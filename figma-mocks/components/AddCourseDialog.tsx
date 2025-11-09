import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function AddCourseDialog({ open, onClose, onAdd }: AddCourseDialogProps) {
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    if (open) {
      setCourseName('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseName.trim()) {
      onAdd(courseName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Add a Course</h2>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
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
                disabled={!courseName.trim()}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Create New Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
