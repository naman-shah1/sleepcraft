'use client';

export default function Features() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="feature-card p-6 bg-white rounded shadow">
          <h3 className="font-semibold">Free Delivery</h3>
          <p className="text-sm text-gray-600 mt-2">Fast, reliable delivery across India.</p>
        </div>
        <div className="feature-card p-6 bg-white rounded shadow">
          <h3 className="font-semibold">Premium Quality</h3>
          <p className="text-sm text-gray-600 mt-2">Handcrafted furniture built to last.</p>
        </div>
        <div className="feature-card p-6 bg-white rounded shadow">
          <h3 className="font-semibold">Easy Returns</h3>
          <p className="text-sm text-gray-600 mt-2">30-day returns on eligible items.</p>
        </div>
      </div>
    </section>
  );
}
