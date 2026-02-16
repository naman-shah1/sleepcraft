'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface OrderDetail {
  order_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  product_id: number;
  product_name: string;
  amount: number;
  status: string;
  payment_method: string;
  date: string;
}

export default function OrderDetail() {
  const params = useParams();
  const orderId = params.order_id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/orders/${orderId}`);
      console.log('[Order Detail] Data fetched:', response.data);
      
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('[Order Detail] Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) {
      alert('Please select a different status');
      return;
    }

    try {
      setUpdating(true);
      const response = await apiClient.put(`/admin/orders/${orderId}/status`, {
        status: selectedStatus,
      });
      console.log('[Order Update] Response:', response.data);
      
      if (response.data.success) {
        alert('Order status updated successfully');
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('[Order Update] Error:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading order details...</div></div>;
  }

  if (!order) {
    return (
      <div className="admin-page">
        <div className="error-message">Order not found</div>
        <Link href="/admin/orders" className="btn-primary">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <Link href="/admin/orders" className="btn-back">← Back</Link>
        <h1>📦 Order Details</h1>
      </div>

      <div className="order-detail-container">
        {/* Order Info Card */}
        <div className="section-card">
          <h3>Order Information</h3>
          <div className="order-info-grid">
            <div className="info-item">
              <span className="label">Order ID:</span>
              <span className="value">#{order.order_id}</span>
            </div>
            <div className="info-item">
              <span className="label">Order Date:</span>
              <span className="value">{formatDate(order.date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Amount:</span>
              <span className="value amount">{formatCurrency(order.amount)}</span>
            </div>
            <div className="info-item">
              <span className="label">Payment Method:</span>
              <span className="value">{order.payment_method || 'Cash on Delivery'}</span>
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="section-card">
          <h3>Customer Information</h3>
          <div className="customer-info-grid">
            <div className="info-item">
              <span className="label">Name:</span>
              <span className="value">{order.user_name}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">
                <a href={`mailto:${order.user_email}`}>{order.user_email}</a>
              </span>
            </div>
            <div className="info-item">
              <span className="label">Phone:</span>
              <span className="value">
                <a href={`tel:${order.user_phone}`}>{order.user_phone}</a>
              </span>
            </div>
            <div className="info-item">
              <span className="label">User ID:</span>
              <span className="value">
                <Link href={`/admin/users/${order.user_id}`} className="link">
                  #{order.user_id}
                </Link>
              </span>
            </div>
          </div>
        </div>

        {/* Product Info Card */}
        <div className="section-card">
          <h3>Product Information</h3>
          <div className="product-info-grid">
            <div className="info-item">
              <span className="label">Product Name:</span>
              <span className="value">{order.product_name}</span>
            </div>
            <div className="info-item">
              <span className="label">Product ID:</span>
              <span className="value">#{order.product_id}</span>
            </div>
          </div>
        </div>

        {/* Status Update Card */}
        <div className="section-card status-update-card">
          <h3>Update Order Status</h3>
          <div className="status-update-form">
            <div className="form-group">
              <label htmlFor="status-select">Current Status:</label>
              <select
                id="status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="status-badge-display">
              <span className={`status-badge ${selectedStatus}`}>
                {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              </span>
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === order.status}
              className="btn-primary"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
