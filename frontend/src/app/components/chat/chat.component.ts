import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
export class ChatComponent implements OnChanges, AfterViewChecked {
  @Input() selectedMachineId?: number;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [];
  currentQuery: string = '';
  isLoading: boolean = false;
  selectedMachine?: Machine;
  private shouldScroll: boolean = false;

  constructor(
    private chatService: ChatService,
    private machineService: MachineService,
    private sanitizer: DomSanitizer
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

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
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
    this.shouldScroll = true;

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
        this.shouldScroll = true;
      },
      error: (error) => {
        console.error('Error sending query:', error);
        const errorMessage: Message = {
          text: 'Sorry, I encountered an error. Please make sure the backend server is running and your LLM service (LM Studio/Groq) is active.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatMessage(text: string): SafeHtml {
    // Escape HTML first to prevent XSS, then format
    const escapeHtml = (str: string) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };
    
    const escaped = escapeHtml(text);
    
    // Format numbered lists and bullet points
    let formatted = escaped
      // Convert numbered lists (1. 2. 3.)
      .replace(/(\d+)\.\s+(.+?)(?=<br>|$)/g, '<div class="list-item numbered">$1. $2</div>')
      // Convert bullet points (- or •)
      .replace(/[-•]\s+(.+?)(?=<br>|$)/g, '<div class="list-item bullet">• $1</div>')
      // Convert bold text (**text**)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Convert headings (=== text ===)
      .replace(/=== (.+?) ===/g, '<h3 class="message-heading">$1</h3>')
      // Convert line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph
    formatted = '<p>' + formatted + '</p>';
    
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}

