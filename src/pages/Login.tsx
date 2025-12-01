// 登录页面
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export function Login() {
  const handleGoogleLogin = () => {
    console.log('跳转到 Google 登录...');
    // 调用后端 Google OAuth
    api.auth.loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo和标题 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">IK</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎来到 ImageKit</h1>
          <p className="text-sm text-gray-600">
            一站式图片处理工具，安全高效
          </p>
        </div>

        {/* 登录按钮 */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-blue-400"
            variant="outline"
          >
            {/* Google 彩色图标 */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            使用 Google 账号登录
          </Button>

          {/* VIP说明 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-medium text-amber-900 mb-1">登录后可享受</p>
                <ul className="text-amber-800 space-y-1">
                  <li>• 基础功能永久免费使用</li>
                  <li>• 升级VIP解锁AI去水印</li>
                  <li>• 使用记录云端同步</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">或</span>
          </div>
        </div>

        {/* 游客模式 */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 text-base border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium"
            onClick={() => window.location.href = '/'}
          >
            👤 以游客身份继续使用基础功能
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            游客模式下可使用所有免费功能
          </p>
        </div>

        {/* 底部说明 */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500 leading-relaxed">
            登录即表示您同意我们的
            <a href="/terms" className="text-blue-600 hover:underline mx-1">服务条款</a>
            和
            <a href="/privacy" className="text-blue-600 hover:underline mx-1">隐私政策</a>
          </p>
        </div>

        {/* 功能亮点 */}
        <div className="pt-4 space-y-3">
          <div className="text-xs text-gray-600 font-medium text-center mb-2">
            为什么选择 ImageKit？
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-2xl">🔒</div>
              <div className="text-xs text-gray-600">本地处理</div>
              <div className="text-xs text-gray-400">隐私安全</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">⚡</div>
              <div className="text-xs text-gray-600">极速处理</div>
              <div className="text-xs text-gray-400">无需等待</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🎨</div>
              <div className="text-xs text-gray-600">功能丰富</div>
              <div className="text-xs text-gray-400">一站式</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
