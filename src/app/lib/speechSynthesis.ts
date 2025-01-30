// // src/app/lib/speechSynthesis.ts

// export class SpeechSynthesisService {
//   speaking: boolean = false;

//   private chunkText(text: string): string[] {
//     // Split by sentences and punctuation
//     const chunks = text.match(/[^.!?]+[.!?]+/g) || [];
//     if (chunks.length === 0) {
//       // If no sentence breaks found, return the whole text as one chunk
//       return [text];
//     }
//     return chunks.map(chunk => chunk.trim());
//   }

//   speak(text: string, language: 'en-US' | 'ar-SA' = 'en-US') {
//     if (typeof window === 'undefined') return;

//     // Cancel any ongoing speech
//     window.speechSynthesis.cancel();
//     this.speaking = false;

//     // Split text into chunks
//     const chunks = this.chunkText(text);
//     let currentChunk = 0;

//     const speakChunk = () => {
//       if (currentChunk < chunks.length) {
//         const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
//         const voices = window.speechSynthesis.getVoices();

//         if (language === 'ar-SA') {
//           const arabicVoice = voices.find(voice => 
//             voice.lang.includes('ar') && 
//             (voice.name.includes('Microsoft Hamed') ||
//              voice.name.includes('Microsoft Naayf') ||
//              voice.name.includes('Mehdi') ||
//              voice.name.includes('Ali') ||
//              voice.name.includes('Hassan'))
//           );

//           if (arabicVoice) {
//             utterance.voice = arabicVoice;
//           }

//           utterance.lang = 'ar-SA';
//           utterance.rate = 0.8;
//           utterance.pitch = 0.7;
//           utterance.volume = 1;
//         } else {
//           const englishVoice = voices.find(voice => 
//             voice.lang.includes('en') && 
//             (voice.name.includes('Microsoft David') ||
//              voice.name.includes('Google US English Male') ||
//              voice.name.includes('Male'))
//           );

//           if (englishVoice) {
//             utterance.voice = englishVoice;
//           }

//           utterance.lang = 'en-US';
//           utterance.rate = 1;
//           utterance.pitch = 1;
//           utterance.volume = 1;
//         }

//         utterance.onstart = () => {
//           this.speaking = true;
//         };

//         utterance.onend = () => {
//           currentChunk++;
//           if (currentChunk < chunks.length) {
//             // Speak next chunk
//             speakChunk();
//           } else {
//             this.speaking = false;
//           }
//         };

//         utterance.onerror = (event) => {
//           console.error('Speech synthesis error:', event);
//           this.speaking = false;
//         };

//         // Speak the current chunk
//         window.speechSynthesis.speak(utterance);
//       }
//     };

//     // Check if voices are loaded
//     const voices = window.speechSynthesis.getVoices();
//     if (voices.length === 0) {
//       window.speechSynthesis.addEventListener('voiceschanged', () => {
//         speakChunk();
//       }, { once: true });
//     } else {
//       speakChunk();
//     }
//   }

//   stop() {
//     if (typeof window === 'undefined') return;
//     window.speechSynthesis.cancel();
//     this.speaking = false;
//   }

//   isSpeaking(): boolean {
//     return this.speaking;
//   }
// }



// CODE FOR ELEVEN LABS:(NOTE: THE ABOVE CODE IS FOR THE WEB SPEECH API).



// src/app/lib/speechSynthesis.ts

// import { ElevenLabsService } from './elevenLabs';

// export class SpeechSynthesisService {
//   speaking: boolean = false;
//   private elevenLabs: ElevenLabsService;
//   private audioElement: HTMLAudioElement | null = null;
//   private currentLanguage: 'en-US' | 'ar-SA' = 'en-US';
//   config: { optimalChunkSize: number; chunkDelay: number; speechRate: number; };

//   constructor(config = {
//     optimalChunkSize: 200,
//     chunkDelay: 100,
//     speechRate: 0.9
//   }) {
//     this.config = config;
//     this.elevenLabs = new ElevenLabsService();
//     if (typeof window !== 'undefined') {
//       this.audioElement = new Audio();
//       this.resumeSpeechIfNeeded();
//     }
//   }

//   private chunkText(text: string): string[] {
//     // First, split by sentence endings while preserving the punctuation
//     const rawChunks = text.match(/[^.!?]+[.!?]+/g) || [];
    
//     // If no sentence breaks found, return the whole text as one chunk
//     if (rawChunks.length === 0) {
//       return [text];
//     }
  
//     // Combine smaller chunks into optimal-sized chunks (around 200 characters)
//     const optimalChunks: string[] = [];
//     let currentChunk = '';
//     const OPTIMAL_CHUNK_SIZE = 200;
  
//     for (const chunk of rawChunks) {
//       if (currentChunk.length + chunk.length <= OPTIMAL_CHUNK_SIZE) {
//         currentChunk += ' ' + chunk.trim();
//       } else {
//         if (currentChunk) {
//           optimalChunks.push(currentChunk.trim());
//         }
//         currentChunk = chunk.trim();
//       }
//     }
    
//     // Add the last chunk if it exists
//     if (currentChunk) {
//       optimalChunks.push(currentChunk.trim());
//     }
  
//     return optimalChunks;
//   }

//   async speak(text: string, language: 'en-US' | 'ar-SA' = 'en-US') {
//     if (typeof window === 'undefined') return;
  
//     this.currentLanguage = language;
//     this.stop();
  
//     // Add a delay to ensure previous speech is fully stopped
//     await new Promise(resolve => setTimeout(resolve, 300));
  
//     if (language === 'ar-SA') {
//       // Arabic handling remains the same
//       // ...
//     } else {
//       try {
//         const chunks = this.chunkText(text);
//         let currentChunk = 0;
  
//         const speakChunk = () => {
//           if (this.currentLanguage !== 'en-US' || currentChunk >= chunks.length) {
//             this.speaking = false;
//             return;
//           }
  
//           const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
          
//           // Get voices and set preferred voice
//           const voices = window.speechSynthesis.getVoices();
//           const englishVoice = voices.find(voice => 
//             voice.lang.includes('en') && 
//             (voice.name.includes('Microsoft David') ||
//              voice.name.includes('Google US English Male') ||
//              voice.name.includes('Male'))
//           );
  
//           if (englishVoice) {
//             utterance.voice = englishVoice;
//           }
  
//           utterance.lang = 'en-US';
//           utterance.rate = 0.9; // Slightly slower rate for better reliability
//           utterance.pitch = 1;
//           utterance.volume = 1;
  
//           // Add a small pause between chunks
//           if (currentChunk > 0) {
//             utterance.onstart = () => {
//               this.speaking = true;
//             };
//           }
  
//           utterance.onend = () => {
//             if (this.currentLanguage === 'en-US') {
//               currentChunk++;
//               if (currentChunk < chunks.length) {
//                 // Add a small delay between chunks
//                 setTimeout(speakChunk, 100);
//               } else {
//                 this.speaking = false;
//               }
//             }
//           };
  
//           utterance.onerror = (event) => {
//             console.error('Speech synthesis error occurred:', event);
//             // Attempt to recover by moving to next chunk
//             currentChunk++;
//             if (currentChunk < chunks.length) {
//               setTimeout(speakChunk, 100);
//             } else {
//               this.speaking = false;
//             }
//           };
  
//           window.speechSynthesis.speak(utterance);
//         };
  
//         // Initialize voices if needed
//         if (window.speechSynthesis.getVoices().length === 0) {
//           window.speechSynthesis.addEventListener('voiceschanged', () => {
//             if (this.currentLanguage === 'en-US') {
//               speakChunk();
//             }
//           }, { once: true });
//         } else {
//           speakChunk();
//         }
//       } catch (error) {
//         console.error('Error with Web Speech API:', error);
//         this.speaking = false;
//       }
//     }
//   }

//   private resumeSpeechIfNeeded() {
//     if (typeof window === 'undefined') return;
    
//     // Chrome bug workaround: speech synthesis sometimes stops unexpectedly
//     setInterval(() => {
//       if (this.speaking && !window.speechSynthesis.speaking) {
//         window.speechSynthesis.resume();
//       }
//     }, 1000);
//   }

//   stop() {
//     if (typeof window === 'undefined') return;
    
//     window.speechSynthesis.cancel();
    
//     if (this.audioElement) {
//       this.audioElement.pause();
//       this.audioElement.currentTime = 0;
//       // Remove all event listeners
//       this.audioElement.onended = null;
//       this.audioElement.onerror = null;
//       this.audioElement.oncanplaythrough = null;
//     }
    
//     this.speaking = false;
//   }

//   isSpeaking(): boolean {
//     return this.speaking;
//   }
// }


// src/app/lib/speechSynthesis.ts

import { ElevenLabsService } from './elevenLabs';

export class SpeechSynthesisService {
  private speaking: boolean = false;
  private elevenLabs: ElevenLabsService;
  private audioElement: HTMLAudioElement | null = null;
  private currentLanguage: 'en-US' | 'ar-SA' = 'en-US';
  private utteranceQueue: SpeechSynthesisUtterance[] = [];
  private intentionalStop: boolean = false;
  private speakingStateListeners: ((isSpeaking: boolean) => void)[] = [];

  constructor() {
    this.elevenLabs = new ElevenLabsService();
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
    }
  }

  private chunkText(text: string): string[] {
    const chunks = text.match(/[^.!?]+[.!?]+/g) || [];
    if (chunks.length === 0) {
      return [text];
    }
    return chunks.map(chunk => chunk.trim());
  }

  private setSpeakingState(state: boolean) {
    this.speaking = state;
    this.speakingStateListeners.forEach(listener => listener(state));
  }

  addSpeakingStateListener(listener: (isSpeaking: boolean) => void) {
    this.speakingStateListeners.push(listener);
  }

  removeSpeakingStateListener(listener: (isSpeaking: boolean) => void) {
    this.speakingStateListeners = this.speakingStateListeners.filter(l => l !== listener);
  }

  async speak(text: string, language: 'en-US' | 'ar-SA' = 'en-US') {
    if (typeof window === 'undefined') return;

    this.currentLanguage = language;
    this.intentionalStop = false;
    this.stop();

    await new Promise(resolve => setTimeout(resolve, 100));

    if (language === 'ar-SA') {
      try {
        this.setSpeakingState(true);
        const processedText = text.trim().normalize('NFKC');
        const audioData = await this.elevenLabs.convertTextToSpeech(processedText);
        
        if (this.currentLanguage !== 'ar-SA') {
          this.setSpeakingState(false);
          return;
        }

        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);

        if (this.audioElement) {
          this.audioElement.onended = null;
          this.audioElement.onerror = null;
          this.audioElement.src = url;
          
          this.audioElement.onended = () => {
            this.setSpeakingState(false);
            URL.revokeObjectURL(url);
          };

          this.audioElement.onerror = () => {
            if (!this.intentionalStop) {
              console.error('Audio playback error');
            }
            this.setSpeakingState(false);
            URL.revokeObjectURL(url);
          };

          await this.audioElement.play();
        }
      } catch (error) {
        if (!this.intentionalStop) {
          console.error('Error with ElevenLabs TTS:', error);
        }
        this.setSpeakingState(false);
      }
    } else {
      try {
        const chunks = this.chunkText(text);
        this.utteranceQueue = [];
        
        chunks.forEach((chunk, index) => {
          const utterance = new SpeechSynthesisUtterance(chunk);
          const voices = window.speechSynthesis.getVoices();
          
          const englishVoice = voices.find(voice => 
            voice.lang.includes('en') && 
            (voice.name.includes('Microsoft David') ||
             voice.name.includes('Google US English Male') ||
             voice.name.includes('Male'))
          );

          if (englishVoice) {
            utterance.voice = englishVoice;
          }

          utterance.lang = 'en-US';
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 1;

          if (index === 0) {
            utterance.onstart = () => {
              this.setSpeakingState(true);
            };
          }

          if (index === chunks.length - 1) {
            utterance.onend = () => {
              if (!this.intentionalStop) {
                this.setSpeakingState(false);
              }
            };
          }

          utterance.onerror = (event) => {
            if (!this.intentionalStop) {
              console.error('Speech synthesis error occurred:', event);
              this.setSpeakingState(false);
            }
          };

          this.utteranceQueue.push(utterance);
        });

        this.setSpeakingState(true);
        this.utteranceQueue.forEach(utterance => {
          window.speechSynthesis.speak(utterance);
        });

      } catch (error) {
        if (!this.intentionalStop) {
          console.error('Error with Web Speech API:', error);
        }
        this.setSpeakingState(false);
      }
    }
  }

  stop() {
    if (typeof window === 'undefined') return;
    
    this.intentionalStop = true;
    window.speechSynthesis.cancel();
    this.utteranceQueue = [];
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.onended = null;
      this.audioElement.onerror = null;
    }
    
    this.setSpeakingState(false);
  }

  isSpeaking(): boolean {
    return this.speaking;
  }
}