'use client';

import ProductCard from './ProductCard';
import { Product } from '@/types';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="section-header">
          <h2 className="section-title">Featured Collections</h2>
          <p className="section-subtitle">Discover our carefully curated collections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products && products.length ? (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full text-center text-gray-500">No products found</div>
          )}
        </div>
      </div>
    </section>
  );
}
