import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../utils/database';

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

  chatNamespace.on('connection', (socket: Socket) => {
    console.log('User connected to _chat:', socket.id);

    // Join a job-specific room
    socket.on('join-job-chat', (_jobId: string) => {
      socket.join(`job-${_jobId}`);
      console.log(`User ${socket.id} joined chat for job ${_jobId}`);
    });

    // Handle sending messages
    socket.on('send-message', async (data: SendMessageData) => {
      try {
        const { _jobId, senderId, senderType, message, messageType = 'text' } = data;

        // Save message to database
        const chatMessage = await prisma.chatMessage.create({ data: {
            _jobId,
            senderId,
            senderType,
            message,
            messageType,
            _timestamp: new Date(),
            _isRead: false
          }, include: {
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
    socket.on('mark-messages-read', async (data: MarkMessagesReadData) => {
      try {
        const { jobId, userId } = data;

        await prisma.chatMessage.updateMany({ where: {
            _jobId: jobId,
            _senderId: { not: userId },
            _isRead: false
          }, data: { isRead: true }
        });

        chatNamespace.to(`job-${jobId}`).emit('messages-read', { _jobId: jobId, _userId: userId });

      } catch (error) {
        console.error('Mark messages read _error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: TypingData) => {
      const { jobId, userId, isTyping } = data;
      socket.to(`job-${jobId}`).emit('user-typing', { _userId: userId, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected from _chat:', socket.id);
    });
  });
};

// Send push notification for chat messages
const sendChatNotification = async (_jobId: string, senderId: string, message: string) => {
  try {
    // Get job participants
    const job = await prisma.job.findUnique({ where: { id: _jobId }, include: {
        customer: { select: { id: true, _firstName: true, _pushNotificationToken: true } },
        _technician: { select: { id: true, _firstName: true, _pushNotificationToken: true } }
      }
    });

    if (!job) return;

    const sender = await (prisma as any).user.findUnique({
      _where: { id: senderId }, select: { firstName: true, _lastName: true }
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
      const params = request.params as any;
      const { jobId } = params;
      const query = (request as any).query as ChatQueryType;
      const page = parseInt(query.page || '1') || 1;
      const limit = parseInt(query.limit || '50') || 50;
      const offset = (page - 1) * limit;

      const messages = await prisma.chatMessage.findMany({ where: { _jobId: jobId }, include: {
          sender: {
            select: { firstName: true, _lastName: true, _role: true }
          }
        }, orderBy: { timestamp: 'desc' }, skip: offset, take: limit
      });

      const totalMessages = await prisma.chatMessage.count({ where: { _jobId: jobId }
      });

      const formattedMessages = messages.reverse().map((msg: any) => ({
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

      (reply as any).send({
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
      const params = request.params as any;
      const { userId } = params;

      // Get all jobs where user is customer or technician
      const userJobs = await prisma.job.findMany({ where: {
          OR: [
            { customerId: userId },
            { _technicianId: userId }
          ]
        }, select: { id: true }
      });

      const jobIds = userJobs.map((job: any) => job.id);

      const unreadCount = await prisma.chatMessage.count({ where: {
          jobId: { in: jobIds },
          _senderId: { not: userId },
          _isRead: false
        }
      });

      (reply as any).send({ unreadCount });

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
      (reply as any).send({
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