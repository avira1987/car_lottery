'use client';

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            قرعه‌کشی خودرو
          </h1>
          <p className="text-2xl text-gray-600 mb-10">
            شانس خود را برای برنده شدن یک خودرو امتحان کنید
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/lottery"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              مشاهده قرعه‌کشی‌ها
            </Link>
            {!user && (
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ثبت‌نام رایگان
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <div className="text-5xl mb-4 text-center">🎫</div>
            <h3 className="text-2xl font-bold mb-3 text-center">قرعه‌کشی</h3>
            <p className="text-gray-600 text-center">
              شرکت در قرعه‌کشی‌های مختلف و شانس برنده شدن جوایز نقدی و خودرو
            </p>
            <Link
              href="/lottery"
              className="block mt-4 text-center text-indigo-600 hover:text-indigo-800 font-medium"
            >
              مشاهده بیشتر →
            </Link>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <div className="text-5xl mb-4 text-center">🎡</div>
            <h3 className="text-2xl font-bold mb-3 text-center">بازی‌ها</h3>
            <p className="text-gray-600 text-center">
              گردونه شانس و ماشین اسلاید برای کسب جوایز بیشتر
            </p>
            <Link
              href="/games/wheel"
              className="block mt-4 text-center text-indigo-600 hover:text-indigo-800 font-medium"
            >
              شروع بازی →
            </Link>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <div className="text-5xl mb-4 text-center">👥</div>
            <h3 className="text-2xl font-bold mb-3 text-center">زیرمجموعه</h3>
            <p className="text-gray-600 text-center">
              دعوت از دوستان و دریافت شانس رایگان برای هر زیرمجموعه
            </p>
            {user ? (
              <Link
                href="/dashboard/referrals"
                className="block mt-4 text-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                مشاهده لینک دعوت →
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="block mt-4 text-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ثبت‌نام کنید →
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-4xl font-bold text-center mb-12">چرا لاتاری؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-bold mb-2">امن و قابل اعتماد</h3>
              <p className="text-gray-600">سیستم RNG امن برای قرعه‌کشی</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-bold mb-2">جوایز نقدی</h3>
              <p className="text-gray-600">جوایز نقدی و خودرو</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-bold mb-2">بازی‌های رایگان</h3>
              <p className="text-gray-600">گردونه و ماشین اسلاید</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold mb-2">شانس رایگان</h3>
              <p className="text-gray-600">با خرید بلیط و دعوت دوستان</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
