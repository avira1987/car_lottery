'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface Prize {
  id: string;
  name: string;
  type: string;
  value: string;
}

export default function WheelOfFortune() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [availableChances, setAvailableChances] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchChances();
    fetchPrizes();
  }, [user, router]);

  const fetchChances = async () => {
    try {
      const response = await api.get('/chances');
      setAvailableChances(response.data.available || 0);
    } catch (error) {
      console.error('Error fetching chances:', error);
    }
  };

  const fetchPrizes = async () => {
    try {
      const response = await api.get('/wheel/prizes');
      const fetchedPrizes = response.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        value: p.value.toString(),
      }));
      setPrizes(fetchedPrizes.length > 0 ? fetchedPrizes : [
        { id: '1', name: '1000 تومان', type: 'CASH', value: '1000' },
        { id: '2', name: '1 شانس', type: 'CHANCE', value: '1' },
        { id: '3', name: '5000 تومان', type: 'CASH', value: '5000' },
        { id: '4', name: '2 شانس', type: 'CHANCE', value: '2' },
        { id: '5', name: '10000 تومان', type: 'CASH', value: '10000' },
        { id: '6', name: '1 بلیط', type: 'TICKET', value: '1' },
      ]);
    } catch (error) {
      console.error('Error fetching prizes:', error);
      // Fallback to mock data
      const mockPrizes: Prize[] = [
        { id: '1', name: '1000 تومان', type: 'CASH', value: '1000' },
        { id: '2', name: '1 شانس', type: 'CHANCE', value: '1' },
        { id: '3', name: '5000 تومان', type: 'CASH', value: '5000' },
        { id: '4', name: '2 شانس', type: 'CHANCE', value: '2' },
        { id: '5', name: '10000 تومان', type: 'CASH', value: '10000' },
        { id: '6', name: '1 بلیط', type: 'TICKET', value: '1' },
      ];
      setPrizes(mockPrizes);
    }
  };

  const spin = async () => {
    if (spinning || availableChances < 2) return;

    setSpinning(true);
    setResult(null);
    setSelectedPrizeIndex(null);

    try {
      const response = await api.post('/wheel/spin');
      const prize = response.data.prize;
      setResult(prize);

      // Find prize index for animation
      const prizeIndex = prizes.findIndex((p) => p.id === prize.id);
      if (prizeIndex !== -1) {
        setSelectedPrizeIndex(prizeIndex);
        // Calculate rotation: multiple full spins + position
        const fullSpins = 5; // 5 full rotations
        const segmentAngle = 360 / prizes.length;
        const targetAngle = prizeIndex * segmentAngle;
        const finalRotation = fullSpins * 360 + (360 - targetAngle);
        setRotation(finalRotation);
      }

      // Update chances
      await fetchChances();

      setTimeout(() => {
        setSpinning(false);
      }, 4000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در چرخش گردونه');
      setSpinning(false);
    }
  };

  if (!user) {
    return null;
  }

  const segmentAngle = 360 / Math.max(prizes.length, 6);
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← بازگشت به داشبورد
          </Link>
          <h1 className="text-4xl font-bold text-center mb-2">گردونه شانس</h1>
          <p className="text-center text-gray-600">شانس‌های فعال: {availableChances}</p>
        </div>

        <div className="flex flex-col items-center">
          {/* Wheel Container */}
          <div className="relative mb-8">
            <div className="relative w-96 h-96">
              {/* Wheel */}
              <div
                className="absolute inset-0 rounded-full border-8 border-gray-800 overflow-hidden transition-transform duration-4000 ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
              >
                {prizes.map((prize, index) => {
                  const angle = (index * segmentAngle) % 360;
                  const isSelected = selectedPrizeIndex === index && !spinning;
                  return (
                    <div
                      key={prize.id}
                      className="absolute inset-0"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`,
                      }}
                    >
                      <div
                        className={`w-full h-full ${colors[index % colors.length]} ${
                          isSelected ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
                        } flex items-center justify-center`}
                        style={{
                          transform: `rotate(${segmentAngle / 2}deg)`,
                        }}
                      >
                        <span className="text-white text-sm font-bold text-center px-2 transform -rotate-90">
                          {prize.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-800 flex items-center justify-center shadow-lg z-10">
                  {spinning ? (
                    <div className="animate-spin text-2xl">🎡</div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎰</div>
                      <div className="text-xs font-bold text-gray-800">2 شانس</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={spinning || availableChances < 2}
            className={`px-8 py-4 text-lg font-bold rounded-lg transition-all ${
              spinning || availableChances < 2
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {spinning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                در حال چرخش...
              </span>
            ) : availableChances < 2 ? (
              'شانس کافی نیست (نیاز به 2 شانس)'
            ) : (
              '🎡 چرخش گردونه (2 شانس)'
            )}
          </button>

          {/* Result */}
          {result && !spinning && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg shadow-xl max-w-md w-full animate-pulse">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-3xl font-bold mb-2">تبریک!</h2>
                <p className="text-xl mb-1">شما برنده شدید:</p>
                <p className="text-2xl font-bold">{result.name}</p>
                {result.type === 'CASH' && (
                  <p className="text-lg mt-2 opacity-90">
                    مبلغ {parseFloat(result.value).toLocaleString('fa-IR')} تومان به کیف پول شما اضافه شد
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-3">📋 قوانین بازی</h3>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li>هر چرخش گردونه 2 شانس هزینه دارد</li>
              <li>جوایز شامل: پول نقد، شانس رایگان و بلیط است</li>
              <li>شانس‌های خود را از خرید بلیط یا دعوت دوستان دریافت کنید</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
