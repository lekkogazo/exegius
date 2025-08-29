'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SortOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

// Animated SVG icons
const CheapestIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" className="animate-pulse"/>
    <path d="M8 5V11M6 7H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const FastestIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 2L10 7H14L8 14L6 9H2L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" className="animate-pulse"/>
  </svg>
);

const EarliestIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse"/>
  </svg>
);

const iconMap: Record<string, React.ReactNode> = {
  'price': <CheapestIcon />,
  'duration': <FastestIcon />,
  'departure': <EarliestIcon />,
};

export default function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded text-sm hover:border-gray-400 transition-all"
      >
        {iconMap[value] && <span className="text-gray-600">{iconMap[value]}</span>}
        <span>{selectedOption?.label}</span>
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 10 10" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={cn('transition-transform duration-200 text-gray-400', isOpen && 'rotate-180')}
        >
          <path d="M2 3L5 6L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[150px] overflow-hidden">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-all duration-150',
                'first:rounded-t-lg last:rounded-b-lg',
                value === option.value && 'bg-gray-50 font-medium'
              )}
              style={{
                animation: isOpen ? `slideIn ${150 + index * 50}ms ease-out` : undefined
              }}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  {iconMap[option.value] && (
                    <span className={cn(
                      'transition-colors',
                      value === option.value ? 'text-black' : 'text-gray-400'
                    )}>
                      {iconMap[option.value]}
                    </span>
                  )}
                  {option.label}
                </span>
                {value === option.value && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6L5 9L10 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}