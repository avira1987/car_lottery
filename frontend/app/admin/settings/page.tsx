'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [ticketBasePrice, setTicketBasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchSettings();
  }, [user, router]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/settings/ticket-base-price');
      if (response.data) {
        setTicketBasePrice(response.data.price?.toString() || '100000');
      } else {
        setTicketBasePrice('100000');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setTicketBasePrice('100000');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTicketPrice = async () => {
    if (!ticketBasePrice || parseFloat(ticketBasePrice) <= 0) {
      alert('قیمت باید بیشتر از صفر باشد');
      return;
    }

    setSaving(true);
    try {
      await api.post('/admin/settings/ticket-base-price', {
        price: parseFloat(ticketBasePrice),
      });
      alert('تنظیمات با موفقیت ذخیره شد');
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← بازگشت به پنل مدیریت
          </Link>
          <h1 className="text-4xl font-bold">تنظیمات سیستم</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ticket Base Price */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">قیمت پایه بلیط</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">قیمت پایه (تومان)</label>
                  <input
                    type="number"
                    value={ticketBasePrice}
                    onChange={(e) => setTicketBasePrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="1000"
                    step="1000"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    قیمت پایه برای اولین بلیط. بلیط‌های بعدی با تخفیف محاسبه می‌شوند.
                  </p>
                </div>
                <button
                  onClick={handleSaveTicketPrice}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    saving
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 اطلاعات</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>قیمت پایه برای اولین بلیط استفاده می‌شود</li>
                <li>بلیط دوم: 20% تخفیف</li>
                <li>بلیط سوم: 30% تخفیف</li>
                <li>بلیط چهارم و بیشتر: 40% تخفیف</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
