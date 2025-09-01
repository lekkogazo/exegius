'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore } from 'date-fns';

export default function FlightSearchForm() {
  const router = useRouter();
  
  // Form state
  const [tripType, setTripType] = useState<'return' | 'oneway'>('return');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState('1 adult, Economy');
  const [showPassengerMenu, setShowPassengerMenu] = useState(false);
  const [showDepartCalendar, setShowDepartCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [showCombinedCalendar, setShowCombinedCalendar] = useState(false);
  const [selectingReturn, setSelectingReturn] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [nearbyAirports, setNearbyAirports] = useState(false);
  const [directOnly, setDirectOnly] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Airport suggestions state
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);

  // Fetch airport suggestions for origin
  useEffect(() => {
    const fetchOriginSuggestions = async () => {
      if (origin.length >= 2) {
        try {
          const response = await fetch(`/api/airports?query=${encodeURIComponent(origin)}`);
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
  }, [origin]);

  // Fetch airport suggestions for destination
  useEffect(() => {
    const fetchDestSuggestions = async () => {
      if (destination.length >= 2) {
        try {
          const response = await fetch(`/api/airports?query=${encodeURIComponent(destination)}`);
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
  }, [destination]);

  const handleSearch = () => {
    if (!origin || !destination || !departureDate) {
      alert('Please fill in all required fields');
      return;
    }

    const params = new URLSearchParams({
      origin,
      destination,
      departureDate: departureDate.toISOString(),
      tripType: tripType === 'return' ? 'roundtrip' : 'oneway',
      adults: adults.toString(),
      children: children.toString(),
      cabinClass,
      nearbyAirports: nearbyAirports.toString(),
      directOnly: directOnly.toString(),
    });

    // Only add returnDate if it's a round trip and returnDate exists
    if (tripType === 'return' && returnDate) {
      params.set('returnDate', returnDate.toISOString());
    }

    router.push(`/results?${params.toString()}`);
  };

  const updatePassengerText = () => {
    const total = adults + children;
    const passengerText = total === 1 ? '1 adult' : `${total} passengers`;
    setPassengers(`${passengerText}, ${cabinClass}`);
    setShowPassengerMenu(false);
  };

  const renderCombinedCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    
    const firstDayOfMonth = days[0];
    const dayOfWeek = firstDayOfMonth.getDay();
    const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const handleDateClick = (day: Date) => {
      if (isBefore(day, new Date())) return;
      
      if (!selectingReturn) {
        setDepartureDate(day);
        setReturnDate(null);
        setSelectingReturn(true);
        if (tripType === 'oneway') {
          setShowCombinedCalendar(false);
        }
      } else {
        if (departureDate && day >= departureDate) {
          setReturnDate(day);
          setSelectingReturn(false);
          setShowCombinedCalendar(false);
        } else {
          // If clicked date is before departure, reset
          setDepartureDate(day);
          setReturnDate(null);
        }
      }
    };

    return (
      <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-lg z-20 w-80">
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
            const isDeparture = departureDate && day.toDateString() === departureDate.toDateString();
            const isReturn = returnDate && day.toDateString() === returnDate.toDateString();
            const isInRange = tripType === 'return' && selectingReturn && departureDate && hoveredDate && 
                           day >= departureDate && day <= hoveredDate;
            const isStaticRange = tripType === 'return' && !selectingReturn && departureDate && returnDate &&
                                day >= departureDate && day <= returnDate;
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
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
        
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          {selectingReturn && tripType === 'return' ? 'Select return date' : 'Select departure date'}
        </div>
      </div>
    );
  };


  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-2xl p-6">
        {/* Trip type tabs */}
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              checked={tripType === 'return'}
              onChange={() => setTripType('return')}
              className="text-black focus:ring-black"
            />
            <span className="text-sm">Round trip</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              checked={tripType === 'oneway'}
              onChange={() => setTripType('oneway')}
              className="text-black focus:ring-black"
            />
            <span className="text-sm">One way</span>
          </label>
        </div>

        {/* Main search inputs */}
        <div className="space-y-3">
          {/* From/To row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="absolute left-4 top-2 text-xs text-gray-500">From</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onFocus={() => setShowOriginSuggestions(true)}
                onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                placeholder="City or airport code"
                className="w-full px-4 pt-7 pb-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none"
              />
              
              {showOriginSuggestions && origin.length > 0 && originSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
                  {originSuggestions.map((airport, index) => (
                    <button
                      key={`${airport.code}-${index}`}
                      onClick={() => {
                        setOrigin(`${airport.city} (${airport.code})`);
                        setShowOriginSuggestions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      <div className="font-medium">{airport.city}</div>
                      <div className="text-xs text-gray-500">{airport.code} - {airport.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              <label className="absolute left-4 top-2 text-xs text-gray-500">To</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowDestSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                placeholder="City or airport code"
                className="w-full px-4 pt-7 pb-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none"
              />
              
              {showDestSuggestions && destination.length > 0 && destSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
                  {destSuggestions.map((airport, index) => (
                    <button
                      key={`${airport.code}-${index}`}
                      onClick={() => {
                        setDestination(`${airport.city} (${airport.code})`);
                        setShowDestSuggestions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      <div className="font-medium">{airport.city}</div>
                      <div className="text-xs text-gray-500">{airport.code} - {airport.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="absolute left-4 top-2 text-xs text-gray-500">Depart</label>
              <input
                type="text"
                value={departureDate ? format(departureDate, 'dd MMM yyyy') : ''}
                onClick={() => {
                  setShowCombinedCalendar(!showCombinedCalendar);
                  setSelectingReturn(false);
                }}
                placeholder="Select date"
                readOnly
                className="w-full px-4 pt-7 pb-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 focus:outline-none cursor-pointer"
              />
              
              {showCombinedCalendar && renderCombinedCalendar()}
            </div>
            
            <div className="relative">
              <label className="absolute left-4 top-2 text-xs text-gray-500">Return</label>
              <input
                type="text"
                value={returnDate ? format(returnDate, 'dd MMM yyyy') : ''}
                onClick={() => {
                  if (tripType === 'return') {
                    setShowCombinedCalendar(!showCombinedCalendar);
                    setSelectingReturn(!!departureDate);
                  }
                }}
                placeholder={tripType === 'oneway' ? 'One way' : 'Select date'}
                readOnly
                disabled={tripType === 'oneway'}
                className={cn(
                  "w-full px-4 pt-7 pb-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-400 focus:outline-none cursor-pointer",
                  tripType === 'oneway' && "bg-gray-50 text-gray-400 cursor-not-allowed"
                )}
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="relative">
            <label className="absolute left-4 top-2 text-xs text-gray-500">Passengers & Class</label>
            <button
              onClick={() => setShowPassengerMenu(!showPassengerMenu)}
              className="w-full px-4 pt-7 pb-3 bg-white border border-gray-200 rounded-xl text-sm text-left focus:border-gray-400 focus:outline-none"
            >
              {passengers}
            </button>

            {showPassengerMenu && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl p-4 shadow-lg z-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Adults</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{adults}</span>
                      <button
                        onClick={() => setAdults(adults + 1)}
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
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{children}</span>
                      <button
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-sm mb-2">Cabin class</div>
                    <div className="flex flex-wrap gap-2">
                      {['Economy', 'Premium', 'Business', 'First'].map(cls => (
                        <button
                          key={cls}
                          onClick={() => setCabinClass(cls)}
                          className={cn(
                            "px-3 py-1.5 border rounded-lg text-xs transition-colors",
                            cabinClass === cls 
                              ? "border-gray-400 bg-gray-100" 
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={updatePassengerText}
                    className="w-full py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional options */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={nearbyAirports}
              onChange={(e) => setNearbyAirports(e.target.checked)}
              className="rounded border-gray-300" 
            />
            <span>Add nearby airports</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={directOnly}
              onChange={(e) => setDirectOnly(e.target.checked)}
              className="rounded border-gray-300" 
            />
            <span>Direct flights only</span>
          </label>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="w-full mt-6 bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-medium transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}