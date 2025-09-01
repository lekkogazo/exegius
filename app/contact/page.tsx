'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message. We will get back to you soon!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-medium text-black mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-gray-700 mb-8">
              We're here to help! Whether you have questions about our service, need assistance with your search, or want to provide feedback, we'd love to hear from you.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-black mb-2">Email</h3>
                <p className="text-gray-600">juan@exegius.com</p>
              </div>

              <div>
                <h3 className="font-medium text-black mb-2">Response Time</h3>
                <p className="text-gray-600">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 p-6 bg-gray-50 border border-gray-200">
          <h2 className="text-xl font-medium text-black mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-black mb-1">How do I book a flight?</h3>
              <p className="text-sm text-gray-600">
                Exegius is a flight search engine. Once you find your ideal flight, click on it to be redirected to the airline or travel agency's website to complete your booking.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-black mb-1">Are the prices accurate?</h3>
              <p className="text-sm text-gray-600">
                We strive to display the most current prices, but final pricing is determined by the booking site. Prices may change based on availability.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-black mb-1">Can I cancel or change my booking?</h3>
              <p className="text-sm text-gray-600">
                Since bookings are made directly with airlines or travel agencies, you'll need to contact them directly for any changes or cancellations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}