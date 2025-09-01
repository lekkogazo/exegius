import { NextRequest, NextResponse } from 'next/server';
import AmadeusAPI from '@/lib/amadeus';

const AIRPORTS = [
  // Major International Hubs
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'United States' },
  { code: 'LGA', city: 'New York', name: 'LaGuardia Airport', country: 'United States' },
  { code: 'EWR', city: 'New York', name: 'Newark Liberty International Airport', country: 'United States' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'United States' },
  { code: 'ORD', city: 'Chicago', name: 'Chicago O\'Hare International Airport', country: 'United States' },
  { code: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'United States' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'United States' },
  { code: 'BOS', city: 'Boston', name: 'Logan International Airport', country: 'United States' },
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', country: 'United States' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport', country: 'United States' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International Airport', country: 'United States' },
  { code: 'DEN', city: 'Denver', name: 'Denver International Airport', country: 'United States' },
  { code: 'LAS', city: 'Las Vegas', name: 'McCarran International Airport', country: 'United States' },
  { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International Airport', country: 'United States' },
  
  // Europe
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
  { code: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'United Kingdom' },
  { code: 'STN', city: 'London', name: 'Stansted Airport', country: 'United Kingdom' },
  { code: 'LTN', city: 'London', name: 'Luton Airport', country: 'United Kingdom' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  { code: 'ORY', city: 'Paris', name: 'Orly Airport', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
  { code: 'BER', city: 'Berlin', name: 'Berlin Brandenburg Airport', country: 'Germany' },
  { code: 'DUS', city: 'Düsseldorf', name: 'Düsseldorf Airport', country: 'Germany' },
  { code: 'HAM', city: 'Hamburg', name: 'Hamburg Airport', country: 'Germany' },
  { code: 'CGN', city: 'Cologne', name: 'Cologne Bonn Airport', country: 'Germany' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas Airport', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona-El Prat Airport', country: 'Spain' },
  { code: 'VLC', city: 'Valencia', name: 'Valencia Airport', country: 'Spain' },
  { code: 'PMI', city: 'Palma', name: 'Palma de Mallorca Airport', country: 'Spain' },
  { code: 'SVQ', city: 'Seville', name: 'Seville Airport', country: 'Spain' },
  { code: 'MXP', city: 'Milan', name: 'Milan Malpensa Airport', country: 'Italy' },
  { code: 'LIN', city: 'Milan', name: 'Milan Linate Airport', country: 'Italy' },
  { code: 'BGY', city: 'Milan', name: 'Milan Bergamo Airport', country: 'Italy' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino Airport', country: 'Italy' },
  { code: 'CIA', city: 'Rome', name: 'Ciampino Airport', country: 'Italy' },
  { code: 'NAP', city: 'Naples', name: 'Naples International Airport', country: 'Italy' },
  { code: 'VCE', city: 'Venice', name: 'Venice Marco Polo Airport', country: 'Italy' },
  { code: 'FLR', city: 'Florence', name: 'Florence Airport', country: 'Italy' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna International Airport', country: 'Austria' },
  { code: 'ZUR', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  { code: 'GVA', city: 'Geneva', name: 'Geneva Airport', country: 'Switzerland' },
  { code: 'BSL', city: 'Basel', name: 'EuroAirport Basel-Mulhouse-Freiburg', country: 'Switzerland' },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado Airport', country: 'Portugal' },
  { code: 'OPO', city: 'Porto', name: 'Francisco Sá Carneiro Airport', country: 'Portugal' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda Airport', country: 'Sweden' },
  { code: 'GOT', city: 'Gothenburg', name: 'Gothenburg Landvetter Airport', country: 'Sweden' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Airport, Gardermoen', country: 'Norway' },
  { code: 'BGO', city: 'Bergen', name: 'Bergen Airport', country: 'Norway' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa Airport', country: 'Finland' },
  { code: 'ATH', city: 'Athens', name: 'Athens International Airport', country: 'Greece' },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin Airport', country: 'Poland' },
  { code: 'KRK', city: 'Krakow', name: 'John Paul II International Airport Kraków-Balice', country: 'Poland' },
  { code: 'GDN', city: 'Gdansk', name: 'Gdansk Lech Walesa Airport', country: 'Poland' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel Airport Prague', country: 'Czech Republic' },
  { code: 'BUD', city: 'Budapest', name: 'Budapest Ferenc Liszt International Airport', country: 'Hungary' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium' },
  { code: 'CRL', city: 'Brussels', name: 'Brussels South Charleroi Airport', country: 'Belgium' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland' },
  { code: 'ORK', city: 'Cork', name: 'Cork Airport', country: 'Ireland' },
  { code: 'EDI', city: 'Edinburgh', name: 'Edinburgh Airport', country: 'United Kingdom' },
  { code: 'GLA', city: 'Glasgow', name: 'Glasgow Airport', country: 'United Kingdom' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester Airport', country: 'United Kingdom' },
  { code: 'BHX', city: 'Birmingham', name: 'Birmingham Airport', country: 'United Kingdom' },
  { code: 'LPL', city: 'Liverpool', name: 'Liverpool John Lennon Airport', country: 'United Kingdom' },
  
  // Asia & Middle East
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'United Arab Emirates' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International Airport', country: 'United Arab Emirates' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan' },
  { code: 'KIX', city: 'Osaka', name: 'Kansai International Airport', country: 'Japan' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong International Airport', country: 'China' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport', country: 'China' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji International Airport', country: 'India' },
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BLR', city: 'Bangalore', name: 'Kempegowda International Airport', country: 'India' },
  
  // Oceania
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
  { code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport', country: 'Australia' },
  { code: 'PER', city: 'Perth', name: 'Perth Airport', country: 'Australia' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand' },
  
  // Canada
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada' },
  { code: 'YUL', city: 'Montreal', name: 'Montreal-Pierre Elliott Trudeau International Airport', country: 'Canada' },
  { code: 'YYC', city: 'Calgary', name: 'Calgary International Airport', country: 'Canada' },
  
  // Africa & South America
  { code: 'CAI', city: 'Cairo', name: 'Cairo International Airport', country: 'Egypt' },
  { code: 'JNB', city: 'Johannesburg', name: 'OR Tambo International Airport', country: 'South Africa' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International Airport', country: 'South Africa' },
  { code: 'GRU', city: 'São Paulo', name: 'São Paulo/Guarulhos International Airport', country: 'Brazil' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Rio de Janeiro–Galeão International Airport', country: 'Brazil' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ezeiza International Airport', country: 'Argentina' },
  { code: 'SCL', city: 'Santiago', name: 'Santiago International Airport', country: 'Chile' },
  
  // Low-cost & Regional European
  { code: 'NRN', city: 'Düsseldorf', name: 'Düsseldorf Weeze Airport', country: 'Germany' },
  { code: 'STR', city: 'Stuttgart', name: 'Stuttgart Airport', country: 'Germany' },
  { code: 'NUE', city: 'Nuremberg', name: 'Nuremberg Airport', country: 'Germany' },
  { code: 'HHN', city: 'Frankfurt', name: 'Frankfurt-Hahn Airport', country: 'Germany' },
  { code: 'MST', city: 'Maastricht', name: 'Maastricht Aachen Airport', country: 'Netherlands' },
  { code: 'EIN', city: 'Eindhoven', name: 'Eindhoven Airport', country: 'Netherlands' },
  { code: 'RTM', city: 'Rotterdam', name: 'Rotterdam The Hague Airport', country: 'Netherlands' },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    let suggestions = [];
    
    // Add "Anywhere" option if query matches
    if ('anywhere'.includes(query.toLowerCase()) || query.toLowerCase().includes('any')) {
      suggestions.push({
        code: 'ANYWHERE',
        city: 'Anywhere',
        name: 'Search all destinations',
        country: 'Worldwide'
      });
    }

    // Check if Amadeus API is configured
    const hasAmadeusConfig = process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET;
    
    if (hasAmadeusConfig && query.length >= 2) {
      const amadeus = new AmadeusAPI();
      const amadeusResults = await amadeus.getAirportSuggestions(query);
      suggestions = suggestions.concat(amadeusResults);
    } else {
      // Fallback to local airport data
      const filtered = AIRPORTS.filter(airport => 
        airport.city.toLowerCase().includes(query.toLowerCase()) ||
        airport.code.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15);
      
      suggestions = suggestions.concat(filtered);
    }
    
    return NextResponse.json(suggestions.slice(0, 20));
  } catch (error) {
    console.error('Error fetching airport suggestions:', error);
    
    // Fallback to local data on error
    let suggestions = [];
    
    // Add "Anywhere" option
    if ('anywhere'.includes(query.toLowerCase()) || query.toLowerCase().includes('any')) {
      suggestions.push({
        code: 'ANYWHERE',
        city: 'Anywhere',
        name: 'Search all destinations',
        country: 'Worldwide'
      });
    }
    
    const filtered = AIRPORTS.filter(airport => 
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase()) ||
      airport.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 15);
    
    suggestions = suggestions.concat(filtered);
    return NextResponse.json(suggestions.slice(0, 20));
  }
}