import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Mic, Loader2 } from 'lucide-react';
import { Concept, Message, FeedbackData, ProgressStatus } from '../App';

interface ReviewSessionProps {
  concept: Concept;
  audience: string;
  onEndSession: (feedback: FeedbackData) => void;
}

export function ReviewSession({ concept, audience, onEndSession }: ReviewSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with first message
  useEffect(() => {
    const audienceText = audience === 'classmate' 
      ? 'a college classmate' 
      : audience === 'middleschooler' 
      ? 'a middle schooler' 
      : 'a young child';
    
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Hi! I'd like to learn about "${concept.name}". Can you explain it to me as if I'm ${audienceText}? Take your time and explain it in your own words.`,
    };
    setMessages([initialMessage]);
  }, [concept.name, audience]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isAIThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setTurnCount(turnCount + 1);

    // Simulate AI response
    setIsAIThinking(true);
    const aiResponse = await simulateAIResponse(input, messages.length, audience);
    setIsAIThinking(false);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
    };

    setMessages(prev => [...prev, aiMessage]);

    // End session after 10 turns (5 user messages)
    if (turnCount >= 4) {
      setTimeout(() => handleEndSession(), 1000);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      
      // Simulate transcription
      const transcribedText = await simulateTranscription();
      setIsTranscribing(false);
      setInput(transcribedText);
    } else {
      setIsRecording(true);
    }
  };

  const handleEndSession = async () => {
    setIsAIThinking(true);
    
    // Simulate feedback generation
    const feedback = await simulateFeedbackGeneration(messages, concept.status);
    
    onEndSession(feedback);
  };

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
          {isTranscribing && (
            <p className="text-muted-foreground mb-2">Transcribing...</p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMicClick}
              className={`flex-shrink-0 p-3 rounded-full transition-all ${
                isRecording
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : 'bg-secondary text-muted-foreground hover:bg-muted'
              }`}
              disabled={isTranscribing || isAIThinking}
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your explanation or use the microphone..."
              className="flex-1 px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isRecording || isTranscribing || isAIThinking}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAIThinking}
              className="flex-shrink-0 p-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simulate AI response
async function simulateAIResponse(userInput: string, messageCount: number, audience: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  const responses = [
    "That's a good start! Can you elaborate on how that works in practice?",
    "Interesting! What would happen if we changed one of those factors?",
    "I see. Can you give me an example to help me understand better?",
    "Thanks for explaining! How does this relate to other concepts we've learned?",
    "Great explanation! Can you summarize the key points for me?",
  ];
  
  return responses[Math.min(Math.floor(messageCount / 2), responses.length - 1)];
}

// Simulate transcription
async function simulateTranscription(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return "This is a simulated transcription of your voice. In a real application, this would be the text from your speech.";
}

// Simulate feedback generation
async function simulateFeedbackGeneration(messages: Message[], currentStatus: ProgressStatus): Promise<FeedbackData> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const statusProgression: ProgressStatus[] = ['Not Started', 'Reviewing', 'Understood', 'Mastered'];
  const currentIndex = statusProgression.indexOf(currentStatus);
  const newStatus = statusProgression[Math.min(currentIndex + 1, statusProgression.length - 1)];
  
  return {
    oldStatus: currentStatus,
    newStatus: newStatus,
    overallQuality: "You demonstrated a solid understanding of the core concept. Your explanations were generally clear and you made good use of examples. With a bit more practice on the finer details, you'll master this concept.",
    clearParts: [
      "You clearly explained the main definition and purpose",
      "Your examples were relevant and helped illustrate the concept",
      "You showed understanding of how it connects to related topics",
    ],
    unclearParts: [
      "The distinction between similar concepts could be clearer",
      "Some technical details were glossed over too quickly",
    ],
    jargonUsed: [
      "Technical term 1",
      "Complex phrase 2",
      "Academic vocabulary 3",
    ],
    struggledWith: [
      "Explaining the underlying mechanism",
      "Providing concrete real-world applications",
    ],
  };
}
