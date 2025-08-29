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
      <>
        <div className="text-center">
          <div className="text-lg font-medium">{format(new Date(firstSegment.departure.time), 'HH:mm')}</div>
          <div className="text-xs text-gray-500">{depCode}</div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-400">{formatDuration(totalSegmentDuration)}</div>
          <div className="w-20 h-px bg-gray-300 my-1"></div>
          <div className="text-xs text-gray-400">
            {segments.length === 1 ? 'Direct' : `${segments.length - 1} stop`}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-medium">{format(new Date(lastSegment.arrival.time), 'HH:mm')}</div>
          <div className="text-xs text-gray-500">{arrCode}</div>
        </div>
      </>
    );
  };

  const airlineLogo = airlineLogos[outboundSegments[0].airline];

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="px-4 py-3">
        <div className="flex items-center">
          {/* Airline logo */}
          <div className="w-28 flex items-center justify-center mr-4">
            {airlineLogo ? (
              <img 
                src={airlineLogo} 
                alt={outboundSegments[0].airline}
                className="max-w-full h-5 object-contain"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    const text = document.createElement('span');
                    text.className = 'text-xs text-gray-600';
                    text.textContent = outboundSegments[0].airline;
                    parent.appendChild(text);
                  }
                }}
              />
            ) : (
              <span className="text-xs text-gray-600">
                {outboundSegments[0].airline}
              </span>
            )}
          </div>

          {/* Flight details */}
          <div className="flex-1 flex items-center gap-8">
            {returnSegments ? (
              <>
                <div className="flex items-center gap-4">
                  {renderSegment(outboundSegments)}
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="flex items-center gap-4">
                  {renderSegment(returnSegments)}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {renderSegment(outboundSegments)}
              </div>
            )}
          </div>

          {/* Price and button */}
          <div className="flex items-center gap-3 ml-6">
            <div className="text-xl font-light">
              {formatPrice(price.amount, price.currency)}
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-900 text-white px-4 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              Select →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}