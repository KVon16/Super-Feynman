import { Trash2 } from 'lucide-react';
import { Concept } from '../App';
import { StatusBadge } from './StatusBadge';

interface ConceptCardProps {
  concept: Concept;
  onSelect: () => void;
  onDelete: () => void;
}

export function ConceptCard({ concept, onSelect, onDelete }: ConceptCardProps) {
  return (
    <div
      className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-foreground mb-2">{concept.name}</h3>
          <StatusBadge status={concept.status} />
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
