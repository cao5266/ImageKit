// 用户菜单组件
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Crown, LogOut, Settings, BarChart3 } from 'lucide-react';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <Link to="/login">
        <Button variant="default" size="sm">
          登录
        </Button>
      </Link>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
            alt={user.username}
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
          {user.isVIP && (
            <Crown className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* VIP状态 */}
        {user.isVIP ? (
          <DropdownMenuItem asChild>
            <Link to="/vip" className="cursor-pointer">
              <Crown className="mr-2 h-4 w-4 text-amber-500" />
              <span className="text-amber-600 font-medium">VIP会员</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/vip" className="cursor-pointer">
              <Crown className="mr-2 h-4 w-4" />
              <span>升级VIP</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* 个人中心 */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>个人中心</span>
          </Link>
        </DropdownMenuItem>

        {/* 使用统计 */}
        <DropdownMenuItem asChild>
          <Link to="/profile?tab=stats" className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>使用统计</span>
          </Link>
        </DropdownMenuItem>

        {/* 设置 */}
        <DropdownMenuItem asChild>
          <Link to="/profile?tab=settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 登出 */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
