import Fastify, { FastifyInstance } from 'fastify';
import WebSocket from 'ws';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'technician' | 'admin';
  message: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file' | 'system';
}

class ChatService {
  private conversations = new Map();
  private messages = new Map();
  private connections = new Map();

  async sendMessage(conversationId: string, senderId: string, senderRole: string, message: string): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderRole: senderRole as unknown,
      message,
      timestamp: new Date().toISOString(),
      messageType: 'text',
    };
    return chatMessage;
  }
}

export const chatService = new ChatService();

export async function registerChatRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/chat/conversations', async () => ({
    success: true,
    data: []
  }));
  
  fastify.post('/api/v1/chat/conversations/:conversationId/messages', async (request: unknown) => {
    const { conversationId  } = (request.params as unknown);
    const { message  } = (request.body as unknown);
    
    const chatMessage = await chatService.sendMessage(conversationId, 'user1', 'customer', message);
    
    return {
      success: true,
      data: chatMessage
    };
  });
}