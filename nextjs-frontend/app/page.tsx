'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Features from '@/components/Features';
import { apiClient } from '@/lib/api-client';
import { ProductsResponse } from '@/types';

export default function Home() {
  const [data, setData] = useState<ProductsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const result = await apiClient.getHomepage();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          <FeaturedProducts products={data?.featured_products || []} />
          <Features />
        </>
      )}
      <Footer />
    </main>
  );
}
