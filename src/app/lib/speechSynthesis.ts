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

import { ElevenLabsService } from './elevenLabs';

export class SpeechSynthesisService {
  speaking: boolean = false;
  private elevenLabs: ElevenLabsService;
  private audioElement: HTMLAudioElement | null = null;
  private currentLanguage: 'en-US' | 'ar-SA' = 'en-US';

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

  async speak(text: string, language: 'en-US' | 'ar-SA' = 'en-US') {
    if (typeof window === 'undefined') return;

    // Store the current language and stop any current speech
    this.currentLanguage = language;
    this.stop();

    // Add a small delay to ensure previous speech is fully stopped
    await new Promise(resolve => setTimeout(resolve, 100));

    if (language === 'ar-SA') {
      try {
        this.speaking = true;
        const audioData = await this.elevenLabs.convertTextToSpeech(text);
        
        if (this.currentLanguage !== 'ar-SA') {
          this.speaking = false;
          return;
        }

        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);

        if (this.audioElement) {
          // Remove any previous event listeners
          this.audioElement.onended = null;
          this.audioElement.onerror = null;
          this.audioElement.oncanplaythrough = null;

          // Set up new audio element
          this.audioElement.src = url;
          
          this.audioElement.onended = () => {
            this.speaking = false;
            URL.revokeObjectURL(url);
          };

          this.audioElement.onerror = () => {
            console.error('Audio playback error');
            this.speaking = false;
            URL.revokeObjectURL(url);
          };

          try {
            await this.audioElement.play();
          } catch (error) {
            console.error('Audio play error:', error);
            this.speaking = false;
          }
        }
      } catch (error) {
        console.error('Error with ElevenLabs TTS:', error);
        this.speaking = false;
      }
    } else {
      try {
        const chunks = this.chunkText(text);
        let currentChunk = 0;

        const speakChunk = () => {
          if (this.currentLanguage !== 'en-US' || currentChunk >= chunks.length) {
            this.speaking = false;
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
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

          utterance.onstart = () => {
            this.speaking = true;
          };

          utterance.onend = () => {
            if (this.currentLanguage === 'en-US') {
              currentChunk++;
              if (currentChunk < chunks.length) {
                speakChunk();
              } else {
                this.speaking = false;
              }
            }
          };

          utterance.onerror = () => {
            console.error('Speech synthesis error occurred');
            this.speaking = false;
          };

          window.speechSynthesis.speak(utterance);
        };

        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            if (this.currentLanguage === 'en-US') {
              speakChunk();
            }
          }, { once: true });
        } else {
          speakChunk();
        }
      } catch (error) {
        console.error('Error with Web Speech API:', error);
        this.speaking = false;
      }
    }
  }

  stop() {
    if (typeof window === 'undefined') return;
    
    window.speechSynthesis.cancel();
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      // Remove all event listeners
      this.audioElement.onended = null;
      this.audioElement.onerror = null;
      this.audioElement.oncanplaythrough = null;
    }
    
    this.speaking = false;
  }

  isSpeaking(): boolean {
    return this.speaking;
  }
}