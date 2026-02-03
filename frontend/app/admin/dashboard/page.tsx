'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'lotteries' | 'settings'>('overview');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← بازگشت به داشبورد
          </Link>
          <h1 className="text-4xl font-bold">پنل مدیریت</h1>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">کل کاربران</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">کل تراکنش‌ها</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalTransactions || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">قرعه‌کشی‌های فعال</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeLotteries || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">کل موجودی</h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalBalance ? parseFloat(stats.totalBalance).toLocaleString('fa-IR') : '0'} تومان
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                آمار کلی
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                کاربران
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'transactions'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                تراکنش‌ها
              </button>
              <button
                onClick={() => setActiveTab('lotteries')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'lotteries'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                قرعه‌کشی‌ها
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                تنظیمات
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">آمار کلی سیستم</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">آمار کاربران</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>کل کاربران:</span>
                        <span className="font-bold">{stats.totalUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>کاربران فعال:</span>
                        <span className="font-bold">{stats.activeUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>کاربران جدید (امروز):</span>
                        <span className="font-bold">{stats.newUsersToday || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">آمار مالی</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>کل موجودی:</span>
                        <span className="font-bold">
                          {stats.totalBalance ? parseFloat(stats.totalBalance).toLocaleString('fa-IR') : '0'} تومان
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>کل تراکنش‌ها:</span>
                        <span className="font-bold">{stats.totalTransactions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>درخواست‌های برداشت:</span>
                        <span className="font-bold">{stats.pendingWithdrawals || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">مدیریت کاربران</h2>
                <Link
                  href="/admin/users"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  مشاهده و مدیریت کاربران
                </Link>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">مدیریت تراکنش‌ها</h2>
                <Link
                  href="/admin/transactions"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  مشاهده و مدیریت تراکنش‌ها
                </Link>
              </div>
            )}

            {activeTab === 'lotteries' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">مدیریت قرعه‌کشی‌ها</h2>
                <Link
                  href="/admin/lotteries"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  مشاهده و مدیریت قرعه‌کشی‌ها
                </Link>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">تنظیمات سیستم</h2>
                <Link
                  href="/admin/settings"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  تنظیمات سیستم
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
