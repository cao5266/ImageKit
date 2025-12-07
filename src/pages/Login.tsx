// 登录页面
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export function Login() {
  const handleGoogleLogin = () => {
    console.log('Redirecting to Google login...');
    // Call backend Google OAuth
    api.auth.loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">IK</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to ImageKit</h1>
          <p className="text-sm text-gray-600">
            All-in-one image processing tool, secure and efficient
          </p>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-blue-400"
            variant="outline"
          >
            {/* Google Color Icon */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          {/* VIP Benefits */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-medium text-amber-900 mb-1">After logging in, enjoy:</p>
                <ul className="text-amber-800 space-y-1">
                  <li>• Basic features permanently free</li>
                  <li>• Upgrade to VIP for AI watermark removal</li>
                  <li>• Cloud sync for usage history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        {/* Guest Mode */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 text-base border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium"
            onClick={() => window.location.href = '/'}
          >
            👤 Continue as Guest with Basic Features
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            All free features available in guest mode
          </p>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500 leading-relaxed">
            By logging in, you agree to our
            <a href="/terms" className="text-blue-600 hover:underline mx-1">Terms of Service</a>
            and
            <a href="/privacy" className="text-blue-600 hover:underline mx-1">Privacy Policy</a>
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="pt-4 space-y-3">
          <div className="text-xs text-gray-600 font-medium text-center mb-2">
            Why Choose ImageKit?
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-2xl">🔒</div>
              <div className="text-xs text-gray-600">Local Processing</div>
              <div className="text-xs text-gray-400">Privacy First</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">⚡</div>
              <div className="text-xs text-gray-600">Lightning Fast</div>
              <div className="text-xs text-gray-400">No Waiting</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🎨</div>
              <div className="text-xs text-gray-600">Rich Features</div>
              <div className="text-xs text-gray-400">All-in-one</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
