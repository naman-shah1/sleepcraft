'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';

export default function SizeGuidePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSizeGuide = async () => {
      try {
        await apiClient.getSizeGuidePage();
      } catch (err) {
        console.error('Failed to fetch size guide page:', err);
        setError('Failed to load size guide');
      } finally {
        setLoading(false);
      }
    };

    fetchSizeGuide();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-16 max-w-4xl">
        <h1 className="text-4xl font-poppins font-semibold mb-8">Size Guide</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Sofa Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Sofa Sizing</h2>
            <p className="text-gray-600 mb-6">
              Our sofas come in various configurations. Here are the standard dimensions:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Width</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Depth</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Height</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Seating Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">2-Seater</td>
                    <td className="border border-gray-300 px-4 py-2">5.5 ft (67")</td>
                    <td className="border border-gray-300 px-4 py-2">2.5 ft (30")</td>
                    <td className="border border-gray-300 px-4 py-2">2.5 ft (30")</td>
                    <td className="border border-gray-300 px-4 py-2">2 people</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">3-Seater</td>
                    <td className="border border-gray-300 px-4 py-2">7 ft (84")</td>
                    <td className="border border-gray-300 px-4 py-2">2.5 ft (30")</td>
                    <td className="border border-gray-300 px-4 py-2">2.5 ft (30")</td>
                    <td className="border border-gray-300 px-4 py-2">3 people</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Sectional L-Shape</td>
                    <td className="border border-gray-300 px-4 py-2">8 ft (96")</td>
                    <td className="border border-gray-300 px-4 py-2">2.5 ft (30")</td>
                    <td className="border border-gray-300 px-4 py-2">2.5 ft (30")</td>
                    <td className="border border-gray-300 px-4 py-2">4+ people</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Mattress Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Mattress Sizing</h2>
            <p className="text-gray-600 mb-6">
              Standard mattress dimensions to help you choose the right size for your space:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Width</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Length</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Single</td>
                    <td className="border border-gray-300 px-4 py-2">3 ft (36")</td>
                    <td className="border border-gray-300 px-4 py-2">6 ft (72")</td>
                    <td className="border border-gray-300 px-4 py-2">Individual</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Double/Queen</td>
                    <td className="border border-gray-300 px-4 py-2">5 ft (60")</td>
                    <td className="border border-gray-300 px-4 py-2">6.5 ft (78")</td>
                    <td className="border border-gray-300 px-4 py-2">Couple</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">King</td>
                    <td className="border border-gray-300 px-4 py-2">6 ft (72")</td>
                    <td className="border border-gray-300 px-4 py-2">6.5 ft (78")</td>
                    <td className="border border-gray-300 px-4 py-2">Couple, Extra Space</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Measurement Tips */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Measure Your Space</h2>
            <ul className="list-decimal list-inside space-y-3 text-gray-600">
              <li>Measure the width and depth of your room where the furniture will be placed</li>
              <li>Account for doorways and passages — ensure the furniture can be moved through them</li>
              <li>Leave at least 2-3 feet of space around the furniture for comfortable movement</li>
              <li>Consider the height of furniture relative to windows and ceiling height</li>
              <li>Measure doorways and hallways to ensure delivery is possible</li>
            </ul>
          </section>

          {/* Contact Info */}
          <section className="bg-primary-light p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Need Help Choosing?</h2>
            <p className="text-gray-700">
              Our expert team is here to help you find the perfect fit. Contact us at help@anupamworld.com or call +91 9372328479.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
