'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  nickname: string | null;
  avatar: string | null;
  phone: string | null;
  email: string | null;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/shop/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setNickname(data.user.nickname || '');
          setAvatar(data.user.avatar || '');
        }
      } catch {
        toast.error('获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error('昵称不能为空');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), avatar }),
      });

      if (res.ok) {
        toast.success('保存成功');
      } else {
        const data = await res.json();
        toast.error(data.error || '保存失败');
      }
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/shop/user')} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">账号设置</h1>
      </div>

      <div className="bg-white rounded-xl border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {nickname?.[0] || session?.user?.name?.[0] || '?'}
              </div>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="输入头像URL（可选）"
              />
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="请输入昵称"
              required
            />
          </div>

          {/* Account info (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <input
              type="text"
              value={session?.user?.email || ''}
              disabled
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">手机号暂不支持修改</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  );
}
