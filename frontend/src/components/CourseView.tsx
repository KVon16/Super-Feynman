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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1>{course.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {lectures.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground mb-6">Add a lecture or topic to get started</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Lecture/Topic
            </button>
          </div>
        ) : (
          /* Lecture List */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2>Lectures & Topics</h2>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Lecture/Topic
              </button>
            </div>
            
            <div className="space-y-3">
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
        onAdd={async (name, file) => {
          await onAddLecture(course.id, name, file);
          setShowAddDialog(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Delete Lecture/Topic?"
        message="This action cannot be undone. All concepts in this lecture will be deleted."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteLecture(deleteTarget);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
