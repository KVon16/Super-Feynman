import { ProgressStatus } from '../App';

interface StatusBadgeProps {
  status: ProgressStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Palette-consistent colors using design system
  const colors = {
    'Not Started': 'bg-muted text-muted-foreground border border-border',
    'Reviewing': 'bg-[#FFF4ED] text-[#CC785C] border border-[#CC785C]/20',
    'Understood': 'bg-[#ECFDF5] text-[#059669] border border-[#059669]/20',
    'Mastered': 'bg-primary text-primary-foreground shadow-brass',
  };

  const glowEffect = {
    'Not Started': '',
    'Reviewing': 'shadow-sm',
    'Understood': 'shadow-sm',
    'Mastered': 'glow-brass',
  };

  return (
    <span
      className={`
        inline-block px-3 py-1.5 rounded-full text-xs font-medium
        transition-all duration-200 hover:scale-105
        ${colors[status]}
        ${glowEffect[status]}
      `}
    >
      {status}
    </span>
  );
}
