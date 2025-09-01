export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-medium text-black mb-8">About Exegius</h1>
        
        <div className="prose prose-gray max-w-none">
          <section className="mb-12">
            <p className="text-lg text-gray-700 mb-6">
              Exegius is your trusted companion for finding the best flight deals across the globe. We aggregate and compare flights from hundreds of airlines and travel providers, making it simple to find the perfect flight at the right price.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-medium text-black mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              We believe that travel should be accessible to everyone. Our mission is to simplify the flight search process and help travelers save both time and money by providing transparent, comprehensive flight comparisons in one place.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-medium text-black mb-4">What We Do</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-black mb-3">Comprehensive Search</h3>
                <p className="text-gray-700">
                  Search across multiple airlines and travel sites simultaneously to find all available options for your journey.
                </p>
              </div>
              <div className="border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-black mb-3">Price Comparison</h3>
                <p className="text-gray-700">
                  Compare prices transparently with no hidden fees. What you see is what's available.
                </p>
              </div>
              <div className="border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-black mb-3">Flexible Dates</h3>
                <p className="text-gray-700">
                  Find the cheapest travel dates with our flexible date search feature.
                </p>
              </div>
              <div className="border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-black mb-3">Direct Booking</h3>
                <p className="text-gray-700">
                  We connect you directly with airlines and trusted partners for secure booking.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-medium text-black mb-4">Why Choose Exegius</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-gray-400 mr-3">✓</span>
                <span className="text-gray-700">No booking fees - we don't charge any additional fees for using our service</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-3">✓</span>
                <span className="text-gray-700">Unbiased results - we show all available options without preference</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-3">✓</span>
                <span className="text-gray-700">Real-time pricing - get up-to-date prices and availability</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-3">✓</span>
                <span className="text-gray-700">Secure and private - your data is protected and never sold</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-3">✓</span>
                <span className="text-gray-700">Mobile friendly - search and compare flights on any device</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-medium text-black mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Founded in 2025, Exegius was born from a simple frustration: finding affordable flights shouldn't be complicated. Our founders, avid travelers themselves, spent countless hours jumping between different websites to compare prices and find the best deals.
            </p>
            <p className="text-gray-700 mb-4">
              We decided to build a solution that would aggregate all this information in one place, with a clean, simple interface that anyone could use. Today, Exegius helps thousands of travelers find their perfect flights every day.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-medium text-black mb-4">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-medium text-black mb-2">Simplicity</h3>
                <p className="text-sm text-gray-600">Making flight search simple and intuitive for everyone</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-medium text-black mb-2">Transparency</h3>
                <p className="text-sm text-gray-600">No hidden fees, no surprises, just honest comparisons</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="font-medium text-black mb-2">Trust</h3>
                <p className="text-sm text-gray-600">Your privacy and security are our top priorities</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-medium text-black mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              Have questions, feedback, or suggestions? We'd love to hear from you. Visit our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a> to get in touch with our team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}