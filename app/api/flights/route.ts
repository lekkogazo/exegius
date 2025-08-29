import { NextRequest, NextResponse } from 'next/server';
import FlightAPIClient from '@/lib/flightapi';

const apiKey = process.env.FLIGHTAPI_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract search parameters
    const params = {
      origin: searchParams.get('origin')?.split(',') || [],
      destination: searchParams.get('destination')?.split(',') || [],
      departureDate: searchParams.get('departureDate') || '',
      returnDate: searchParams.get('returnDate') || undefined,
      tripType: (searchParams.get('tripType') || 'return') as 'return' | 'oneway',
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      infants: parseInt(searchParams.get('infants') || '0'),
      maxStops: parseInt(searchParams.get('maxStops') || '2'),
      currency: searchParams.get('currency') || 'EUR',
      flexibleDates: searchParams.get('flexibleDates') === 'true',
      minStayDays: parseInt(searchParams.get('minStay') || '1'),
      maxStayDays: parseInt(searchParams.get('maxStay') || '30'),
    };

    // Check for API key
    if (!apiKey) {
      // Return mock data if no API key is configured
      return NextResponse.json({
        flights: generateMockFlights(params),
        message: 'Using mock data. Configure FLIGHTAPI_KEY in .env.local for real data.',
      });
    }

    // Initialize API client and fetch flights
    const client = new FlightAPIClient(apiKey);
    const flights = await client.searchFlights(params);

    return NextResponse.json({ flights });
  } catch (error) {
    console.error('Error in flight search API:', error);
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    );
  }
}

// Mock data generator for development
function generateMockFlights(params: any) {
  const flights = [];
  const airlines = ['Ryanair', 'EasyJet', 'Lufthansa', 'KLM', 'Air France', 'British Airways'];
  const airports = {
    'NRN': 'Düsseldorf Weeze',
    'BGY': 'Milan Bergamo',
    'MXP': 'Milan Malpensa',
    'LIN': 'Milan Linate',
    'CGN': 'Cologne Bonn',
    'FRA': 'Frankfurt',
  };

  for (let i = 0; i < 15; i++) {
    const basePrice = 39.98 + (Math.random() * 250);
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const stops = Math.floor(Math.random() * 3);
    
    flights.push({
      id: `mock-flight-${i}`,
      price: {
        amount: Math.round(basePrice * 100) / 100,
        currency: params.currency || 'EUR',
      },
      segments: [
        {
          departure: {
            airport: params.origin[0] || 'NRN',
            time: new Date(Date.now() + i * 86400000).toISOString(),
          },
          arrival: {
            airport: params.destination[0] || 'BGY',
            time: new Date(Date.now() + i * 86400000 + 5700000).toISOString(),
          },
          airline: airline,
          flightNumber: `${airline.substring(0, 2).toUpperCase()}${1000 + i}`,
          duration: 95 + Math.floor(Math.random() * 60),
        },
      ],
      totalDuration: 95 + Math.floor(Math.random() * 180),
      stops: stops,
      bookingUrl: `https://www.${airline.toLowerCase().replace(' ', '')}.com`,
      airline: airline,
      cabinClass: 'economy',
    });
  }

  return flights.sort((a, b) => a.price.amount - b.price.amount);
}