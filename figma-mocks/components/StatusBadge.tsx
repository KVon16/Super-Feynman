import { ProgressStatus } from '../App';

interface StatusBadgeProps {
  status: ProgressStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    'Not Started': 'bg-muted text-muted-foreground',
    'Reviewing': 'bg-[#FEF3C7] text-[#92400E]',
    'Understood': 'bg-[#D1FAE5] text-[#065F46]',
    'Mastered': 'bg-primary text-primary-foreground',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
}
