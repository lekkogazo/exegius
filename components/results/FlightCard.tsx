'use client';

import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { getAirlineLogoPath, getAirlineName } from '@/lib/airline-codes';

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
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  
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
          <div className="text-xs text-gray-500 w-24 flex-shrink-0">
            {depDate}
          </div>
          <span className="font-medium w-12 text-right flex-shrink-0">{depTime}</span>
          <AirportTooltip code={depCode} fullName={depAirportFull}>
            <div className="flex items-center ml-3 w-32">
              <span className="text-gray-600 truncate">{depCity}</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded ml-1 flex-shrink-0">{depCode}</span>
            </div>
          </AirportTooltip>
          <div className="flex items-center justify-center w-8 mx-2 flex-shrink-0">
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </div>
          <span className="font-medium w-12 text-right flex-shrink-0">{arrTime}</span>
          <AirportTooltip code={arrCode} fullName={arrAirportFull}>
            <div className="flex items-center ml-3 w-32">
              <span className="text-gray-600 truncate">{arrCity}</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded ml-1 flex-shrink-0">{arrCode}</span>
            </div>
          </AirportTooltip>
          
          <div className="text-xs text-gray-400 whitespace-nowrap ml-auto">
            {formatDuration(duration)} / {stops > 0 ? `${stops} stop${stops > 1 ? 's' : ''}` : 'no change'}
          </div>
        </div>
        
        {/* Expanded details below - showing all segments */}
        {isExpanded && (
          <div className="mt-3 pb-3 pr-12">
            {segments.map((segment, index) => {
              const segDepTime = format(new Date(segment.departure.time), 'HH:mm');
              const segArrTime = format(new Date(segment.arrival.time), 'HH:mm');
              const segDepCity = extractCityName(segment.departure.airport) || extractAirportCode(segment.departure.airport);
              const segArrCity = extractCityName(segment.arrival.airport) || extractAirportCode(segment.arrival.airport);
              const segDepCode = extractAirportCode(segment.departure.airport);
              const segArrCode = extractAirportCode(segment.arrival.airport);
              
              const airlineName = getAirlineName(segment.airline);
              const logoPath = getAirlineLogoPath(segment.airline);
              const logoKey = `${segment.airline}-${index}`;
              const shouldShowLogo = logoPath && !failedLogos.has(logoKey);
              
              return (
                <div key={index} className="flex items-center py-2 bg-gray-50 px-3 rounded mb-2 ml-24 mr-4">
                  <div className="inline-flex items-center gap-2 min-w-[120px] max-w-[140px] flex-shrink-0">
                    {shouldShowLogo ? (
                      <img 
                        src={logoPath} 
                        alt={airlineName}
                        className="h-5 w-auto object-contain flex-shrink-0"
                        onError={() => {
                          setFailedLogos(prev => new Set(prev).add(logoKey));
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-600 w-6 text-center flex-shrink-0">
                        {segment.airline.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs text-gray-700 truncate">{airlineName}</span>
                  </div>
                  
                  <div className="flex items-center ml-2">
                    <span className="text-sm font-medium w-11 text-right">{segDepTime}</span>
                    <span className="text-sm ml-2 w-16 truncate">{segDepCity}</span>
                    <span className="px-1 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 ml-1 w-10 text-center flex-shrink-0">
                      {segDepCode}
                    </span>
                  </div>
                  
                  <span className="text-gray-400 mx-2 flex-shrink-0">→</span>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-11 text-right">{segArrTime}</span>
                    <span className="text-sm ml-2 w-16 truncate">{segArrCity}</span>
                    <span className="px-1 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 ml-1 w-10 text-center flex-shrink-0">
                      {segArrCode}
                    </span>
                  </div>
                  
                  <span className="text-blue-600 font-medium text-xs ml-4 min-w-[60px]">{segment.flightNumber}</span>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-auto">{formatDuration(segment.duration)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all group relative">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="flex-1 pr-4">
            <div className={isExpanded ? "space-y-6" : "space-y-2"}>
              {renderFlightLeg(outboundSegments, 'outbound')}
              {returnSegments && renderFlightLeg(returnSegments, 'return')}
            </div>
          </div>

          {!isExpanded && (
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
          )}
        </div>
        
      </div>
      
      {/* Total section when expanded */}
      {isExpanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {returnSegments ? 'Round-trip total price' : 'One-way total price'}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Total:</span>
              <span className="text-xl font-bold">{formatPrice(price.amount, price.currency)}</span>
            </div>
            <a 
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors uppercase inline-block"
            >
              BOOK FLIGHT
            </a>
          </div>
        </div>
      )}
    </div>
  );
}