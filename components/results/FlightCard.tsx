'use client';

import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

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

const airlineLogos: Record<string, string> = {
  'Ryanair': 'https://logos-world.net/wp-content/uploads/2020/03/Ryanair-Logo.png',
  'EasyJet': 'https://logos-world.net/wp-content/uploads/2023/01/EasyJet-Logo.png',
  'easyJet': 'https://logos-world.net/wp-content/uploads/2023/01/EasyJet-Logo.png',
  'Lufthansa': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg',
  'KLM': '/airline-logos/klm-real.svg',
  'Air France': '/airline-logos/airfrance-real.svg',
  'British Airways': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/British_Airways_Logo.svg/300px-British_Airways_Logo.svg.png',
  'Wizz Air': '/airline-logos/wizz-air.svg',
  'Emirates': '/airline-logos/emirates.svg',
  'Turkish Airlines': '/airline-logos/turkish-airlines.svg',
  'Qatar Airways': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/300px-Qatar_Airways_Logo.svg.png',
};

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
  
  // Get unique airlines - normalize the names for comparison
  const outboundAirline = outbound.airline;
  const returnAirline = returnFlight?.airline;
  const normalizedOutbound = outboundAirline.toLowerCase();
  const normalizedReturn = returnAirline?.toLowerCase();
  const showBothAirlines = returnAirline && normalizedOutbound !== normalizedReturn;
  
  const outboundLogo = airlineLogos[outboundAirline] || airlineLogos[outboundAirline.toLowerCase()];
  const returnLogo = returnAirline ? (airlineLogos[returnAirline] || airlineLogos[returnAirline.toLowerCase()]) : null;

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
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all group">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="space-y-2">
              {renderFlightLeg(outboundSegments, 'outbound')}
              {returnSegments && renderFlightLeg(returnSegments, 'return')}
            </div>
          </div>

          <div className="ml-6 flex items-center gap-3">
            <div className="flex flex-col items-center justify-center gap-1 w-20">
              {showBothAirlines ? (
                <>
                  {outboundLogo ? (
                    <img 
                      src={outboundLogo} 
                      alt={outboundAirline}
                      className="max-h-3.5 max-w-14 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          const text = document.createElement('span');
                          text.className = 'text-[10px] text-gray-400';
                          text.textContent = outboundAirline;
                          parent.appendChild(text);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400">{outboundAirline}</span>
                  )}
                  {returnLogo ? (
                    <img 
                      src={returnLogo} 
                      alt={returnAirline}
                      className="max-h-3.5 max-w-14 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                      onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            const text = document.createElement('span');
                            text.className = 'text-[10px] text-gray-400';
                            text.textContent = returnAirline || '';
                            parent.appendChild(text);
                          }
                        }}
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400">{returnAirline}</span>
                  )}
                </>
              ) : (
                outboundLogo ? (
                  <img 
                    src={outboundLogo} 
                    alt={outboundAirline}
                    className="max-h-4 max-w-16 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        const text = document.createElement('span');
                        text.className = 'text-[11px] text-gray-400';
                        text.textContent = outboundAirline;
                        parent.appendChild(text);
                      }
                    }}
                  />
                ) : (
                  <span className="text-[11px] text-gray-400">{outboundAirline}</span>
                )
              )}
            </div>

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
    </div>
  );
}