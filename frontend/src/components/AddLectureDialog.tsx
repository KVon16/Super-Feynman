import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

// Maximum file size: 5MB (matches backend validation)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

interface AddLectureDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, file: File) => Promise<void>;
}

export function AddLectureDialog({ open, onClose, onAdd }: AddLectureDialogProps) {
  const [lectureName, setLectureName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setLectureName('');
      setSelectedFile(null);
      setIsProcessing(false);
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check file type
    if (file.type !== 'text/plain') {
      alert('Please select a .txt file');
      e.target.value = '';
      return;
    }

    // Check file size (must be less than 5MB)
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`File size must be less than 5MB. Your file is ${fileSizeMB}MB`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lectureName.trim() && selectedFile) {
      setIsProcessing(true);
      await onAdd(lectureName.trim(), selectedFile);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Add Lecture/Topic</h2>
            <button onClick={onClose} className="p-3 hover:bg-secondary rounded transition-colors" disabled={isProcessing}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-foreground">Processing your notes...</p>
              <p className="text-muted-foreground mt-2">Extracting concepts using AI</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-foreground mb-2">Lecture/Topic Name</label>
                <input
                  type="text"
                  value={lectureName}
                  onChange={(e) => setLectureName(e.target.value)}
                  placeholder="e.g., Classical Conditioning"
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-foreground mb-2">Upload Notes</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-border rounded-lg hover:border-primary cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'Choose .txt file'}
                  </span>
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!lectureName.trim() || !selectedFile}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
