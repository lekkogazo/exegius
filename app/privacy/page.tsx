export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-medium text-black mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">Effective Date: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">We collect information you provide directly to us, such as:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Search queries (departure/arrival locations, travel dates, number of passengers)</li>
              <li>IP address and browser information</li>
              <li>Device information and identifiers</li>
              <li>Usage data and preferences</li>
              <li>Contact information if you reach out to us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide and improve our flight search services</li>
              <li>Personalize your experience and show relevant results</li>
              <li>Analyze usage patterns to enhance our service</li>
              <li>Communicate with you about our services</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>With airline and travel partners to facilitate flight searches</li>
              <li>With service providers who assist in operating our platform</li>
              <li>To comply with legal requirements or protect our rights</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">4. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            <p className="text-gray-700 mb-4">Types of cookies we use:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information only for as long as necessary to provide you with our services and as described in this Privacy Policy. We will also retain and use your information to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request restriction of processing your personal information</li>
              <li>Request transfer of your personal information</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those in your jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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