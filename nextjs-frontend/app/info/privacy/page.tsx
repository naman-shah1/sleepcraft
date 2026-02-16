'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        await apiClient.getPrivacyPage();
      } catch (err) {
        console.error('Failed to fetch privacy page:', err);
        setError('Failed to load privacy policy');
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-16 max-w-3xl">
        <h1 className="text-4xl font-poppins font-semibold mb-8">Privacy Policy</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">Introduction</h2>
            <p>
              At Anupam World, we are committed to protecting your privacy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site
              includes:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Personal Data: name, email address, phone number, and postal address</li>
              <li>Payment Information: credit card numbers and billing information</li>
              <li>Device Information: IP address, browser type, and operating system</li>
              <li>Usage Data: pages visited, time spent on pages, and links clicked</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized
              experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Process your transactions and send related information</li>
              <li>Email regarding your account or order</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site</li>
              <li>Generate a personal profile about you so that future visits to the Site will be personalized</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>By Law or to Protect Rights: if required by law or if we believe in good faith</li>
              <li>Third-Party Service Providers: to vendors, consultants, and other service providers</li>
              <li>Business Transfers: if we are involved in a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to protect your personal information. However,
              no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: help@anupamworld.com<br />
              Phone: +91 9372328479
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
