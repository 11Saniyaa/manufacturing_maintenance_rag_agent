import { Component, Input, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs';
import { ChatService } from '../../services/chat.service';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type ChatLanguage = 'en-US' | 'hi-IN';

type SpeechRecognitionCtor = new () => SpeechRecognition;
type SpeechRecognitionLike = SpeechRecognition & {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
};

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnDestroy {
  @Input() selectedMachineId?: number;
  @Input() uiMode: 'voice' | 'photo' | 'full' = 'full';

  language: ChatLanguage = 'en-US';
  conciseMode = true;

  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content:
        'Hi! Describe the issue you’re seeing (symptoms, error codes, when it started). I’ll suggest safe troubleshooting steps.',
      timestamp: new Date(),
    },
  ];

  queryText = '';
  isSending = false;
  lastError?: string;
  selectedImageDataUrl?: string;
  selectedImageName?: string;
  selectedImageDetails?: string;
  isProcessingImage = false;

  // Speech-to-text (Web Speech API)
  readonly canUseSpeechToText: boolean;
  isListening = false;
  sttStatus?: string;
  private recognition?: SpeechRecognitionLike;
  private interimTranscript = '';

  // Text-to-speech (SpeechSynthesis API)
  readonly canUseTextToSpeech: boolean;
  autoSpeakReplies = false;
  isSpeaking = false;

  constructor(private chatService: ChatService) {
    this.canUseSpeechToText = !!this.getSpeechRecognitionCtor();
    this.canUseTextToSpeech =
      typeof window !== 'undefined' &&
      !!window.speechSynthesis &&
      typeof SpeechSynthesisUtterance !== 'undefined';
  }

  ngOnDestroy(): void {
    this.stopListening();
    this.stopSpeaking();
  }

  private getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
    const w = window as any;
    return (w.SpeechRecognition || w.webkitSpeechRecognition) as SpeechRecognitionCtor | undefined;
  }

  private initSpeechRecognition(): SpeechRecognitionLike | undefined {
    const Ctor = this.getSpeechRecognitionCtor();
    if (!Ctor) return undefined;

    const rec = new Ctor() as SpeechRecognitionLike;
    rec.lang = this.language;
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res[0]?.transcript ?? '';
        if (res.isFinal) finalText += transcript;
        else interimText += transcript;
      }

      this.interimTranscript = interimText.trim();
      const combined = `${this.queryText} ${finalText}`.trim();
      if (finalText.trim()) this.queryText = combined;

      if (this.interimTranscript) {
        this.sttStatus = `Listening… ${this.interimTranscript}`;
      } else {
        this.sttStatus = 'Listening…';
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event);
      this.sttStatus = `Mic error: ${event.error}`;
      this.isListening = false;
    };

    rec.onend = () => {
      this.isListening = false;
      this.interimTranscript = '';
      if (!this.sttStatus?.startsWith('Mic error')) this.sttStatus = undefined;
    };

    return rec;
  }

  startListening() {
    if (this.isListening) return;
    if (!this.recognition) this.recognition = this.initSpeechRecognition();
    if (!this.recognition) {
      this.sttStatus = 'Speech-to-text not supported in this browser.';
      return;
    }

    // ensure language is current (in case user changed dropdown)
    this.recognition.lang = this.language;

    try {
      this.sttStatus = 'Listening…';
      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      // Can throw if called twice quickly
      console.error('Failed to start recognition:', e);
      this.isListening = false;
      this.sttStatus = 'Could not start microphone.';
    }
  }

  stopListening() {
    if (!this.recognition) {
      this.isListening = false;
      return;
    }
    try {
      this.recognition.stop();
    } catch {
      // ignore
    } finally {
      this.isListening = false;
      this.interimTranscript = '';
    }
  }

  toggleListening() {
    if (this.isListening) this.stopListening();
    else this.startListening();
  }

  private speak(text: string) {
    if (!this.canUseTextToSpeech) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Stop any existing speech first
    synth.cancel();
    this.isSpeaking = true;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = this.language;
    // Try to select a voice that matches the chosen language (if available).
    // Note: some browsers only populate voices asynchronously; in that case,
    // setting `utter.lang` still helps pick a reasonable default.
    const voice = this.pickVoiceForLang(this.language);
    if (voice) utter.voice = voice;
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => {
      this.isSpeaking = false;
    };
    utter.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.isSpeaking = false;
    };

    synth.speak(utter);
  }

  private pickVoiceForLang(lang: ChatLanguage): SpeechSynthesisVoice | undefined {
    const synth = window.speechSynthesis;
    if (!synth) return undefined;
    const voices = synth.getVoices?.() ?? [];
    if (!voices.length) return undefined;
    return (
      voices.find((v) => (v.lang || '').toLowerCase().startsWith(lang.toLowerCase())) ||
      voices.find((v) => (v.lang || '').toLowerCase().startsWith(lang.split('-')[0].toLowerCase()))
    );
  }

  onLanguageChange() {
    // Apply to active STT session if currently listening
    if (this.recognition) {
      this.recognition.lang = this.language;
    }
  }

  stopSpeaking() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    this.isSpeaking = false;
  }

  speakLastAssistantMessage() {
    const last = [...this.messages].reverse().find((m) => m.role === 'assistant');
    if (!last) return;
    this.speak(last.content);
  }

  private buildInstructionPrefix(): string {
    // Keep this short but strongly formatted so the LLM returns readable output.
    // We prepend it to the user's query to avoid changing the backend.
    if (this.language === 'hi-IN') {
      return (
        'हिंदी में जवाब दें। जवाब संक्षिप्त, स्पष्ट और पढ़ने योग्य रखें। ' +
        'इस फॉर्मेट का पालन करें:\n' +
        '1) सारांश (1-2 लाइन)\n' +
        '2) संभावित कारण (बुलेट)\n' +
        '3) अगले कदम (क्रमांकित स्टेप्स)\n' +
        '4) सुरक्षा नोट\n' +
        '5) कब एस्केलेट करें\n' +
        'बहुत लंबा टेक्स्ट न लिखें।\n\n'
      );
    }

    return (
      'Answer in a concise, clear, readable format. Follow this template:\n' +
      '1) Summary (1-2 lines)\n' +
      '2) Likely causes (bullets)\n' +
      '3) Next steps (numbered)\n' +
      '4) Safety note\n' +
      '5) When to escalate\n' +
      'Keep it short; avoid long paragraphs.\n\n'
    );
  }

  private formatAssistantText(text: string): string {
    // Light formatting to improve readability in the UI without needing markdown rendering.
    return (
      text
        .replace(/\r\n/g, '\n')
        // collapse 3+ blank lines to max 2
        .replace(/\n{3,}/g, '\n\n')
        // normalize common bullet markers
        .replace(/^\s*[\*\u2022]\s+/gm, '- ')
        .trim()
    );
  }

  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.lastError = 'Please upload JPG, PNG, or WEBP image only (SVG is not supported).';
      this.clearSelectedImage();
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.lastError = 'Image is too large. Please use a file smaller than 10MB.';
      this.clearSelectedImage();
      return;
    }

    this.isProcessingImage = true;
    try {
      const optimized = await this.optimizeImageForDiagnosis(file);
      this.selectedImageDataUrl = optimized.dataUrl;
      this.selectedImageName = file.name;
      this.selectedImageDetails = `${optimized.width}x${optimized.height} · ${Math.round(optimized.sizeBytes / 1024)} KB`;
      this.lastError = undefined;
    } catch (error) {
      console.error('Image processing failed:', error);
      this.lastError = 'Failed to process selected image. Try another image.';
      this.clearSelectedImage();
    } finally {
      this.isProcessingImage = false;
      input.value = '';
    }
  }

  clearSelectedImage() {
    this.selectedImageDataUrl = undefined;
    this.selectedImageName = undefined;
    this.selectedImageDetails = undefined;
  }

  analyzeImage() {
    if (!this.selectedImageDataUrl || this.isSending || this.isProcessingImage) return;

    this.lastError = undefined;
    this.isSending = true;
    this.stopListening();

    const note = this.queryText.trim();
    const userMessage = this.selectedImageName
      ? `Uploaded machine photo: ${this.selectedImageName}${note ? `\nNote: ${note}` : ''}`
      : `Uploaded machine photo${note ? `\nNote: ${note}` : ''}`;

    this.messages = [
      ...this.messages,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ];

    this.chatService
      .diagnoseImage({
        imageDataUrl: this.selectedImageDataUrl,
        machineId: this.selectedMachineId,
        note: note || undefined,
      })
      .pipe(finalize(() => (this.isSending = false)))
      .subscribe({
        next: (res) => {
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: this.formatAssistantText(res.response),
            timestamp: new Date(res.timestamp),
          };
          this.messages = [...this.messages, assistantMsg];
          this.queryText = '';
          this.clearSelectedImage();
          if (this.autoSpeakReplies) this.speak(assistantMsg.content);
        },
        error: (err) => {
          console.error('Image diagnosis failed:', err);
          this.lastError = 'Could not analyze image right now. Check backend configuration and try again.';
          this.messages = [
            ...this.messages,
            {
              role: 'assistant',
              content:
                "I couldn't analyze that photo right now. Please try again, or verify the backend and vision-capable model settings.",
              timestamp: new Date(),
            },
          ];
        },
      });
  }

  send() {
    const text = this.queryText.trim();
    if (!text || this.isSending) return;

    this.lastError = undefined;
    this.isSending = true;
    this.stopListening();

    const outgoing = this.conciseMode ? `${this.buildInstructionPrefix()}${text}` : text;

    this.messages = [
      ...this.messages,
      { role: 'user', content: text, timestamp: new Date() },
    ];

    this.queryText = '';

    this.chatService
      .query({
        query: outgoing,
        machineId: this.selectedMachineId,
      })
      .pipe(finalize(() => (this.isSending = false)))
      .subscribe({
        next: (res) => {
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: this.formatAssistantText(res.response),
            timestamp: new Date(res.timestamp),
          };
          this.messages = [
            ...this.messages,
            assistantMsg,
          ];
          if (this.autoSpeakReplies) this.speak(assistantMsg.content);
        },
        error: (err) => {
          console.error('Chat query failed:', err);
          this.lastError = 'Could not reach the backend chat service. Is the backend running on port 3000?';
          this.messages = [
            ...this.messages,
            {
              role: 'assistant',
              content:
                "I couldn't reach the backend chat service. Please start the backend (port 3000) and try again.",
              timestamp: new Date(),
            },
          ];
        },
      });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  get showVoiceControls(): boolean {
    return this.uiMode !== 'photo';
  }

  get showPhotoControls(): boolean {
    return this.uiMode !== 'voice';
  }

  private async optimizeImageForDiagnosis(file: File): Promise<{ dataUrl: string; sizeBytes: number; width: number; height: number }> {
    const originalDataUrl = await this.readFileAsDataUrl(file);
    const image = await this.loadImage(originalDataUrl);

    let targetWidth = image.naturalWidth;
    let targetHeight = image.naturalHeight;
    const maxDimension = 1400;
    const maxSide = Math.max(targetWidth, targetHeight);
    if (maxSide > maxDimension) {
      const scale = maxDimension / maxSide;
      targetWidth = Math.max(1, Math.round(targetWidth * scale));
      targetHeight = Math.max(1, Math.round(targetHeight * scale));
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not available');
    }

    const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let quality = outputMime === 'image/jpeg' ? 0.86 : undefined;
    let currentWidth = targetWidth;
    let currentHeight = targetHeight;
    let resultDataUrl = originalDataUrl;

    for (let i = 0; i < 6; i++) {
      canvas.width = currentWidth;
      canvas.height = currentHeight;
      ctx.clearRect(0, 0, currentWidth, currentHeight);
      ctx.drawImage(image, 0, 0, currentWidth, currentHeight);
      resultDataUrl = canvas.toDataURL(outputMime, quality);

      const sizeBytes = this.getDataUrlSizeBytes(resultDataUrl);
      if (sizeBytes <= 3_500_000) {
        return { dataUrl: resultDataUrl, sizeBytes, width: currentWidth, height: currentHeight };
      }

      currentWidth = Math.max(640, Math.round(currentWidth * 0.85));
      currentHeight = Math.max(640, Math.round(currentHeight * 0.85));
      if (quality !== undefined) {
        quality = Math.max(0.55, quality - 0.08);
      }
    }

    const finalSize = this.getDataUrlSizeBytes(resultDataUrl);
    if (finalSize > 3_900_000) {
      throw new Error('Optimized image still too large');
    }
    return { dataUrl: resultDataUrl, sizeBytes: finalSize, width: currentWidth, height: currentHeight };
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') resolve(result);
        else reject(new Error('Invalid file read result'));
      };
      reader.onerror = () => reject(reader.error || new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  }

  private loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = dataUrl;
    });
  }

  private getDataUrlSizeBytes(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1] || '';
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.floor((base64.length * 3) / 4) - padding;
  }
}
