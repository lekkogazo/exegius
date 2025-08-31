'use client';

import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight, ChevronDown, ChevronUp, Plane, Clock, Luggage, Info, Coffee, Shield } from 'lucide-react';
import { useState } from 'react';
import { getAirlineLogoPath } from '@/lib/airline-codes';

interface FlightSegment {
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  airline: string;
  flightNumber: string;
  duration: number;
}

interface FlightCardProps {
  id: string;
  outboundSegments: FlightSegment[];
  returnSegments?: FlightSegment[];
  price: {
    amount: number;
    currency: string;
  };
  totalDuration: number;
  stops: number;
  bookingUrl: string;
  stayDuration?: number;
}


// Custom tooltip component
const AirportTooltip = ({ code, fullName, children }: { code: string; fullName: string; children: React.ReactNode }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span 
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
          {fullName}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </span>
  );
};

export default function FlightCard({
  outboundSegments,
  returnSegments,
  price,
  bookingUrl,
  stayDuration,
}: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const extractAirportCode = (airport: string) => {
    const match = airport.match(/\(([^)]+)\)/);
    return match ? match[1] : airport;
  };

  const extractCityName = (airport: string) => {
    return airport.split('(')[0].trim();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const outbound = outboundSegments[0];
  const returnFlight = returnSegments?.[0];

  const renderFlightLeg = (
    segments: FlightSegment[], 
    direction: 'outbound' | 'return'
  ) => {
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    const stops = segments.length - 1;
    const duration = segments.reduce((acc, seg) => acc + seg.duration, 0);
    const depTime = format(new Date(firstSeg.departure.time), 'HH:mm');
    const arrTime = format(new Date(lastSeg.arrival.time), 'HH:mm');
    const depCode = extractAirportCode(firstSeg.departure.airport);
    const arrCode = extractAirportCode(lastSeg.arrival.airport);
    const depCity = extractCityName(firstSeg.departure.airport);
    const arrCity = extractCityName(lastSeg.arrival.airport);
    const depDate = format(new Date(firstSeg.departure.time), 'EEE dd MMM');
    
    // Full airport names for tooltips
    const depAirportFull = firstSeg.departure.airport.replace(/\([^)]+\)/, '').trim();
    const arrAirportFull = lastSeg.arrival.airport.replace(/\([^)]+\)/, '').trim();

    return (
      <div>
        {/* Main flight row - ALWAYS THE SAME */}
        <div className="flex items-center text-sm">
          <div className="text-xs text-gray-500 w-20">
            {depDate}
          </div>
          <span className="font-medium w-11">{depTime}</span>
          <AirportTooltip code={depCode} fullName={depAirportFull}>
            <div className="flex items-center ml-2">
              <span className="text-gray-600 whitespace-nowrap">{depCity}</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded ml-1">{depCode}</span>
            </div>
          </AirportTooltip>
          <div className="flex items-center justify-center w-6 mx-2">
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </div>
          <span className="font-medium w-11">{arrTime}</span>
          <AirportTooltip code={arrCode} fullName={arrAirportFull}>
            <div className="flex items-center ml-2">
              <span className="text-gray-600 whitespace-nowrap">{arrCity}</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded ml-1">{arrCode}</span>
            </div>
          </AirportTooltip>
          
          <div className="text-xs text-gray-400 whitespace-nowrap ml-auto pl-4">
            {formatDuration(duration)} / {stops > 0 ? `${stops} stop${stops > 1 ? 's' : ''}` : 'no change'}
          </div>
        </div>
        
        {/* Expanded details below - showing all segments */}
        {isExpanded && (
          <div className="mt-3 px-4 pb-3">
            {segments.map((segment, index) => {
              const segDepTime = format(new Date(segment.departure.time), 'HH:mm');
              const segArrTime = format(new Date(segment.arrival.time), 'HH:mm');
              const segDate = format(new Date(segment.departure.time), 'EEE dd MMM');
              
              return (
                <div key={index} className="flex items-center gap-4 py-2 bg-gray-50 px-4 rounded mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded">
                    {getAirlineLogoPath(segment.airline) ? (
                      <img 
                        src={getAirlineLogoPath(segment.airline)!} 
                        alt={segment.airline}
                        className="h-3.5 w-auto object-contain flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span className="text-xs font-sans text-gray-700 whitespace-nowrap">{segment.airline}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{segDepTime}</span>
                    <span className="text-sm whitespace-nowrap">{extractCityName(segment.departure.airport)}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-medium">
                      {extractAirportCode(segment.departure.airport)}
                    </span>
                  </div>
                  
                  <span className="text-gray-400">→</span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{segArrTime}</span>
                    <span className="text-sm whitespace-nowrap">{extractCityName(segment.arrival.airport)}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-medium">
                      {extractAirportCode(segment.arrival.airport)}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-xs">{segment.flightNumber}</span>
                  </div>
                  
                  {index === segments.length - 1 && (
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{formatPrice(price.amount / (returnSegments ? 2 : 1), price.currency)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all group">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={isExpanded ? "space-y-6" : "space-y-2"}>
              {renderFlightLeg(outboundSegments, 'outbound')}
              {returnSegments && renderFlightLeg(returnSegments, 'return')}
            </div>
          </div>

          {!isExpanded && (
            <div className="ml-6 flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-light">
                  {formatPrice(price.amount, price.currency)}
                </div>
                {stayDuration && (
                  <div className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                    Length of stay: {stayDuration} days
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          )}
        </div>
        
      </div>
      
      {/* Total section when expanded */}
      {isExpanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Total:</span>
              <span className="text-xl font-bold">{formatPrice(price.amount, price.currency)}</span>
            </div>
            <button className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors uppercase">
              BOOK FLIGHT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}