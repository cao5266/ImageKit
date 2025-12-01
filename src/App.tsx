import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { FAQ } from './components/FAQ/FAQ';
import { Compress } from './pages/Compress';
import { Convert } from './pages/Convert';
import { Resize } from './pages/Resize';
import { Crop as CropPage } from './pages/Crop';
import { Watermark } from './pages/Watermark';
import { RemoveWatermark } from './pages/RemoveWatermark';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Card } from './components/ui/card';
import { Minimize2, RefreshCw, Maximize2, Crop, Type } from 'lucide-react';

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
  const tools: Array<{ icon: any; name: string; desc: string; path: string; badge?: string }> = [
    // { icon: Sparkles, name: 'AI Watermark Removal', desc: 'AI-powered watermark removal', path: '/remove-watermark', badge: 'VIP' }, // Temporarily disabled
    { icon: Minimize2, name: 'Compress', desc: 'Reduce file size without quality loss', path: '/compress' },
    { icon: RefreshCw, name: 'Convert', desc: 'Convert between JPG, PNG, WebP', path: '/convert' },
    { icon: Maximize2, name: 'Resize', desc: 'Change image dimensions', path: '/resize' },
    { icon: Crop, name: 'Crop', desc: 'Crop image area', path: '/crop' },
    { icon: Type, name: 'Watermark', desc: 'Add text or image watermarks', path: '/watermark' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
          ImageKit - Image Processing Toolkit
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
          Free · Local Processing · Privacy First · More Powerful than TinyPNG
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="min-w-[100px]">
            <span className="text-2xl sm:text-3xl font-bold text-primary">1M+</span>
            <p className="text-xs sm:text-sm text-muted-foreground">Images Processed</p>
          </div>
          <div className="min-w-[100px]">
            <span className="text-2xl sm:text-3xl font-bold text-primary">1.2TB</span>
            <p className="text-xs sm:text-sm text-muted-foreground">Space Saved</p>
          </div>
          <div className="min-w-[100px]">
            <span className="text-2xl sm:text-3xl font-bold text-primary">Free</span>
            <p className="text-xs sm:text-sm text-muted-foreground">100% Free</p>
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
          <h3 className="font-bold mb-2 text-sm sm:text-base">Privacy First</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            All images processed locally in your browser, never uploaded
          </p>
        </Card>
        
        <Card className="p-5 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2">⚡</div>
          <h3 className="font-bold mb-2 text-sm sm:text-base">Lightning Fast</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Local processing is fast, no waiting for upload/download
          </p>
        </Card>
        
        <Card className="p-5 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2">💰</div>
          <h3 className="font-bold mb-2 text-sm sm:text-base">100% Free</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            All features permanently free, no hidden charges
          </p>
        </Card>
        
        <Card className="p-5 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl mb-2">🎨</div>
          <h3 className="font-bold mb-2 text-sm sm:text-base">Powerful Features</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Compress, convert, crop, watermark... All-in-one solution
          </p>
        </Card>
      </div>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}

export default App;
