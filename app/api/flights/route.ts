import { NextRequest, NextResponse } from 'next/server';
import AmadeusAPI from '@/lib/amadeus';

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
    
    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination, or departureDate' },
        { status: 400 }
      );
    }

    // Extract IATA codes from airport strings (e.g., "New York (JFK)" -> "JFK")
    const extractIataCode = (airport: string): string => {
      const match = airport.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : airport.toUpperCase().slice(0, 3);
    };

    const originCode = extractIataCode(origin);
    const destinationCode = extractIataCode(destination);

    // Check if Amadeus API is configured
    const hasAmadeusConfig = process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET;
    
    if (!hasAmadeusConfig) {
      // Return mock data if no Amadeus API credentials are configured
      const mockParams = {
        origin: originCode,
        destination: destinationCode,
        departureDate,
        returnDate,
        tripType,
        adults,
        children,
        cabinClass,
      };
      
      return NextResponse.json({
        flights: generateMockFlights(mockParams),
        message: 'Using mock data. Configure AMADEUS_API_KEY and AMADEUS_API_SECRET in .env.local for real data.',
      });
    }

    // Format dates for Amadeus API (YYYY-MM-DD format)
    const formatDateForAmadeus = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const formattedDepartureDate = formatDateForAmadeus(departureDate);
    const formattedReturnDate = returnDate ? formatDateForAmadeus(returnDate) : undefined;

    // Use Amadeus API
    const amadeus = new AmadeusAPI();
    const flights = await amadeus.searchFlights({
      origin: originCode,
      destination: destinationCode,
      departureDate: formattedDepartureDate,
      returnDate: tripType === 'roundtrip' ? formattedReturnDate : undefined,
      adults,
      children: children > 0 ? children : undefined,
      cabinClass: cabinClass.toLowerCase(),
      currencyCode: 'EUR',
    });

    return NextResponse.json({ flights });
  } catch (error: any) {
    console.error('Error in flight search API:', error);
    
    // If Amadeus API fails, fallback to mock data
    const searchParams = request.nextUrl.searchParams;
    const mockParams = {
      origin: searchParams.get('origin')?.match(/\(([A-Z]{3})\)/)?.[1] || 'JFK',
      destination: searchParams.get('destination')?.match(/\(([A-Z]{3})\)/)?.[1] || 'LAX',
      departureDate: searchParams.get('departureDate') || '',
      returnDate: searchParams.get('returnDate'),
      tripType: searchParams.get('tripType') || 'roundtrip',
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      cabinClass: searchParams.get('cabinClass') || 'Economy',
    };
    
    return NextResponse.json({
      flights: generateMockFlights(mockParams),
      message: 'Amadeus API error, using mock data as fallback.',
      error: error.message
    });
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