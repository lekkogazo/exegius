import FlightSearchForm from '@/components/search/FlightSearchForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-black mb-4">
            Find the best flights
          </h1>
          <p className="text-gray-600 text-lg">
            Search and compare prices from hundreds of travel sites.
          </p>
        </div>
        
        <FlightSearchForm />
        
        <div className="mt-24 pt-12 border-t border-gray-100">
          <h3 className="text-sm font-normal text-gray-500 mb-8 text-center uppercase tracking-wider">
            Popular Routes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { from: 'New York', to: 'London', price: '€320' },
              { from: 'Paris', to: 'Tokyo', price: '€890' },
              { from: 'London', to: 'Dubai', price: '€450' },
              { from: 'Singapore', to: 'Sydney', price: '€380' },
              { from: 'Barcelona', to: 'Rome', price: '€95' },
              { from: 'Amsterdam', to: 'Berlin', price: '€120' },
              { from: 'Miami', to: 'Cancun', price: '€280' },
              { from: 'Dublin', to: 'Edinburgh', price: '€75' },
            ].map((route, i) => (
              <button
                key={i}
                className="text-left p-3 border border-gray-200 hover:border-gray-400 transition-colors group"
              >
                <div className="text-xs text-gray-500 mb-1">{route.from} →</div>
                <div className="text-sm font-medium mb-2">{route.to}</div>
                <div className="text-xs text-gray-400">from {route.price}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-gray-400">
            Prices shown include taxes and fees. Actual prices may vary.
          </p>
        </div>
      </div>
    </main>
  );
}