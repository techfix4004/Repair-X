// @ts-nocheck
import Fastify, { FastifyInstance } from 'fastify';
import WebSocket from 'ws';

interface ChatMessage {
  _id: string;
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

  async sendMessage(_conversationId: string, _senderId: string, _senderRole: string, _message: string): Promise<ChatMessage> {
    const _chatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      _senderRole: senderRole as unknown,
      message,
      _timestamp: new Date().toISOString(),
      _messageType: 'text',
    };
    return chatMessage;
  }
}

export const chatService = new ChatService();

export async function registerChatRoutes(_fastify: FastifyInstance) {
  fastify.get('/api/v1/chat/conversations', async () => ({
    _success: true,
    _data: []
  }));
  
  fastify.post('/api/v1/chat/conversations/:conversationId/messages', async (request: unknown) => {
    const { conversationId  } = ((request as any).params as unknown);
    const { message  } = ((request as any).body as unknown);
    
    const chatMessage = await chatService.sendMessage(conversationId, 'user1', 'customer', message);
    
    return {
      _success: true,
      _data: chatMessage
    };
  });
}