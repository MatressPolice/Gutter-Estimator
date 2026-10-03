import { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: ReactNode;
  iconClassName?: string;
  popupClassName?: string;
}

export default function Tooltip({
  content,
  iconClassName = "w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer",
  popupClassName = "absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 bg-[#00162B] text-white text-xs p-2.5 rounded-lg shadow-lg z-10 font-sans font-normal leading-relaxed border border-[#A5ACAF]/30",
}: TooltipProps) {
  return (
    <div className="group relative">
      <HelpCircle className={iconClassName} />
      <div className={popupClassName}>
        {content}
      </div>
    </div>
  );
}
