'use client';

import Link from 'next/link';
import { useState } from 'react';
import '@/styles/admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-container">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2>SleepCraft Admin</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="nav-link">
            <span>📊</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className="nav-link">
            <span>👥</span>
            <span>Users</span>
          </Link>
          <Link href="/admin/orders" className="nav-link">
            <span>📦</span>
            <span>Orders</span>
          </Link>
          <Link href="/admin/products" className="nav-link">
            <span>🛏️</span>
            <span>Products</span>
          </Link>
          <Link href="/admin/analytics" className="nav-link">
            <span>📈</span>
            <span>Analytics</span>
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
