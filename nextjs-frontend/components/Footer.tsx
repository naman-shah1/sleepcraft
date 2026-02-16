'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="container-custom py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold">ANUPAM WORLD</h3>
          <p className="text-gray-300 mt-2">Luxury sofas and mattresses for the discerning homeowner.</p>
        </div>
        <div>
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-3 text-gray-300 space-y-2 text-sm">
            <li><Link href="/products/new">New Arrivals</Link></li>
            <li><Link href="/products/sofa">Sofa</Link></li>
            <li><Link href="/products/mattress">Mattress</Link></li>
            <li><Link href="/search">Search</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Support</h4>
          <ul className="mt-3 text-gray-300 space-y-2 text-sm">
            <li><Link href="/info/contact">Contact</Link></li>
            <li><Link href="/info/size-guide">Size Guide</Link></li>
            <li><Link href="/info/privacy">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Contact</h4>
          <p className="text-gray-300 mt-3 text-sm">help@anupamworld.com</p>
          <p className="text-gray-300 mt-1 text-sm">+91 9372328479</p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Anupam World. All rights reserved.
      </div>
    </footer>
  );
}
