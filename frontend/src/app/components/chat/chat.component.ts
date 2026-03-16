import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() selectedMachineId?: number;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  currentQuery: string = '';
  isLoading: boolean = false;

  // Audio features
  isVoiceInputEnabled: boolean = false;
  isTextToSpeechEnabled: boolean = false;
  isRecording: boolean = false;
  recognition: any;
  synthesis: SpeechSynthesis;
  currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(private chatService: ChatService) {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  ngOnInit() {
    this.addWelcomeMessage();
  }

  ngOnDestroy() {
    this.stopRecording();
    this.stopSpeaking();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }

  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.currentQuery = transcript;
        this.isRecording = false;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isRecording = false;
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        }
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  addWelcomeMessage() {
    this.messages.push({
      text: 'Hello! I\'m your maintenance assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    });
  }

  toggleVoiceInput() {
    this.isVoiceInputEnabled = !this.isVoiceInputEnabled;
    if (!this.isVoiceInputEnabled) {
      this.stopRecording();
    }
  }

  toggleTextToSpeech() {
    this.isTextToSpeechEnabled = !this.isTextToSpeechEnabled;
    if (!this.isTextToSpeechEnabled) {
      this.stopSpeaking();
    }
  }

  startRecording() {
    if (!this.recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (this.isRecording) {
      this.stopRecording();
      return;
    }

    try {
      this.isRecording = true;
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      this.isRecording = false;
    }
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  speakText(text: string) {
    if (!this.isTextToSpeechEnabled || !this.synthesis) {
      return;
    }

    this.stopSpeaking();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;
    this.currentUtterance.lang = 'en-US';

    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
    };

    this.currentUtterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      this.currentUtterance = null;
    };

    this.synthesis.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
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
        const botMessage: Message = {
          text: response.response,
          isUser: false,
          timestamp: new Date(response.timestamp)
        };
        this.messages.push(botMessage);
        this.isLoading = false;
        
        // Speak the response if text-to-speech is enabled
        if (this.isTextToSpeechEnabled) {
          setTimeout(() => this.speakText(response.response), 100);
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        const errorMessage: Message = {
          text: 'Sorry, I encountered an error. Please try again.',
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
