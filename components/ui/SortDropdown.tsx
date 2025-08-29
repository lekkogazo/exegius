'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

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
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded text-sm hover:border-gray-400 transition-colors"
      >
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
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg',
                value === option.value && 'bg-gray-50 font-medium'
              )}
            >
              <span className="flex items-center justify-between">
                {option.label}
                {value === option.value && <span className="text-xs">✓</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}