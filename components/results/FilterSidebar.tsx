'use client';

import { useState, useEffect } from 'react';

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void;
  availableAirlines?: string[];
  initialStops?: string;
}

export default function FilterSidebar({ onFiltersChange, availableAirlines = [], initialStops = 'any' }: FilterSidebarProps) {
  const [stops, setStops] = useState<string>(initialStops);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [airlines, setAirlines] = useState<string[]>([]);
  const [departureTime, setDepartureTime] = useState<string>('any');
  const [duration, setDuration] = useState<number>(24);
  
  // Apply initial filters on mount
  useEffect(() => {
    onFiltersChange({ stops: initialStops, maxPrice, airlines, departureTime, duration });
  }, []);

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

  const handleDepartureTimeChange = (value: string) => {
    setDepartureTime(value);
    onFiltersChange({ stops, maxPrice, airlines, departureTime: value, duration });
  };

  const handleDurationChange = (value: number) => {
    setDuration(value);
    onFiltersChange({ stops, maxPrice, airlines, departureTime, duration: value });
  };

  const airlinesList = availableAirlines.length > 0 ? availableAirlines : [];
  const timeSlots = [
    { value: 'any', label: 'Any time' },
    { value: 'morning', label: 'Morning (6am-12pm)' },
    { value: 'afternoon', label: 'Afternoon (12pm-6pm)' },
    { value: 'evening', label: 'Evening (6pm-12am)' },
  ];

  return (
    <div className="w-64 pr-6">
      <div>
        <h2 className="text-sm font-medium mb-6">Filters</h2>
        
        {/* Stops */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Stops</h3>
          <div className="space-y-2">
            {['any', 'direct', '1 stop', '2+ stops'].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -mx-2">
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Up to</span>
              <span className="text-sm font-medium">€{maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              value={maxPrice}
              onChange={(e) => handlePriceChange(parseInt(e.target.value))}
              className="w-full accent-black"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>€50</span>
              <span>€1500</span>
            </div>
          </div>
        </div>

        {/* Airlines */}
        {airlinesList.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Airlines</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {airlinesList.map(airline => (
                <label key={airline} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -mx-2">
                  <input
                    type="checkbox"
                    checked={airlines.includes(airline)}
                    onChange={() => toggleAirline(airline)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm">{airline}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Departure time */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Departure time</h3>
          <div className="space-y-2">
            {timeSlots.map(slot => (
              <label key={slot.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -mx-2">
                <input
                  type="radio"
                  name="departureTime"
                  checked={departureTime === slot.value}
                  onChange={() => handleDepartureTimeChange(slot.value)}
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Up to</span>
              <span className="text-sm font-medium">{duration} hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              value={duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value))}
              className="w-full accent-black"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>2h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        {/* Clear filters */}
        <button
          onClick={() => {
            setStops('any');
            setMaxPrice(1500);
            setAirlines([]);
            setDepartureTime('any');
            setDuration(24);
            onFiltersChange({ stops: 'any', maxPrice: 1500, airlines: [], departureTime: 'any', duration: 24 });
          }}
          className="w-full py-2 border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}