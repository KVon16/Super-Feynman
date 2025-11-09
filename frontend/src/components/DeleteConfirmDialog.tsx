import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, title, message, onClose, onConfirm }: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="mb-2">{title}</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-all shadow-sm"
            >
              Delete
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
