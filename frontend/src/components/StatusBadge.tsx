import { ProgressStatus } from '../App';

interface StatusBadgeProps {
  status: ProgressStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    'Not Started': 'bg-gray-200 text-gray-700',
    'Reviewing': 'bg-amber-200 text-amber-800',
    'Understood': 'bg-green-200 text-green-800',
    'Mastered': 'bg-green-600 text-white',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
}
