import type { 
  ISpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from './types';

export class SpeechRecognitionService {
  recognition: ISpeechRecognition | null = null;
  isListening: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(language: 'en-US' | 'ar-SA' = 'en-US') {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = language;
      }
    }
  }

  private resetRetryCount() {
    this.retryCount = 0;
  }

  start(onResult: (text: string, isFinal: boolean) => void, onError: (error: any) => void) {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      
      if (isFinal) {
        this.resetRetryCount();
      }
      
      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => {
          this.start(onResult, onError);
        }, 1000);
      } else {
        onError(event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition?.start();
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError(error);
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
      this.resetRetryCount();
    }
  }

  setLanguage(language: 'en-US' | 'ar-SA') {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }
}