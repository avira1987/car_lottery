'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">لاتاری</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/lottery" className="text-gray-700 hover:text-indigo-600 transition">
              قرعه‌کشی‌ها
            </Link>
            <Link href="/games/wheel" className="text-gray-700 hover:text-indigo-600 transition">
              گردونه شانس
            </Link>
            <Link href="/games/slide" className="text-gray-700 hover:text-indigo-600 transition">
              ماشین اسلاید
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  داشبورد
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="text-purple-600 hover:text-purple-700 font-medium transition"
                  >
                    پنل مدیریت
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition">
                    <span>{user.firstName || user.email || 'کاربر'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      پروفایل
                    </Link>
                    <Link
                      href="/dashboard/wallet"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      کیف پول
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-indigo-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <Link
              href="/lottery"
              className="block py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              قرعه‌کشی‌ها
            </Link>
            <Link
              href="/games/wheel"
              className="block py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              گردونه شانس
            </Link>
            <Link
              href="/games/slide"
              className="block py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              ماشین اسلاید
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  داشبورد
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  پروفایل
                </Link>
                <Link
                  href="/dashboard/wallet"
                  className="block py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  کیف پول
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="block py-2 text-purple-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    پنل مدیریت
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-right py-2 text-red-600"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="block py-2 text-indigo-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
