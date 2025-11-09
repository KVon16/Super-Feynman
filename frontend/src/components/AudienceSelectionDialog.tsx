import { X, Users, GraduationCap, Baby } from 'lucide-react';

interface AudienceSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (audience: string) => void;
}

export function AudienceSelectionDialog({ open, onClose, onSelect }: AudienceSelectionDialogProps) {
  if (!open) return null;

  const audiences = [
    { id: 'classmate', label: 'Explain to your classmate', icon: GraduationCap, description: 'College-level explanation' },
    { id: 'middleschooler', label: 'Explain to a middle schooler', icon: Users, description: 'Simplified explanation' },
    { id: 'kid', label: 'Explain to a kid', icon: Baby, description: 'Very simple explanation' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2>Choose your audience level</h2>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          <div className="space-y-3">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <button
                  key={audience.id}
                  onClick={() => onSelect(audience.id)}
                  className="w-full flex items-center gap-4 p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-secondary transition-all text-left"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-foreground">{audience.label}</div>
                    <div className="text-muted-foreground">{audience.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
