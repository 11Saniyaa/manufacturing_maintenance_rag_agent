import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

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
  currentQuery: string = '';
  isLoading: boolean = false;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.addWelcomeMessage();
  }

  addWelcomeMessage() {
    this.messages.push({
      text: 'Hello! I\'m your maintenance assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    });
  }

  sendMessage() {
    if (!this.currentQuery.trim() || this.isLoading) {
      return;
    }

    const userMessage: Message = {
      text: this.currentQuery,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const query = this.currentQuery;
    this.currentQuery = '';
    this.isLoading = true;

    this.chatService.sendQuery(query, this.selectedMachineId).subscribe({
      next: (response) => {
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
