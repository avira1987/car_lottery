'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface Referral {
  id: string;
  referred: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    createdAt: string;
  };
  createdAt: string;
  isActive: boolean;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalChancesGranted: number;
  recentReferrals: Referral[];
}

export default function ReferralsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchReferralCode();
    fetchStats();
  }, [user, router]);

  const fetchReferralCode = async () => {
    try {
      const response = await api.get('/referrals/code');
      setReferralCode(response.data.referralCode);
      setReferralLink(response.data.referralLink);
    } catch (error) {
      console.error('Error fetching referral code:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/referrals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
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
          <h1 className="text-4xl font-bold">زیرمجموعه‌ها</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">کل زیرمجموعه‌ها</h3>
              <p className="text-4xl font-bold text-indigo-600">{stats.totalReferrals}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">زیرمجموعه‌های فعال</h3>
              <p className="text-4xl font-bold text-green-600">{stats.activeReferrals}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-600">شانس‌های دریافت شده</h3>
              <p className="text-4xl font-bold text-purple-600">{stats.totalChancesGranted}</p>
            </div>
          </div>
        )}

        {/* Referral Code Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">کد معرف شما</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">کد معرف</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
                />
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {copied ? 'کپی شد!' : 'کپی'}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">لینک دعوت</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {copied ? 'کپی شد!' : 'کپی لینک'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 چگونه کار می‌کند؟</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>لینک دعوت خود را با دوستانتان به اشتراک بگذارید</li>
              <li>هر بار که کسی با لینک شما ثبت‌نام کند، شما یک شانس رایگان دریافت می‌کنید</li>
              <li>شانس‌های دریافت شده را می‌توانید در بازی‌ها استفاده کنید</li>
            </ul>
          </div>
        </div>

        {/* Recent Referrals */}
        {stats && stats.recentReferrals.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">زیرمجموعه‌های اخیر</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">نام</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">ایمیل/موبایل</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">تاریخ ثبت‌نام</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {referral.referred.firstName || referral.referred.lastName
                          ? `${referral.referred.firstName || ''} ${referral.referred.lastName || ''}`.trim()
                          : 'بدون نام'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {referral.referred.email || referral.referred.phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(referral.referred.createdAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            referral.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {referral.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {stats && stats.recentReferrals.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">هنوز زیرمجموعه‌ای ندارید</p>
            <p className="text-gray-400 text-sm mt-2">
              لینک دعوت خود را با دوستانتان به اشتراک بگذارید
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
