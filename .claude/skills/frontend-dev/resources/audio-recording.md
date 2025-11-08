# Audio Recording - Super Feynman Frontend

Complete guide to implementing audio recording with speech-to-text transcription.

---

## useAudioRecorder Hook

```javascript
// hooks/useAudioRecorder.js
import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const clearRecording = () => {
        setAudioBlob(null);
        chunksRef.current = [];
    };

    return {
        isRecording,
        audioBlob,
        startRecording,
        stopRecording,
        clearRecording,
    };
};
```

---

## Microphone Button Component

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const MicrophoneButton = ({ onTranscription }) => {
    const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder();
    const [isTranscribing, setIsTranscribing] = useState(false);

    useEffect(() => {
        if (audioBlob) {
            transcribeAudio(audioBlob);
        }
    }, [audioBlob]);

    const transcribeAudio = async (blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');

            const response = await axios.post('/api/transcribe', formData);
            onTranscription(response.data.text);
            clearRecording();
        } catch (error) {
            console.error('Transcription failed:', error);
            alert('Failed to transcribe audio');
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all
                ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary hover:bg-primary-dark'}
                ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
        </button>
    );
};

export default MicrophoneButton;
```

---

## Complete Review Session Example

```javascript
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MicrophoneButton from '../components/MicrophoneButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { reviewApi } from '../services/api';

const ReviewSession = () => {
    const { conceptId } = useParams();
    const [conversation, setConversation] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [audienceLevel, setAudienceLevel] = useState('classmate');

    const startReview = async () => {
        try {
            setLoading(true);
            const response = await reviewApi.startReview(conceptId, audienceLevel);
            setConversation([
                {
                    role: 'assistant',
                    content: response.data.data.message
                }
            ]);
        } catch (error) {
            alert('Failed to start review');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (message) => {
        if (!message.trim()) return;

        // Add user message
        const updatedConversation = [
            ...conversation,
            { role: 'user', content: message }
        ];
        setConversation(updatedConversation);
        setUserInput('');

        try {
            setLoading(true);
            const response = await reviewApi.continueReview(
                updatedConversation,
                message
            );

            setConversation([
                ...updatedConversation,
                {
                    role: 'assistant',
                    content: response.data.data.message
                }
            ]);
        } catch (error) {
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleTranscription = (text) => {
        setUserInput(text);
    };

    if (conversation.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Start Review</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Explain as if to:
                    </label>
                    <select
                        value={audienceLevel}
                        onChange={(e) => setAudienceLevel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="classmate">A Classmate</option>
                        <option value="middle-schooler">A Middle Schooler</option>
                        <option value="kid">An 8-Year-Old</option>
                    </select>
                </div>
                <button
                    onClick={startReview}
                    className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark"
                >
                    Start Review Session
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            {/* Conversation History */}
            <div className="mb-4 space-y-4 h-96 overflow-y-auto">
                {conversation.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg ${
                            msg.role === 'user'
                                ? 'bg-primary text-white ml-8'
                                : 'bg-gray-100 mr-8'
                        }`}
                    >
                        <p className="font-medium mb-1">
                            {msg.role === 'user' ? 'You' : 'Tutor'}
                        </p>
                        <p>{msg.content}</p>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-center">
                        <LoadingSpinner />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-2">
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(userInput);
                        }
                    }}
                    placeholder="Type your explanation or use the microphone..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary"
                    rows="3"
                />
                <MicrophoneButton onTranscription={handleTranscription} />
                <button
                    onClick={() => sendMessage(userInput)}
                    disabled={loading || !userInput.trim()}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ReviewSession;
```

---

## Audio Recording Best Practices

✅ **DO:**
- Request microphone permissions gracefully
- Show recording state clearly (red pulse)
- Stop media tracks after recording
- Handle permission denials
- Clean up audio blobs after use
- Show loading state during transcription
- Provide text input as fallback

❌ **DON'T:**
- Start recording without user action
- Forget to stop media streams
- Keep audio blobs in memory indefinitely
- Hide transcription errors
- Block UI during transcription
