'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportSelectorProps {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (airports: string[]) => void;
  multiple?: boolean;
  className?: string;
}

// Mock airport data - replace with API call
const mockAirports: Airport[] = [
  { code: 'DTM', name: 'Dortmund Airport', city: 'Dortmund', country: 'Germany' },
  { code: 'CGN', name: 'Cologne Bonn Airport', city: 'Cologne', country: 'Germany' },
  { code: 'NRN', name: 'Weeze Airport', city: 'Weeze', country: 'Germany' },
  { code: 'HHN', name: 'Frankfurt-Hahn Airport', city: 'Hahn', country: 'Germany' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
  { code: 'LIN', name: 'Milan Linate Airport', city: 'Milan', country: 'Italy' },
  { code: 'BGY', name: 'Milan Bergamo Airport', city: 'Bergamo', country: 'Italy' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
];

export default function AirportSelector({
  label,
  placeholder = 'Type to search...',
  value,
  onChange,
  multiple = true,
  className,
}: AirportSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = mockAirports.filter(
      (airport) =>
        airport.code.toLowerCase().includes(search.toLowerCase()) ||
        airport.name.toLowerCase().includes(search.toLowerCase()) ||
        airport.city.toLowerCase().includes(search.toLowerCase()) ||
        airport.country.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredAirports(filtered);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    if (multiple) {
      if (value.includes(airport.code)) {
        onChange(value.filter((code) => code !== airport.code));
      } else {
        onChange([...value, airport.code]);
      }
    } else {
      onChange([airport.code]);
      setIsOpen(false);
    }
    setSearch('');
  };

  const removeAirport = (code: string) => {
    onChange(value.filter((c) => c !== code));
  };

  const selectedAirports = value
    .map((code) => mockAirports.find((a) => a.code === code))
    .filter(Boolean) as Airport[];

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <label className="block text-xs font-normal text-gray-600 mb-2 uppercase tracking-wider">{label}</label>
      
      <div className="relative">
        <div className="min-h-[42px] w-full border border-gray-300 bg-white px-3 py-2 focus-within:border-black">
          {selectedAirports.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedAirports.map((airport) => (
                <span
                  key={airport.code}
                  className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-xs"
                >
                  <span className="font-medium">{airport.code}</span>
                  <button
                    onClick={() => removeAirport(airport.code)}
                    className="ml-1 hover:text-black text-gray-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white max-h-48 overflow-auto">
          {filteredAirports.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500">No airports found</div>
          ) : (
            filteredAirports.map((airport) => (
              <button
                key={airport.code}
                onClick={() => handleSelect(airport)}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-gray-50 text-sm',
                  value.includes(airport.code) && 'bg-gray-50'
                )}
              >
                <div className="font-medium">{airport.code}</div>
                <div className="text-xs text-gray-500">
                  {airport.city}, {airport.country}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}