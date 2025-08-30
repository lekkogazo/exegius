'use client';

import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight, ChevronDown, ChevronUp, Plane, Clock, Calendar, AlertCircle } from 'lucide-react';
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
        
        {/* Expanded details below - only shown when expanded */}
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {/* THERE/BACK label */}
            <div className="flex items-center gap-2 ml-20">
              <Plane className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 uppercase">
                {direction === 'outbound' ? 'THERE' : 'BACK'}
              </span>
              <span className="text-xs text-gray-500">
                {depDate}
              </span>
              <div className="ml-auto text-lg font-medium">
                {formatPrice(price.amount / 2, price.currency)}
              </div>
            </div>
            
            {/* Flight segments */}
            {segments.map((segment, index) => {
              const segDepTime = format(new Date(segment.departure.time), 'HH:mm');
              const segArrTime = format(new Date(segment.arrival.time), 'HH:mm');
              const segDepDate = format(new Date(segment.departure.time), 'EEE');
              
              return (
                <div key={index} className="flex items-center gap-4 text-xs ml-20">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {segDepDate} {segDepTime}
                    </span>
                    <span className="text-gray-600">{extractCityName(segment.departure.airport)}</span>
                    <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {extractAirportCode(segment.departure.airport)}
                    </span>
                  </div>
                  
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{segArrTime}</span>
                    <span className="text-gray-600">{extractCityName(segment.arrival.airport)}</span>
                    <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {extractAirportCode(segment.arrival.airport)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-blue-600 font-medium">{segment.flightNumber}</span>
                    <img 
                      src={airlineLogos[segment.airline] || airlineLogos[segment.airline.toLowerCase()]}
                      alt={segment.airline}
                      className="h-3 object-contain opacity-60"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          const text = document.createElement('span');
                          text.className = 'text-xs text-gray-400';
                          text.textContent = segment.airline;
                          parent.appendChild(text);
                        }
                      }}
                    />
                    <span className="text-gray-400">{segment.airline}</span>
                    
                    <AlertCircle className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 uppercase">Maintenance</span>
                    
                    <span className="text-gray-600 font-medium">{formatPrice(price.amount / 2, price.currency)}</span>
                    
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-medium uppercase">
                      Book Flight
                    </button>
                  </div>
                </div>
              );
            })}
            
            {direction === 'outbound' && (
              <div className="flex gap-3 mt-3 ml-20">
                <button className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs font-medium uppercase hover:bg-blue-200">
                  Hotels: In the City
                </button>
                <button className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs font-medium uppercase hover:bg-blue-200">
                  Hotels: Near the Airport
                </button>
              </div>
            )}
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
        
        {isExpanded && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Book Journey with KIWI.COM</div>
                <div className="text-[10px] text-gray-400">(a ticketing fee will be added by part of which you directly support AZair)</div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total:</div>
                  <div className="text-2xl font-medium">{formatPrice(price.amount, price.currency)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}