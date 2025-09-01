export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-medium text-black mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Exegius ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">2. Service Description</h2>
            <p className="text-gray-700 mb-4">
              Exegius is a flight search and comparison service that aggregates flight information from various airlines and travel providers. We do not sell tickets directly but provide links to third-party booking sites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">You agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate and complete information when using our service</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to disrupt or interfere with the service</li>
              <li>Verify all flight information with the airline before booking</li>
              <li>Read and understand the terms of the third-party booking sites</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">4. Pricing and Availability</h2>
            <p className="text-gray-700 mb-4">
              Flight prices and availability displayed on Exegius are subject to change without notice. We strive to provide accurate information but cannot guarantee that all prices are current or that seats are available at the displayed price.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">5. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our service contains links to third-party websites. We are not responsible for the content, accuracy, or practices of these sites. Your use of third-party sites is at your own risk and subject to their terms and conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Exegius shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from your use or inability to use the service, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content on Exegius, including text, graphics, logos, and software, is the property of Exegius or its content suppliers and is protected by international copyright laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">8. Privacy</h2>
            <p className="text-gray-700 mb-4">
              Your use of our service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">9. Modifications</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new terms on this page. Your continued use of the service after any modifications indicates your acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: juan@exegius.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}