import { NextRequest, NextResponse } from 'next/server';
import FlightAPI from '@/lib/flightapi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract search parameters
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');
    const tripType = searchParams.get('tripType') || 'roundtrip';
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');
    const cabinClass = searchParams.get('cabinClass') || 'Economy';
    const directOnly = searchParams.get('directOnly') === 'true';
    
    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination, or departureDate' },
        { status: 400 }
      );
    }

    // Format dates for API (YYYY-MM-DD format)
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const formattedDepartureDate = formatDate(departureDate);
    const formattedReturnDate = returnDate ? formatDate(returnDate) : undefined;

    // Initialize FlightAPI
    // If USE_MOCK_FLIGHTS is true or no API key, it will use mock data
    const flightAPI = new FlightAPI({
      useMockData: process.env.USE_MOCK_FLIGHTS === 'true',
    });

    // Search for flights
    const flights = await flightAPI.searchFlights({
      origin,
      destination,
      departureDate: formattedDepartureDate,
      returnDate: tripType === 'roundtrip' ? formattedReturnDate : undefined,
      adults,
      children: children > 0 ? children : undefined,
      cabinClass: cabinClass.toLowerCase(),
      currencyCode: 'EUR',
      directOnly,
    });

    // Add message about mock data if no API key
    const isUsingMockData = !process.env.FLIGHTAPI_KEY || process.env.USE_MOCK_FLIGHTS === 'true';
    
    return NextResponse.json({
      flights,
      ...(isUsingMockData && {
        message: 'Using mock data to preserve API calls. Set FLIGHTAPI_KEY in .env.local and USE_MOCK_FLIGHTS=false for real data.',
      }),
    });
  } catch (error: any) {
    console.error('Error in flight search API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to search flights',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Mock data generator for development - matches FlightCard expected format
function generateMockFlights(params: any) {
  const flights = [];
  const airlines = ['Ryanair', 'EasyJet', 'Lufthansa', 'KLM', 'Air France', 'British Airways', 'Wizz Air', 'Emirates', 'Turkish Airlines', 'Qatar Airways'];
  
  for (let i = 0; i < 10; i++) {
    const basePrice = 39.98 + (Math.random() * 200);
    const airline = airlines[i % airlines.length];
    const stops = Math.floor(Math.random() * 3);
    
    // Create departure date
    const depDate = new Date(params.departureDate || new Date());
    depDate.setHours(12 + i, 20 + (i * 5) % 60);
    
    // Create arrival date (1.5 to 3 hours later)
    const arrDate = new Date(depDate);
    arrDate.setHours(arrDate.getHours() + 1, arrDate.getMinutes() + 35 + Math.random() * 90);
    
    const outboundSegments = [{
      departure: {
        airport: params.origin || 'JFK',
        time: depDate.toISOString(),
      },
      arrival: {
        airport: params.destination || 'LAX',
        time: arrDate.toISOString(),
      },
      airline: airline,
      flightNumber: `${airline.substring(0, 2).replace(/[^A-Z]/g, '').toUpperCase()}${1234 + i}`,
      duration: 95 + Math.floor(Math.random() * 60),
    }];

    let returnSegments;
    let stayDuration;
    
    if (params.returnDate && params.tripType === 'roundtrip') {
      const retDepDate = new Date(params.returnDate);
      retDepDate.setHours(16 + (i % 8), 15 + (i * 7) % 60);
      
      const retArrDate = new Date(retDepDate);
      retArrDate.setHours(retArrDate.getHours() + 1, retArrDate.getMinutes() + 35 + Math.random() * 90);
      
      returnSegments = [{
        departure: {
          airport: params.destination || 'LAX',
          time: retDepDate.toISOString(),
        },
        arrival: {
          airport: params.origin || 'JFK',
          time: retArrDate.toISOString(),
        },
        airline: airline,
        flightNumber: `${airline.substring(0, 2).replace(/[^A-Z]/g, '').toUpperCase()}${5678 + i}`,
        duration: 95 + Math.floor(Math.random() * 60),
      }];
      
      // Calculate stay duration
      const depDateTime = new Date(arrDate);
      const retDateTime = new Date(retDepDate);
      stayDuration = Math.ceil((retDateTime.getTime() - depDateTime.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    flights.push({
      id: `flight-${i}`,
      outboundSegments,
      returnSegments,
      price: {
        amount: Math.round(basePrice * 100) / 100,
        currency: 'EUR',
      },
      totalDuration: 95 + Math.floor(Math.random() * 60),
      stops,
      bookingUrl: `https://www.${airline.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      stayDuration,
    });
  }

  return flights.sort((a, b) => a.price.amount - b.price.amount);
}