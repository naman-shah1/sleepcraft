'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';
import Cookies from 'js-cookie';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Add a small delay to ensure auth is fully loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await apiClient.get(`/orders/${orderId}`);
        if (result.data?.success) {
          setOrder(result.data.data);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        console.error('[Order Confirmation] Failed to fetch order:', err);
        const status = err.response?.status;
        if (status === 401) {
          setError('Please login to view your order');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else if (status === 404) {
          setError('Order not found');
        } else {
          setError('Failed to load order details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container-custom py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading order confirmation...</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {error ? (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          ) : order ? (
            <>
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-poppins font-semibold text-green-600 mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-gray-600 text-lg">Thank you for your order</p>
              </div>

              <div className="bg-gray-50 p-8 rounded border mb-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                    <p className="text-2xl font-semibold text-primary">{order.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Status</p>
                    <p className="text-lg font-semibold">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {order.status?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-6">
                  <h2 className="text-lg font-semibold mb-4">Order Details</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product</span>
                      <span className="font-medium">{order.product_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Amount</span>
                      <span className="font-medium">₹{Number(order.payment).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">{order.payment_method?.toUpperCase() || 'COD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date</span>
                      <span className="font-medium">
                        {order.date
                          ? new Date(order.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded border mb-8">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Order confirmation has been sent to your email</li>
                  <li>✓ You will receive a call from our team to confirm delivery details</li>
                  <li>✓ Expected delivery within 5-7 business days</li>
                  <li>✓ Payment to be collected at the time of delivery (COD)</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/products')}
                  className="flex-1 btn-primary py-3"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 border border-primary text-primary hover:bg-gray-50"
                >
                  Back to Home
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Order not found</p>
              <button
                onClick={() => router.push('/products')}
                className="btn-primary py-2 px-6"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
