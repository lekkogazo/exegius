'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isToday } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

interface CompactSearchBarProps {
  origin: string;
  destination: string;
  departureDate: string | null;
  returnDate: string | null;
  adults: string;
  children: string;
  cabinClass: string;
  tripType: string;
}

export default function CompactSearchBar({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  cabinClass,
  tripType: initialTripType,
}: CompactSearchBarProps) {
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
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [stopsFilter, setStopsFilter] = useState('any');
  
  // Reset selecting return when calendar opens
  useEffect(() => {
    if (activeDropdown === 'dates' && searchParams.tripType === 'roundtrip') {
      if (searchParams.departureDate && !searchParams.returnDate) {
        setSelectingReturn(true);
      } else if (!searchParams.departureDate) {
        setSelectingReturn(false);
      }
    } else if (searchParams.tripType === 'oneway') {
      setSelectingReturn(false);
    }
  }, [activeDropdown, searchParams.departureDate, searchParams.tripType, searchParams.returnDate]);

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureDate: searchParams.departureDate?.toISOString() || '',
      tripType: searchParams.tripType,
      adults: searchParams.adults.toString(),
      children: searchParams.children.toString(),
      cabinClass: searchParams.cabinClass,
    });

    // Only add returnDate if it's a round trip and returnDate exists
    if (searchParams.tripType === 'roundtrip' && searchParams.returnDate) {
      params.set('returnDate', searchParams.returnDate.toISOString());
    }

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

  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);

  // Fetch airport suggestions
  useEffect(() => {
    const fetchOriginSuggestions = async () => {
      if (originInput.length >= 2) {
        try {
          const response = await fetch(`/api/airports?query=${encodeURIComponent(originInput)}`);
          const suggestions = await response.json();
          setOriginSuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching origin suggestions:', error);
          setOriginSuggestions([]);
        }
      } else {
        setOriginSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchOriginSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [originInput]);

  useEffect(() => {
    const fetchDestSuggestions = async () => {
      if (destInput.length >= 2) {
        try {
          const response = await fetch(`/api/airports?query=${encodeURIComponent(destInput)}`);
          const suggestions = await response.json();
          setDestSuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching dest suggestions:', error);
          setDestSuggestions([]);
        }
      } else {
        setDestSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchDestSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [destInput]);

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
      <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50 w-80" style={{ left: '50%', transform: 'translateX(-50%)' }}>
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
            const isInRange = searchParams.tripType === 'roundtrip' && selectingReturn && searchParams.departureDate && hoveredDate && 
                           day > searchParams.departureDate && day <= hoveredDate;
            const isStaticRange = searchParams.tripType === 'roundtrip' && searchParams.departureDate && searchParams.returnDate &&
                                day > searchParams.departureDate && day < searchParams.returnDate;
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  if (!isDisabled) {
                    if (searchParams.tripType === 'oneway') {
                      // One-way trip - just set departure
                      setSearchParams(prev => ({ ...prev, departureDate: day, returnDate: null }));
                      setSelectingReturn(false);
                      setActiveDropdown(null);
                    } else {
                      // Round trip logic - based on homepage implementation
                      if (!selectingReturn) {
                        setSearchParams(prev => ({ ...prev, departureDate: day, returnDate: null }));
                        setSelectingReturn(true);
                      } else {
                        if (searchParams.departureDate && day >= searchParams.departureDate) {
                          setSearchParams(prev => ({ ...prev, returnDate: day }));
                          setSelectingReturn(false);
                          setActiveDropdown(null);
                        } else {
                          // If clicked date is before departure, reset
                          setSearchParams(prev => ({ ...prev, departureDate: day, returnDate: null }));
                        }
                      }
                    }
                  }
                }}
                onMouseEnter={() => selectingReturn && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isDisabled}
                className={cn(
                  'h-8 text-sm rounded hover:bg-gray-100 transition-colors',
                  isDisabled && 'text-gray-300 cursor-not-allowed',
                  isTodayDate && !isDeparture && !isReturn && 'font-bold',
                  (isDeparture || isReturn) && 'bg-black text-white hover:bg-gray-800',
                  (isInRange || isStaticRange) && 'bg-gray-200'
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {searchParams.tripType === 'roundtrip' ? 
              (selectingReturn ? 'Select return date' : 'Select departure date') :
              'Select departure date'
            }
          </div>
          {searchParams.tripType === 'roundtrip' && searchParams.departureDate && searchParams.returnDate && (
            <button 
              onClick={() => {
                setSearchParams(prev => ({ ...prev, departureDate: null, returnDate: null }));
                setSelectingReturn(false);
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm w-full">
      {/* All elements in one connected bar */}
      <div className="flex items-center w-full">
        {/* Trip Type */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'tripType' ? null : 'tripType')}
            className="h-9 px-2 hover:bg-gray-50 text-xs font-medium flex items-center gap-1 border-r border-gray-200 w-20"
          >
            {searchParams.tripType === 'roundtrip' ? 'Round trip' : 'One way'}
          </button>
          
          {activeDropdown === 'tripType' && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  setSearchParams(prev => ({ ...prev, tripType: 'roundtrip' }));
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 whitespace-nowrap"
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

        {/* Origin */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'origin' ? null : 'origin')}
            className="h-9 px-2 hover:bg-gray-50 text-sm font-medium truncate w-24"
          >
            {searchParams.origin.split('(')[0].trim()}
          </button>
          
          {activeDropdown === 'origin' && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72 p-3">
              <input
                type="text"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                placeholder="City or airport"
                autoFocus
              />
              <div className="mt-2 max-h-48 overflow-auto">
                {originSuggestions.map((airport, index) => (
                  <button
                    key={`${airport.code}-${index}`}
                    onClick={() => {
                      setSearchParams(prev => ({ ...prev, origin: `${airport.city} (${airport.code})` }));
                      setOriginInput(`${airport.city} (${airport.code})`);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm rounded"
                  >
                    <div className="font-medium">{airport.city}</div>
                    <div className="text-xs text-gray-500">{airport.code} - {airport.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap */}
        <button
          onClick={handleSwapAirports}
          className="h-9 px-1 hover:bg-gray-50 text-gray-500"
        >
          ⇄
        </button>

        {/* Destination */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'destination' ? null : 'destination')}
            className="h-9 px-2 hover:bg-gray-50 text-sm font-medium border-r border-gray-200 truncate w-24"
          >
            {searchParams.destination.split('(')[0].trim()}
          </button>
          
          {activeDropdown === 'destination' && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72 p-3">
              <input
                type="text"
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                placeholder="City or airport"
                autoFocus
              />
              <div className="mt-2 max-h-48 overflow-auto">
                {destSuggestions.map((airport, index) => (
                  <button
                    key={`${airport.code}-${index}`}
                    onClick={() => {
                      setSearchParams(prev => ({ ...prev, destination: `${airport.city} (${airport.code})` }));
                      setDestInput(`${airport.city} (${airport.code})`);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm rounded"
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
            className="h-9 px-2 hover:bg-gray-50 text-sm border-r border-gray-200 whitespace-nowrap w-32"
          >
            {searchParams.departureDate && searchParams.returnDate ? 
              `${format(searchParams.departureDate, 'dd MMM')} to ${format(searchParams.returnDate, 'dd MMM')}` :
              searchParams.departureDate ? 
                format(searchParams.departureDate, 'dd MMM') : 
                'Select dates'
            }
          </button>
          
          {activeDropdown === 'dates' && renderCalendar()}
        </div>

        {/* Passengers */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'passengers' ? null : 'passengers')}
            className="h-9 px-2 hover:bg-gray-50 text-sm whitespace-nowrap w-32"
          >
            {totalPassengers} {totalPassengers === 1 ? 'pax' : 'pax'}, {searchParams.cabinClass}
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

        {/* Stops filter */}
        <div className="dropdown-container relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'stops' ? null : 'stops')}
            className="h-9 px-2 text-xs font-medium transition-colors border-l border-gray-200 text-gray-600 hover:bg-gray-50 w-20"
          >
            {stopsFilter === 'any' ? 'Any' : 
             stopsFilter === 'direct' ? 'Direct' :
             stopsFilter === '1' ? '1 stop' : '2+ stops'}
          </button>
          
          {activeDropdown === 'stops' && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-32">
              <button
                onClick={() => {
                  setStopsFilter('any');
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Any stops
              </button>
              <button
                onClick={() => {
                  setStopsFilter('direct');
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Direct only
              </button>
              <button
                onClick={() => {
                  setStopsFilter('1');
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                1 stop
              </button>
              <button
                onClick={() => {
                  setStopsFilter('2+');
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                2+ stops
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="h-9 px-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium rounded-r-md"
      >
        Search
      </button>
    </div>
  );
}