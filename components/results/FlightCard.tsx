'use client';

import { formatDuration, formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';

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

// Map airline names to logo files
const airlineLogos: Record<string, string> = {
  'Ryanair': '/airline-logos/ryanair-real.svg',
  'EasyJet': '/airline-logos/easyjet.svg',
  'Lufthansa': '/airline-logos/lufthansa-real.svg',
  'KLM': '/airline-logos/klm.svg',
  'Air France': '/airline-logos/airfrance.svg',
  'British Airways': '/airline-logos/british-airways.svg',
  'Wizz Air': '/airline-logos/wizz-air.svg',
  'Emirates': '/airline-logos/emirates.svg',
  'Turkish Airlines': '/airline-logos/turkish-airlines.svg',
  'Qatar Airways': '/airline-logos/qatar-airways.svg',
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
        <div className="text-right">
          <div className="text-lg font-medium">{format(new Date(firstSegment.departure.time), 'HH:mm')}</div>
          <div 
            className="text-xs text-gray-500 cursor-help hover:text-black transition-colors"
            title={airportNames[depCode] || depCode}
          >
            {depCode}
          </div>
        </div>
        
        <div className="flex flex-col items-center flex-1 max-w-[200px]">
          <div className="text-xs text-gray-400">{formatDuration(totalSegmentDuration)}</div>
          <div className="relative w-full my-1">
            <div className="h-px bg-gray-300 w-full"></div>
            {segments.length > 1 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {segments.length === 1 ? 'Direct' : `${segments.length - 1} stop`}
          </div>
        </div>
        
        <div className="text-left">
          <div className="text-lg font-medium">{format(new Date(lastSegment.arrival.time), 'HH:mm')}</div>
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

  const airlineLogo = airlineLogos[outboundSegments[0].airline];

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="p-4">
        <div className="flex items-center">
          {/* Airline logo and name */}
          <div className="flex items-center gap-3 mr-8 min-w-[140px]">
            {airlineLogo ? (
              <div className="w-8 h-8 relative flex items-center justify-center">
                <Image 
                  src={airlineLogo} 
                  alt={outboundSegments[0].airline}
                  width={32}
                  height={32}
                  className="object-contain"
                  style={{ maxWidth: '32px', maxHeight: '32px' }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                {outboundSegments[0].airline.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600">{outboundSegments[0].airline}</span>
          </div>

          {/* Flight details */}
          <div className="flex-1">
            {returnSegments ? (
              <div className="flex gap-8">
                <div className="flex-1">{renderSegment(outboundSegments)}</div>
                <div className="w-px bg-gray-200"></div>
                <div className="flex-1">{renderSegment(returnSegments)}</div>
              </div>
            ) : (
              renderSegment(outboundSegments)
            )}
          </div>

          {/* Price and select button */}
          <div className="flex items-center gap-6 ml-8">
            <div className="text-2xl font-light">
              {formatPrice(price.amount, price.currency)}
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-900 text-white px-5 py-2 text-sm font-medium rounded-lg transition-colors"
            >
              Select →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}