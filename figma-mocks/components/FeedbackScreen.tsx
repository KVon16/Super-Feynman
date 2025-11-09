import { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, CheckCircle, XCircle, AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import { Concept, FeedbackData } from '../App';
import { AudienceSelectionDialog } from './AudienceSelectionDialog';

interface FeedbackScreenProps {
  concept: Concept;
  feedback: FeedbackData;
  onRetry: (audience: string) => void;
  onBackToConcepts: () => void;
}

export function FeedbackScreen({ concept, feedback, onRetry, onBackToConcepts }: FeedbackScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showAudienceDialog, setShowAudienceDialog] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-foreground mb-2">Analyzing your session...</h2>
          <p className="text-muted-foreground">Generating personalized feedback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1>Session Feedback</h1>
          <p className="text-muted-foreground mt-1">{concept.name}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Update */}
        <div className="bg-gradient-to-r from-primary to-[#B8664F] text-white rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center justify-center gap-4">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full">
              {feedback.oldStatus}
            </span>
            <ArrowRight className="w-6 h-6" />
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full">
              {feedback.newStatus}
            </span>
          </div>
          <p className="text-center mt-4 text-white/90">Progress updated!</p>
        </div>

        {/* Overall Quality */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <h2>Overall Quality</h2>
          </div>
          <p className="text-foreground leading-relaxed">{feedback.overallQuality}</p>
        </div>

        {/* Clear Parts */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-[#059669] flex-shrink-0 mt-1" />
            <h2>What You Explained Well</h2>
          </div>
          <ul className="space-y-2">
            {feedback.clearParts.map((part, index) => (
              <li key={index} className="flex items-start gap-2 text-foreground">
                <span className="text-[#059669] mt-1">•</span>
                <span>{part}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unclear Parts */}
        {feedback.unclearParts.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <XCircle className="w-6 h-6 text-[#EA580C] flex-shrink-0 mt-1" />
              <h2>Areas for Improvement</h2>
            </div>
            <ul className="space-y-2">
              {feedback.unclearParts.map((part, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-[#EA580C] mt-1">•</span>
                  <span>{part}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Jargon Used */}
        {feedback.jargonUsed.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#7C3AED] flex-shrink-0 mt-1" />
              <h2>Complex Terms Used</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {feedback.jargonUsed.map((term, index) => (
                <span key={index} className="px-3 py-1 bg-[#EDE9FE] text-[#5B21B6] rounded-full">
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Struggled With */}
        {feedback.struggledWith.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <h2>Challenges Identified</h2>
            </div>
            <ul className="space-y-2">
              {feedback.struggledWith.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground">
                  <span className="text-destructive mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mt-8">
          <button
            onClick={() => setShowAudienceDialog(true)}
            className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Retry This Concept
          </button>
          <button
            onClick={onBackToConcepts}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-sm"
          >
            Back to Concepts
          </button>
        </div>
      </div>

      {/* Audience Selection Dialog for Retry */}
      <AudienceSelectionDialog
        open={showAudienceDialog}
        onClose={() => setShowAudienceDialog(false)}
        onSelect={(audience) => {
          setShowAudienceDialog(false);
          onRetry(audience);
        }}
      />
    </div>
  );
}
