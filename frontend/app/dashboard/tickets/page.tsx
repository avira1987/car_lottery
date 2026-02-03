'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface Ticket {
  id: string;
  price: string;
  discount: string;
  finalPrice: string;
  chanceGranted: boolean;
  cashbackGiven: boolean;
  createdAt: string;
  lottery?: {
    id: string;
    title: string;
  };
}

export default function TicketsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState('0');
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchTickets();
    fetchBalance();
  }, [user, router]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets/my-tickets');
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
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

  const calculatePrice = (qty: number) => {
    // Base price (should come from backend settings)
    const basePrice = 100000; // 100,000 Toman
    let total = 0;
    
    // Tiered discount: 1-5: 0%, 6-10: 5%, 11-20: 10%, 21+: 15%
    for (let i = 1; i <= qty; i++) {
      let discount = 0;
      if (i > 20) discount = 0.15;
      else if (i > 10) discount = 0.10;
      else if (i > 5) discount = 0.05;
      
      total += basePrice * (1 - discount);
    }
    
    return total;
  };

  const handleBuy = async () => {
    if (quantity < 1) {
      alert('تعداد باید حداقل 1 باشد');
      return;
    }

    const totalPrice = calculatePrice(quantity);
    if (parseFloat(balance) < totalPrice) {
      alert(`موجودی کافی نیست. نیاز به ${totalPrice.toLocaleString('fa-IR')} تومان`);
      return;
    }

    setBuying(true);
    try {
      await api.post('/tickets/buy', {
        quantity,
      });
      alert('بلیط‌ها با موفقیت خریداری شدند!');
      setShowBuyModal(false);
      setQuantity(1);
      await fetchTickets();
      await fetchBalance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در خرید بلیط');
    } finally {
      setBuying(false);
    }
  };

  if (!user) {
    return null;
  }

  const totalPrice = calculatePrice(quantity);
  const discount = quantity > 5 ? (quantity > 10 ? (quantity > 20 ? 15 : 10) : 5) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
              ← بازگشت به داشبورد
            </Link>
            <h1 className="text-4xl font-bold">بلیط‌های من</h1>
          </div>
          <button
            onClick={() => setShowBuyModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg"
          >
            + خرید بلیط
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-600">کل بلیط‌ها</h3>
            <p className="text-3xl font-bold text-indigo-600">{tickets.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-600">موجودی</h3>
            <p className="text-3xl font-bold text-green-600">
              {parseFloat(balance).toLocaleString('fa-IR')} تومان
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-600">قیمت پایه</h3>
            <p className="text-3xl font-bold text-blue-600">100,000 تومان</p>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-xl text-gray-600 mb-4">هنوز بلیطی خریداری نکرده‌اید</p>
            <button
              onClick={() => setShowBuyModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              خرید اولین بلیط
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">تاریخ خرید</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">قیمت پایه</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">تخفیف</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">قیمت نهایی</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {parseFloat(ticket.price).toLocaleString('fa-IR')} تومان
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {parseFloat(ticket.discount).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {parseFloat(ticket.finalPrice).toLocaleString('fa-IR')} تومان
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          {ticket.chanceGranted && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              شانس دریافت شد
                            </span>
                          )}
                          {ticket.cashbackGiven && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              کش‌بک دریافت شد
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buy Modal */}
        {showBuyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6">خرید بلیط</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">تعداد بلیط</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-4 py-2 border rounded-lg text-center"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>قیمت پایه:</span>
                    <span>{calculatePrice(1).toLocaleString('fa-IR')} تومان</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>تخفیف ({discount}%):</span>
                      <span>-{(calculatePrice(quantity) - quantity * 100000).toLocaleString('fa-IR')} تومان</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>جمع کل:</span>
                    <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>موجودی:</span>
                    <span>{parseFloat(balance).toLocaleString('fa-IR')} تومان</span>
                  </div>
                </div>

                {parseFloat(balance) < totalPrice && (
                  <div className="bg-red-50 p-3 rounded-lg text-red-800 text-sm">
                    موجودی کافی نیست. لطفاً کیف پول خود را شارژ کنید.
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  onClick={handleBuy}
                  disabled={buying || parseFloat(balance) < totalPrice}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                    buying || parseFloat(balance) < totalPrice
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {buying ? 'در حال پردازش...' : 'خرید'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
