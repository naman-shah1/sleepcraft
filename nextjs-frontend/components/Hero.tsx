'use client';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-light to-white py-24">
      <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-poppins text-primary-dark">Of Myths and Memories</h1>
          <p className="mt-6 text-gray-700 max-w-xl">A piece of folklore reflecting emotion to do the talking. Discover our Ready to Ship collection.</p>
          <div className="mt-8 flex gap-4">
            <a href="/products/new" className="btn-primary">Shop Now</a>
            <a href="/search" className="btn-secondary">Search</a>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-72 bg-white rounded-2xl shadow-lg flex items-center justify-center text-6xl">🛋️</div>
        </div>
      </div>
    </section>
  );
}
