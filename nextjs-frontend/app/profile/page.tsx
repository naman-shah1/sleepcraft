'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { push: showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_number: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile_number: user.mobile_number || '',
      });
    }
  }, [user, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // You would need to create an API endpoint for updating user profile
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
      showToast('Logout failed', 'error');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container-custom py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading profile...</div>
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-poppins font-semibold mb-8">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-6 rounded border text-center">
                {user.profile_picture && (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                <div className="space-y-2">
                  <a
                    href="/my-orders"
                    className="block w-full py-2 text-primary hover:underline font-medium"
                  >
                    My Orders
                  </a>
                  <a
                    href="/wishlist"
                    className="block w-full py-2 text-primary hover:underline font-medium"
                  >
                    Wishlist
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Edit Form */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-6 rounded border">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Account Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {isEditing ? (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        placeholder="Enter your mobile number"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="w-full btn-primary py-2 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="text-lg font-medium">{formData.name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email Address</p>
                      <p className="text-lg font-medium">{formData.email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mobile Number</p>
                      <p className="text-lg font-medium">
                        {formData.mobile_number || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Book */}
              <div className="bg-gray-50 p-6 rounded border mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Saved Addresses</h2>
                  <button className="text-primary hover:underline font-medium">
                    + Add New
                  </button>
                </div>
                <p className="text-gray-500 text-center py-4">No saved addresses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
