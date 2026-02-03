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
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [withdrawDescription, setWithdrawDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw' | 'transactions'>('balance');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchBalance();
    fetchTransactions();
  }, [user, router]);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/wallet/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async (pageNum: number = 1) => {
    try {
      const response = await api.get(`/wallet/transactions?page=${pageNum}&limit=20`);
      if (pageNum === 1) {
        setTransactions(response.data.transactions || []);
      } else {
        setTransactions([...transactions, ...(response.data.transactions || [])]);
      }
      setHasMore(response.data.transactions?.length === 20);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('مبلغ باید بیشتر از صفر باشد');
      return;
    }

    setLoading(true);
    try {
      await api.post('/wallet/deposit', {
        amount: parseFloat(depositAmount),
        description: depositDescription || 'شارژ کیف پول',
      });
      alert('شارژ با موفقیت انجام شد');
      setDepositAmount('');
      setDepositDescription('');
      fetchBalance();
      fetchTransactions(1);
      setActiveTab('balance');
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در شارژ کیف پول');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('مبلغ باید بیشتر از صفر باشد');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(balance)) {
      alert('موجودی کافی نیست');
      return;
    }

    setLoading(true);
    try {
      await api.post('/wallet/withdraw', {
        amount: parseFloat(withdrawAmount),
        description: withdrawDescription || 'درخواست برداشت',
      });
      alert('درخواست برداشت با موفقیت ثبت شد. پس از تایید ادمین، مبلغ به حساب شما واریز می‌شود.');
      setWithdrawAmount('');
      setWithdrawDescription('');
      fetchBalance();
      fetchTransactions(1);
      setActiveTab('balance');
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در ثبت درخواست برداشت');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
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

  const getTransactionStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'text-green-600',
      PENDING: 'text-yellow-600',
      FAILED: 'text-red-600',
      CANCELLED: 'text-gray-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getTransactionStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: 'تکمیل شده',
      PENDING: 'در انتظار',
      FAILED: 'ناموفق',
      CANCELLED: 'لغو شده',
    };
    return labels[status] || status;
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
          <h1 className="text-4xl font-bold">کیف پول</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-2">موجودی کیف پول</h2>
          <p className="text-5xl font-bold">
            {parseFloat(balance).toLocaleString('fa-IR')} تومان
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'balance'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                موجودی
              </button>
              <button
                onClick={() => setActiveTab('deposit')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'deposit'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                شارژ
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'withdraw'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                برداشت
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'transactions'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                تاریخچه تراکنش‌ها
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Deposit Form */}
            {activeTab === 'deposit' && (
              <form onSubmit={handleDeposit} className="max-w-md space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">مبلغ شارژ (تومان)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="مثال: 100000"
                    required
                    min="1000"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">توضیحات (اختیاری)</label>
                  <textarea
                    value={depositDescription}
                    onChange={(e) => setDepositDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                    placeholder="توضیحات..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'در حال پردازش...' : 'شارژ کیف پول'}
                </button>
              </form>
            )}

            {/* Withdraw Form */}
            {activeTab === 'withdraw' && (
              <form onSubmit={handleWithdraw} className="max-w-md space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">مبلغ برداشت (تومان)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder={`حداکثر: ${parseFloat(balance).toLocaleString('fa-IR')}`}
                    required
                    min="10000"
                    max={balance}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    موجودی قابل برداشت: {parseFloat(balance).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">توضیحات (اختیاری)</label>
                  <textarea
                    value={withdrawDescription}
                    onChange={(e) => setWithdrawDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                    placeholder="توضیحات..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'در حال پردازش...' : 'ثبت درخواست برداشت'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  توجه: درخواست برداشت شما پس از تایید ادمین پرداخت می‌شود.
                </p>
              </form>
            )}

            {/* Transactions List */}
            {activeTab === 'transactions' && (
              <div>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">تراکنشی یافت نشد</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {getTransactionTypeLabel(transaction.type)}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {transaction.description || 'بدون توضیحات'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(transaction.createdAt).toLocaleDateString('fa-IR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-left">
                            <p
                              className={`text-xl font-bold ${
                                transaction.type === 'DEPOSIT' ||
                                transaction.type === 'CASHBACK' ||
                                transaction.type === 'PRIZE' ||
                                transaction.type === 'REFERRAL_BONUS'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.type === 'DEPOSIT' ||
                              transaction.type === 'CASHBACK' ||
                              transaction.type === 'PRIZE' ||
                              transaction.type === 'REFERRAL_BONUS'
                                ? '+'
                                : '-'}
                              {parseFloat(transaction.amount).toLocaleString('fa-IR')} تومان
                            </p>
                            <p className={`text-sm mt-1 ${getTransactionStatusColor(transaction.status)}`}>
                              {getTransactionStatusLabel(transaction.status)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {hasMore && (
                      <button
                        onClick={() => {
                          const nextPage = page + 1;
                          setPage(nextPage);
                          fetchTransactions(nextPage);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        نمایش بیشتر
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Balance Info */}
            {activeTab === 'balance' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">اطلاعات کیف پول</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">موجودی فعلی:</span>
                      <span className="font-bold text-lg">
                        {parseFloat(balance).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 برای شارژ کیف پول، به بخش "شارژ" بروید و مبلغ مورد نظر را وارد کنید.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
