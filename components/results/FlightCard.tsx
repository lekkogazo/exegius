'use client';

import { formatDuration, formatPrice } from '@/lib/utils';
import { format } from 'date-fns';

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

// Airline colors for the logos
const airlineColors: Record<string, string> = {
  'Ryanair': '#073590',
  'EasyJet': '#FF6600',
  'Lufthansa': '#001751',
  'KLM': '#00A1E4',
  'Air France': '#004B87',
  'British Airways': '#075AAA',
};

// Airport full names mapping
const airportNames: Record<string, string> = {
  'JFK': 'John F. Kennedy International Airport, New York',
  'LHR': 'London Heathrow Airport',
  'CDG': 'Charles de Gaulle Airport, Paris',
  'DXB': 'Dubai International Airport',
  'HND': 'Tokyo Haneda Airport',
  'SIN': 'Singapore Changi Airport',
  'LAX': 'Los Angeles International Airport',
  'FRA': 'Frankfurt Airport',
  'AMS': 'Amsterdam Airport Schiphol',
  'MAD': 'Madrid-Barajas Airport',
  'NRN': 'Niederrhein Airport',
  'BGY': 'Milan Bergamo Airport',
};

export default function FlightCard({
  outboundSegments,
  returnSegments,
  price,
  bookingUrl,
  stayDuration,
}: FlightCardProps) {
  const extractAirportCode = (airport: string) => {
    const match = airport.match(/\(([^)]+)\)/);
    return match ? match[1] : airport;
  };

  const renderSegment = (segments: FlightSegment[], isReturn = false) => {
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    const totalSegmentDuration = segments.reduce((acc, seg) => acc + seg.duration, 0);
    const depCode = extractAirportCode(firstSegment.departure.airport);
    const arrCode = extractAirportCode(lastSegment.arrival.airport);
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Times and airports */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-lg font-medium">{format(new Date(firstSegment.departure.time), 'HH:mm')}</div>
              <div 
                className="text-sm text-gray-500 cursor-help hover:text-black transition-colors"
                title={airportNames[depCode] || depCode}
              >
                {depCode}
              </div>
            </div>
            
            <div className="flex flex-col items-center min-w-[140px]">
              <div className="text-xs text-gray-400 mb-1">{formatDuration(totalSegmentDuration)}</div>
              <div className="relative w-full">
                <div className="h-px bg-gray-300 w-full"></div>
                {segments.length > 1 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {segments.length === 1 ? 'Direct' : `${segments.length - 1} stop`}
              </div>
            </div>
            
            <div>
              <div className="text-lg font-medium">{format(new Date(lastSegment.arrival.time), 'HH:mm')}</div>
              <div 
                className="text-sm text-gray-500 cursor-help hover:text-black transition-colors"
                title={airportNames[arrCode] || arrCode}
              >
                {arrCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="p-5">
        <div className="flex">
          {/* Left side - Airline and flight details */}
          <div className="flex-1">
            {/* Airline */}
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: airlineColors[outboundSegments[0].airline] || '#6B7280' }}
              >
                {outboundSegments[0].airline.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">{outboundSegments[0].airline}</span>
            </div>
            
            {/* Flights */}
            <div className="space-y-4">
              {renderSegment(outboundSegments)}
              {returnSegments && (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    {renderSegment(returnSegments, true)}
                  </div>
                </>
              )}
            </div>
            
            {stayDuration && (
              <div className="text-xs text-gray-400 mt-3">
                Length of stay: {stayDuration} days
              </div>
            )}
          </div>
          
          {/* Right side - Price and select button */}
          <div className="flex flex-col items-end justify-center pl-8 ml-8 border-l border-gray-100">
            <div className="text-3xl font-light mb-3">
              {formatPrice(price.amount, price.currency)}
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-900 text-white px-6 py-2 text-sm font-medium rounded-lg transition-colors"
            >
              Select →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}