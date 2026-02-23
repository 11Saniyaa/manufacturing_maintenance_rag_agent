import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

export class ChatRequestDto {
  query: string;
  machineId?: number;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('query')
  async processQuery(@Body() request: ChatRequestDto) {
    console.log('Chat controller received request:', { 
      query: request.query, 
      machineId: request.machineId 
    });
    
    const response = await this.chatService.processQuery(
      request.query, 
      request.machineId
    );
    
    return {
      response,
      timestamp: new Date().toISOString(),
    };
  }
}

