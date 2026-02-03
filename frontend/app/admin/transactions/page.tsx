'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    userId: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchTransactions();
  }, [user, router, page, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get(`/admin/transactions?${params}`);
      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    if (!confirm('آیا از تایید این درخواست برداشت اطمینان دارید؟')) return;

    try {
      await api.post(`/admin/withdrawals/${id}/approve`);
      alert('درخواست برداشت تایید شد');
      fetchTransactions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در تایید درخواست');
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    if (!confirm('آیا از رد این درخواست برداشت اطمینان دارید؟')) return;

    try {
      await api.post(`/admin/withdrawals/${id}/reject`);
      alert('درخواست برداشت رد شد');
      fetchTransactions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در رد درخواست');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DEPOSIT: 'شارژ',
      WITHDRAWAL: 'برداشت',
      TICKET_PURCHASE: 'خرید بلیط',
      CASHBACK: 'کش‌بک',
      PRIZE: 'جایزه',
      REFERRAL_BONUS: 'پاداش معرف',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: 'تکمیل شده',
      PENDING: 'در انتظار',
      FAILED: 'ناموفق',
      CANCELLED: 'لغو شده',
    };
    return labels[status] || status;
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← بازگشت به پنل مدیریت
          </Link>
          <h1 className="text-4xl font-bold">مدیریت تراکنش‌ها</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">نوع</label>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">همه</option>
              <option value="DEPOSIT">شارژ</option>
              <option value="WITHDRAWAL">برداشت</option>
              <option value="TICKET_PURCHASE">خرید بلیط</option>
              <option value="CASHBACK">کش‌بک</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">وضعیت</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">همه</option>
              <option value="COMPLETED">تکمیل شده</option>
              <option value="PENDING">در انتظار</option>
              <option value="FAILED">ناموفق</option>
              <option value="CANCELLED">لغو شده</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">شناسه کاربر</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => {
                setFilters({ ...filters, userId: e.target.value });
                setPage(1);
              }}
              placeholder="جستجو..."
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">کاربر</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">نوع</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">مبلغ</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">وضعیت</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">تاریخ</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {tx.user.firstName || tx.user.lastName
                          ? `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim()
                          : tx.user.email || tx.user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">{getTypeLabel(tx.type)}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {parseFloat(tx.amount).toLocaleString('fa-IR')} تومان
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            tx.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : tx.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {getStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(tx.createdAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {tx.type === 'WITHDRAWAL' && tx.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveWithdrawal(tx.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              تایید
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(tx.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              رد
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  قبلی
                </button>
                <span className="text-sm text-gray-600">
                  صفحه {page} از {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  بعدی
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
