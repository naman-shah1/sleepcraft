'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch products
        const productsRes = await apiClient.getProducts({
          category: category || undefined,
          page: currentPage,
          per_page: 12,
          sort: sort || undefined,
        });
        setProducts(productsRes?.products || []);
        setTotalPages(productsRes?.pagination?.pages || 1);

        // Fetch categories
        const categoriesRes = await apiClient.getCategories();
        setCategories(categoriesRes?.categories || []);

        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, currentPage, sort]);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-poppins font-semibold mb-8">Products</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 rounded border">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>

              {/* Sort Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => {
                    const newSort = e.target.value;
                    const params = new URLSearchParams();
                    if (category) params.set('category', category);
                    if (newSort) params.set('sort', newSort);
                    window.location.href = `/products?${params.toString()}`;
                  }}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary"
                >
                  <option value="">Relevance</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                </select>
              </div>

              <div className="space-y-2">
                <a
                  href="/products"
                  className={`block px-3 py-2 rounded transition ${
                    !category
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  All Products
                </a>
                {categories.map((cat) => (
                  <a
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}${sort ? `&sort=${sort}` : ''}`}
                    className={`block px-3 py-2 rounded transition ${
                      category === cat
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded transition ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
