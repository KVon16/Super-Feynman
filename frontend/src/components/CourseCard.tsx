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
      className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-foreground">{course.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
