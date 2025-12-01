// Google OAuth 回调处理页面
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import api from '@/services/api';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 从 URL 获取 token
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        // 检查是否有错误
        if (errorParam) {
          setError('登录失败：' + errorParam);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!token) {
          setError('未获取到认证令牌');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // 保存 token
        api.auth.saveToken(token);
        setToken(token);

        // 获取用户信息
        const { user } = await api.auth.getCurrentUser();
        
        // 转换为前端需要的格式
        setUser({
          id: user._id,
          email: user.email,
          username: user.name,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          isVIP: user.vipLevel > 0,
          credits: user.credits,
          vipLevel: user.vipLevel,
        });

        // 跳转到首页
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || '登录失败，请重试');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [navigate, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="p-8 text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-500 text-4xl">❌</div>
            <h2 className="text-xl font-semibold text-gray-900">登录失败</h2>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-gray-500">正在返回登录页...</p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">登录中...</h2>
            <p className="text-sm text-gray-600">正在验证您的账号</p>
          </>
        )}
      </Card>
    </div>
  );
}
