'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';
import { CartItem } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState('');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const result = await apiClient.getCart({ sort: sort || undefined });
        setCartItems(result?.cart_items || []);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch cart:', err);
        const status = err.response?.status || err.code;
        if (status === 401 || err.message?.includes('401')) {
          setError('Please login to view your cart');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          setError('Failed to load cart. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router, sort]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
      await apiClient.updateCartItem(Number(itemId), newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity, subtotal: item.product_price * newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Failed to update cart:', err);
      setError('Failed to update item. Please try again.');
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
      await apiClient.removeFromCart(Number(itemId));
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-poppins font-semibold mb-8">Shopping Cart</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading cart...</div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
            <a href="/products" className="btn-primary">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Items ({cartItems.length})</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sort:</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-1 border rounded text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Default</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="quantity_desc">Quantity (High to Low)</option>
                    <option value="newest">Recently Added</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white border rounded shadow-sm">
                    {/* Product Image Placeholder */}
                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-3xl">
                      🛋️
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.product_name}</h3>
                      <p className="text-gray-600 text-sm">₹{Number(item.product_price).toLocaleString()}</p>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updating[item.id]}
                          className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                          disabled={updating[item.id]}
                          className="w-12 text-center border rounded px-2 py-1 disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updating[item.id]}
                          className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal and Remove */}
                    <div className="text-right">
                      <div className="text-xl font-semibold text-primary">
                        ₹{Number(item.subtotal).toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updating[item.id]}
                        className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-gray-50 rounded border">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6 border-b pb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>₹{Number(totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-semibold mb-6">
                  <span>Total</span>
                  <span className="text-primary">₹{Number(totalAmount).toLocaleString()}</span>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full btn-primary py-3 mb-2"
                >
                  Proceed to Checkout
                </button>
                <a href="/products" className="block text-center py-2 text-primary hover:underline text-sm">
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
