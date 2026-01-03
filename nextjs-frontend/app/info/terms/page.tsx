'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';

export default function TermsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        await apiClient.getTermsPage();
      } catch (err) {
        console.error('Failed to fetch terms page:', err);
        setError('Failed to load terms and conditions');
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-16 max-w-3xl">
        <h1 className="text-4xl font-poppins font-semibold mb-8">Terms and Conditions</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on the
              Anupam World website for personal, non-commercial transitory viewing only. This is the grant of a license, not
              a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">3. Disclaimer</h2>
            <p>
              The materials on the Anupam World website are provided on an 'as is' basis. Anupam World makes no warranties,
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">4. Limitations</h2>
            <p>
              In no event shall Anupam World or its suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use
              the materials on the Anupam World website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on the Anupam World website could include technical, typographical, or photographic
              errors. Anupam World does not warrant that any of the materials on its website are accurate, complete, or
              current. Anupam World may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">6. Links</h2>
            <p>
              Anupam World has not reviewed all of the sites linked to its website and is not responsible for the contents
              of any such linked site. The inclusion of any link does not imply endorsement by Anupam World of the site. Use
              of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">7. Modifications</h2>
            <p>
              Anupam World may revise these terms and conditions for its website at any time without notice. By using this
              website, you are agreeing to be bound by the then current version of these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-3">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and you
              irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
