'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface Chance {
  id: string;
  source: string;
  sourceId?: string;
  used: boolean;
  usedFor?: string;
  usedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

interface ChancesData {
  available: number;
  used: number;
  total: number;
}

export default function ChancesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [chancesData, setChancesData] = useState<ChancesData | null>(null);
  const [history, setHistory] = useState<Chance[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchChances();
    fetchHistory();
  }, [user, router]);

  const fetchChances = async () => {
    try {
      const response = await api.get('/chances');
      setChancesData(response.data);
    } catch (error) {
      console.error('Error fetching chances:', error);
    }
  };

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      const response = await api.get(`/chances/history?page=${pageNum}&limit=20`);
      if (pageNum === 1) {
        setHistory(response.data.chances || []);
      } else {
        setHistory([...history, ...(response.data.chances || [])]);
      }
      setHasMore(response.data.chances?.length === 20);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      TICKET: 'خرید بلیط',
      REFERRAL: 'زیرمجموعه',
      PRIZE: 'جایزه',
    };
    return labels[source] || source;
  };

  const getUsedForLabel = (usedFor?: string) => {
    const labels: Record<string, string> = {
      WHEEL: 'گردونه شانس',
      LOTTERY: 'قرعه‌کشی',
      SLIDE: 'ماشین اسلاید',
    };
    return labels[usedFor || ''] || 'نامشخص';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← بازگشت به داشبورد
          </Link>
          <h1 className="text-4xl font-bold">مدیریت شانس</h1>
        </div>

        {/* Stats Cards */}
        {chancesData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">شانس‌های فعال</h3>
              <p className="text-5xl font-bold">{chancesData.available}</p>
              <p className="text-sm mt-2 opacity-90">آماده استفاده</p>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">شانس‌های استفاده شده</h3>
              <p className="text-5xl font-bold text-gray-800">{chancesData.used}</p>
            </div>
            <div className="bg-indigo-100 p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-indigo-700">کل شانس‌ها</h3>
              <p className="text-5xl font-bold text-indigo-800">{chancesData.total}</p>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">💡 چگونه شانس دریافت کنم؟</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>با خرید هر بلیط، یک شانس رایگان دریافت می‌کنید</li>
            <li>هر بار که کسی با لینک شما ثبت‌نام کند، یک شانس دریافت می‌کنید</li>
            <li>شانس‌ها را می‌توانید در بازی‌ها استفاده کنید</li>
            <li>گردونه شانس: 2 شانس | قرعه‌کشی: 5 شانس | ماشین اسلاید: 1 شانس</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/games/wheel"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">🎡</div>
            <h3 className="text-xl font-bold mb-2">گردونه شانس</h3>
            <p className="text-gray-600 mb-4">استفاده از 2 شانس</p>
            {chancesData && chancesData.available >= 2 ? (
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                آماده
              </span>
            ) : (
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                شانس کافی نیست
              </span>
            )}
          </Link>

          <Link
            href="/lottery"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">🎫</div>
            <h3 className="text-xl font-bold mb-2">قرعه‌کشی</h3>
            <p className="text-gray-600 mb-4">استفاده از 5 شانس</p>
            {chancesData && chancesData.available >= 5 ? (
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                آماده
              </span>
            ) : (
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                شانس کافی نیست
              </span>
            )}
          </Link>

          <Link
            href="/games/slide"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">🎰</div>
            <h3 className="text-xl font-bold mb-2">ماشین اسلاید</h3>
            <p className="text-gray-600 mb-4">استفاده از 1 شانس</p>
            {chancesData && chancesData.available >= 1 ? (
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                آماده
              </span>
            ) : (
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                شانس کافی نیست
              </span>
            )}
          </Link>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">تاریخچه شانس‌ها</h2>

          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">تاریخچه‌ای یافت نشد</p>
          ) : (
            <div className="space-y-4">
              {history.map((chance) => (
                <div
                  key={chance.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            chance.used
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {chance.used ? 'استفاده شده' : 'فعال'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {getSourceLabel(chance.source)}
                        </span>
                      </div>
                      {chance.used && chance.usedFor && (
                        <p className="text-sm text-gray-600 mt-1">
                          استفاده شده در: {getUsedForLabel(chance.usedFor)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {chance.used && chance.usedAt
                          ? `استفاده شده در: ${new Date(chance.usedAt).toLocaleDateString('fa-IR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : `دریافت شده در: ${new Date(chance.createdAt).toLocaleDateString('fa-IR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`}
                      </p>
                      {chance.expiresAt && (
                        <p className="text-xs text-yellow-600 mt-1">
                          انقضا: {new Date(chance.expiresAt).toLocaleDateString('fa-IR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchHistory(nextPage);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  نمایش بیشتر
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
