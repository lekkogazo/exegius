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

export default function FlightCard({
  outboundSegments,
  returnSegments,
  price,
  bookingUrl,
}: FlightCardProps) {
  const renderSegment = (segments: FlightSegment[]) => {
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    const totalSegmentDuration = segments.reduce((acc, seg) => acc + seg.duration, 0);
    
    return (
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-medium">{format(new Date(firstSegment.departure.time), 'HH:mm')}</div>
            <div className="text-xs text-gray-500">{firstSegment.departure.airport}</div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center">
          <div className="text-center flex-1">
            <div className="text-xs text-gray-400">{formatDuration(totalSegmentDuration)}</div>
            <div className="h-px bg-gray-300 w-full my-1"></div>
            <div className="text-xs text-gray-400">
              {segments.length === 1 ? 'direct' : `${segments.length - 1} stop`}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="font-medium">{format(new Date(lastSegment.arrival.time), 'HH:mm')}</div>
            <div className="text-xs text-gray-500">{lastSegment.arrival.airport}</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 w-16">
          {firstSegment.airline}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-all mb-2">
      <div className="p-3">
        {returnSegments ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-12">Outbound</span>
              {renderSegment(outboundSegments)}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400 w-12">Return</span>
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