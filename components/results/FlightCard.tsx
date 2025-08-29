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

// Airline logos as simple colored circles for now
const airlineColors: Record<string, string> = {
  'Ryanair': 'bg-blue-600',
  'EasyJet': 'bg-orange-500',
  'Lufthansa': 'bg-gray-800',
  'KLM': 'bg-blue-500',
  'Air France': 'bg-red-600',
  'British Airways': 'bg-blue-800',
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
}: FlightCardProps) {
  const extractAirportCode = (airport: string) => {
    // Extract code from format like "New York (JFK)" or just "JFK"
    const match = airport.match(/\(([^)]+)\)/);
    return match ? match[1] : airport;
  };

  const renderSegment = (segments: FlightSegment[]) => {
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    const totalSegmentDuration = segments.reduce((acc, seg) => acc + seg.duration, 0);
    const depCode = extractAirportCode(firstSegment.departure.airport);
    const arrCode = extractAirportCode(lastSegment.arrival.airport);
    
    return (
      <div className="flex items-center gap-4">
        {/* Airline logo */}
        <div className="flex items-center gap-2 w-24">
          <div className={`w-4 h-4 rounded-full ${airlineColors[firstSegment.airline] || 'bg-gray-400'}`} />
          <span className="text-xs text-gray-500 truncate">{firstSegment.airline}</span>
        </div>
        
        {/* Departure */}
        <div className="text-right w-20">
          <div className="font-medium text-sm">{format(new Date(firstSegment.departure.time), 'HH:mm')}</div>
          <div 
            className="text-xs text-gray-500 cursor-help hover:text-black transition-colors"
            title={airportNames[depCode] || depCode}
          >
            {depCode}
          </div>
        </div>
        
        {/* Duration and stops */}
        <div className="flex-1 max-w-32">
          <div className="text-center">
            <div className="text-xs text-gray-400">{formatDuration(totalSegmentDuration)}</div>
            <div className="relative">
              <div className="h-px bg-gray-300 w-full my-1"></div>
              {segments.length > 1 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {segments.length === 1 ? 'direct' : `${segments.length - 1} stop`}
            </div>
          </div>
        </div>
        
        {/* Arrival */}
        <div className="text-left w-20">
          <div className="font-medium text-sm">{format(new Date(lastSegment.arrival.time), 'HH:mm')}</div>
          <div 
            className="text-xs text-gray-500 cursor-help hover:text-black transition-colors"
            title={airportNames[arrCode] || arrCode}
          >
            {arrCode}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-all mb-2 max-w-3xl">
      <div className="p-3">
        {returnSegments ? (
          <div className="space-y-3">
            <div>{renderSegment(outboundSegments)}</div>
            <div className="pt-3 border-t border-gray-100">
              {renderSegment(returnSegments)}
            </div>
          </div>
        ) : (
          renderSegment(outboundSegments)
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-4">
          <div className="text-xl font-light">
            {formatPrice(price.amount, price.currency)}
          </div>
          
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black hover:bg-gray-900 text-white px-4 py-1.5 text-xs uppercase tracking-wider transition-colors rounded"
          >
            Select
          </a>
        </div>
      </div>
    </div>
  );
}