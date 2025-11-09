import { useState } from 'react';
import { Plus, Settings, User } from 'lucide-react';
import { Course } from '../App';
import { AddCourseDialog } from './AddCourseDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { CourseCard } from './CourseCard';

interface HomeProps {
  courses: Course[];
  onAddCourse: (name: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onSelectCourse: (courseId: string) => void;
}

export function Home({ courses, onAddCourse, onDeleteCourse, onSelectCourse }: HomeProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAddCourse = async (name: string) => {
    try {
      await onAddCourse(name);
      setShowAddDialog(false);
    } catch (error) {
      // Error will be shown by App.tsx's error handling
      console.error('Failed to add course:', error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteTarget) return;

    try {
      await onDeleteCourse(deleteTarget);
      setDeleteTarget(null);
    } catch (error) {
      // Error will be shown by App.tsx's error handling
      console.error('Failed to delete course:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto relative flex items-center justify-center">
          <h1 className="text-foreground">Super Feynman</h1>
          <div className="absolute right-0 flex gap-3">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {courses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground mb-6">Welcome, add your first course to get started</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add a Course
            </button>
          </div>
        ) : (
          /* Course List */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2>My Courses</h2>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>
            
            <div className="space-y-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={() => onSelectCourse(course.id)}
                  onDelete={() => setDeleteTarget(course.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Course Dialog */}
      <AddCourseDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddCourse}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Delete Course?"
        message="This action cannot be undone. All lectures and concepts in this course will be deleted."
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
}
