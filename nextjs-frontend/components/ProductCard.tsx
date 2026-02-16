"use client";

import { Product } from '@/types';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast-context';
import LoadingSpinner from './LoadingSpinner';

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      console.log('Adding product to cart:', { productId: product.id, name: product.name });
      await apiClient.addToCart(Number(product.id), 1);
      // optimistic UI: trigger router refresh
      router.refresh();
      toast.push(`${product.name} added to cart`, 'success');
    } catch (err: any) {
      console.error('Add to cart error:', err);
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      
      if (status === 401) {
        toast.push('Please login to add items to cart', 'error');
        router.push('/auth/login');
      } else {
        toast.push(`Failed to add to cart: ${message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card p-6">
      <div className="product-image mb-4 flex items-center justify-center text-5xl">{product.image_url || product.image ? <img src={product.image_url || product.image!} alt={product.name} className="max-h-40 object-contain" /> : '🛋️'}</div>
      <div className="product-info">
        <div className="text-sm text-gray-500 mb-2">{product.category}</div>
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">₹{Number(product.mrp || product.price || 0).toLocaleString()}</div>
          <button onClick={handleAddToCart} disabled={loading} className="btn-primary ml-4 flex items-center gap-2">
            {loading ? <><LoadingSpinner /> Adding...</> : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
