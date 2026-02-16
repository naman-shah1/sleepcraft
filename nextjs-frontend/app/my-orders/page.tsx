'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const result = await apiClient.get('/orders/user/all');
        if (result.data?.success) {
          setOrders(result.data.data.orders || []);
        }
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        if (err.response?.status === 401) {
          setError('Please login to view your orders');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          setError('Failed to load orders. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-poppins font-semibold mb-8">My Orders</h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded border">
            <p className="text-xl text-gray-500 mb-6">You haven't placed any orders yet</p>
            <a href="/products" className="btn-primary py-2 px-6">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.order_id} className="p-6 border rounded hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-semibold text-primary">#{order.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium">{order.product_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-semibold">₹{Number(order.payment).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {order.date
                        ? new Date(order.date).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-4">
                  <button
                    onClick={() => router.push(`/order-confirmation/${order.order_id}`)}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button className="text-gray-600 hover:underline text-sm font-medium">
                    Track Order
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
