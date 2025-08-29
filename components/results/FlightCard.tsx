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

// Map airline names to logo files - using working URLs
const airlineLogos: Record<string, string> = {
  'Ryanair': 'https://logos-world.net/wp-content/uploads/2020/03/Ryanair-Logo.png',
  'EasyJet': 'https://logos-world.net/wp-content/uploads/2023/01/EasyJet-Logo.png',
  'Lufthansa': '/airline-logos/lufthansa-real.svg',
  'KLM': '/airline-logos/klm-real.svg',
  'Air France': '/airline-logos/airfrance-real.svg',
  'British Airways': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/British_Airways_Logo.svg/300px-British_Airways_Logo.svg.png',
  'Wizz Air': '/airline-logos/wizz-air.svg',
  'Emirates': '/airline-logos/emirates.svg',
  'Turkish Airlines': '/airline-logos/turkish-airlines.svg',
  'Qatar Airways': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/300px-Qatar_Airways_Logo.svg.png',
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
      <div className="flex items-center">
        {/* Times and airports - fixed widths */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-16 text-right">
            <div className="text-lg font-medium">{format(new Date(firstSegment.departure.time), 'HH:mm')}</div>
            <div 
              className="text-xs text-gray-500 cursor-help hover:text-black transition-colors"
              title={airportNames[depCode] || depCode}
            >
              {depCode}
            </div>
          </div>
          
          <div className="flex flex-col items-center w-24">
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
          
          <div className="w-16 text-left">
            <div className="text-lg font-medium">{format(new Date(lastSegment.arrival.time), 'HH:mm')}</div>
            <div 
              className="text-xs text-gray-500 cursor-help hover:text-black transition-colors"
              title={airportNames[arrCode] || arrCode}
            >
              {arrCode}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const airlineLogo = airlineLogos[outboundSegments[0].airline];

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="px-4 py-3">
        <div className="flex items-center">
          {/* Airline logo - fixed width */}
          <div className="w-24 flex items-center justify-center mr-6">
            {airlineLogo ? (
              <img 
                src={airlineLogo} 
                alt={outboundSegments[0].airline}
                className="max-w-full h-6 object-contain"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    const text = document.createElement('span');
                    text.className = 'text-sm text-gray-600';
                    text.textContent = outboundSegments[0].airline;
                    parent.appendChild(text);
                  }
                }}
              />
            ) : (
              <span className="text-sm text-gray-600">
                {outboundSegments[0].airline}
              </span>
            )}
          </div>

          {/* Flight details - flex-1 for consistent spacing */}
          <div className="flex-1">
            {returnSegments ? (
              <div className="grid grid-cols-2 gap-x-8">
                <div>{renderSegment(outboundSegments)}</div>
                <div className="border-l border-gray-200 pl-8">{renderSegment(returnSegments)}</div>
              </div>
            ) : (
              <div className="max-w-xs">
                {renderSegment(outboundSegments)}
              </div>
            )}
          </div>

          {/* Price and button - fixed width aligned right */}
          <div className="flex items-center gap-4 ml-8">
            <div className="text-2xl font-light text-right w-28">
              {formatPrice(price.amount, price.currency)}
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-900 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Select →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}