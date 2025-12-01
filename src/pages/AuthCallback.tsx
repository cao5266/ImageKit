// Google OAuth Callback Page
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
        // Get token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        // Check for errors
        if (errorParam) {
          setError('Login failed: ' + errorParam);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!token) {
          setError('Authentication token not received');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Save token
        api.auth.saveToken(token);
        setToken(token);

        // Get user information
        const { user } = await api.auth.getCurrentUser();
        
        // Convert to frontend format
        setUser({
          id: user._id,
          email: user.email,
          username: user.name,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          isVIP: user.vipLevel > 0,
          credits: user.credits,
          vipLevel: user.vipLevel,
        });

        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Login failed, please try again');
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
            <h2 className="text-xl font-semibold text-gray-900">Login Failed</h2>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-gray-500">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Logging in...</h2>
            <p className="text-sm text-gray-600">Verifying your account</p>
          </>
        )}
      </Card>
    </div>
  );
}
