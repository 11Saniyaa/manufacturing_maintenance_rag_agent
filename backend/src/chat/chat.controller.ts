import { Controller, Post, Body, Query } from '@nestjs/common';
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
    const response = await this.chatService.processQuery(
      request.query,
      request.machineId,
    );
    
    return {
      response,
      timestamp: new Date().toISOString(),
    };
  }
}

