import axios from 'axios';

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  cabinClass?: string;
  currencyCode?: string;
  maxStops?: number;
}

interface AmadeusFlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      duration: string;
    }>;
  }>;
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
    };
  }>;
}

class AmadeusAPI {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.AMADEUS_API_KEY || '';
    this.clientSecret = process.env.AMADEUS_API_SECRET || '';
    this.baseUrl = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/security/oauth2/token`,
        'grant_type=client_credentials&client_id=' + this.clientId + '&client_secret=' + this.clientSecret,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const tokenData: AmadeusToken = response.data;
      this.token = tokenData.access_token;
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000) - 60000); // Expire 1 minute early

      return this.token;
    } catch (error) {
      console.error('Error getting Amadeus access token:', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  async searchFlights(params: FlightSearchParams) {
    const token = await this.getAccessToken();

    try {
      // Handle "Anywhere" destination with Flight Inspiration Search
      if (params.destination === 'ANYWHERE') {
        return this.searchFlightInspiration(params);
      }

      const searchParams: any = {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        adults: params.adults,
        currencyCode: params.currencyCode || 'EUR'
      };

      if (params.returnDate) {
        searchParams.returnDate = params.returnDate;
      }

      if (params.children && params.children > 0) {
        searchParams.children = params.children;
      }

      if (params.cabinClass) {
        searchParams.travelClass = params.cabinClass.toUpperCase();
      }

      if (params.maxStops !== undefined) {
        searchParams.maxStops = params.maxStops;
      }

      const response = await axios.get(`${this.baseUrl}/v2/shopping/flight-offers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: searchParams
      });

      return this.transformFlightData(response.data.data || []);
    } catch (error: any) {
      console.error('Error searching flights:', error?.response?.data || error.message);
      throw new Error('Failed to search flights');
    }
  }

  private async searchFlightInspiration(params: FlightSearchParams) {
    const token = await this.getAccessToken();

    try {
      const searchParams: any = {
        origin: params.origin,
        departureDate: params.departureDate,
        maxPrice: 2000, // Set a reasonable max price for inspiration search
        currencyCode: params.currencyCode || 'EUR'
      };

      if (params.returnDate) {
        searchParams.returnDate = params.returnDate;
      }

      const response = await axios.get(`${this.baseUrl}/v1/shopping/flight-destinations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: searchParams
      });

      return this.transformInspirationData(response.data.data || []);
    } catch (error: any) {
      console.error('Error searching flight inspiration:', error?.response?.data || error.message);
      throw new Error('Failed to search flight inspiration');
    }
  }

  private transformInspirationData(inspirationFlights: any[]) {
    return inspirationFlights.slice(0, 20).map((flight, index) => {
      const departureDate = new Date(flight.departureDate);
      const returnDate = flight.returnDate ? new Date(flight.returnDate) : null;

      // Create mock segments for inspiration results
      const outboundSegments = [{
        departure: {
          airport: flight.origin,
          time: departureDate.toISOString(),
        },
        arrival: {
          airport: flight.destination,
          time: new Date(departureDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
        },
        airline: 'Multiple Airlines',
        flightNumber: `INSP${1000 + index}`,
        duration: 120,
      }];

      const returnSegments = returnDate ? [{
        departure: {
          airport: flight.destination,
          time: returnDate.toISOString(),
        },
        arrival: {
          airport: flight.origin,
          time: new Date(returnDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
        },
        airline: 'Multiple Airlines',
        flightNumber: `INSP${2000 + index}`,
        duration: 120,
      }] : undefined;

      return {
        id: `inspiration-${index}`,
        outboundSegments,
        returnSegments,
        price: {
          amount: parseFloat(flight.price.total),
          currency: flight.price.currency || 'EUR',
        },
        totalDuration: 120,
        stops: 0,
        bookingUrl: '#',
        stayDuration: returnDate ? this.calculateStayDuration(
          outboundSegments[0].arrival.time,
          returnSegments[0].departure.time
        ) : undefined,
      };
    });
  }

  private transformFlightData(amadeusFlights: AmadeusFlightOffer[]) {
    return amadeusFlights.map((flight) => {
      const outboundItinerary = flight.itineraries[0];
      const returnItinerary = flight.itineraries[1];

      // Calculate total duration in minutes
      const parseDuration = (duration: string): number => {
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        const hours = match?.[1] ? parseInt(match[1]) : 0;
        const minutes = match?.[2] ? parseInt(match[2]) : 0;
        return hours * 60 + minutes;
      };

      const outboundSegments = outboundItinerary.segments.map(segment => ({
        departure: {
          airport: segment.departure.iataCode,
          time: segment.departure.at,
        },
        arrival: {
          airport: segment.arrival.iataCode,
          time: segment.arrival.at,
        },
        airline: this.getAirlineName(segment.carrierCode),
        flightNumber: `${segment.carrierCode}${segment.number}`,
        duration: parseDuration(segment.duration),
      }));

      const returnSegments = returnItinerary ? returnItinerary.segments.map(segment => ({
        departure: {
          airport: segment.departure.iataCode,
          time: segment.departure.at,
        },
        arrival: {
          airport: segment.arrival.iataCode,
          time: segment.arrival.at,
        },
        airline: this.getAirlineName(segment.carrierCode),
        flightNumber: `${segment.carrierCode}${segment.number}`,
        duration: parseDuration(segment.duration),
      })) : undefined;

      return {
        id: flight.id,
        outboundSegments,
        returnSegments,
        price: {
          amount: parseFloat(flight.price.total),
          currency: flight.price.currency,
        },
        totalDuration: parseDuration(outboundItinerary.duration),
        stops: outboundItinerary.segments.length - 1,
        bookingUrl: '#', // Amadeus doesn't provide direct booking URLs in flight offers
        stayDuration: returnItinerary ? this.calculateStayDuration(
          outboundItinerary.segments[outboundItinerary.segments.length - 1].arrival.at,
          returnItinerary.segments[0].departure.at
        ) : undefined,
      };
    });
  }

  private getAirlineName(carrierCode: string): string {
    const airlineMap: { [key: string]: string } = {
      'FR': 'Ryanair',
      'U2': 'EasyJet', 
      'LH': 'Lufthansa',
      'KL': 'KLM',
      'AF': 'Air France',
      'BA': 'British Airways',
      'W6': 'Wizz Air',
      'EK': 'Emirates',
      'TK': 'Turkish Airlines',
      'QR': 'Qatar Airways',
      'IB': 'Iberia',
      'TP': 'TAP Air Portugal',
      'LX': 'Swiss',
      'OS': 'Austrian Airlines',
      'SK': 'SAS',
      'AY': 'Finnair',
      'A3': 'Aegean Airlines',
      'LO': 'LOT Polish Airlines',
      'AZ': 'ITA Airways',
      'EN': 'Air Dolomiti',
      'WF': 'Wideroe',
      'HV': 'Transavia'
    };
    return airlineMap[carrierCode] || carrierCode;
  }

  private calculateStayDuration(arrivalTime: string, departureTime: string): number {
    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);
    const diffTime = departure.getTime() - arrival.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getAirportSuggestions(keyword: string) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(`${this.baseUrl}/v1/reference-data/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          keyword: keyword,
          subType: 'AIRPORT,CITY'
        }
      });

      return response.data.data.map((location: any) => ({
        code: location.iataCode,
        city: location.address?.cityName || location.name,
        name: location.name,
        country: location.address?.countryName
      }));
    } catch (error) {
      console.error('Error fetching airport suggestions:', error);
      return [];
    }
  }
}

export default AmadeusAPI;