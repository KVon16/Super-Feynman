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
      className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-foreground">{lecture.name}</h3>
            <p className="text-muted-foreground">{lecture.concepts.length} concepts</p>
          </div>
        </div>
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
