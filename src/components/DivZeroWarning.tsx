import { AlertCircle } from 'lucide-react';

interface DivZeroWarningProps {
  className?: string;
}

export default function DivZeroWarning({ className }: DivZeroWarningProps) {
  return (
    <span className={`flex items-center gap-1 font-medium text-[10px] ${className || 'justify-end text-rose-500'}`}>
      <AlertCircle className="w-3 h-3" />
      <span>#DIV/0!</span>
    </span>
  );
}
