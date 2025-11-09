import { Trash2, FileText } from 'lucide-react';
import { Lecture } from '../App';

interface LectureCardProps {
  lecture: Lecture;
  onSelect: () => void;
  onDelete: () => void;
}

export function LectureCard({ lecture, onSelect, onDelete }: LectureCardProps) {
  return (
    <div
      className="bg-gradient-white-cream rounded-xl border border-border p-5 hover:border-primary/40 shadow-soft hover-lift cursor-pointer group card-overlay transition-smooth"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-foreground font-medium text-shadow-sm group-hover:text-primary transition-colors">
              {lecture.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lecture.concepts.length} concept{lecture.concepts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Delete lecture"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
