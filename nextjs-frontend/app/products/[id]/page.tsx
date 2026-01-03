'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { push: showToast } = useToast();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await apiClient.get(`/products/${productId}`);
        if (result.data?.success) {
          setProduct(result.data.data);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await apiClient.addToCart(parseInt(productId), quantity);
      showToast(`${quantity} item(s) added to cart!`, 'success');
      setQuantity(1);
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      const errorMsg = err.response?.data?.error || 'Failed to add to cart';
      showToast(errorMsg, 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container-custom py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading product...</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container-custom py-8">
          <div className="text-center">
            <p className="text-xl text-gray-500 mb-4">{error || 'Product not found'}</p>
            <button onClick={() => router.push('/products')} className="btn-primary">
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container-custom py-8">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 h-96">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <p className="text-lg">No image available</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-poppins font-semibold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-semibold text-primary">
                  ₹{Number(product.mrp).toLocaleString()}
                </p>
                {product.original_price && product.original_price > product.mrp && (
                  <p className="text-lg text-gray-500 line-through">
                    ₹{Number(product.original_price).toLocaleString()}
                  </p>
                )}
              </div>
              {product.discount && (
                <p className="text-green-600 font-medium">{product.discount}% Off</p>
              )}
            </div>

            {/* Stock Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <p className="text-sm">
                <span className="font-medium">Stock:</span>{' '}
                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                  disabled={addingToCart}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border rounded px-2 py-2"
                  disabled={addingToCart}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                  disabled={addingToCart}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button className="flex-1 py-3 border border-primary text-primary hover:bg-gray-50">
                Add to Wishlist
              </button>
            </div>

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-medium">{product.product_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.type_of_product || 'N/A'}</span>
                </div>
                {product.color && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{product.color}</span>
                  </div>
                )}
                {product.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{product.size}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
