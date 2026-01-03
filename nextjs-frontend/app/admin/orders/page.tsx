'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Order {
  order_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  product_id: number;
  product_name: string;
  amount: number;
  status: string;
  payment_method: string;
  date: string;
}

interface PaginationData {
  orders: Order[];
  total: number;
  pages: number;
  current_page: number;
}

export default function AdminOrders() {
  const [data, setData] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const fetchOrders = async (page: number, status: string) => {
    try {
      setLoading(true);
      const url = status
        ? `/admin/orders?page=${page}&per_page=${perPage}&status=${status}`
        : `/admin/orders?page=${page}&per_page=${perPage}`;
      
      const response = await apiClient.get(url);
      console.log('[Admin Orders] Data fetched:', response.data);
      
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('[Admin Orders] Error fetching orders:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading orders...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📦 Orders Management</h1>
        <div className="header-stats">
          <span>Total Orders: {data?.total || 0}</span>
        </div>
      </div>

      <div className="section-card">
        <div className="filters">
          <label>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders && data.orders.length > 0 ? (
                data.orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <Link href={`/admin/orders/${order.order_id}`} className="order-link">
                        #{order.order_id}
                      </Link>
                    </td>
                    <td>{order.user_name}</td>
                    <td>{order.user_email}</td>
                    <td>{order.product_name}</td>
                    <td>{formatCurrency(order.amount)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>{order.payment_method || 'COD'}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>
                      <Link
                        href={`/admin/orders/${order.order_id}`}
                        className="btn-small"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="no-data">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="pagination">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn-pagination"
              >
                ← Previous
              </button>
            )}

            {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`btn-pagination ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}

            {currentPage < data.pages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn-pagination"
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
