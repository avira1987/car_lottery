'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface Prize {
  id: string;
  type: string;
  name: string;
  description?: string;
  value?: string;
  rankFrom?: number;
  rankTo?: number;
  quantity?: number;
}

interface Lottery {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  drawDate?: string;
  maxEntries?: number;
  prizes: Prize[];
  _count: {
    entries: number;
  };
}

export default function LotteryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [lottery, setLottery] = useState<Lottery | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [availableChances, setAvailableChances] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (lottery) {
      fetchChances();
      checkEntry();
    }
  }, [lottery]);

  useEffect(() => {
    fetchLottery();
  }, [params.id]);

  const fetchLottery = async () => {
    try {
      const response = await api.get(`/lottery/${params.id}`);
      setLottery(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        router.push('/lottery');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchChances = async () => {
    if (!user) return;
    try {
      const response = await api.get('/chances');
      setAvailableChances(response.data.available || 0);
    } catch (error) {
      console.error('Error fetching chances:', error);
    }
  };

  const checkEntry = async () => {
    if (!user || !lottery) return;
    try {
      // Check if user has entered by checking their lottery entries
      const response = await api.get('/lottery');
      const userLotteries = response.data || [];
      const hasEnteredThisLottery = userLotteries.some((l: any) => l.id === params.id && l.hasEntered);
      setHasEntered(hasEnteredThisLottery);
    } catch (error) {
      // Entry check might fail, that's ok
      setHasEntered(false);
    }
  };

  const handleEnter = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (availableChances < 5) {
      alert('شما به 5 شانس نیاز دارید. شانس‌های فعلی: ' + availableChances);
      return;
    }

    setEntering(true);
    try {
      await api.post('/lottery/enter', {
        lotteryId: params.id,
      });
      alert('با موفقیت در قرعه‌کشی شرکت کردید!');
      setHasEntered(true);
      await fetchChances();
      await fetchLottery();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در شرکت در قرعه‌کشی');
    } finally {
      setEntering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!lottery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">قرعه‌کشی یافت نشد</p>
          <Link href="/lottery" className="text-indigo-600 hover:underline">
            بازگشت به لیست قرعه‌کشی‌ها
          </Link>
        </div>
      </div>
    );
  }

  const isActive = lottery.status === 'ACTIVE';
  const isUpcoming = lottery.status === 'UPCOMING';
  const isCompleted = lottery.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/lottery" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
          ← بازگشت به لیست قرعه‌کشی‌ها
        </Link>

        {/* Lottery Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold">{lottery.title}</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : isUpcoming
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isActive ? 'فعال' : isUpcoming ? 'آینده' : 'تمام شده'}
            </span>
          </div>

          {lottery.description && (
            <p className="text-gray-600 text-lg mb-6">{lottery.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">تاریخ شروع</p>
              <p className="font-semibold">
                {new Date(lottery.startDate).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">تاریخ پایان</p>
              <p className="font-semibold">
                {new Date(lottery.endDate).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">شرکت‌کنندگان</p>
              <p className="font-semibold text-2xl">{lottery._count.entries}</p>
            </div>
          </div>

          {/* Enter Button */}
          {isActive && (
            <div className="border-t pt-6">
              {!user ? (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-blue-800 mb-2">برای شرکت در قرعه‌کشی باید وارد شوید</p>
                  <Link
                    href="/auth/login"
                    className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    ورود / ثبت‌نام
                  </Link>
                </div>
              ) : hasEntered ? (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-green-800 font-semibold">✅ شما در این قرعه‌کشی شرکت کرده‌اید</p>
                </div>
              ) : (
                <div>
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-yellow-800 mb-2">
                      برای شرکت در این قرعه‌کشی به <strong>5 شانس</strong> نیاز دارید
                    </p>
                    <p className="text-sm text-yellow-700">
                      شانس‌های فعلی شما: <strong>{availableChances}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleEnter}
                    disabled={entering || availableChances < 5}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition ${
                      availableChances >= 5 && !entering
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {entering ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚙️</span>
                        در حال پردازش...
                      </span>
                    ) : availableChances < 5 ? (
                      'شانس کافی نیست'
                    ) : (
                      '🎫 شرکت در قرعه‌کشی (5 شانس)'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {isCompleted && lottery.drawDate && (
            <div className="border-t pt-6 mt-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-800 font-semibold mb-2">قرعه‌کشی انجام شده است</p>
                <p className="text-sm text-purple-700">
                  تاریخ قرعه‌کشی:{' '}
                  {new Date(lottery.drawDate).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Prizes */}
        {lottery.prizes && lottery.prizes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-6">جوایز</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lottery.prizes.map((prize, index) => (
                <div
                  key={prize.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{prize.name}</h3>
                        {prize.type === 'CASH' && prize.value && (
                          <p className="text-green-600 font-semibold">
                            {parseFloat(prize.value).toLocaleString('fa-IR')} تومان
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {prize.description && (
                    <p className="text-gray-600 text-sm mb-2">{prize.description}</p>
                  )}
                  {prize.rankFrom && prize.rankTo && (
                    <p className="text-sm text-gray-500">
                      رتبه‌های {prize.rankFrom} تا {prize.rankTo}
                    </p>
                  )}
                  {prize.quantity && (
                    <p className="text-sm text-gray-500">تعداد: {prize.quantity}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
