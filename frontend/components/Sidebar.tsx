"use client";
import React from "react";
import Link from "next/link";
import {
  Home,
  Users,
  User,
  LogOut,
  Settings,
  Shield,
  TrendingUp,
  Cookie,
  FileText,
  ChevronRight,
  X,
  Layers3,
  Bookmark,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgColor: string;
  iconColor: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, bgColor: "bg-rose-50", iconColor: "text-rose-500" },
  { label: "Explore", href: "/explore", icon: TrendingUp, bgColor: "bg-blue-50", iconColor: "text-blue-500" },
  { label: "Threads", href: "/threads", icon: Layers3, bgColor: "bg-purple-50", iconColor: "text-purple-500" },
  { label: "Follows", href: "/follows", icon: Users, bgColor: "bg-green-50", iconColor: "text-green-500" },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark, bgColor: "bg-amber-50", iconColor: "text-amber-500" },
  { label: "Profile", href: "/profile", icon: User, bgColor: "bg-cyan-50", iconColor: "text-cyan-500" },
  { label: "Settings", href: "/settings", icon: Settings, bgColor: "bg-indigo-50", iconColor: "text-indigo-500" },
];

const legalItems: NavItem[] = [
  { label: "Terms", href: "/legal/terms", icon: FileText, bgColor: "bg-blue-50", iconColor: "text-blue-500" },
  { label: "Privacy", href: "/legal/privacy", icon: Shield, bgColor: "bg-green-50", iconColor: "text-green-500" },
  { label: "Cookies", href: "/legal/cookies", icon: Cookie, bgColor: "bg-yellow-50", iconColor: "text-yellow-600" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg z-30 transform transition-all duration-300 ease-in-out border-r border-gray-200 ${
          isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0 pointer-events-none'
        }`}
      >
        <div className={`w-72 h-full overflow-hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-300`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nexus</h2>
              <p className="text-xs text-gray-600">Quick Links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-280px)]">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group hover:shadow-sm border border-transparent hover:border-gray-200 touch-manipulation"
            >
              <div className={`p-2 rounded-lg ${item.bgColor} pointer-events-none`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <span className="font-semibold text-gray-900 group-hover:text-gray-900 flex-1 pointer-events-none">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-all group-hover:translate-x-1 pointer-events-none" />
            </Link>
          ))}
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-gray-500 mb-3 ml-2 uppercase tracking-wide font-medium">Legal</p>
            <div className="space-y-1">
              {legalItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-200 touch-manipulation"
                >
                  <div className={`p-2 rounded-lg ${item.bgColor} pointer-events-none`}>
                    <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 pointer-events-none">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-linear-to-r from-gray-50 to-gray-100">
          {user && (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={logout} className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
