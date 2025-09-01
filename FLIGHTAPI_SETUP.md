# FlightAPI Integration Setup

This application now uses FlightAPI.io for flight search functionality with a built-in mock mode to preserve your API calls during development.

## Configuration

### 1. Development Mode (Recommended)

By default, the application runs in mock mode to save your API calls:

```env
USE_MOCK_FLIGHTS=true
```

This mode generates realistic flight data without consuming API calls.

### 2. Production Mode

When you're ready to use real flight data:

1. Get your API key from [FlightAPI.io](https://flightapi.io)
2. Update your `.env.local` file:

```env
FLIGHTAPI_KEY=your_actual_api_key_here
USE_MOCK_FLIGHTS=false
```

## Features

### Mock Data Mode
- Generates 12 realistic flight options per search
- Includes direct and connecting flights
- Simulates TAP Air Portugal, Ryanair, EasyJet, Lufthansa, and other airlines
- Realistic pricing between €89-€489
- Proper city names and airport codes
- Round-trip and one-way support

### Real API Mode
- Connects to FlightAPI.io for live flight data
- Automatically falls back to mock data on API errors
- Transforms API responses to match application format
- Supports all search filters and options

## API Usage Tips

1. **Always start with mock mode** during development
2. **Test thoroughly** with mock data before enabling real API
3. **Monitor your API usage** on the FlightAPI dashboard
4. **Use environment variables** to switch between modes easily

## Switching Between Modes

### Use Mock Data (Development)
```bash
USE_MOCK_FLIGHTS=true npm run dev
```

### Use Real API (Production)
```bash
USE_MOCK_FLIGHTS=false npm run dev
```

## Troubleshooting

- **No flights showing**: Check console for error messages
- **API errors**: Verify your API key is correct
- **Unexpected data**: Application automatically falls back to mock data on API errors

## Important Notes

- Mock data is designed to be realistic but is not real flight information
- Always verify API response format matches expected structure when using real API
- Keep your API key secret and never commit it to version control