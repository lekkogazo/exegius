interface FlightAPIConfig {
  apiKey?: string;
  baseUrl?: string;
  useMockData?: boolean;
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
  directOnly?: boolean;
}

interface Flight {
  id: string;
  outboundSegments: any[];
  returnSegments?: any[];
  price: {
    amount: number;
    currency: string;
  };
  totalDuration: number;
  stops: number;
  bookingUrl: string;
  stayDuration?: number;
}

class FlightAPI {
  private apiKey: string | undefined;
  private baseUrl: string;
  private useMockData: boolean;

  constructor(config: FlightAPIConfig = {}) {
    this.apiKey = config.apiKey || process.env.FLIGHTAPI_KEY;
    this.baseUrl = config.baseUrl || 'https://api.flightapi.io';
    // Use mock data if explicitly set or if no API key is provided
    this.useMockData = config.useMockData ?? !this.apiKey;
    
    if (this.useMockData) {
      console.log('FlightAPI: Using mock data to preserve API calls');
    }
  }

  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    // Always use mock data for development to save API calls
    if (this.useMockData || !this.apiKey || process.env.USE_MOCK_FLIGHTS === 'true') {
      return this.generateMockFlights(params);
    }

    try {
      // FlightAPI.io endpoint structure
      const endpoint = `${this.baseUrl}/compressedsearch/${this.apiKey}`;
      
      // Build query parameters for FlightAPI
      const queryParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        adults: params.adults.toString(),
        currency: params.currencyCode || 'EUR',
        ...(params.returnDate && { returnDate: params.returnDate }),
        ...(params.children && { children: params.children.toString() }),
        ...(params.cabinClass && { cabinClass: params.cabinClass.toLowerCase() }),
        ...(params.directOnly && { stops: '0' }),
      });

      const response = await fetch(`${endpoint}?${queryParams}`);

      if (!response.ok) {
        throw new Error(`FlightAPI error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformFlightAPIResponse(data);
    } catch (error) {
      console.error('FlightAPI search error:', error);
      // Fallback to mock data on error
      return this.generateMockFlights(params);
    }
  }

  private transformFlightAPIResponse(apiResponse: any): Flight[] {
    const flights: Flight[] = [];

    if (apiResponse.legs && Array.isArray(apiResponse.legs)) {
      // Group legs by search ID for round trips
      const flightGroups = new Map<string, any[]>();
      
      apiResponse.legs.forEach((leg: any) => {
        const searchId = leg.searchId || 'default';
        if (!flightGroups.has(searchId)) {
          flightGroups.set(searchId, []);
        }
        flightGroups.get(searchId)?.push(leg);
      });

      let flightIndex = 0;
      flightGroups.forEach((legs) => {
        const outboundLeg = legs[0];
        const returnLeg = legs[1];

        // Transform outbound segments
        const outboundSegments = outboundLeg.segments?.map((seg: any) => ({
          departure: {
            airport: `${seg.departureAirport.city || seg.departureAirport.name} (${seg.departureAirport.code})`,
            time: seg.departureTime,
            terminal: seg.departureTerminal,
          },
          arrival: {
            airport: `${seg.arrivalAirport.city || seg.arrivalAirport.name} (${seg.arrivalAirport.code})`,
            time: seg.arrivalTime,
            terminal: seg.arrivalTerminal,
          },
          airline: seg.airline.code,
          flightNumber: `${seg.airline.code}${seg.flightNumber}`,
          duration: seg.duration,
        })) || [];

        // Transform return segments if exists
        const returnSegments = returnLeg?.segments?.map((seg: any) => ({
          departure: {
            airport: `${seg.departureAirport.city || seg.departureAirport.name} (${seg.departureAirport.code})`,
            time: seg.departureTime,
            terminal: seg.departureTerminal,
          },
          arrival: {
            airport: `${seg.arrivalAirport.city || seg.arrivalAirport.name} (${seg.arrivalAirport.code})`,
            time: seg.arrivalTime,
            terminal: seg.arrivalTerminal,
          },
          airline: seg.airline.code,
          flightNumber: `${seg.airline.code}${seg.flightNumber}`,
          duration: seg.duration,
        }));

        // Calculate stay duration if round trip
        let stayDuration;
        if (returnSegments && returnSegments.length > 0 && outboundSegments.length > 0) {
          const outboundArrival = new Date(outboundSegments[outboundSegments.length - 1].arrival.time);
          const returnDeparture = new Date(returnSegments[0].departure.time);
          stayDuration = Math.ceil((returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60 * 24));
        }

        flights.push({
          id: outboundLeg.id || `flight-${flightIndex++}`,
          outboundSegments,
          returnSegments,
          price: {
            amount: parseFloat(outboundLeg.price || 0) + (returnLeg?.price ? parseFloat(returnLeg.price) : 0),
            currency: outboundLeg.currency || 'EUR',
          },
          totalDuration: outboundLeg.duration || 120,
          stops: outboundSegments.length - 1,
          bookingUrl: outboundLeg.deepLink || '#',
          stayDuration,
        });
      });
    }

    return flights;
  }

  private generateMockFlights(params: FlightSearchParams): Flight[] {
    const flights: Flight[] = [];
    const airlines = [
      'TP', // TAP Air Portugal
      'FR', // Ryanair
      'U2', // EasyJet
      'LH', // Lufthansa
      'KL', // KLM
      'AF', // Air France
      'BA', // British Airways
      'W6', // Wizz Air
      'EK', // Emirates
      'TK', // Turkish Airlines
    ];

    const cities: Record<string, string> = {
      'BER': 'Berlin',
      'JFK': 'New York',
      'EWR': 'Newark',
      'LAX': 'Los Angeles',
      'LHR': 'London',
      'CDG': 'Paris',
      'AMS': 'Amsterdam',
      'FRA': 'Frankfurt',
      'MAD': 'Madrid',
      'BCN': 'Barcelona',
      'LIS': 'Lisbon',
    };

    // Extract IATA code if format is "City (CODE)"
    const extractCode = (airport: string): string => {
      const match = airport.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : airport.toUpperCase().slice(0, 3);
    };

    const originCode = extractCode(params.origin);
    const destCode = extractCode(params.destination);
    const originCity = cities[originCode] || originCode;
    const destCity = cities[destCode] || destCode;

    for (let i = 0; i < 12; i++) {
      const airline = airlines[i % airlines.length];
      const basePrice = 89 + Math.random() * 400;
      const stops = params.directOnly ? 0 : Math.floor(Math.random() * 2);
      
      // Generate departure time
      const depDate = new Date(params.departureDate);
      depDate.setHours(6 + Math.floor(i * 1.5), (i * 25) % 60);
      
      // Generate arrival time (2-8 hours later depending on stops)
      const duration = 120 + stops * 90 + Math.floor(Math.random() * 60);
      const arrDate = new Date(depDate.getTime() + duration * 60 * 1000);
      
      const outboundSegments = [];
      
      if (stops === 0) {
        // Direct flight
        outboundSegments.push({
          departure: {
            airport: `${originCity} (${originCode})`,
            time: depDate.toISOString(),
          },
          arrival: {
            airport: `${destCity} (${destCode})`,
            time: arrDate.toISOString(),
          },
          airline: airline,
          flightNumber: `${airline}${Math.floor(1000 + Math.random() * 8999)}`,
          duration: duration,
        });
      } else {
        // Flight with stops
        const stopoverAirport = 'LIS';
        const stopoverCity = 'Lisbon';
        const firstLegDuration = Math.floor(duration * 0.4);
        const secondLegDuration = duration - firstLegDuration - 60;
        
        const stopoverArr = new Date(depDate.getTime() + firstLegDuration * 60 * 1000);
        const stopoverDep = new Date(stopoverArr.getTime() + 60 * 60 * 1000);
        
        outboundSegments.push({
          departure: {
            airport: `${originCity} (${originCode})`,
            time: depDate.toISOString(),
          },
          arrival: {
            airport: `${stopoverCity} (${stopoverAirport})`,
            time: stopoverArr.toISOString(),
          },
          airline: airline,
          flightNumber: `${airline}${Math.floor(1000 + Math.random() * 8999)}`,
          duration: firstLegDuration,
        });
        
        outboundSegments.push({
          departure: {
            airport: `${stopoverCity} (${stopoverAirport})`,
            time: stopoverDep.toISOString(),
          },
          arrival: {
            airport: `${destCity} (${destCode})`,
            time: arrDate.toISOString(),
          },
          airline: airline,
          flightNumber: `${airline}${Math.floor(1000 + Math.random() * 8999)}`,
          duration: secondLegDuration,
        });
      }
      
      let returnSegments;
      let stayDuration;
      
      if (params.returnDate) {
        const retDepDate = new Date(params.returnDate);
        retDepDate.setHours(7 + Math.floor(i * 1.2), (i * 35) % 60);
        const retArrDate = new Date(retDepDate.getTime() + duration * 60 * 1000);
        
        if (stops === 0) {
          returnSegments = [{
            departure: {
              airport: `${destCity} (${destCode})`,
              time: retDepDate.toISOString(),
            },
            arrival: {
              airport: `${originCity} (${originCode})`,
              time: retArrDate.toISOString(),
            },
            airline: airline,
            flightNumber: `${airline}${Math.floor(1000 + Math.random() * 8999)}`,
            duration: duration,
          }];
        } else {
          const stopoverAirport = 'LIS';
          const stopoverCity = 'Lisbon';
          const firstLegDuration = Math.floor(duration * 0.4);
          const secondLegDuration = duration - firstLegDuration - 60;
          
          const stopoverArr = new Date(retDepDate.getTime() + firstLegDuration * 60 * 1000);
          const stopoverDep = new Date(stopoverArr.getTime() + 60 * 60 * 1000);
          
          returnSegments = [
            {
              departure: {
                airport: `${destCity} (${destCode})`,
                time: retDepDate.toISOString(),
              },
              arrival: {
                airport: `${stopoverCity} (${stopoverAirport})`,
                time: stopoverArr.toISOString(),
              },
              airline: airline,
              flightNumber: `${airline}${Math.floor(1000 + Math.random() * 8999)}`,
              duration: firstLegDuration,
            },
            {
              departure: {
                airport: `${stopoverCity} (${stopoverAirport})`,
                time: stopoverDep.toISOString(),
              },
              arrival: {
                airport: `${originCity} (${originCode})`,
                time: retArrDate.toISOString(),
              },
              airline: airline,
              flightNumber: `${airline}${Math.floor(1000 + Math.random() * 8999)}`,
              duration: secondLegDuration,
            }
          ];
        }
        
        // Calculate stay duration
        stayDuration = Math.ceil((new Date(retDepDate).getTime() - arrDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      flights.push({
        id: `flight-${i}`,
        outboundSegments,
        returnSegments,
        price: {
          amount: Math.round(basePrice * 100) / 100,
          currency: params.currencyCode || 'EUR',
        },
        totalDuration: duration,
        stops,
        bookingUrl: '#',
        stayDuration,
      });
    }
    
    return flights.sort((a, b) => a.price.amount - b.price.amount);
  }
}

export default FlightAPI;