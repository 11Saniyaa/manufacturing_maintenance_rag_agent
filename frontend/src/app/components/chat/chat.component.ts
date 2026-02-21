import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MachineService, Machine } from '../../services/machine.service';

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
export class ChatComponent implements OnChanges {
  @Input() selectedMachineId?: number;

  messages: Message[] = [];
  currentQuery: string = '';
  isLoading: boolean = false;
  selectedMachine?: Machine;

  constructor(
    private chatService: ChatService,
    private machineService: MachineService
  ) {
    // Add welcome message
    this.messages.push({
      text: 'Hello! I\'m your maintenance assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedMachineId']) {
      const previousId = changes['selectedMachineId'].previousValue;
      const currentId = changes['selectedMachineId'].currentValue;
      
      if (currentId && currentId !== previousId) {
        this.loadMachineInfo(currentId);
      } else if (!currentId && previousId) {
        this.selectedMachine = undefined;
        // Add a message when machine selection is cleared
        this.messages.push({
          text: 'Machine selection cleared. I can now assist with all machines.',
          isUser: false,
          timestamp: new Date()
        });
      }
    }
  }

  loadMachineInfo(machineId: number) {
    this.machineService.getMachine(machineId).subscribe({
      next: (machine) => {
        this.selectedMachine = machine;
        // Add a system message indicating machine context
        this.messages.push({
          text: `Now assisting with: ${machine.name} (${machine.type})`,
          isUser: false,
          timestamp: new Date()
        });
      },
      error: (error) => {
        console.error('Error loading machine info:', error);
        this.selectedMachine = undefined;
      }
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

    // Debug log to verify machine ID is being sent
    console.log('Sending query with machine ID:', this.selectedMachineId);

    this.chatService.sendQuery(query, this.selectedMachineId).subscribe({
      next: (response) => {
        const botMessage: Message = {
          text: response.response,
          isUser: false,
          timestamp: new Date(response.timestamp)
        };
        this.messages.push(botMessage);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending query:', error);
        const errorMessage: Message = {
          text: 'Sorry, I encountered an error. Please make sure the backend server is running and LM Studio is active.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
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

