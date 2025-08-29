import axios from 'axios';
import { Flight, FlightSearchParams } from '@/types/flight';

const FLIGHTAPI_BASE_URL = 'https://api.flightapi.io';

class FlightAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    try {
      // This is a mock implementation for now
      // You'll need to implement the actual FlightAPI.io integration
      // based on their documentation
      
      const response = await axios.get(`${FLIGHTAPI_BASE_URL}/compressedsearch/${this.apiKey}`, {
        params: {
          origin: params.origin.join(','),
          destination: params.destination.join(','),
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
          children: params.children,
          infants: params.infants,
          cabinClass: params.cabinClass || 'economy',
          currency: params.currency || 'EUR',
          stops: params.maxStops,
        }
      });

      return this.transformFlightData(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
      throw new Error('Failed to fetch flights');
    }
  }

  private transformFlightData(data: any): Flight[] {
    // Transform the API response to match our Flight interface
    // This will need to be adjusted based on actual API response structure
    if (!data || !data.flights) {
      return [];
    }

    return data.flights.map((flight: any) => ({
      id: flight.id || Math.random().toString(36),
      price: {
        amount: flight.price,
        currency: flight.currency || 'EUR'
      },
      segments: flight.segments || [],
      totalDuration: flight.duration || 0,
      stops: flight.stops || 0,
      bookingUrl: flight.bookingUrl || '#',
      airline: flight.airline || 'Unknown',
      cabinClass: flight.cabinClass || 'economy'
    }));
  }

  async getAirports(query: string): Promise<any[]> {
    try {
      const response = await axios.get(`${FLIGHTAPI_BASE_URL}/airports/${this.apiKey}`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching airports:', error);
      return [];
    }
  }
}

export default FlightAPIClient;