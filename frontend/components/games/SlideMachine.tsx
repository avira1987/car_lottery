'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import Link from 'next/link';

export default function SlideMachine() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'LIVE' | 'AUTO'>('AUTO');
  const [userNumber, setUserNumber] = useState<number>(50);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [availableChances, setAvailableChances] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchChances();
  }, [user, router]);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Listen for slide results
    newSocket.on('slide-result', (data) => {
      setResult(data);
      if (data.isWinner) {
        fetchWinners();
      }
    });

    // Listen for new target
    newSocket.on('new-target', (data) => {
      setTargetNumber(data.targetNumber);
    });

    // Fetch current target
    fetchCurrentTarget();
    fetchWinners();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchChances = async () => {
    try {
      const response = await api.get('/chances');
      setAvailableChances(response.data.available || 0);
    } catch (error) {
      console.error('Error fetching chances:', error);
    }
  };

  const fetchCurrentTarget = async () => {
    try {
      const response = await api.get('/slide/target');
      if (response.data.targetNumber) {
        setTargetNumber(response.data.targetNumber);
      }
    } catch (error) {
      console.error('Error fetching target:', error);
    }
  };

  const fetchWinners = async () => {
    try {
      const response = await api.get('/slide/winners?limit=10');
      setWinners(response.data);
    } catch (error) {
      console.error('Error fetching winners:', error);
    }
  };

  const play = async () => {
    if (playing || !userNumber || availableChances < 1) return;

    setPlaying(true);
    setResult(null);
    setAnimating(true);

    try {
      const response = await api.post('/slide/play', {
        userNumber,
        mode,
      });
      setResult(response.data);
      await fetchChances();

      setTimeout(() => {
        setAnimating(false);
        setPlaying(false);
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در بازی');
      setPlaying(false);
      setAnimating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← بازگشت به داشبورد
          </Link>
          <h1 className="text-4xl font-bold text-center mb-2">ماشین اسلاید</h1>
          <p className="text-center text-gray-600">شانس‌های فعال: {availableChances}</p>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setMode('AUTO')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'AUTO'
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎯 حالت خودکار
            </button>
            <button
              onClick={() => setMode('LIVE')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'LIVE'
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔴 حالت لایو
            </button>
          </div>
        </div>

        {/* Target Number Display */}
        {mode === 'AUTO' && targetNumber && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <p className="text-sm mb-1">عدد هدف</p>
            <p className="text-5xl font-bold">{targetNumber}</p>
          </div>
        )}

        {/* Number Selector */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <label className="block text-lg font-semibold mb-4 text-center">
            عدد خود را انتخاب کنید (1-100)
          </label>
          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="100"
              value={userNumber}
              onChange={(e) => setUserNumber(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={playing}
            />
            <div className="text-center">
              <div className={`text-6xl font-bold transition-all ${animating ? 'scale-125 animate-bounce' : ''}`}>
                {userNumber}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>1</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Play Button */}
        <div className="text-center mb-8">
          <button
            onClick={play}
            disabled={playing || availableChances < 1}
            className={`px-12 py-4 text-xl font-bold rounded-lg transition-all ${
              playing || availableChances < 1
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {playing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                در حال پردازش...
              </span>
            ) : availableChances < 1 ? (
              'شانس کافی نیست (نیاز به 1 شانس)'
            ) : (
              '🎰 بازی کن (1 شانس)'
            )}
          </button>
        </div>

        {/* Result */}
        {result && !playing && (
          <div
            className={`mb-8 p-8 rounded-lg shadow-xl text-center animate-fade-in ${
              result.isWinner
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
            }`}
          >
            <div className="text-5xl mb-4">{result.isWinner ? '🎉' : '😔'}</div>
            <h2 className="text-3xl font-bold mb-4">
              {result.isWinner ? 'تبریک! شما برنده شدید!' : 'متأسفانه برنده نشدید'}
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4 text-lg">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">عدد شما</p>
                <p className="text-2xl font-bold">{result.userNumber}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm opacity-90">عدد هدف</p>
                <p className="text-2xl font-bold">{result.targetNumber}</p>
              </div>
            </div>
            {result.isWinner && (
              <p className="mt-4 text-lg opacity-90">
                جایزه شما به کیف پول اضافه شد!
              </p>
            )}
          </div>
        )}

        {/* Winners List */}
        {winners.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">🏆 برندگان اخیر</h2>
            <div className="space-y-3">
              {winners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {winner.user?.firstName || winner.user?.email || 'کاربر ناشناس'}{' '}
                        {winner.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        عدد: <span className="font-bold">{winner.userNumber}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(winner.createdAt).toLocaleDateString('fa-IR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-3">📋 قوانین بازی</h3>
          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>هر بازی 1 شانس هزینه دارد</li>
            <li>در حالت خودکار: عدد هدف از قبل مشخص است</li>
            <li>در حالت لایو: عدد هدف به صورت زنده تعیین می‌شود</li>
            <li>اگر عدد شما با عدد هدف برابر باشد، برنده می‌شوید</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
