'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchBalance();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await api.get('/wallet/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/auth/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg">
          لطفاً وارد شوید
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">داشبورد</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">موجودی</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {parseFloat(balance).toLocaleString('fa-IR')} تومان
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">شانس‌های فعال</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.activeChances || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">بلیط‌ها</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.ticketsCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">زیرمجموعه‌ها</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.referralsCount || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard/wallet"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">💳</div>
            <h2 className="text-2xl font-bold mb-2">کیف پول</h2>
            <p className="text-gray-600">شارژ، برداشت و تاریخچه تراکنش‌ها</p>
          </Link>
          <Link
            href="/dashboard/chances"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-2xl font-bold mb-2">مدیریت شانس</h2>
            <p className="text-gray-600">مشاهده و مدیریت شانس‌های خود</p>
          </Link>
          <Link
            href="/dashboard/referrals"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">👥</div>
            <h2 className="text-2xl font-bold mb-2">زیرمجموعه‌ها</h2>
            <p className="text-gray-600">لینک دعوت و آمار زیرمجموعه‌ها</p>
          </Link>
          <Link
            href="/dashboard/profile"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">👤</div>
            <h2 className="text-2xl font-bold mb-2">پروفایل</h2>
            <p className="text-gray-600">اطلاعات شخصی و تنظیمات</p>
          </Link>
          <Link
            href="/dashboard/tickets"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">🎫</div>
            <h2 className="text-2xl font-bold mb-2">بلیط‌های من</h2>
            <p className="text-gray-600">مشاهده و خرید بلیط</p>
          </Link>
          <Link
            href="/lottery"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">🎫</div>
            <h2 className="text-2xl font-bold mb-2">قرعه‌کشی</h2>
            <p className="text-gray-600">شرکت در قرعه‌کشی‌ها</p>
          </Link>
          <Link
            href="/games/wheel"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">🎡</div>
            <h2 className="text-2xl font-bold mb-2">گردونه شانس</h2>
            <p className="text-gray-600">چرخش گردونه و برنده شدن جوایز</p>
          </Link>
          <Link
            href="/games/slide"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-3">🎰</div>
            <h2 className="text-2xl font-bold mb-2">ماشین اسلاید</h2>
            <p className="text-gray-600">بازی و شانس برنده شدن</p>
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="block p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-3">⚙️</div>
              <h2 className="text-2xl font-bold mb-2">پنل مدیریت</h2>
              <p className="text-white opacity-90">مدیریت سیستم</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
