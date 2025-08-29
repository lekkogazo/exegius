'use client';

import { formatPrice } from '@/lib/utils';
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

// Map airline names to logo files
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

  const outbound = outboundSegments[0];
  const returnFlight = returnSegments?.[0];
  const depCode = extractAirportCode(outbound.departure.airport);
  const arrCode = extractAirportCode(outbound.arrival.airport);
  const airlineLogo = airlineLogos[outbound.airline];
  
  // Calculate total duration in hours
  const outDuration = outboundSegments.reduce((acc, seg) => acc + seg.duration, 0);
  const retDuration = returnSegments?.reduce((acc, seg) => acc + seg.duration, 0) || 0;
  const totalHours = Math.round((outDuration + retDuration) / 60);
  
  const isDirectFlight = outboundSegments.length === 1 && (!returnSegments || returnSegments.length === 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all group">
      <div className="p-3 flex items-center justify-between">
        {/* Left side - minimal flight info */}
        <div className="flex items-center gap-6">
          {/* Airline */}
          <div className="w-20 flex items-center justify-center">
            {airlineLogo ? (
              <img 
                src={airlineLogo} 
                alt={outbound.airline}
                className="max-w-full h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    const text = document.createElement('span');
                    text.className = 'text-xs text-gray-400';
                    text.textContent = outbound.airline;
                    parent.appendChild(text);
                  }
                }}
              />
            ) : (
              <span className="text-xs text-gray-400">
                {outbound.airline}
              </span>
            )}
          </div>

          {/* Route and times */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">{format(new Date(outbound.departure.time), 'HH:mm')}</span>
              <span className="text-sm text-gray-400">{depCode}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-px bg-gray-300"></div>
              {isDirectFlight && <span className="text-xs text-gray-400">direct</span>}
              <div className="w-8 h-px bg-gray-300"></div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm text-gray-400">{arrCode}</span>
              <span className="font-medium">{format(new Date(outbound.arrival.time), 'HH:mm')}</span>
            </div>
          </div>

          {/* Duration info - very subtle */}
          {returnFlight && (
            <div className="text-xs text-gray-400">
              {totalHours}h total
            </div>
          )}
        </div>

        {/* Right side - Price hero and button */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-light">
              {formatPrice(price.amount, price.currency)}
            </div>
            {returnFlight && (
              <div className="text-xs text-gray-400">round trip</div>
            )}
          </div>
          
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 text-sm rounded-lg transition-colors"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
}