import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  @Input() selectedMachineId: number | null = null;

  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Add welcome message
    this.messages.push({
      text: 'Hello! I\'m your maintenance assistant. Describe your machine problem or ask a question, and I\'ll help you troubleshoot it.',
      sender: 'assistant',
      timestamp: new Date(),
    });
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    const userMessage: Message = {
      text: this.userInput,
      sender: 'user',
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    const query = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    // Send query to backend
    this.apiService.sendQuery(query, this.selectedMachineId || undefined).subscribe({
      next: (response) => {
        const assistantMessage: Message = {
          text: response.response,
          sender: 'assistant',
          timestamp: new Date(response.timestamp),
        };
        this.messages.push(assistantMessage);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending query:', error);
        const errorMessage: Message = {
          text: 'Sorry, I encountered an error processing your query. Please make sure the backend server is running and Ollama is configured correctly.',
          sender: 'assistant',
          timestamp: new Date(),
        };
        this.messages.push(errorMessage);
        this.isLoading = false;
      },
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }
}

