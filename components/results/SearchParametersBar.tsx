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
];

interface SearchParametersBarProps {
  origin: string;
  destination: string;
  departureDate: string | null;
  returnDate: string | null;
  adults: string;
  children: string;
  cabinClass: string;
  tripType: string;
}

export default function SearchParametersBar({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  cabinClass,
  tripType,
}: SearchParametersBarProps) {
  const router = useRouter();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [originValue, setOriginValue] = useState(origin);
  const [destValue, setDestValue] = useState(destination);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDeparture, setSelectedDeparture] = useState<Date | null>(
    departureDate ? new Date(departureDate) : null
  );
  const [selectedReturn, setSelectedReturn] = useState<Date | null>(
    returnDate ? new Date(returnDate) : null
  );
  const [selectingReturn, setSelectingReturn] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [passengersAdults, setPassengersAdults] = useState(parseInt(adults));
  const [passengersChildren, setPassengersChildren] = useState(parseInt(children));
  const [passengersCabin, setPassengersCabin] = useState(cabinClass);

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin: originValue,
      destination: destValue,
      departureDate: selectedDeparture?.toISOString() || '',
      returnDate: selectedReturn?.toISOString() || '',
      tripType,
      adults: passengersAdults.toString(),
      children: passengersChildren.toString(),
      cabinClass: passengersCabin,
    });

    router.push(`/results?${params.toString()}`);
    setEditingField(null);
  };

  const handleSwap = () => {
    const temp = originValue;
    setOriginValue(destValue);
    setDestValue(temp);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    
    const firstDayOfMonth = days[0];
    const dayOfWeek = firstDayOfMonth.getDay();
    const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

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
            const isDeparture = selectedDeparture && day.toDateString() === selectedDeparture.toDateString();
            const isReturn = selectedReturn && day.toDateString() === selectedReturn.toDateString();
            const isInRange = selectingReturn && selectedDeparture && hoveredDate && 
                           day > selectedDeparture && day <= hoveredDate;
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  if (!isDisabled) {
                    if (!selectingReturn) {
                      setSelectedDeparture(day);
                      setSelectedReturn(null);
                      setSelectingReturn(true);
                    } else {
                      if (selectedDeparture && day >= selectedDeparture) {
                        setSelectedReturn(day);
                        setSelectingReturn(false);
                        handleSearch();
                      }
                    }
                  }
                }}
                disabled={isDisabled}
                onMouseEnter={() => selectingReturn && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                className={cn(
                  'h-8 text-sm rounded hover:bg-gray-100',
                  isDisabled && 'text-gray-300 cursor-not-allowed',
                  isTodayDate && 'font-bold',
                  isDeparture && 'bg-black text-white',
                  isReturn && 'bg-black text-white',
                  isInRange && 'bg-gray-200'
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

  const filteredOriginAirports = AIRPORTS.filter(a => 
    a.code.toLowerCase().includes(originValue.toLowerCase()) ||
    a.city.toLowerCase().includes(originValue.toLowerCase())
  );

  const filteredDestAirports = AIRPORTS.filter(a => 
    a.code.toLowerCase().includes(destValue.toLowerCase()) ||
    a.city.toLowerCase().includes(destValue.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Route */}
      <div className="relative">
        <button
          onClick={() => setEditingField(editingField === 'route' ? null : 'route')}
          className="px-3 py-1.5 border border-gray-200 rounded hover:border-gray-400"
        >
          {origin.split('(')[0].trim()} → {destination.split('(')[0].trim()}
        </button>
        
        {editingField === 'route' && (
          <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-lg z-20 w-96">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">From</label>
                <input
                  type="text"
                  value={originValue}
                  onChange={(e) => setOriginValue(e.target.value)}
                  onFocus={() => setShowOriginDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  placeholder="City or airport"
                />
                {showOriginDropdown && filteredOriginAirports.length > 0 && (
                  <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-auto">
                    {filteredOriginAirports.map(airport => (
                      <button
                        key={airport.code}
                        onClick={() => {
                          setOriginValue(`${airport.city} (${airport.code})`);
                          setShowOriginDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        <div className="font-medium">{airport.city}</div>
                        <div className="text-xs text-gray-500">{airport.code} - {airport.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button onClick={handleSwap} className="p-2 hover:bg-gray-100 rounded-lg">
                  ⇄
                </button>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">To</label>
                <input
                  type="text"
                  value={destValue}
                  onChange={(e) => setDestValue(e.target.value)}
                  onFocus={() => setShowDestDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  placeholder="City or airport"
                />
                {showDestDropdown && filteredDestAirports.length > 0 && (
                  <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-auto">
                    {filteredDestAirports.map(airport => (
                      <button
                        key={airport.code}
                        onClick={() => {
                          setDestValue(`${airport.city} (${airport.code})`);
                          setShowDestDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        <div className="font-medium">{airport.city}</div>
                        <div className="text-xs text-gray-500">{airport.code} - {airport.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span>Direct flights only</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span>Add nearby airports</span>
                </label>
              </div>
              
              <button
                onClick={handleSearch}
                className="w-full py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors mt-4"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="relative">
        {editingField === 'dates' ? (
          <div className="relative">
            {renderCalendar()}
            <button
              onClick={() => setEditingField(null)}
              className="px-3 py-1.5 border border-gray-400 rounded"
            >
              {selectedDeparture && format(selectedDeparture, 'dd MMM')}
              {selectedReturn && ` - ${format(selectedReturn, 'dd MMM')}`}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingField('dates')}
            className="px-3 py-1.5 border border-gray-200 rounded hover:border-gray-400"
          >
            {departureDate && format(new Date(departureDate), 'dd MMM')}
            {returnDate && ` - ${format(new Date(returnDate), 'dd MMM')}`}
          </button>
        )}
      </div>

      {/* Passengers */}
      <div className="relative">
        {editingField === 'passengers' ? (
          <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-lg z-20 w-64">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Adults</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPassengersAdults(Math.max(1, passengersAdults - 1))}
                    className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{passengersAdults}</span>
                  <button
                    onClick={() => setPassengersAdults(passengersAdults + 1)}
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
                    onClick={() => setPassengersChildren(Math.max(0, passengersChildren - 1))}
                    className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{passengersChildren}</span>
                  <button
                    onClick={() => setPassengersChildren(passengersChildren + 1)}
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
                      onClick={() => setPassengersCabin(cls)}
                      className={cn(
                        "px-3 py-1.5 border rounded-lg text-xs transition-colors",
                        passengersCabin === cls 
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
                onClick={handleSearch}
                className="w-full py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
        
        <button
          onClick={() => setEditingField(editingField === 'passengers' ? null : 'passengers')}
          className="px-3 py-1.5 border border-gray-200 rounded hover:border-gray-400"
        >
          {parseInt(adults) + parseInt(children)} passenger{parseInt(adults) + parseInt(children) > 1 ? 's' : ''}, {cabinClass}
        </button>
      </div>
    </div>
  );
}