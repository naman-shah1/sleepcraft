'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string;
  oauth_provider: string;
  is_verified: boolean;
  last_login: string | null;
}

interface PaginationData {
  users: User[];
  total: number;
  pages: number;
  current_page: number;
}

export default function AdminUsers() {
  const [data, setData] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/users?page=${page}&per_page=${perPage}`);
      console.log('[Admin Users] Data fetched:', response.data);
      
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('[Admin Users] Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading users...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>👥 Users Management</h1>
        <div className="header-stats">
          <span>Total Users: {data?.total || 0}</span>
        </div>
      </div>

      <div className="section-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Provider</th>
                <th>Verified</th>
                <th>Last Login</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.users && data.users.length > 0 ? (
                data.users.map((user) => (
                  <tr key={user.user_id}>
                    <td>#{user.user_id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.mobile_number || 'N/A'}</td>
                    <td>
                      <span className="badge">{user.oauth_provider || 'Direct'}</span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_verified ? 'verified' : 'unverified'}`}>
                        {user.is_verified ? '✓ Verified' : 'Not Verified'}
                      </span>
                    </td>
                    <td>{formatDate(user.last_login)}</td>
                    <td>
                      <Link
                        href={`/admin/users/${user.user_id}`}
                        className="btn-small"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-data">
                    No users found
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
