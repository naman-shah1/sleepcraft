'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';
import { WishlistItem } from '@/types';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const result = await apiClient.getWishlist();
        setWishlistItems(result?.wishlist_items || []);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch wishlist:', err);
        const status = err.response?.status || err.code;
        if (status === 401 || err.message?.includes('401')) {
          setError('Please login to view your wishlist');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          setError('Failed to load wishlist. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      setRemoving((prev) => ({ ...prev, [itemId]: true }));
      await apiClient.removeFromWishlist(Number(itemId));
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemoving((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await apiClient.addToCart(Number(productId), 1);
      alert(`${productName} added to cart`);
      router.refresh();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-poppins font-semibold mb-8">My Wishlist</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading wishlist...</div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-6">Your wishlist is empty</p>
            <a href="/products" className="btn-primary">
              Explore Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="product-card p-6 border rounded shadow-sm hover:shadow-md transition">
                {/* Product Image */}
                <div className="mb-4 h-40 bg-gray-100 rounded flex items-center justify-center text-5xl overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.product_name} className="w-full h-full object-contain" />
                  ) : (
                    '🛋️'
                  )}
                </div>

                {/* Product Info */}
                <div className="text-sm text-gray-500 mb-2">{item.product_category}</div>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.product_name}</h3>

                {/* Stock Status */}
                <div className="mb-4">
                  {item.in_stock ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="text-2xl font-bold text-primary mb-4">
                  ₹{Number(item.product_price).toLocaleString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item.product_id, item.product_name)}
                    disabled={!item.in_stock}
                    className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    disabled={removing[item.id]}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    ❤️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
