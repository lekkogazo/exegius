'use client';

import { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, isAfter, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  departureDate: Date | null;
  returnDate: Date | null;
  onDepartureChange: (date: Date | null) => void;
  onReturnChange: (date: Date | null) => void;
  flexibleDates?: boolean;
  minStay?: number;
  maxStay?: number;
  label?: string;
}

export default function DateRangeSelector({
  departureDate,
  returnDate,
  onDepartureChange,
  onReturnChange,
  flexibleDates = false,
  minStay = 1,
  maxStay = 30,
  label = "DATES"
}: DateRangeSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSelectingReturn, setIsSelectingReturn] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateClick = (date: Date) => {
    if (!isSelectingReturn) {
      onDepartureChange(date);
      onReturnChange(null);
      setIsSelectingReturn(true);
    } else {
      if (departureDate && isBefore(date, departureDate)) {
        onDepartureChange(date);
        onReturnChange(null);
        setIsSelectingReturn(true);
      } else {
        onReturnChange(date);
        setIsSelectingReturn(false);
        setShowCalendar(false);
      }
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(date, today)) return true;
    
    if (isSelectingReturn && departureDate) {
      const minReturnDate = addDays(departureDate, minStay);
      const maxReturnDate = addDays(departureDate, maxStay);
      return isBefore(date, minReturnDate) || isAfter(date, maxReturnDate);
    }
    
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!departureDate) return false;
    
    if (isSelectingReturn && hoveredDate) {
      return date >= departureDate && date <= hoveredDate;
    }
    
    if (!isSelectingReturn && returnDate) {
      return (isAfter(date, departureDate) || date.getTime() === departureDate.getTime()) && 
             (isBefore(date, returnDate) || date.getTime() === returnDate.getTime());
    }
    
    return false;
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Get the first day of the month and determine padding
  const firstDayOfMonth = monthDays[0];
  const dayOfWeek = firstDayOfMonth.getDay();
  const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return (
    <div className="w-full">
      <label className="block text-xs font-normal text-gray-600 mb-2 uppercase tracking-wider">{label}</label>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <input
            type="text"
            readOnly
            value={departureDate ? format(departureDate, 'dd MMM yyyy') : ''}
            onClick={() => setShowCalendar(true)}
            placeholder="Departure"
            className="w-full px-3 py-2 border border-gray-300 text-sm cursor-pointer focus:border-black outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            readOnly
            value={returnDate ? format(returnDate, 'dd MMM yyyy') : ''}
            onClick={() => setShowCalendar(true)}
            placeholder="Return"
            className="w-full px-3 py-2 border border-gray-300 text-sm cursor-pointer focus:border-black outline-none"
          />
        </div>
      </div>

      {showCalendar && (
        <div className="mt-4 p-4 border border-gray-300 bg-white">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              className="text-gray-600 hover:text-black text-sm px-2"
            >
              ←
            </button>
            
            <div className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="text-gray-600 hover:text-black text-sm px-2"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`padding-${i}`} className="h-7" />
            ))}
            {monthDays.map(day => {
              const isDisabled = isDateDisabled(day);
              const isDeparture = departureDate && day.getTime() === departureDate.getTime();
              const isReturn = returnDate && day.getTime() === returnDate.getTime();
              const isInRange = isDateInRange(day);
              const isTodayDate = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isDisabled && handleDateClick(day)}
                  onMouseEnter={() => isSelectingReturn && setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={isDisabled}
                  className={cn(
                    'h-7 text-xs transition-colors',
                    isDisabled && 'text-gray-300 cursor-not-allowed',
                    !isDisabled && 'hover:bg-gray-100 cursor-pointer',
                    isDeparture && 'bg-black text-white hover:bg-gray-800',
                    isReturn && 'bg-black text-white hover:bg-gray-800',
                    isInRange && !isDeparture && !isReturn && 'bg-gray-200',
                    isTodayDate && !isDeparture && !isReturn && 'font-bold',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
            <span className="text-xs text-gray-500">
              {isSelectingReturn ? 'Select return date' : 'Select departure date'}
            </span>
            <button
              onClick={() => setShowCalendar(false)}
              className="text-xs text-gray-600 hover:text-black"
            >
              Close
            </button>
          </div>

          {flexibleDates && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="border-gray-300"
                />
                <span className="text-xs text-gray-600">Flexible dates (±3 days)</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}