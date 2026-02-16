'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

// Mobile menu implemented here for small screens

export default function Header() {
  const auth = (() => {
    try {
      return useAuth();
    } catch (e) {
      return null;
    }
  })();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const localCart = JSON.parse(localStorage.getItem('anupamCart') || '[]');
      const count = localCart.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
      setCartCount(count);
      const localWishlist = JSON.parse(localStorage.getItem('anupamWishlist') || '[]');
      setWishlistCount(localWishlist.length);
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-40">
      <div className="container-custom flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 mr-2 rounded hover:bg-gray-100"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((s) => !s)}
          >
            {/* simple hamburger */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <Link href="/" className="text-2xl font-poppins font-semibold text-primary">
            <span className="text-primary-dark">ANUPAM</span>WORLD
          </Link>

          <nav className="hidden md:flex gap-6 items-center text-sm">
            <Link href="/products/new" className="hover:text-primary">New</Link>
            <Link href="/products/mattress" className="hover:text-primary">Mattress</Link>
            <Link href="/products/sofa" className="hover:text-primary">Sofa</Link>
            <Link href="/search" className="hover:text-primary">Search</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/wishlist" className="relative px-3 py-2 hover:text-primary">
            <span>❤️</span>
            <span className="ml-1 text-sm">{wishlistCount}</span>
          </Link>

          <Link href="/cart" className="relative px-3 py-2 hover:text-primary">
            <span>🛍️</span>
            <span className="ml-1 text-sm">{cartCount}</span>
          </Link>

          {auth && auth.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="text-sm hover:text-primary py-2">
                  Hi, {auth.user?.name ?? 'User'} ▼
                </button>
                <div className="absolute right-0 hidden group-hover:block bg-white border rounded shadow-lg min-w-48 z-50">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 border-b">
                    My Profile
                  </Link>
                  <Link href="/my-orders" className="block px-4 py-2 hover:bg-gray-100 border-b">
                    My Orders
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium"
                    onClick={() => auth.logout()}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="px-3 py-2 bg-primary text-white rounded-full text-sm">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link href="/products" className="block px-3 py-2 rounded hover:bg-gray-100">All Products</Link>
            <Link href="/products/new" className="block px-3 py-2 rounded hover:bg-gray-100">New</Link>
            <Link href="/products/mattress" className="block px-3 py-2 rounded hover:bg-gray-100">Mattress</Link>
            <Link href="/products/sofa" className="block px-3 py-2 rounded hover:bg-gray-100">Sofa</Link>
            <Link href="/search" className="block px-3 py-2 rounded hover:bg-gray-100">Search</Link>
            {auth && auth.isAuthenticated && (
              <>
                <Link href="/profile" className="block px-3 py-2 rounded hover:bg-gray-100 border-t">My Profile</Link>
                <Link href="/my-orders" className="block px-3 py-2 rounded hover:bg-gray-100">My Orders</Link>
              </>
            )}
            <Link href="/wishlist" className="block px-3 py-2 rounded hover:bg-gray-100">Wishlist ({wishlistCount})</Link>
            <Link href="/cart" className="block px-3 py-2 rounded hover:bg-gray-100">Cart ({cartCount})</Link>
          </div>
        </div>
      )}
    </header>
  );
}
