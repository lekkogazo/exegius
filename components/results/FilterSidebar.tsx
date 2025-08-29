'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void;
}

export default function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [stops, setStops] = useState<string>('any');
  const [maxPrice, setMaxPrice] = useState(500);
  const [airlines, setAirlines] = useState<string[]>([]);
  const [departureTime, setDepartureTime] = useState<string>('any');
  const [duration, setDuration] = useState<number>(24);

  const handleStopsChange = (value: string) => {
    setStops(value);
    onFiltersChange({ stops: value, maxPrice, airlines, departureTime, duration });
  };

  const handlePriceChange = (value: number) => {
    setMaxPrice(value);
    onFiltersChange({ stops, maxPrice: value, airlines, departureTime, duration });
  };

  const toggleAirline = (airline: string) => {
    const newAirlines = airlines.includes(airline) 
      ? airlines.filter(a => a !== airline)
      : [...airlines, airline];
    setAirlines(newAirlines);
    onFiltersChange({ stops, maxPrice, airlines: newAirlines, departureTime, duration });
  };

  const airlinesList = ['Ryanair', 'EasyJet', 'Lufthansa', 'KLM', 'Air France', 'British Airways'];
  const timeSlots = [
    { value: 'any', label: 'Any time' },
    { value: 'morning', label: 'Morning (6am-12pm)' },
    { value: 'afternoon', label: 'Afternoon (12pm-6pm)' },
    { value: 'evening', label: 'Evening (6pm-12am)' },
  ];

  return (
    <div className="w-64 pr-6">
      <div className="sticky top-20">
        <h2 className="text-sm font-medium mb-6">Filters</h2>
        
        {/* Stops */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Stops</h3>
          <div className="space-y-2">
            {['any', 'direct', '1 stop', '2+ stops'].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stops"
                  checked={stops === option}
                  onChange={() => handleStopsChange(option)}
                  className="text-black focus:ring-black"
                />
                <span className="text-sm capitalize">{option === 'any' ? 'Any' : option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Max price</h3>
          <div className="space-y-2">
            <input
              type="range"
              min="50"
              max="1500"
              value={maxPrice}
              onChange={(e) => handlePriceChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>€50</span>
              <span className="font-medium text-black">€{maxPrice}</span>
              <span>€1500</span>
            </div>
          </div>
        </div>

        {/* Airlines */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Airlines</h3>
          <div className="space-y-2">
            {airlinesList.map(airline => (
              <label key={airline} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={airlines.includes(airline)}
                  onChange={() => toggleAirline(airline)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{airline}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Departure time */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Departure time</h3>
          <div className="space-y-2">
            {timeSlots.map(slot => (
              <label key={slot.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="departureTime"
                  checked={departureTime === slot.value}
                  onChange={() => setDepartureTime(slot.value)}
                  className="text-black focus:ring-black"
                />
                <span className="text-sm">{slot.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Max duration</h3>
          <div className="space-y-2">
            <input
              type="range"
              min="2"
              max="24"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>2h</span>
              <span className="font-medium text-black">{duration}h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        {/* Clear filters */}
        <button
          onClick={() => {
            setStops('any');
            setMaxPrice(500);
            setAirlines([]);
            setDepartureTime('any');
            setDuration(24);
            onFiltersChange({ stops: 'any', maxPrice: 500, airlines: [], departureTime: 'any', duration: 24 });
          }}
          className="w-full py-2 border border-gray-200 rounded-lg text-sm hover:border-gray-400 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}