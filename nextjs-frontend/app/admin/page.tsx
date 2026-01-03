'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_products: number;
  total_revenue: number;
  orders_by_status: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
  };
}

interface RecentOrder {
  order_id: number;
  user_name: string;
  product_name: string;
  amount: number;
  status: string;
  date: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/dashboard');
      console.log('[Admin Dashboard] Data fetched:', response.data);
      
      if (response.data.success) {
        setStats(response.data.data.stats);
        setRecentOrders(response.data.data.recent_orders);
      }
    } catch (error) {
      console.error('[Admin Dashboard] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading dashboard...</div></div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <button onClick={fetchDashboardData} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats?.total_users || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats?.total_orders || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛏️</div>
          <div className="stat-content">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{stats?.total_products || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(stats?.total_revenue || 0)}</div>
          </div>
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <h3>Orders by Status</h3>
          <div className="status-bars">
            <div className="status-bar">
              <span className="status-label">Pending</span>
              <div className="status-bar-bg">
                <div
                  className="status-bar-fill pending"
                  style={{
                    width: `${(stats?.orders_by_status.pending || 0) > 0 ? '100%' : '5%'}`,
                  }}
                />
              </div>
              <span className="status-count">{stats?.orders_by_status.pending || 0}</span>
            </div>

            <div className="status-bar">
              <span className="status-label">Confirmed</span>
              <div className="status-bar-bg">
                <div
                  className="status-bar-fill confirmed"
                  style={{
                    width: `${(stats?.orders_by_status.confirmed || 0) > 0 ? '100%' : '5%'}`,
                  }}
                />
              </div>
              <span className="status-count">{stats?.orders_by_status.confirmed || 0}</span>
            </div>

            <div className="status-bar">
              <span className="status-label">Shipped</span>
              <div className="status-bar-bg">
                <div
                  className="status-bar-fill shipped"
                  style={{
                    width: `${(stats?.orders_by_status.shipped || 0) > 0 ? '100%' : '5%'}`,
                  }}
                />
              </div>
              <span className="status-count">{stats?.orders_by_status.shipped || 0}</span>
            </div>

            <div className="status-bar">
              <span className="status-label">Delivered</span>
              <div className="status-bar-bg">
                <div
                  className="status-bar-fill delivered"
                  style={{
                    width: `${(stats?.orders_by_status.delivered || 0) > 0 ? '100%' : '5%'}`,
                  }}
                />
              </div>
              <span className="status-count">{stats?.orders_by_status.delivered || 0}</span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link href="/admin/orders" className="view-all">View All →</Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>
                        <Link href={`/admin/orders/${order.order_id}`} className="order-link">
                          #{order.order_id}
                        </Link>
                      </td>
                      <td>{order.user_name}</td>
                      <td>{order.product_name}</td>
                      <td>{formatCurrency(order.amount)}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(order.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
