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

// Function to get airline logo path
export function getAirlineLogoPath(airlineName: string): string | null {
  const icaoCode = getICAOCode(airlineName);
  if (!icaoCode) return null;
  
  // Return path to the FlightAware logo
  return `/airline-logos/${icaoCode}.png`;
}