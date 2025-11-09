import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Mic, Loader2 } from 'lucide-react';
import { Concept, FeedbackData, isValidAudienceLevel, UIMessage } from '../types';
import * as api from '../services/api';
import { useError } from '../contexts/ErrorContext';

// Configuration constants
const MAX_CONVERSATION_TURNS = 5; // Number of user messages before ending session
const END_SESSION_DELAY_MS = 1000; // Brief delay to allow user to see the final AI response

interface ReviewSessionProps {
  concept: Concept;
  audience: string;
  onEndSession: (feedback: FeedbackData) => void;
}

export function ReviewSession({ concept, audience, onEndSession }: ReviewSessionProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { showError } = useError();

  // Initialize session with backend API
  useEffect(() => {
    let cancelled = false;

    const initializeSession = async () => {
      try {
        setIsInitializing(true);

        // Validate audience level
        if (!isValidAudienceLevel(audience)) {
          throw new Error(`Invalid audience level: ${audience}`);
        }

        const response = await api.startReviewSession(concept.id, audience);

        // Only update state if still mounted
        if (!cancelled) {
          setSessionId(response.sessionId);

          const initialMessage: UIMessage = {
            id: '1',
            role: 'assistant',
            content: response.initialMessage,
          };
          setMessages([initialMessage]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error starting session:', error);
          showError('Failed to start review session. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    initializeSession();

    return () => {
      cancelled = true;
    };
  }, [concept.id, audience, showError]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Always stop all media stream tracks to release microphone
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isAIThinking || !sessionId) return;

    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const userInput = input.trim();
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setTurnCount(prevTurnCount => prevTurnCount + 1);

    try {
      setIsAIThinking(true);
      const response = await api.sendMessage(sessionId, userInput);

      const aiMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.aiResponse,
      };

      setMessages(prev => [...prev, aiMessage]);

      // End session after MAX_CONVERSATION_TURNS
      if (turnCount >= MAX_CONVERSATION_TURNS - 1) {
        // Use setTimeout to allow user to see the final AI response
        setTimeout(() => handleEndSession(), END_SESSION_DELAY_MS);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again.');
    } finally {
      setIsAIThinking(false);
    }
  };

  const startRecording = async () => {
    try {
      // Check MediaRecorder support
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        showError('Audio recording is not supported in this browser. Please use a modern browser or try text input.');
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store for cleanup

      // Detect supported audio format (Safari uses audio/mp4, others use audio/webm)
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      }

      // Create MediaRecorder instance with appropriate MIME type
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        // Create audio blob with the same MIME type used for recording
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        try {
          setIsTranscribing(true);

          // Call transcription API
          const transcribedText = await api.transcribeAudio(audioBlob);

          // Set transcribed text in input field
          setInput(transcribedText);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          showError('Failed to transcribe audio. Please try again or use text input.');
        } finally {
          setIsTranscribing(false);
        }

        // Clean up: stop all tracks to release microphone
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        // Reset audio chunks
        audioChunksRef.current = [];
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        showError('Microphone permission denied. Please allow microphone access and try again.');
      } else {
        showError('Failed to access microphone. Please check your device settings.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      setIsAIThinking(true);
      const feedback = await api.endReviewSession(sessionId);
      onEndSession(feedback);
    } catch (error) {
      console.error('Error ending session:', error);
      showError('Failed to end session. Please try again.');
      setIsAIThinking(false);
    }
    // Note: Don't set isAIThinking to false on success as we're navigating away
  };

  // Show loading state while initializing session
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Starting review session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleEndSession} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2>{concept.name}</h2>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 text-destructive border border-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Instruction */}
      <div className="bg-secondary border-b border-border px-6 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <p className="text-foreground">
            Explain the concept in your own words. The AI will ask questions to check your understanding.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground border border-border'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isAIThinking && (
            <div className="flex justify-start">
              <div className="bg-card text-foreground border border-border px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-card border-t border-border px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleMicClick}
              className={`flex-shrink-0 p-3 rounded-full transition-all ${
                isRecording
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : 'bg-secondary text-muted-foreground hover:bg-muted'
              }`}
              disabled={isAIThinking || isTranscribing}
              title={isRecording ? "Click to stop recording" : isTranscribing ? "Transcribing..." : "Click to start recording"}
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your explanation or use the microphone..."
              className="flex-1 px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isAIThinking}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAIThinking}
              className="flex-shrink-0 p-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
