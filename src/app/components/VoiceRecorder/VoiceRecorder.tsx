'use client';

import { useState, useEffect, useRef } from 'react';
import { SpeechRecognitionService } from '../../lib/speechRecognition';
import { SpeechSynthesisService } from '../../lib/speechSynthesis';
import { getGeminiResponse, clearConversationHistory } from '../../lib/gemini';
import { FaMicrophone, FaStop, FaTrash, FaVolumeMute } from 'react-icons/fa';
import { MdLanguage } from 'react-icons/md';
import styles from './VoiceRecorder.module.css';

interface Conversation {
  role: 'user' | 'assistant';
  content: string;
}

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognitionService | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisService | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'ar-SA'>('en-US');
  const [error, setError] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const SILENCE_DURATION = 1500;

  // Initialize speech synthesis service
  useEffect(() => {
    if (!speechSynthesisRef.current) {
      speechSynthesisRef.current = new SpeechSynthesisService();
    }
  }, []);

  useEffect(() => {
    setSpeechRecognition(new SpeechRecognitionService(currentLanguage));
  }, [currentLanguage]);

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      // Clear previous response before getting new one
      setResponse('');
      
      const aiResponse = await getGeminiResponse(text);

      // Update conversations with new entries only
      const newConversations: Conversation[] = [
        ...conversations,
        { role: 'user', content: text.trim() },
        { role: 'assistant', content: aiResponse }
      ];
      setConversations(newConversations);

      // Set new response and speak it
      setResponse(aiResponse);
      
      // Stop any ongoing speech before starting new one
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.stop();
        // Small delay to ensure previous speech is fully stopped
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsSpeaking(true);
        speechSynthesisRef.current.speak(aiResponse, currentLanguage);
      }

      setFinalTranscript('');
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Sorry, I encountered an error processing your request.');
    }
    setIsProcessing(false);
  };

  const handleStartRecording = () => {
    setError('');
    if (speechRecognition) {
      speechRecognition.start(
        (text, isFinal) => {
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
            silenceTimer.current = null;
          }

          if (isFinal) {
            const newTranscript = finalTranscript + ' ' + text;
            setFinalTranscript(newTranscript);
            setTranscript('');

            silenceTimer.current = setTimeout(() => {
              speechRecognition.stop();
              setIsRecording(false);
              processTranscript(newTranscript);
            }, SILENCE_DURATION);
          } else {
            setTranscript(text);
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setError('Error with speech recognition. Please try again.');
          setIsRecording(false);
        }
      );
      setIsRecording(true);
    } else {
      setError('Speech recognition is not supported in your browser.');
    }
  };

  const handleStopRecording = () => {
    if (speechRecognition) {
      speechRecognition.stop();
      setIsRecording(false);
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
      processTranscript(finalTranscript);
    }
  };

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'en-US' ? 'ar-SA' : 'en-US';
    setCurrentLanguage(newLanguage);
    if (speechRecognition) {
      speechRecognition.setLanguage(newLanguage);
    }
  };

  const handleClearConversation = async () => {
    setIsClearing(true);
    try {
      await clearConversationHistory();
      setConversations([]);
      setResponse('');
      setFinalTranscript('');
      setTranscript('');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      setError('Failed to clear conversation history.');
    }
    setIsClearing(false);
  };

  useEffect(() => {
    return () => {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkSpeakingState = setInterval(() => {
      if (speechSynthesisRef.current) {
        setIsSpeaking(speechSynthesisRef.current.isSpeaking());
      }
    }, 100);

    return () => clearInterval(checkSpeakingState);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`${styles.button} ${isRecording ? styles.stopButton : styles.startButton}`}
          disabled={isProcessing || isClearing}
        >
          <span className={styles.buttonIcon}>
            {isRecording ? <FaStop /> : <FaMicrophone />}
          </span>
          <span className={styles.buttonText}>
            {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
          </span>
        </button>

        <button
          onClick={handleLanguageToggle}
          className={styles.languageButton}
          disabled={isRecording || isProcessing || isClearing}
        >
          <span className={styles.buttonIcon}>
            <MdLanguage />
          </span>
          <span className={styles.buttonText}>
            {currentLanguage === 'en-US' ? 'Switch to Arabic' : 'Switch to English'}
          </span>
        </button>

        <button
          onClick={handleClearConversation}
          className={styles.clearButton}
          disabled={isRecording || isProcessing || isClearing || conversations.length === 0}
        >
          <span className={styles.buttonIcon}>
            <FaTrash />
          </span>
          <span className={styles.buttonText}>
            {isClearing ? 'Clearing...' : 'Clear Conversation'}
          </span>
        </button>

        {isSpeaking && (
        <button
          onClick={() => {
            if (speechSynthesisRef.current) {
              speechSynthesisRef.current.stop();
              setIsSpeaking(false);
            }
          }}
          className={styles.stopSpeakingButton}
        >
          <span className={styles.buttonIcon}>
            <FaVolumeMute />
          </span>
          <span className={styles.buttonText}>
            Stop Speaking
          </span>
        </button>
      )}
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.error}>{error}</p>
        </div>
      )}

      {transcript && (
        <div className={styles.transcriptContainer}>
          <h3 className={styles.heading}>Current Input:</h3>
          <p className={styles.interim}>{transcript}</p>
        </div>
      )}

      {finalTranscript && (
        <div className={styles.transcriptContainer}>
          <h3 className={styles.heading}>Your Question:</h3>
          <p className={styles.final}>{finalTranscript}</p>
        </div>
      )}

      {response && (
        <div className={styles.responseContainer}>
          <h3 className={styles.heading}>AI Response:</h3>
          <p className={styles.response}>{response}</p>
        </div>
      )}

      {conversations.length > 0 && (
        <div className={styles.conversationsContainer}>
          <h3 className={styles.heading}>Conversation History:</h3>
          {conversations.map((conv, index) => (
            <div
              key={index}
              className={`${styles.conversationItem} ${
                conv.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <strong className={styles.heading}>
                {conv.role === 'user' ? 'You:' : 'Assistant:'}
              </strong>
              <p>{conv.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

