'use client';

import FlightSearchForm from '@/components/search/FlightSearchForm';
import { useRouter } from 'next/navigation';
import { format, addWeeks } from 'date-fns';

export default function Home() {
  const router = useRouter();

  const handleRouteClick = (from: string, to: string) => {
    const departDate = format(addWeeks(new Date(), 2), 'yyyy-MM-dd');
    const returnDate = format(addWeeks(new Date(), 3), 'yyyy-MM-dd');
    
    const searchParams = new URLSearchParams({
      origin: from,
      destination: to,
      departureDate: departDate,
      returnDate: returnDate,
      adults: '1',
      tripType: 'roundtrip'
    });
    
    router.push(`/results?${searchParams.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-black mb-4">
            Find the best flights
          </h1>
          <p className="text-gray-600 text-lg">
            Search and compare prices from hundreds of travel sites.
          </p>
        </div>
        
        <FlightSearchForm />
        
        {/* Popular Routes - Hidden for now
        <div className="mt-24 pt-12 border-t border-gray-100">
          <h3 className="text-sm font-normal text-gray-500 mb-8 text-center uppercase tracking-wider">
            Popular Routes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { from: 'JFK', to: 'LHR', fromCity: 'New York', toCity: 'London', price: '€320' },
              { from: 'CDG', to: 'NRT', fromCity: 'Paris', toCity: 'Tokyo', price: '€890' },
              { from: 'LHR', to: 'DXB', fromCity: 'London', toCity: 'Dubai', price: '€450' },
              { from: 'SIN', to: 'SYD', fromCity: 'Singapore', toCity: 'Sydney', price: '€380' },
              { from: 'BCN', to: 'FCO', fromCity: 'Barcelona', toCity: 'Rome', price: '€95' },
              { from: 'AMS', to: 'BER', fromCity: 'Amsterdam', toCity: 'Berlin', price: '€120' },
              { from: 'MIA', to: 'CUN', fromCity: 'Miami', toCity: 'Cancun', price: '€280' },
              { from: 'DUB', to: 'EDI', fromCity: 'Dublin', toCity: 'Edinburgh', price: '€75' },
            ].map((route, i) => (
              <button
                key={i}
                onClick={() => handleRouteClick(route.from, route.to)}
                className="text-left p-3 border border-gray-200 hover:border-gray-400 transition-colors group cursor-pointer"
              >
                <div className="text-xs text-gray-500 mb-1">{route.fromCity} →</div>
                <div className="text-sm font-medium mb-2">{route.toCity}</div>
                <div className="text-xs text-gray-400">from {route.price}</div>
              </button>
            ))}
          </div>
        </div>
        */}

        <div className="mt-16 text-center">
          <p className="text-xs text-gray-400">
            Prices shown include taxes and fees. Actual prices may vary.
          </p>
        </div>
      </div>
    </main>
  );
}