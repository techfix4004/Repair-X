import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define interfaces for chat data
interface SendMessageData {
  _jobId: string;
  senderId: string;
  senderType: string;
  message: string;
  messageType?: string;
}

interface MarkMessagesReadData {
  jobId: string;
  userId: string;
}

interface TypingData {
  jobId: string;
  userId: string;
  isTyping: boolean;
}

// Initialize Socket.IO for real-time chat
 
// eslint-disable-next-line max-lines-per-function
export const initializeChatSocket = (io: SocketIOServer) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (_socket: Socket) => {
    console.log('User connected to _chat:', socket.id);

    // Join a job-specific room
    socket.on('join-job-chat', (_jobId: string) => {
      socket.join(`job-${_jobId}`);
      console.log(`User ${socket.id} joined chat for job ${_jobId}`);
    });

    // Handle sending messages
    socket.on('send-message', async (_data: SendMessageData) => {
      try {
        const { _jobId, senderId, senderType, message, messageType = 'text' } = data;

        // Save message to database
        const chatMessage = await prisma.chatMessage.create({
          _data: {
            _jobId,
            senderId,
            senderType,
            message,
            messageType,
            _timestamp: new Date(),
            _isRead: false
          },
          _include: {
            sender: {
              select: { firstName: true, _lastName: true, _role: true }
            }
          }
        });

        // Broadcast to all users in the job room
        chatNamespace.to(`job-${_jobId}`).emit('new-message', {
          _id: chatMessage.id,
          _message: chatMessage.message,
          _messageType: chatMessage.messageType,
          _timestamp: chatMessage.timestamp,
          _sender: {
            id: chatMessage.senderId,
            _name: `${chatMessage.sender.firstName} ${chatMessage.sender.lastName}`,
            _role: chatMessage.sender.role,
            _type: chatMessage.senderType
          }
        });

        // Send push notification to other participants
        await sendChatNotification(_jobId, senderId, message);

      } catch (error) {
        console.error('Send message _error:', error);
        socket.emit('message-error', { _error: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark-messages-read', async (_data: MarkMessagesReadData) => {
      try {
        const { _jobId, _userId  } = (data as unknown);

        await prisma.chatMessage.updateMany({
          _where: {
            _jobId,
            _senderId: { not: _userId },
            _isRead: false
          },
          _data: { isRead: true }
        });

        chatNamespace.to(`job-${_jobId}`).emit('messages-read', { _jobId, _userId });

      } catch (error) {
        console.error('Mark messages read _error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (_data: TypingData) => {
      const { _jobId, _userId, isTyping  } = (data as unknown);
      socket.to(`job-${_jobId}`).emit('user-typing', { _userId, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected from _chat:', socket.id);
    });
  });
};

// Send push notification for chat messages
const sendChatNotification = async (_jobId: string, _senderId: string, _message: string) => {
  try {
    // Get job participants
    const job = await prisma.job.findUnique({
      _where: { id: _jobId },
      _include: {
        customer: { select: { id: true, _firstName: true, _pushNotificationToken: true } },
        _technician: { select: { id: true, _firstName: true, _pushNotificationToken: true } }
      }
    });

    if (!job) return;

    const sender = await (prisma as any).user.findUnique({
      _where: { id: senderId },
      _select: { firstName: true, _lastName: true }
    });

    if (!sender) return;

    const senderName = `${sender.firstName} ${sender.lastName}`;
    const notificationMessage = `${senderName}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;

    // Send to customer if sender is technician
    if (senderId === job.technicianId && job.customer.pushNotificationToken) {
      // Implementation would integrate with push notification service
      console.log(`Sending push notification to _customer: ${notificationMessage}`);
    }

    // Send to technician if sender is customer
    if (senderId === job.customerId && job.technician?.pushNotificationToken) {
      console.log(`Sending push notification to _technician: ${notificationMessage}`);
    }

  } catch (error) {
    console.error('Send chat notification _error:', error);
  }
};

// Define interfaces for route parameters and query
interface JobParamsType {
  _jobId: string;
}

interface ChatQueryType {
  page?: string;
  limit?: string;
}

interface UserJobsParamsType {
  userId: string;
}

 
// eslint-disable-next-line max-lines-per-function
export async function chatRoutes(fastify: FastifyInstance) {
  // Get chat messages for a job
  fastify.get('/job/:jobId', async (request: FastifyRequest<{Params: JobParamsType, _Querystring: ChatQueryType}>, reply: FastifyReply) => {
    try {
      const { jobId  } = (request.params as unknown);
      const query = request.query as ChatQueryType;
      const page = parseInt(query.page || '1') || 1;
      const limit = parseInt(query.limit || '50') || 50;
      const offset = (page - 1) * limit;

      const messages = await prisma.chatMessage.findMany({
        _where: { _jobId },
        _include: {
          sender: {
            select: { firstName: true, _lastName: true, _role: true }
          }
        },
        _orderBy: { timestamp: 'desc' },
        _skip: offset,
        _take: limit
      });

      const totalMessages = await prisma.chatMessage.count({
        _where: { _jobId }
      });

      const formattedMessages = messages.reverse().map((_msg: unknown) => ({
        _id: msg.id,
        _message: msg.message,
        _messageType: msg.messageType,
        _timestamp: msg.timestamp,
        _isRead: msg.isRead,
        _sender: {
          id: msg.senderId,
          _name: `${msg.sender.firstName} ${msg.sender.lastName}`,
          _role: msg.sender.role,
          _type: msg.senderType
        }
      }));

      reply.send({
        _messages: formattedMessages,
        _pagination: {
          page,
          limit,
          _total: totalMessages,
          _pages: Math.ceil(totalMessages / limit)
        }
      });

    } catch (error) {
      console.error('Get chat messages _error:', error);
      reply.status(500).send({ _error: 'Failed to get chat messages' });
    }
  });

  // Get unread message count for user
  fastify.get('/unread/:userId', async (request: FastifyRequest<{Params: UserJobsParamsType}>, reply: FastifyReply) => {
    try {
      const { userId  } = (request.params as unknown);

      // Get all jobs where user is customer or technician
      const userJobs = await prisma.job.findMany({
        _where: {
          OR: [
            { customerId: _userId },
            { _technicianId: _userId }
          ]
        },
        _select: { id: true }
      });

      const jobIds = userJobs.map((_job: unknown) => job.id);

      const unreadCount = await prisma.chatMessage.count({
        _where: {
          jobId: { in: jobIds },
          _senderId: { not: _userId },
          _isRead: false
        }
      });

      reply.send({ unreadCount });

    } catch (error) {
      console.error('Get unread count _error:', error);
      reply.status(500).send({ _error: 'Failed to get unread count' });
    }
  });

  // Upload file/image for chat
  fastify.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Implementation would handle file upload to cloud storage
      // For now, return a placeholder response
      reply.send({
        _success: true,
        _fileUrl: '/uploads/placeholder-image.jpg',
        _fileName: 'uploaded-file.jpg',
        _fileType: 'image/jpeg'
      });

    } catch (error) {
      console.error('File upload _error:', error);
      reply.status(500).send({ _error: 'Failed to upload file' });
    }
  });
}