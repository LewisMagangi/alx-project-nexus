  // frontend/components/Navbar.tsx
    'use client';

    import Link from 'next/link';
    import { usePathname } from 'next/navigation';
    import { useAuth } from '@/context/AuthContext';
    import { Button } from '@/components/ui/button';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';
    import {
      Home,
      Search,
      Bell,
      Mail,
      Bookmark,
      User,
      Settings,
      LogOut,
      MoreHorizontal,
      Users
    } from 'lucide-react';

    export default function Navbar() {
      const pathname = usePathname();
      const { user, logout } = useAuth();

      // Don't show navbar on auth pages
      if (pathname?.startsWith('/auth')) {
        return null;
      }

      if (!user) {
        return null;
      }

      const navItems = [
        { href: '/dashboard', icon: Home, label: 'Home' },
        { href: '/explore', icon: Search, label: 'Explore' },
        { href: '/notifications', icon: Bell, label: 'Notifications' },
        { href: '/messages', icon: Mail, label: 'Messages' },
        { href: '/follows', icon: Users, label: 'Follows' },
        { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
        { href: '/profile', icon: User, label: 'Profile' },
      ];

      return (
        <>
          {/* Desktop Sidebar Navigation */}
          <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-64 border-r bg-white flex-col justify-between p-4">
            <div className="space-y-2">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className="text-xl font-bold">Nexus</span>
              </Link>

              {/* Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                );
              })}

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-4 px-4 py-3 rounded-full w-full justify-start hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-6 w-6" />
                    <span className="text-lg">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/legal/terms" className="flex items-center gap-2 cursor-pointer">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      Terms of Service
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/legal/privacy" className="flex items-center gap-2 cursor-pointer">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Privacy Policy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/legal/cookies" className="flex items-center gap-2 cursor-pointer">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                      Cookie Policy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Profile Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 px-4 py-3 rounded-full w-full justify-start hover:bg-gray-100"
                >
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600"
                >
                  Logout @{user.username}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Top Navigation */}
          <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="px-2 py-2 border-b">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
              </Link>

              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </nav>

          {/* Mobile Bottom Navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
            <div className="flex justify-around py-2">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center px-2 py-2 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                    <span className="text-[10px] mt-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Spacer for mobile */}
          <div className="lg:hidden h-14" />
          <div className="lg:hidden h-16 fixed bottom-0 pointer-events-none" />
        </>
      );
    }
