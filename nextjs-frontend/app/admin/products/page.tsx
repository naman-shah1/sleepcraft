'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface Product {
  product_id: number;
  name: string;
  price: number;
  category: string;
  stock: string | number;
}

interface PaginationData {
  products: Product[];
  total: number;
  pages: number;
  current_page: number;
}

export default function AdminProducts() {
  const [data, setData] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/products?page=${page}&per_page=${perPage}`);
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        console.error('Failed to fetch products:', response.data.error);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error.response?.data || error.message);
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

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading products...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🛏️ Products Management</h1>
        <div className="header-stats">
          <span>Total Products: {data?.total || 0}</span>
        </div>
      </div>

      <div className="section-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {data?.products && data.products.length > 0 ? (
                data.products.map((product) => (
                  <tr key={product.product_id}>
                    <td>#{product.product_id}</td>
                    <td>{product.name}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <span className="badge">{product.category}</span>
                    </td>
                    <td>
                      {typeof product.stock === 'number'
                        ? product.stock
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-data">
                    No products found
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
