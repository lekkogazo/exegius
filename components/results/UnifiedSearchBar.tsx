'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isToday } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, Calendar, Users, ArrowRight } from 'lucide-react';

const AIRPORTS = [
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy' },
  { code: 'LHR', city: 'London', name: 'Heathrow' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle' },
  { code: 'DXB', city: 'Dubai', name: 'International' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda' },
  { code: 'SIN', city: 'Singapore', name: 'Changi' },
  { code: 'LAX', city: 'Los Angeles', name: 'International' },
  { code: 'FRA', city: 'Frankfurt', name: 'Main' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol' },
  { code: 'MAD', city: 'Madrid', name: 'Barajas' },
  { code: 'BCN', city: 'Barcelona', name: 'El Prat' },
  { code: 'MXP', city: 'Milan', name: 'Malpensa' },
  { code: 'FCO', city: 'Rome', name: 'Fiumicino' },
  { code: 'VIE', city: 'Vienna', name: 'International' },
  { code: 'MUC', city: 'Munich', name: 'Franz Josef Strauss' },
  { code: 'ZRH', city: 'Zurich', name: 'Kloten' },
  { code: 'BER', city: 'Berlin', name: 'Brandenburg' },
];

interface UnifiedSearchBarProps {
  origin: string;
  destination: string;
  departureDate: string | null;
  returnDate: string | null;
  adults: string;
  children: string;
  cabinClass: string;
  tripType: string;
}

export default function UnifiedSearchBar({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  cabinClass,
  tripType: initialTripType,
}: UnifiedSearchBarProps) {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    origin,
    destination,
    departureDate: departureDate ? new Date(departureDate) : null,
    returnDate: returnDate ? new Date(returnDate) : null,
    adults: parseInt(adults),
    children: parseInt(children),
    cabinClass,
    tripType: initialTripType,
  });
  
  const [originInput, setOriginInput] = useState(origin);
  const [destInput, setDestInput] = useState(destination);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingReturn, setSelectingReturn] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureDate: searchParams.departureDate?.toISOString() || '',
      returnDate: searchParams.tripType === 'roundtrip' ? (searchParams.returnDate?.toISOString() || '') : '',
      tripType: searchParams.tripType,
      adults: searchParams.adults.toString(),
      children: searchParams.children.toString(),
      cabinClass: searchParams.cabinClass,
    });

    router.push(`/results?${params.toString()}`);
    setActiveDropdown(null);
  };

  const handleSwapAirports = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
    setOriginInput(destInput);
    setDestInput(originInput);
  };

  const filteredOriginAirports = AIRPORTS.filter(a => 
    a.code.toLowerCase().includes(originInput.toLowerCase()) ||
    a.city.toLowerCase().includes(originInput.toLowerCase())
  );

  const filteredDestAirports = AIRPORTS.filter(a => 
    a.code.toLowerCase().includes(destInput.toLowerCase()) ||
    a.city.toLowerCase().includes(destInput.toLowerCase())
  );

  const totalPassengers = searchParams.adults + searchParams.children;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    
    const firstDayOfMonth = days[0];
    const dayOfWeek = firstDayOfMonth.getDay();
    const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return (
      <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50 w-80">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <span className="text-sm font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="h-8" />
          ))}
          {days.map(day => {
            const isDisabled = isBefore(day, new Date());
            const isTodayDate = isToday(day);
            const isDeparture = searchParams.departureDate && day.toDateString() === searchParams.departureDate.toDateString();
            const isReturn = searchParams.returnDate && day.toDateString() === searchParams.returnDate.toDateString();
            const isInRange = searchParams.departureDate && searchParams.returnDate &&
                            day > searchParams.departureDate && day < searchParams.returnDate;
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  if (!isDisabled) {
                    if (!selectingReturn) {
                      setSearchParams(prev => ({ ...prev, departureDate: day, returnDate: null }));
                      if (searchParams.tripType === 'roundtrip') {
                        setSelectingReturn(true);
                      } else {
                        setActiveDropdown(null);
                      }
                    } else {
                      if (searchParams.departureDate && day > searchParams.departureDate) {
                        setSearchParams(prev => ({ ...prev, returnDate: day }));
                        setSelectingReturn(false);
                        setActiveDropdown(null);
                      }
                    }
                  }
                }}
                disabled={isDisabled}
                className={cn(
                  'h-8 text-sm rounded hover:bg-gray-100',
                  isDisabled && 'text-gray-300 cursor-not-allowed',
                  isTodayDate && !isDeparture && !isReturn && 'font-bold',
                  (isDeparture || isReturn) && 'bg-black text-white hover:bg-gray-800',
                  isInRange && !isDeparture && !isReturn && 'bg-gray-100'
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          {selectingReturn ? 'Select return date' : 'Select departure date'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Trip Type */}
          <div className="dropdown-container relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'tripType' ? null : 'tripType')}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 text-sm"
            >
              {searchParams.tripType === 'roundtrip' ? 'Round trip' : 'One way'}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {activeDropdown === 'tripType' && (
              <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => {
                    setSearchParams(prev => ({ ...prev, tripType: 'roundtrip' }));
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Round trip
                </button>
                <button
                  onClick={() => {
                    setSearchParams(prev => ({ ...prev, tripType: 'oneway', returnDate: null }));
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  One way
                </button>
              </div>
            )}
          </div>

          {/* Route */}
          <div className="dropdown-container relative flex items-center">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'origin' ? null : 'origin')}
              className="px-3 py-2 border border-gray-300 rounded-l-lg hover:border-gray-400 text-sm"
            >
              {searchParams.origin.split('(')[0].trim()}
            </button>
            
            <button
              onClick={handleSwapAirports}
              className="px-2 py-2 border-t border-b border-gray-300 hover:bg-gray-50"
            >
              ⇄
            </button>
            
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'destination' ? null : 'destination')}
              className="px-3 py-2 border border-gray-300 rounded-r-lg hover:border-gray-400 text-sm"
            >
              {searchParams.destination.split('(')[0].trim()}
            </button>

            {/* Origin Dropdown */}
            {activeDropdown === 'origin' && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72 p-3">
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  placeholder="City or airport"
                  autoFocus
                />
                <div className="mt-2 max-h-48 overflow-auto">
                  {filteredOriginAirports.map(airport => (
                    <button
                      key={airport.code}
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, origin: `${airport.city} (${airport.code})` }));
                        setOriginInput(`${airport.city} (${airport.code})`);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      <div className="font-medium">{airport.city}</div>
                      <div className="text-xs text-gray-500">{airport.code} - {airport.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Destination Dropdown */}
            {activeDropdown === 'destination' && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72 p-3">
                <input
                  type="text"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  placeholder="City or airport"
                  autoFocus
                />
                <div className="mt-2 max-h-48 overflow-auto">
                  {filteredDestAirports.map(airport => (
                    <button
                      key={airport.code}
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, destination: `${airport.city} (${airport.code})` }));
                        setDestInput(`${airport.city} (${airport.code})`);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      <div className="font-medium">{airport.city}</div>
                      <div className="text-xs text-gray-500">{airport.code} - {airport.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="dropdown-container relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'dates' ? null : 'dates')}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 text-sm"
            >
              <Calendar className="w-4 h-4" />
              {searchParams.departureDate && format(searchParams.departureDate, 'dd MMM')}
              {searchParams.tripType === 'roundtrip' && searchParams.returnDate && ` - ${format(searchParams.returnDate, 'dd MMM')}`}
              {!searchParams.departureDate && 'Select dates'}
            </button>
            
            {activeDropdown === 'dates' && renderCalendar()}
          </div>

          {/* Passengers */}
          <div className="dropdown-container relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'passengers' ? null : 'passengers')}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 text-sm"
            >
              <Users className="w-4 h-4" />
              {totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}, {searchParams.cabinClass}
            </button>
            
            {activeDropdown === 'passengers' && (
              <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Adults</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSearchParams(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                        className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{searchParams.adults}</span>
                      <button
                        onClick={() => setSearchParams(prev => ({ ...prev, adults: prev.adults + 1 }))}
                        className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Children</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSearchParams(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                        className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{searchParams.children}</span>
                      <button
                        onClick={() => setSearchParams(prev => ({ ...prev, children: prev.children + 1 }))}
                        className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-sm mb-2">Cabin class</div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Economy', 'Premium', 'Business', 'First'].map(cls => (
                        <button
                          key={cls}
                          onClick={() => setSearchParams(prev => ({ ...prev, cabinClass: cls }))}
                          className={cn(
                            "px-3 py-1.5 border rounded-lg text-xs transition-colors",
                            searchParams.cabinClass === cls 
                              ? "border-gray-400 bg-gray-100" 
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="ml-auto px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}