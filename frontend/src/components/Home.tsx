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
    <div className="min-h-screen bg-background bg-textured">
      {/* Enhanced Header */}
      <div className="bg-gradient-cream-cararra border-b border-primary/10 px-6 py-5 shadow-soft">
        <div className="max-w-4xl mx-auto relative flex items-center justify-center">
          <h1 className="text-foreground text-shadow-sm font-medium tracking-tight">
            Super Feynman
          </h1>
          <div className="absolute right-0 flex gap-2">
            <button className="p-2.5 icon-button-enhanced rounded-full">
              <Settings className="w-5 h-5 text-primary" />
            </button>
            <button className="p-2.5 icon-button-enhanced rounded-full">
              <User className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {courses.length === 0 ? (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-gradient-white-cream p-12 rounded-2xl shadow-medium border border-primary/10">
              <p className="text-muted-foreground text-lg mb-8 text-center max-w-md">
                Welcome! Add your first course to begin mastering concepts with AI
              </p>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-brass-light text-white px-8 py-3.5 rounded-xl hover-lift shadow-brass transition-smooth flex items-center gap-2 mx-auto font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Your First Course
              </button>
            </div>
          </div>
        ) : (
          /* Enhanced Course List */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-foreground text-shadow-sm">My Courses</h2>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover-lift shadow-brass transition-smooth flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>

            <div className="space-y-4">
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
