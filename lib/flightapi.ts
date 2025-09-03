// Simple in-memory cache to prevent duplicate requests
const requestCache = new Map<string, { data: any, timestamp: number, promise?: Promise<any> }>();
const CACHE_DURATION = 30000; // 30 seconds cache

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
    this.apiKey = (config.apiKey || process.env.FLIGHTAPI_KEY)?.trim();
    this.baseUrl = config.baseUrl || 'https://api.flightapi.io';
    // Use mock data if explicitly set or if no API key is provided
    this.useMockData = config.useMockData ?? !this.apiKey;
    
    console.log('FlightAPI initialized:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length,
      useMockData: this.useMockData,
      configUseMock: config.useMockData,
      envUseMock: process.env.USE_MOCK_FLIGHTS
    });
    
    if (this.useMockData) {
      console.log('FlightAPI: Using mock data to preserve API calls');
    }
  }

  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    // Always use mock data for development to save API calls
    if (this.useMockData || !this.apiKey || process.env.USE_MOCK_FLIGHTS?.trim() === 'true') {
      return this.generateMockFlights(params);
    }

    try {
      
      // Extract IATA codes if in format "City (CODE)"
      const extractCode = (airport: string): string => {
        const match = airport.match(/\(([A-Z]{3})\)/);
        return match ? match[1] : airport.toUpperCase().slice(0, 3);
      };
      
      const originCode = extractCode(params.origin);
      const destinationCode = extractCode(params.destination);
      
      // Build the FlightAPI URL with path parameters
      // Format: /endpoint/api_key/origin/destination/depart_date/return_date/adults/children/infants/cabin/currency
      
      // Format dates as YYYY-MM-DD (API requirement)
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };
      
      const children = params.children || 0;
      const infants = 0; // Not provided in our interface, default to 0
      // API requires lowercase cabin class in the URL
      const cabin = (params.cabinClass || 'Economy').toLowerCase();
      const currency = params.currencyCode || 'EUR';
      
      let endpoint: string;
      
      if (params.returnDate) {
        // Round Trip API endpoint with all parameters in path
        endpoint = `${this.baseUrl}/roundtrip/${this.apiKey}/${originCode}/${destinationCode}/${formatDate(params.departureDate)}/${formatDate(params.returnDate)}/${params.adults}/${children}/${infants}/${cabin}/${currency}`;
      } else {
        // Oneway Trip API endpoint with all parameters in path
        // For one-way, we don't have a return date
        endpoint = `${this.baseUrl}/onewaytrip/${this.apiKey}/${originCode}/${destinationCode}/${formatDate(params.departureDate)}/${params.adults}/${children}/${infants}/${cabin}/${currency}`;
      }

      // Check cache first
      const cacheKey = endpoint;
      const cached = requestCache.get(cacheKey);
      
      // If we have valid cached data, return it
      if (cached && cached.data && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('Using cached FlightAPI response');
        return this.transformFlightAPIResponse(cached.data);
      }
      
      // If there's an ongoing request for this endpoint, wait for it
      if (cached?.promise) {
        console.log('Waiting for existing FlightAPI request...');
        const data = await cached.promise;
        return this.transformFlightAPIResponse(data);
      }

      console.log('Making real FlightAPI request...');
      console.log('API Endpoint:', endpoint);
      console.log('API Key present:', !!this.apiKey, 'Key length:', this.apiKey?.length);
      
      // Create and store the promise to prevent duplicate requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout for large responses
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        console.error('FlightAPI error response:', errorText.substring(0, 500));
        
        // Handle specific error codes
        if (response.status === 410) {
          console.log('No flights found for this route/date (410 error)');
          return []; // Return empty array for no flights
        }
        
        if (response.status === 429) {
          console.log('API rate limit exceeded (429 error) - you may have exceeded your free tier limit');
          throw new Error('API rate limit exceeded - falling back to mock data');
        }
        
        throw new Error(`FlightAPI error: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        const text = await response.text();
        console.log('FlightAPI response size:', text.length, 'characters');
        data = JSON.parse(text);
        console.log('FlightAPI response parsed successfully');
      } catch (e) {
        console.error('Failed to parse FlightAPI response:', e);
        throw new Error('Invalid response from FlightAPI');
      }
      
      // Cache the response
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
      
      return this.transformFlightAPIResponse(data);
    } catch (error) {
      console.error('FlightAPI search error:', error);
      // Fallback to mock data on error
      console.log('Falling back to mock data due to API error');
      return this.generateMockFlights(params);
    }
  }

  private transformFlightAPIResponse(apiResponse: any): Flight[] {
    const flights: Flight[] = [];
    
    
    // Build lookup maps from the API response
    const placesMap = new Map<number, any>();
    const carriersMap = new Map<number, any>();
    const legsMap = new Map<string, any>();
    const segmentsMap = new Map<string, any>();
    
    // Build places lookup
    if (apiResponse.places) {
      apiResponse.places.forEach((place: any) => {
        placesMap.set(place.id, place);
      });
    }
    
    // Build carriers lookup
    if (apiResponse.carriers) {
      apiResponse.carriers.forEach((carrier: any) => {
        carriersMap.set(carrier.id, carrier);
      });
    }
    
    // Build legs lookup
    if (apiResponse.legs) {
      apiResponse.legs.forEach((leg: any) => {
        legsMap.set(leg.id, leg);
      });
    }
    
    // Build segments lookup
    if (apiResponse.segments) {
      apiResponse.segments.forEach((segment: any) => {
        segmentsMap.set(segment.id, segment);
      });
    }

    // Process itineraries
    if (apiResponse.itineraries && Array.isArray(apiResponse.itineraries)) {
      apiResponse.itineraries.forEach((itinerary: any, index: number) => {
        // Each itinerary has pricing_options with the actual price
        const price = itinerary.pricing_options?.[0]?.price?.amount || 0;
        const currency = apiResponse.query?.currency || 'EUR';
        
        // Get leg IDs from itinerary
        const legIds = itinerary.leg_ids || [];
        const outboundLegId = legIds[0];
        const returnLegId = legIds[1];
        
        // Parse legs using the lookup maps
        const outboundSegments = this.parseLeg(outboundLegId, legsMap, segmentsMap, placesMap, carriersMap);
        const returnSegments = returnLegId ? this.parseLeg(returnLegId, legsMap, segmentsMap, placesMap, carriersMap) : undefined;
        
        // Get booking URL from pricing options - this is the deep link from the API
        let bookingUrl = itinerary.pricing_options?.[0]?.items?.[0]?.url || '';
        
        // The API returns a relative URL that needs to be prepended with Skyscanner base URL
        if (bookingUrl && !bookingUrl.startsWith('http')) {
          // This is the Skyscanner deep link that will redirect to the actual booking
          bookingUrl = `https://www.skyscanner.com${bookingUrl}`;
        } else if (!bookingUrl) {
          // Fallback if no URL provided - create a basic Skyscanner search
          const origin = outboundSegments[0]?.departure.airport.match(/\(([A-Z]{3})\)/)?.[1] || 'XXX';
          const dest = outboundSegments[outboundSegments.length - 1]?.arrival.airport.match(/\(([A-Z]{3})\)/)?.[1] || 'XXX';
          const depDate = outboundSegments[0]?.departure.time?.split('T')[0] || '';
          const retDate = returnSegments?.[0]?.departure.time?.split('T')[0] || '';
          
          bookingUrl = `https://www.skyscanner.com/transport/flights/${origin}/${dest}/${depDate}/${retDate}/?adults=1&cabinclass=economy&preferdirects=false`;
        }
        
        flights.push({
          id: itinerary.id || `flight-${index}`,
          outboundSegments,
          returnSegments,
          price: {
            amount: price,
            currency: currency,
          },
          totalDuration: this.calculateTotalDuration(outboundSegments),
          stops: outboundSegments.length - 1,
          bookingUrl,
          stayDuration: this.calculateStayDuration(outboundSegments, returnSegments),
        });
      });
    }

    return flights;
  }
  
  private parseLeg(legId: string, legsMap: Map<string, any>, segmentsMap: Map<string, any>, 
                   placesMap: Map<number, any>, carriersMap: Map<number, any>): any[] {
    const segments: any[] = [];
    
    if (!legId) return this.generateMockSegments();
    
    const leg = legsMap.get(legId);
    if (!leg) {
      console.log('Leg not found:', legId);
      return this.generateMockSegments();
    }
    
    // Process each segment in the leg
    const segmentIds = leg.segment_ids || [];
    segmentIds.forEach((segmentId: string) => {
      const segment = segmentsMap.get(segmentId);
      if (!segment) return;
      
      // Get place information
      const originPlace = placesMap.get(segment.origin_place_id) || {};
      const destPlace = placesMap.get(segment.destination_place_id) || {};
      
      // Get carrier information
      const carrier = carriersMap.get(segment.marketing_carrier_id) || 
                     carriersMap.get(segment.operating_carrier_id) || {};
      
      // Get IATA codes from place objects - use display_code
      const originCode = originPlace.display_code || originPlace.alt_id || 'XXX';
      const destCode = destPlace.display_code || destPlace.alt_id || 'XXX';
      const originCity = originPlace.name || 'Unknown';
      const destCity = destPlace.name || 'Unknown';
      
      // Get airline code - use display_code
      const airlineCode = carrier.display_code || carrier.alt_id || 'XX';
      const flightNumber = `${airlineCode}${segment.marketing_flight_number || Math.floor(1000 + Math.random() * 8999)}`;
      
      segments.push({
        departure: {
          airport: `${originCity} (${originCode})`,
          time: segment.departure,
        },
        arrival: {
          airport: `${destCity} (${destCode})`,
          time: segment.arrival,
        },
        airline: airlineCode,
        flightNumber: flightNumber,
        duration: segment.duration || 120,
      });
    });
    
    return segments.length > 0 ? segments : this.generateMockSegments();
  }
  
  private getAirlineFromCarrierId(carrierId: string, apiResponse: any): string {
    // Common carrier ID mappings for European airlines
    const carrierMap: Record<string, string> = {
      '31913': 'FR', // Ryanair
      '32090': 'W6', // Wizz Air
      '30685': 'U2', // easyJet
      '31669': 'DY', // Norwegian
      '32480': 'VY', // Vueling
      '32132': 'LH', // Lufthansa
      '30189': 'AF', // Air France
      '31609': 'KL', // KLM
      '31539': 'BA', // British Airways
      '32348': 'LO', // LOT Polish Airlines
      '32236': 'AZ', // ITA Airways
      '31665': 'SK', // SAS
      '32753': 'IB', // Iberia
      '32723': 'TP', // TAP Portugal
      '31717': 'LX', // Swiss
      '31538': 'OS', // Austrian Airlines
      '30870': 'AY', // Finnair
      '30626': 'A3', // Aegean Airlines
      '32728': 'EW', // Eurowings
      '32756': 'HV', // Transavia
      '32093': 'W6', // Wizz Air alternative
      '32544': 'LH', // Lufthansa alternative
      '32332': 'KL', // KLM alternative
      '32672': 'IB', // Iberia alternative
      '32704': 'TP', // TAP alternative
      '32659': 'LX', // Swiss alternative
      '32356': 'AZ', // ITA Airways alternative
      '32657': 'SN', // Brussels Airlines
      '32338': 'OS', // Austrian Airlines alternative
    };
    
    const mappedCarrier = carrierMap[carrierId];
    if (!mappedCarrier && carrierId) {
      console.log(`Unknown carrier ID: ${carrierId} - defaulting to XX`);
    }
    return mappedCarrier || 'XX';
  }
  
  private extractFlightNumber(legPart: string, airline: string): string {
    // Try to extract flight number from the leg ID
    // Sometimes it's embedded in the format
    const match = legPart.match(/\b(\d{2,4})\b/g);
    if (match && match.length > 2) {
      // Use one of the middle numbers as flight number
      return `${airline}${match[Math.floor(match.length / 2)]}`;
    }
    return `${airline}${Math.floor(100 + Math.random() * 9899)}`;
  }
  
  private calculateSegmentDuration(depTime: string, arrTime: string): number {
    const dep = new Date(depTime);
    const arr = new Date(arrTime);
    return Math.floor((arr.getTime() - dep.getTime()) / (1000 * 60));
  }
  
  private getCityName(airportCode: string, apiResponse: any): string | null {
    // City name mappings for common airports
    const cityMap: Record<string, string> = {
      'WAW': 'Warsaw',
      'BER': 'Berlin',
      'CDG': 'Paris',
      'FRA': 'Frankfurt',
      'MUC': 'Munich',
      'AMS': 'Amsterdam',
      'MAD': 'Madrid',
      'BCN': 'Barcelona',
      'LIS': 'Lisbon',
      'FCO': 'Rome',
      'LHR': 'London',
      'MAN': 'Manchester',
      'DUB': 'Dublin',
      'CPH': 'Copenhagen',
      'ARN': 'Stockholm',
      'OSL': 'Oslo',
      'HEL': 'Helsinki',
      'VIE': 'Vienna',
      'ZRH': 'Zurich',
      'BRU': 'Brussels',
      'ATH': 'Athens',
      'KRK': 'Krakow',
      'WRO': 'Wroclaw',
      'GDN': 'Gdansk',
    };
    
    return cityMap[airportCode] || null;
  }
  
  private getAirportCode(code: string): string {
    // Map numeric codes to IATA codes if needed
    const airportMap: Record<string, string> = {
      '17648': 'WAW', // Warsaw
      '9828': 'BER', // Berlin
      '10413': 'CDG', // Paris
      '17517': 'FRA', // Frankfurt
      '13451': 'LHR', // London Heathrow
      '11616': 'AMS', // Amsterdam
      '16189': 'MUC', // Munich
      '13554': 'MAD', // Madrid
      '9451': 'BCN', // Barcelona
      '13667': 'MAN', // Manchester
      '11240': 'DUB', // Dublin
      '10756': 'CPH', // Copenhagen
      '10043': 'BRU', // Brussels
      '17305': 'VIE', // Vienna
      '11051': 'FCO', // Rome Fiumicino
      // Add more mappings as needed
    };
    return airportMap[code] || code;
  }
  
  
  private parseFlightTime(timeStr: string): string {
    // Parse format like "2509101835" to ISO date
    if (timeStr.length >= 10) {
      const year = '20' + timeStr.substring(0, 2);
      const month = timeStr.substring(2, 4);
      const day = timeStr.substring(4, 6);
      const hour = timeStr.substring(6, 8);
      const minute = timeStr.substring(8, 10);
      return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
    }
    return new Date().toISOString();
  }
  
  private calculateTotalDuration(segments: any[]): number {
    if (segments.length === 0) return 120;
    const firstDep = new Date(segments[0].departure.time);
    const lastArr = new Date(segments[segments.length - 1].arrival.time);
    return Math.floor((lastArr.getTime() - firstDep.getTime()) / (1000 * 60));
  }
  
  private calculateStayDuration(outbound: any[], returnSegs: any[] | undefined): number | undefined {
    if (!returnSegs || returnSegs.length === 0 || outbound.length === 0) return undefined;
    const outArr = new Date(outbound[outbound.length - 1].arrival.time);
    const retDep = new Date(returnSegs[0].departure.time);
    return Math.ceil((retDep.getTime() - outArr.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  private transformSingleFlight(flight: any, index: number): Flight {
    // Parse segments/legs
    const segments = flight.segments || flight.legs || flight.itineraries || [];
    const outboundSegments: any[] = [];
    const returnSegments: any[] = [];
    
    // Determine if this is a round trip based on segments
    const hasReturn = segments.some((seg: any) => seg.direction === 'return' || seg.isReturn);
    
    segments.forEach((seg: any) => {
      const segment = {
        departure: {
          airport: `${seg.departure?.city || seg.from?.city || seg.origin?.city || seg.departure?.airport || seg.from || seg.origin} (${seg.departure?.iata || seg.from?.iata || seg.departure?.code || seg.from?.code || seg.origin})`,
          time: seg.departure?.time || seg.departureTime || seg.departure_time,
          terminal: seg.departure?.terminal,
        },
        arrival: {
          airport: `${seg.arrival?.city || seg.to?.city || seg.destination?.city || seg.arrival?.airport || seg.to || seg.destination} (${seg.arrival?.iata || seg.to?.iata || seg.arrival?.code || seg.to?.code || seg.destination})`,
          time: seg.arrival?.time || seg.arrivalTime || seg.arrival_time,
          terminal: seg.arrival?.terminal,
        },
        airline: seg.airline?.code || seg.carrier || seg.airline || 'XX',
        flightNumber: seg.flightNumber || seg.flight_number || `${seg.airline || 'XX'}${Math.floor(1000 + Math.random() * 8999)}`,
        duration: seg.duration || 120,
      };
      
      if (seg.direction === 'return' || seg.isReturn) {
        returnSegments.push(segment);
      } else {
        outboundSegments.push(segment);
      }
    });
    
    // If no clear separation, assume first half is outbound, second half is return
    if (outboundSegments.length === 0 && segments.length > 0) {
      const midPoint = Math.ceil(segments.length / 2);
      segments.slice(0, midPoint).forEach((seg: any) => {
        outboundSegments.push({
          departure: {
            airport: `${seg.departure?.city || seg.from?.city || 'Unknown'} (${seg.departure?.iata || seg.from?.code || 'XXX'})`,
            time: seg.departure?.time || seg.departureTime || new Date().toISOString(),
          },
          arrival: {
            airport: `${seg.arrival?.city || seg.to?.city || 'Unknown'} (${seg.arrival?.iata || seg.to?.code || 'XXX'})`,
            time: seg.arrival?.time || seg.arrivalTime || new Date().toISOString(),
          },
          airline: seg.airline?.code || seg.carrier || 'XX',
          flightNumber: seg.flightNumber || `XX${Math.floor(1000 + Math.random() * 8999)}`,
          duration: seg.duration || 120,
        });
      });
      
      if (segments.length > midPoint) {
        segments.slice(midPoint).forEach((seg: any) => {
          returnSegments.push({
            departure: {
              airport: `${seg.departure?.city || seg.from?.city || 'Unknown'} (${seg.departure?.iata || seg.from?.code || 'XXX'})`,
              time: seg.departure?.time || seg.departureTime || new Date().toISOString(),
            },
            arrival: {
              airport: `${seg.arrival?.city || seg.to?.city || 'Unknown'} (${seg.arrival?.iata || seg.to?.code || 'XXX'})`,
              time: seg.arrival?.time || seg.arrivalTime || new Date().toISOString(),
            },
            airline: seg.airline?.code || seg.carrier || 'XX',
            flightNumber: seg.flightNumber || `XX${Math.floor(1000 + Math.random() * 8999)}`,
            duration: seg.duration || 120,
          });
        });
      }
    }
    
    // Calculate stay duration if round trip
    let stayDuration;
    if (returnSegments.length > 0 && outboundSegments.length > 0) {
      try {
        const outboundArrival = new Date(outboundSegments[outboundSegments.length - 1].arrival.time);
        const returnDeparture = new Date(returnSegments[0].departure.time);
        stayDuration = Math.ceil((returnDeparture.getTime() - outboundArrival.getTime()) / (1000 * 60 * 60 * 24));
      } catch (e) {
        stayDuration = undefined;
      }
    }
    
    return {
      id: flight.id || flight.trip_id || `flight-${index}`,
      outboundSegments: outboundSegments.length > 0 ? outboundSegments : this.generateMockSegments(),
      returnSegments: returnSegments.length > 0 ? returnSegments : undefined,
      price: {
        amount: parseFloat(flight.price?.total || flight.total_price || flight.price || Math.random() * 500),
        currency: flight.price?.currency || flight.currency || 'EUR',
      },
      totalDuration: flight.duration || flight.total_duration || 180,
      stops: flight.stops || (outboundSegments.length - 1) || 0,
      bookingUrl: flight.deep_link || flight.deepLink || flight.booking_url || flight.url || '#',
      stayDuration,
    };
  }
  
  private generateMockSegments(): any[] {
    return [{
      departure: {
        airport: 'Unknown (XXX)',
        time: new Date().toISOString(),
      },
      arrival: {
        airport: 'Unknown (XXX)',
        time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      },
      airline: 'XX',
      flightNumber: 'XX0000',
      duration: 120,
    }];
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
        bookingUrl: airline === 'LH' ? 'https://www.lufthansa.com' :
                   airline === 'FR' ? 'https://www.ryanair.com' :
                   airline === 'W6' ? 'https://www.wizzair.com' :
                   airline === 'U2' ? 'https://www.easyjet.com' :
                   airline === 'LO' ? 'https://www.lot.com' :
                   `https://www.skyscanner.com/transport/flights/${originCode}/${destCode}/`,
        stayDuration,
      });
    }
    
    return flights.sort((a, b) => a.price.amount - b.price.amount);
  }
}

export default FlightAPI;