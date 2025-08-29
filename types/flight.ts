export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
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
  duration: number; // in minutes
  aircraft?: string;
}

export interface Flight {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  segments: FlightSegment[];
  totalDuration: number; // in minutes
  stops: number;
  bookingUrl: string;
  airline: string;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface FlightSearchParams {
  origin: string[];
  destination: string[];
  departureDate: string;
  returnDate?: string;
  tripType: 'return' | 'oneway';
  adults: number;
  children: number;
  infants: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  maxStops?: number;
  currency?: string;
  flexibleDates?: boolean;
  departDateFrom?: string;
  departDateTo?: string;
  returnDateFrom?: string;
  returnDateTo?: string;
  minStayDays?: number;
  maxStayDays?: number;
}

export interface SearchFilters {
  maxPrice?: number;
  maxDuration?: number;
  maxStops?: number;
  airlines?: string[];
  departureTimeRange?: {
    from: string;
    to: string;
  };
  arrivalTimeRange?: {
    from: string;
    to: string;
  };
}