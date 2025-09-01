// Mapping of IATA codes to airline names
export const iataToName: Record<string, string> = {
  // European Airlines
  'FR': 'Ryanair',
  'U2': 'easyJet',
  'W6': 'Wizz Air',
  'VY': 'Vueling',
  'LH': 'Lufthansa',
  'AF': 'Air France',
  'KL': 'KLM',
  'BA': 'British Airways',
  'IB': 'Iberia',
  'TP': 'TAP Air Portugal',
  'LX': 'Swiss',
  'OS': 'Austrian',
  'SK': 'SAS',
  'AY': 'Finnair',
  'DY': 'Norwegian',
  'D8': 'Norwegian',
  'A3': 'Aegean',
  'TK': 'Turkish Airlines',
  'LO': 'LOT Polish',
  'AZ': 'ITA Airways',
  'UX': 'Air Europa',
  'EW': 'Eurowings',
  'HV': 'Transavia',
  'TO': 'Transavia France',
  
  // Middle East Airlines
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'EY': 'Etihad',
  
  // US Airlines
  'AA': 'American Airlines',
  'DL': 'Delta',
  'UA': 'United',
  'WN': 'Southwest',
  'B6': 'JetBlue',
  'AS': 'Alaska',
  'NK': 'Spirit',
  'F9': 'Frontier',
  
  // Canadian
  'AC': 'Air Canada',
  'WS': 'WestJet',
  
  // Asian Airlines
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'NH': 'ANA',
  'JL': 'JAL',
  'AI': 'Air India',
  '6E': 'IndiGo',
  'AK': 'AirAsia',
  'TG': 'Thai Airways',
  'MH': 'Malaysia Airlines',
  'GA': 'Garuda',
  'PR': 'Philippine Airlines',
  'VN': 'Vietnam Airlines',
  'KE': 'Korean Air',
  'OZ': 'Asiana',
};

// Mapping of IATA codes to ICAO codes
export const iataToICAO: Record<string, string> = {
  // European Airlines
  'FR': 'RYR', // Ryanair
  'U2': 'EZY', // easyJet
  'W6': 'WZZ', // Wizz Air
  'VY': 'VLG', // Vueling
  'LH': 'DLH', // Lufthansa
  'AF': 'AFR', // Air France
  'KL': 'KLM', // KLM
  'BA': 'BAW', // British Airways
  'IB': 'IBE', // Iberia
  'TP': 'TAP', // TAP Air Portugal
  'LX': 'SWR', // Swiss
  'OS': 'AUA', // Austrian
  'SK': 'SAS', // SAS
  'AY': 'FIN', // Finnair
  'DY': 'NOZ', // Norwegian
  'D8': 'NOZ', // Norwegian (alternative code)
  'A3': 'AEE', // Aegean
  'TK': 'THY', // Turkish Airlines
  'LO': 'LOT', // LOT Polish
  'AZ': 'ITY', // ITA Airways
  'UX': 'AEA', // Air Europa
  'EW': 'EWG', // Eurowings
  'HV': 'TRA', // Transavia
  'TO': 'TRA', // Transavia France
  
  // Middle East Airlines
  'EK': 'UAE', // Emirates
  'QR': 'QTR', // Qatar Airways
  'EY': 'ETD', // Etihad
  
  // US Airlines
  'AA': 'AAL', // American Airlines
  'DL': 'DAL', // Delta
  'UA': 'UAL', // United
  'WN': 'SWA', // Southwest
  'B6': 'JBU', // JetBlue
  'AS': 'ASA', // Alaska
  'NK': 'NKS', // Spirit
  'F9': 'FFT', // Frontier
  
  // Canadian
  'AC': 'ACA', // Air Canada
  'WS': 'WJA', // WestJet
  
  // Asian Airlines
  'SQ': 'SIA', // Singapore Airlines
  'CX': 'CPA', // Cathay Pacific
  'NH': 'ANA', // ANA
  'JL': 'JAL', // JAL
  'AI': 'AIC', // Air India
  '6E': 'IGO', // IndiGo
  'AK': 'AXM', // AirAsia
  'TG': 'THA', // Thai Airways
  'MH': 'MAS', // Malaysia Airlines
  'GA': 'GIA', // Garuda
  'PR': 'PAL', // Philippine Airlines
  'VN': 'HVN', // Vietnam Airlines
  'KE': 'KAL', // Korean Air
  'OZ': 'AAR', // Asiana
};

// Mapping of airline names to ICAO codes for logo lookup
export const airlineToICAO: Record<string, string> = {
  // Major European Airlines
  'Ryanair': 'RYR',
  'easyJet': 'EZY',
  'EasyJet': 'EZY',
  'Wizz Air': 'WZZ',
  'Vueling': 'VLG',
  'Lufthansa': 'DLH',
  'Air France': 'AFR',
  'KLM': 'KLM',
  'British Airways': 'BAW',
  'Iberia': 'IBE',
  'TAP': 'TAP',
  'TAP Air Portugal': 'TAP',
  'Swiss': 'SWR',
  'Austrian': 'AUA',
  'Brussels Airlines': 'BEL',
  'SAS': 'SAS',
  'Finnair': 'FIN',
  'Norwegian': 'NAX',
  'Aegean': 'AEE',
  'Turkish Airlines': 'THY',
  'LOT': 'LOT',
  'Alitalia': 'AZA',
  'ITA Airways': 'ITY',
  'Air Europa': 'AEA',
  'Eurowings': 'EWG',
  'Transavia': 'TRA',
  'Jet2': 'EXS',
  'TUI': 'TOM',
  'Condor': 'CFG',
  
  // US Airlines
  'American Airlines': 'AAL',
  'Delta': 'DAL',
  'United': 'UAL',
  'Southwest': 'SWA',
  'JetBlue': 'JBU',
  'Alaska': 'ASA',
  'Spirit': 'NKS',
  'Frontier': 'FFT',
  'Hawaiian': 'HAL',
  
  // Asian Airlines
  'Emirates': 'UAE',
  'Qatar Airways': 'QTR',
  'Etihad': 'ETD',
  'Singapore Airlines': 'SIA',
  'Cathay Pacific': 'CPA',
  'ANA': 'ANA',
  'JAL': 'JAL',
  'Air India': 'AIC',
  'IndiGo': 'IGO',
  'AirAsia': 'AXM',
  'Thai Airways': 'THA',
  'Malaysia Airlines': 'MAS',
  'Garuda': 'GIA',
  'Philippine Airlines': 'PAL',
  'Vietnam Airlines': 'HVN',
  'Korean Air': 'KAL',
  'Asiana': 'AAR',
  'China Southern': 'CSN',
  'China Eastern': 'CES',
  'Air China': 'CCA',
  
  // Other Airlines
  'Air Canada': 'ACA',
  'LATAM': 'LAN',
  'Avianca': 'AVA',
  'Copa': 'CMP',
  'Aeromexico': 'AMX',
  'Ethiopian': 'ETH',
  'Kenya Airways': 'KQA',
  'South African': 'SAA',
  'EgyptAir': 'MSR',
  'Royal Air Maroc': 'RAM',
  'El Al': 'ELY',
  'Qantas': 'QFA',
  'Air New Zealand': 'ANZ',
};

// Function to get ICAO code from airline name
export function getICAOCode(airlineName: string): string | null {
  // Try exact match first
  if (airlineToICAO[airlineName]) {
    return airlineToICAO[airlineName];
  }
  
  // Try case-insensitive match
  const normalizedName = airlineName.trim();
  for (const [key, value] of Object.entries(airlineToICAO)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return value;
    }
  }
  
  // Try partial match (for cases like "Ryanair UK" -> "Ryanair")
  for (const [key, value] of Object.entries(airlineToICAO)) {
    if (normalizedName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedName.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}

// Function to get airline name from code
export function getAirlineName(airlineCode: string): string {
  // Check if it's an IATA code
  if (airlineCode.length === 2 || airlineCode.length === 3) {
    const upperCode = airlineCode.toUpperCase();
    if (iataToName[upperCode]) {
      return iataToName[upperCode];
    }
  }
  
  // If it's already a full name, return it
  if (airlineCode.length > 3) {
    return airlineCode;
  }
  
  // Otherwise return the code itself
  return airlineCode;
}

// Function to get airline logo path
export function getAirlineLogoPath(airlineCode: string): string | null {
  // First check if it's a 2-letter IATA code
  if (airlineCode.length === 2 || airlineCode.length === 3) {
    const upperCode = airlineCode.toUpperCase();
    // Check if it's an IATA code
    if (iataToICAO[upperCode]) {
      return `/airline-logos/${iataToICAO[upperCode]}.png`;
    }
    // Check if it's already an ICAO code (3 letters)
    if (airlineCode.length === 3) {
      // Check if file exists by trying common ICAO codes
      return `/airline-logos/${upperCode}.png`;
    }
  }
  
  // Otherwise try to match by airline name
  const icaoCode = getICAOCode(airlineCode);
  if (!icaoCode) return null;
  
  // Return path to the FlightAware logo
  return `/airline-logos/${icaoCode}.png`;
}