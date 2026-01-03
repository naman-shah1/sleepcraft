'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!!q);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(q);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        const result = await apiClient.searchProducts(q, 1);
        setProducts(result?.products || []);
        setTotalResults(result?.total_results || 0);
        setError(null);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to perform search. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Section */}
        {!q ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Enter a search term to find products</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">Searching for "{q}"...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found for "{q}"</p>
            <p className="text-gray-400 mt-2">Try different keywords or browse our categories</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found <strong>{totalResults}</strong> result{totalResults !== 1 ? 's' : ''} for "{q}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
