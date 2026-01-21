"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Menu, Feather } from 'lucide-react';
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 w-full justify-between">
          <div className="flex items-center gap-4">
            {user && (
              <button
                className="flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Toggle sidebar"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6 text-blue-600" />
              </button>
            )}
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none">Nexus</span>
            </Link>
          </div>
          {/* Auth Navigation - Only show when not logged in */}
          {!user && (
            <div className="flex items-center gap-4">
              <Link href="/about">
                <button className="hidden sm:inline-flex text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">About Us</button>
              </Link>
              <Link href="/auth/login">
                <button className="text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">Sign In</button>
              </Link>
              <Link href="/auth/register">
                <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-4 py-2 rounded-md shadow-lg">Get Started</button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar (slide-out) */}
        {user && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main content - shifts when sidebar is open */}
        <main className={`flex-1 bg-gray-50 transition-all duration-300 ${sidebarOpen && user ? 'lg:ml-72' : ''}`}>
          {children}
        </main>

        {/* Floating Action Button for Compose */}
        {user && (
          <Link href="/compose">
            <button
              className="fixed bottom-6 right-6 z-50 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Compose new post"
            >
              <Feather className="w-6 h-6" />
            </button>
          </Link>
        )}
      </div>
    </>
  );
}
