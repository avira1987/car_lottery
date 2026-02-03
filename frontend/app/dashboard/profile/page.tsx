'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
    fetchStats();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Note: Update endpoint might need to be added to backend
      const response = await api.put('/users/profile', formData);
      setProfile(response.data);
      setUser(response.data);
      setEditMode(false);
      alert('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← بازگشت به داشبورد
          </Link>
          <h1 className="text-4xl font-bold">پروفایل کاربری</h1>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">موجودی</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {parseFloat(stats.balance || '0').toLocaleString('fa-IR')} تومان
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">شانس‌های فعال</h3>
              <p className="text-2xl font-bold text-green-600">{stats.activeChances || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">بلیط‌ها</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.ticketsCount || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">زیرمجموعه‌ها</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.referralsCount || 0}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">اطلاعات شخصی</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                ویرایش
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">نام</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">نام خانوادگی</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">ایمیل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">شماره موبایل</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      firstName: profile.firstName || '',
                      lastName: profile.lastName || '',
                      email: profile.email || '',
                      phone: profile.phone || '',
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">نام</label>
                  <p className="text-lg">{profile.firstName || 'ثبت نشده'}</p>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">نام خانوادگی</label>
                  <p className="text-lg">{profile.lastName || 'ثبت نشده'}</p>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">ایمیل</label>
                <p className="text-lg">{profile.email || 'ثبت نشده'}</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">شماره موبایل</label>
                <p className="text-lg">{profile.phone || 'ثبت نشده'}</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">کد معرف</label>
                <p className="text-lg font-mono">{profile.referralCode}</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">تاریخ عضویت</label>
                <p className="text-lg">
                  {new Date(profile.createdAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/wallet"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">کیف پول</h3>
            <p className="text-gray-600">مدیریت موجودی و تراکنش‌ها</p>
          </Link>
          <Link
            href="/dashboard/referrals"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">زیرمجموعه‌ها</h3>
            <p className="text-gray-600">لینک دعوت و آمار زیرمجموعه‌ها</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
