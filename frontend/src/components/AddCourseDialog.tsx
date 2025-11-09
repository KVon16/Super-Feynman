import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface AddCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function AddCourseDialog({ open, onClose, onAdd }: AddCourseDialogProps) {
  const [courseName, setCourseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCourseName('');
      setIsLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (courseName.trim()) {
      try {
        setIsLoading(true);
        await onAdd(courseName.trim());
      } catch (error) {
        // Error is handled by parent component
        console.error('Failed to add course:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Add a Course</h2>
            <button
              onClick={onClose}
              className="p-3 hover:bg-secondary rounded transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-foreground mb-2">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Introduction to Psychology"
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!courseName.trim() || isLoading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create New Course'
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
