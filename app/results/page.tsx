'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FlightCard from '@/components/results/FlightCard';
import FilterSidebar from '@/components/results/FilterSidebar';
import SearchParametersBar from '@/components/results/SearchParametersBar';
import { calculateStayDuration } from '@/lib/utils';

// Mock data generator for demonstration
const generateMockFlights = (params: any) => {
  const flights = [];
  const airlines = ['Ryanair', 'EasyJet', 'Lufthansa', 'KLM', 'Air France'];
  const basePrice = 39.98;
  
  for (let i = 0; i < 10; i++) {
    const price = basePrice + (Math.random() * 200);
    const outboundDate = new Date(params.departureDate || new Date());
    const returnDate = params.returnDate ? new Date(params.returnDate) : null;
    
    flights.push({
      id: `flight-${i}`,
      outboundSegments: [{
        departure: {
          airport: params.origin?.split(',')[0] || 'NRN',
          time: new Date(outboundDate.setHours(12 + i, 20)).toISOString(),
        },
        arrival: {
          airport: params.destination?.split(',')[0] || 'BGY',
          time: new Date(outboundDate.setHours(13 + i, 55)).toISOString(),
        },
        airline: airlines[i % airlines.length],
        flightNumber: `FR${1234 + i}`,
        duration: 95,
      }],
      returnSegments: returnDate ? [{
        departure: {
          airport: params.destination?.split(',')[0] || 'BGY',
          time: new Date(returnDate.setHours(16 + i % 8, 15)).toISOString(),
        },
        arrival: {
          airport: params.origin?.split(',')[0] || 'NRN',
          time: new Date(returnDate.setHours(17 + i % 8, 50)).toISOString(),
        },
        airline: airlines[i % airlines.length],
        flightNumber: `FR${5678 + i}`,
        duration: 95,
      }] : undefined,
      price: {
        amount: price,
        currency: 'EUR',
      },
      totalDuration: 95,
      stops: 0,
      bookingUrl: `https://www.${airlines[i % airlines.length].toLowerCase()}.com`,
      stayDuration: returnDate ? calculateStayDuration(outboundDate.toISOString(), returnDate.toISOString()) : undefined,
    });
  }
  
  return flights;
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [filters, setFilters] = useState({
    maxPrice: 1500,
    stops: 'any',
    airlines: [] as string[],
    departureTime: 'any',
    duration: 24,
  });

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const params = Object.fromEntries(searchParams.entries());
      const mockFlights = generateMockFlights(params);
      setFlights(mockFlights);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price.amount - b.price.amount;
      case 'duration':
        return a.totalDuration - b.totalDuration;
      case 'departure':
        return new Date(a.outboundSegments[0].departure.time).getTime() - 
               new Date(b.outboundSegments[0].departure.time).getTime();
      default:
        return 0;
    }
  });

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const tripType = searchParams.get('tripType') || 'return';
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const adults = searchParams.get('adults') || '1';
  const children = searchParams.get('children') || '0';
  const cabinClass = searchParams.get('cabinClass') || 'Economy';

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const filteredFlights = sortedFlights.filter(flight => {
    if (filters.maxPrice && flight.price.amount > filters.maxPrice) return false;
    if (filters.stops !== 'any') {
      if (filters.stops === 'direct' && flight.stops !== 0) return false;
      if (filters.stops === '1 stop' && flight.stops !== 1) return false;
      if (filters.stops === '2+ stops' && flight.stops < 2) return false;
    }
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.outboundSegments[0].airline)) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Search parameters bar */}
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-black text-sm">
                ← Back
              </Link>
              <SearchParametersBar
                origin={origin}
                destination={destination}
                departureDate={departureDate}
                returnDate={returnDate}
                adults={adults}
                children={children}
                cabinClass={cabinClass}
                tripType={tripType}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {loading ? 'Searching...' : `${filteredFlights.length} results`}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="price">Cheapest</option>
                <option value="duration">Fastest</option>
                <option value="departure">Earliest</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar onFiltersChange={handleFiltersChange} />
          
          {/* Results */}
          <div className="flex-1 max-w-3xl">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg h-24 animate-pulse max-w-3xl" />
                ))}
              </div>
            ) : filteredFlights.length > 0 ? (
              <div>
                {filteredFlights.map((flight) => (
                  <FlightCard key={flight.id} {...flight} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No flights found matching your filters.</p>
                <button
                  onClick={() => setFilters({ maxPrice: 1500, stops: 'any', airlines: [], departureTime: 'any', duration: 24 })}
                  className="text-black hover:underline mt-4 inline-block text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}