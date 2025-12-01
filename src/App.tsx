import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Compress } from './pages/Compress';
import { Convert } from './pages/Convert';
import { Resize } from './pages/Resize';
import { Crop as CropPage } from './pages/Crop';
import { Watermark } from './pages/Watermark';
import { RemoveWatermark } from './pages/RemoveWatermark';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Card } from './components/ui/card';
import { Minimize2, RefreshCw, Maximize2, Crop, Type, Sparkles } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compress" element={<Compress />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/resize" element={<Resize />} />
            <Route path="/crop" element={<CropPage />} />
            <Route path="/watermark" element={<Watermark />} />
            <Route path="/remove-watermark" element={<RemoveWatermark />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

// 首页组件
function HomePage() {
  const tools = [
    { icon: Sparkles, name: 'AI 去水印', desc: 'AI 智能识别并移除水印', path: '/remove-watermark', badge: 'VIP' },
    { icon: Minimize2, name: '图片压缩', desc: '减小文件大小，不损失画质', path: '/compress' },
    { icon: RefreshCw, name: '格式转换', desc: 'JPG、PNG、WebP 互转', path: '/convert' },
    { icon: Maximize2, name: '调整大小', desc: '修改图片尺寸', path: '/resize' },
    { icon: Crop, name: '图片裁剪', desc: '裁剪图片区域', path: '/crop' },
    { icon: Type, name: '添加水印', desc: '为图片添加文字或图片水印', path: '/watermark' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
          ImageKit - 图片处理神器
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
          完全免费 · 本地处理 · 隐私安全 · 比 TinyPNG 更强大
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="min-w-[100px]">
            <span className="text-2xl sm:text-3xl font-bold text-primary">100万+</span>
            <p className="text-xs sm:text-sm text-muted-foreground">已处理图片</p>
          </div>
          <div className="min-w-[100px]">
            <span className="text-2xl sm:text-3xl font-bold text-primary">1.2TB</span>
            <p className="text-xs sm:text-sm text-muted-foreground">节省空间</p>
          </div>
          <div className="min-w-[100px]">
            <span className="text-2xl sm:text-3xl font-bold text-primary">0元</span>
            <p className="text-xs sm:text-sm text-muted-foreground">完全免费</p>
          </div>
        </div>
      </div>
      
      {/* 功能卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.path} to={tool.path}>
              <Card className="p-5 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer h-full relative">
                {tool.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-lg">
                      {tool.badge}
                    </span>
                  </div>
                )}
                <Icon className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 text-primary" />
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </Card>
            </Link>
          );
        })}
      </div>
      
      {/* 特点介绍 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mt-12 sm:mt-16">
        <Card className="p-5 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2">🔒</div>
          <h3 className="font-bold mb-2 text-sm sm:text-base">隐私安全</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            所有图片在浏览器本地处理，不上传服务器
          </p>
        </Card>
        
        <Card className="p-5 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2">⚡</div>
          <h3 className="font-bold mb-2 text-sm sm:text-base">极速处理</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            本地处理速度快，无需等待上传下载
          </p>
        </Card>
        
        <Card className="p-5 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2">💰</div>
          <h3 className="font-bold mb-2 text-sm sm:text-base">完全免费</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            所有功能永久免费，无隐藏收费
          </p>
        </Card>
        
        <Card className="p-5 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2">🎨</div>
          <h3 className="font-bold mb-2 text-sm sm:text-base">功能强大</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            压缩、转换、裁剪、水印...一站式解决所有需求
          </p>
        </Card>
      </div>
    </div>
  );
}

export default App;
