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
      className="bg-gradient-white-cream rounded-xl border border-border p-5 hover:border-primary/40 shadow-soft hover-lift cursor-pointer group card-overlay transition-smooth"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-medium text-shadow-sm mb-3 group-hover:text-primary transition-colors">
            {concept.name}
          </h3>
          <StatusBadge status={concept.status} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all hover:scale-110 active:scale-95 flex-shrink-0"
          aria-label="Delete concept"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
