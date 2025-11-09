import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Course, Lecture } from '../App';
import { AddLectureDialog } from './AddLectureDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { LectureCard } from './LectureCard';

interface CourseViewProps {
  course: Course;
  lectures: Lecture[];
  onBack: () => void;
  onAddLecture: (courseId: string, name: string, file: File) => Promise<string>;
  onDeleteLecture: (lectureId: string) => void;
  onSelectLecture: (lectureId: string) => void;
}

export function CourseView({ course, lectures, onBack, onAddLecture, onDeleteLecture, onSelectLecture }: CourseViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAddLecture = async (name: string, file: File) => {
    try {
      await onAddLecture(course.id, name, file);
      setShowAddDialog(false);
    } catch (error) {
      // Error will be shown by App.tsx's error handling
      console.error('Failed to add lecture:', error);
    }
  };

  const handleDeleteLecture = async () => {
    if (!deleteTarget) return;

    try {
      await onDeleteLecture(deleteTarget);
      setDeleteTarget(null);
    } catch (error) {
      // Error will be shown by App.tsx's error handling
      console.error('Failed to delete lecture:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-textured">
      {/* Enhanced Header */}
      <div className="bg-gradient-cream-cararra border-b border-primary/10 px-6 py-5 shadow-soft">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 icon-button-enhanced rounded-full">
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h1 className="text-foreground text-shadow-sm">{course.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {lectures.length === 0 ? (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-gradient-white-cream p-12 rounded-2xl shadow-medium border border-primary/10">
              <p className="text-muted-foreground text-lg mb-8 text-center max-w-md">
                Add a lecture or topic to begin extracting concepts
              </p>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-brass-light text-white px-8 py-3.5 rounded-xl hover-lift shadow-brass transition-smooth flex items-center gap-2 mx-auto font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Lecture/Topic
              </button>
            </div>
          </div>
        ) : (
          /* Enhanced Lecture List */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-foreground text-shadow-sm">Lectures & Topics</h2>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover-lift shadow-brass transition-smooth flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Lecture/Topic
              </button>
            </div>

            <div className="space-y-4">
              {lectures.map((lecture) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  onSelect={() => onSelectLecture(lecture.id)}
                  onDelete={() => setDeleteTarget(lecture.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Lecture Dialog */}
      <AddLectureDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddLecture}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Delete Lecture/Topic?"
        message="This action cannot be undone. All concepts in this lecture will be deleted."
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLecture}
      />
    </div>
  );
}
