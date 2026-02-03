'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Link from 'next/link';

interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    tickets: number;
    chances: number;
    referrals: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, router, page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=20${search ? `&search=${search}` : ''}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: { isActive?: boolean; role?: string }) => {
    try {
      await api.put(`/admin/users/${userId}`, data);
      alert('کاربر با موفقیت به‌روزرسانی شد');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطا در به‌روزرسانی کاربر');
    }
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
          <h1 className="text-4xl font-bold">مدیریت کاربران</h1>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <input
            type="text"
            placeholder="جستجو بر اساس ایمیل، موبایل، نام..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Users Table */}
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
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">نام</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">ایمیل/موبایل</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">نقش</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">بلیط</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">زیرمجموعه</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">وضعیت</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {u.firstName || u.lastName
                          ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                          : 'بدون نام'}
                      </td>
                      <td className="px-6 py-4 text-sm">{u.email || u.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role === 'ADMIN' ? 'مدیر' : 'کاربر'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{u._count.tickets}</td>
                      <td className="px-6 py-4 text-sm">{u._count.referrals}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowEditModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          ویرایش
                        </button>
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

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6">ویرایش کاربر</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">نقش</label>
                  <select
                    defaultValue={selectedUser.role}
                    onChange={(e) =>
                      handleUpdateUser(selectedUser.id, { role: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="USER">کاربر</option>
                    <option value="ADMIN">مدیر</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">وضعیت</label>
                  <select
                    defaultValue={selectedUser.isActive ? 'true' : 'false'}
                    onChange={(e) =>
                      handleUpdateUser(selectedUser.id, { isActive: e.target.value === 'true' })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="true">فعال</option>
                    <option value="false">غیرفعال</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
