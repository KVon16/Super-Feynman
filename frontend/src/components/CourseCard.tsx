import { Trash2 } from 'lucide-react';
import { Course } from '../App';

interface CourseCardProps {
  course: Course;
  onSelect: () => void;
  onDelete: () => void;
}

export function CourseCard({ course, onSelect, onDelete }: CourseCardProps) {
  return (
    <div
      className="bg-gradient-white-cream rounded-xl border border-border p-5 hover:border-primary/40 shadow-soft hover-lift cursor-pointer group card-overlay transition-smooth"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-foreground font-medium text-shadow-sm group-hover:text-primary transition-colors">
            {course.name}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Delete course"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
