import { Component, Input, OnInit } from '@angular/core';
import { ChatService, ChatResponse } from '../../services/chat.service';

export interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() selectedMachineId?: number;

  messages: Message[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    // Add welcome message
    this.messages.push({
      text: 'Hello! I\'m your maintenance assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    });
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) {
      return;
    }

    const userMessage = this.currentMessage.trim();
    this.currentMessage = '';

    // Add user message
    this.messages.push({
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    });

    // Send to API
    this.isLoading = true;
    this.chatService.sendMessage(userMessage, this.selectedMachineId).subscribe({
      next: (response: ChatResponse) => {
        this.messages.push({
          text: response.response,
          isUser: false,
          timestamp: new Date(response.timestamp)
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.messages.push({
          text: 'Sorry, I encountered an error. Please try again.',
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
