// 头部组件

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageIcon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
// import { UserMenu } from '@/components/Auth/UserMenu';

export function Header() {
  const [open, setOpen] = useState(false);
  
  const menuItems: Array<{ path: string; label: string; badge?: string }> = [
    // { path: '/remove-watermark', label: 'AI Remove', badge: 'VIP' }, // Temporarily disabled
    { path: '/compress', label: 'Compress' },
    { path: '/convert', label: 'Convert' },
    { path: '/resize', label: 'Resize' },
    { path: '/crop', label: 'Crop' },
    { path: '/watermark', label: 'Watermark' },
  ];
  
  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ImageIcon className="w-8 h-8 text-primary" />
          <span className="text-xl sm:text-2xl font-bold">ImageKit</span>
        </Link>
        
        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {item.label}
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        
        {/* 右侧区域 */}
        <div className="flex items-center gap-4">
          {/* 用户菜单 - 已移除 */}
          {/* <div className="hidden md:block">
            <UserMenu />
          </div> */}
          
          {/* 移动端菜单 */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-primary" />
                  ImageKit
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                {/* 移动端用户菜单 - 已移除 */}
                {/* <div className="border-t pt-4 mt-4">
                  <UserMenu />
                </div> */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
