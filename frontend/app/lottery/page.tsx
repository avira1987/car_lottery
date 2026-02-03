'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Lottery {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  _count: {
    entries: number;
  };
}

export default function LotteryPage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLotteries();
  }, []);

  const fetchLotteries = async () => {
    try {
      const response = await api.get('/lottery');
      setLotteries(response.data);
    } catch (error) {
      console.error('Error fetching lotteries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">در حال بارگذاری...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">قرعه‌کشی‌ها</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotteries.map((lottery) => (
            <div key={lottery.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-2">{lottery.title}</h2>
              {lottery.description && (
                <p className="text-gray-600 mb-4">{lottery.description}</p>
              )}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  lottery.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  lottery.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lottery.status === 'ACTIVE' ? 'فعال' :
                   lottery.status === 'UPCOMING' ? 'آینده' :
                   'تمام شده'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                شرکت‌کنندگان: {lottery._count.entries}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                پایان: {new Date(lottery.endDate).toLocaleDateString('fa-IR')}
              </p>
              {lottery.status === 'ACTIVE' && (
                <Link
                  href={`/lottery/${lottery.id}`}
                  className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  شرکت در قرعه‌کشی
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
