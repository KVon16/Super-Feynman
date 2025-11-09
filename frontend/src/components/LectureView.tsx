import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Lecture } from '../App';
import { ConceptCard } from './ConceptCard';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { AudienceSelectionDialog } from './AudienceSelectionDialog';

interface LectureViewProps {
  lecture: Lecture;
  onBack: () => void;
  onDeleteConcept: (conceptId: string) => void;
  onSelectConcept: (conceptId: string, audience: string) => void;
}

export function LectureView({ lecture, onBack, onDeleteConcept, onSelectConcept }: LectureViewProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);

  const handleDeleteConcept = async () => {
    if (!deleteTarget) return;

    try {
      await onDeleteConcept(deleteTarget);
      setDeleteTarget(null);
    } catch (error) {
      // Error will be shown by App.tsx's error handling
      console.error('Failed to delete concept:', error);
    }
  };

  // Sort concepts: most recently reviewed first
  const sortedConcepts = [...lecture.concepts].sort((a, b) => {
    if (!a.lastReviewed && !b.lastReviewed) return 0;
    if (!a.lastReviewed) return 1;
    if (!b.lastReviewed) return -1;
    return b.lastReviewed.getTime() - a.lastReviewed.getTime();
  });

  return (
    <div className="min-h-screen bg-background bg-textured">
      {/* Enhanced Header */}
      <div className="bg-gradient-cream-cararra border-b border-primary/10 px-6 py-5 shadow-soft">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 icon-button-enhanced rounded-full">
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="text-foreground text-shadow-sm">{lecture.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {lecture.concepts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-gradient-white-cream p-12 rounded-2xl shadow-medium border border-primary/10">
              <p className="text-muted-foreground text-lg text-center">
                No concepts found in this lecture
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-8 text-foreground text-shadow-sm">
              Concepts ({lecture.concepts.length})
            </h2>

            <div className="space-y-4">
              {sortedConcepts.map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  onSelect={() => setSelectedConceptId(concept.id)}
                  onDelete={() => setDeleteTarget(concept.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audience Selection Dialog */}
      <AudienceSelectionDialog
        open={selectedConceptId !== null}
        onClose={() => setSelectedConceptId(null)}
        onSelect={(audience) => {
          if (selectedConceptId) {
            onSelectConcept(selectedConceptId, audience);
            setSelectedConceptId(null);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Delete Concept?"
        message="This action cannot be undone."
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConcept}
      />
    </div>
  );
}
