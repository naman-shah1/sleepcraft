'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface UserDetail {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string;
  oauth_provider: string;
  profile_picture: string;
  is_verified: boolean;
  last_login: string | null;
  total_orders: number;
  total_spent: number;
}

interface Order {
  order_id: number;
  product_name: string;
  amount: number;
  status: string;
  date: string;
}

interface WishlistItem {
  product_id: number;
  product_name: string;
}

export default function UserDetail() {
  const params = useParams();
  const userId = params.user_id as string;
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/users/${userId}`);
      console.log('[User Detail] Data fetched:', response.data);
      
      if (response.data.success) {
        setUser(response.data.data.user);
        setOrders(response.data.data.orders);
        setWishlist(response.data.data.wishlist);
      }
    } catch (error) {
      console.error('[User Detail] Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading user details...</div></div>;
  }

  if (!user) {
    return (
      <div className="admin-page">
        <div className="error-message">User not found</div>
        <Link href="/admin/users" className="btn-primary">← Back to Users</Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <Link href="/admin/users" className="btn-back">← Back</Link>
        <h1>👤 User Details</h1>
      </div>

      <div className="user-detail-container">
        {/* User Info Card */}
        <div className="section-card user-info-card">
          <div className="user-header">
            {user.profile_picture && (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="user-avatar"
              />
            )}
            <div className="user-info">
              <h2>{user.name}</h2>
              <p className="email">{user.email}</p>
              <div className="info-badges">
                <span className="badge">{user.oauth_provider || 'Direct'}</span>
                <span className={`badge ${user.is_verified ? 'verified' : 'unverified'}`}>
                  {user.is_verified ? '✓ Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          <div className="user-details-grid">
            <div className="detail-item">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">#{user.user_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{user.mobile_number || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Login:</span>
              <span className="detail-value">{formatDate(user.last_login)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Orders:</span>
              <span className="detail-value">{user.total_orders}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Spent:</span>
              <span className="detail-value">{formatCurrency(user.total_spent)}</span>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="section-card">
          <h3>📦 Orders ({orders.length})</h3>
          {orders.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.order_id}>
                      <td>
                        <Link href={`/admin/orders/${order.order_id}`} className="order-link">
                          #{order.order_id}
                        </Link>
                      </td>
                      <td>{order.product_name}</td>
                      <td>{formatCurrency(order.amount)}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(order.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">No orders found</div>
          )}
        </div>

        {/* Wishlist Section */}
        <div className="section-card">
          <h3>❤️ Wishlist ({wishlist.length})</h3>
          {wishlist.length > 0 ? (
            <div className="wishlist-grid">
              {wishlist.map((item) => (
                <div key={item.product_id} className="wishlist-item">
                  <span>{item.product_name}</span>
                  <span className="product-id">#{item.product_id}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No wishlist items</div>
          )}
        </div>
      </div>
    </div>
  );
}
