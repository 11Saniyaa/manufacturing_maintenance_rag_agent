import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

export class ChatMessage {
  text: string;
  isUser: boolean;
  timestamp?: string;
}

export class ChatRequestDto {
  query: string;
  machineId?: number;
  conversationHistory?: ChatMessage[];
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('query')
  async processQuery(@Body() request: ChatRequestDto) {
    console.log('Chat controller received request:', { 
      query: request.query, 
      machineId: request.machineId,
      historyLength: request.conversationHistory?.length || 0
    });
    
    const response = await this.chatService.processQuery(
      request.query, 
      request.machineId,
      request.conversationHistory || []
    );
    
    return {
      response,
      timestamp: new Date().toISOString(),
    };
  }
}

