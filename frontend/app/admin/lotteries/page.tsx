'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface Lottery {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  drawDate?: string;
  maxEntries?: number;
  _count: {
    entries: number;
  };
}

export default function AdminLotteriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [drawing, setDrawing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    maxEntries: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchLotteries();
  }, [user, router]);

  const fetchLotteries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/lottery');
      setLotteries(response.data || []);
    } catch (error) {
      console.error('Error fetching lotteries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/lottery', {
        ...formData,
        maxEntries: formData.maxEntries ? parseInt(formData.maxEntries) : undefined,
      });
      alert('قرعه‌کشی با موفقیت ایجاد شد');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        maxEntries: '',
      });
      fetchLotteries();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در ایجاد قرعه‌کشی');
    }
  };

  const handleDraw = async (lotteryId: string) => {
    if (!confirm('آیا از انجام قرعه‌کشی اطمینان دارید؟ این عمل قابل بازگشت نیست.')) return;

    setDrawing(lotteryId);
    try {
      await api.post(`/admin/lottery/${lotteryId}/draw`);
      alert('قرعه‌کشی با موفقیت انجام شد');
      fetchLotteries();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در انجام قرعه‌کشی');
    } finally {
      setDrawing(null);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
              ← بازگشت به پنل مدیریت
            </Link>
            <h1 className="text-4xl font-bold">مدیریت قرعه‌کشی‌ها</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg"
          >
            + ایجاد قرعه‌کشی جدید
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotteries.map((lottery) => (
              <div key={lottery.id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-2">{lottery.title}</h2>
                {lottery.description && (
                  <p className="text-gray-600 text-sm mb-4">{lottery.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">وضعیت:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        lottery.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : lottery.status === 'UPCOMING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lottery.status === 'ACTIVE'
                        ? 'فعال'
                        : lottery.status === 'UPCOMING'
                        ? 'آینده'
                        : 'تمام شده'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">شرکت‌کنندگان:</span>
                    <span className="font-semibold">{lottery._count.entries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">پایان:</span>
                    <span>
                      {new Date(lottery.endDate).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/lottery/${lottery.id}`}
                    className="flex-1 text-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    مشاهده
                  </Link>
                  {lottery.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleDraw(lottery.id)}
                      disabled={drawing === lottery.id}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                    >
                      {drawing === lottery.id ? 'در حال انجام...' : 'قرعه‌کشی'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6">ایجاد قرعه‌کشی جدید</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">عنوان</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">توضیحات</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">تاریخ شروع</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">تاریخ پایان</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">حداکثر شرکت‌کننده (اختیاری)</label>
                  <input
                    type="number"
                    value={formData.maxEntries}
                    onChange={(e) => setFormData({ ...formData, maxEntries: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="1"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    ایجاد
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
