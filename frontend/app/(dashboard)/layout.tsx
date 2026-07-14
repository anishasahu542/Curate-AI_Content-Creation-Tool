'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '../PageTransition';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { href: '/generate', label: 'Create', icon: 'add_circle' },
  { href: '/repurpose', label: 'Repurpose', icon: 'repartition' },
  { href: '/hooks', label: 'Hooks', icon: 'explore' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar_month' },
  { href: '/persona', label: 'Persona', icon: 'psychology' },
  { href: '/viral-score', label: 'Viral Score', icon: 'trending_up' },
  { href: '/help', label: 'Help Center', icon: 'help' },
  { href: '/profile', label: 'Settings', icon: 'settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const profile = useAuthStore(state => state.profile);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-on-background font-dm-sans selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 glass z-50 px-6 py-10 flex flex-col justify-between hidden md:flex border-r border-outline-variant/20 select-none">
        <div>
          <div className="mb-10 px-2">
            <Link href="/dashboard" className="flex items-center gap-1">
              <h1 className="font-playfair text-headline-md text-primary tracking-tight">Curate AI</h1>
            </Link>
          </div>
          
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl relative transition-colors duration-200 group ${
                    isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <motion.span
                    className="material-symbols-outlined text-md"
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/80 to-secondary/80 flex items-center justify-center text-on-primary font-bold text-sm shadow-inner border border-outline-variant/30 select-none font-playfair">
              {mounted ? profile.avatarLetter : 'A'}
            </div>
            <div>
              <p className="font-semibold text-xs text-on-surface">
                {mounted ? profile.name : 'Anisha Sahu'}
              </p>
              <p className="text-[10px] text-outline uppercase tracking-widest font-bold">
                {mounted ? profile.plan : 'Pro Creator'}
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full"
          >
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full bg-surface-container-low hover:bg-surface-container/60 text-primary py-3 rounded-full font-label-md text-label-md border border-outline-variant/20 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign out
            </button>
          </motion.div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Header */}
        <header className="glass border-b border-outline-variant/10 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm shadow-primary/5">
          <h2 className="text-xs font-bold tracking-wide uppercase text-secondary flex items-center gap-1.5 font-dm-sans">
            <span className="material-symbols-outlined text-sm">laptop_mac</span> Creator Workspace
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1.5 bg-secondary-container/30 border border-secondary-container/50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider font-dm-sans">Engine Online</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-tr from-primary/80 to-secondary/80 text-on-primary rounded-full flex justify-center items-center font-bold text-xs select-none shadow-sm font-playfair">
              {mounted ? profile.avatarLetter : 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-x-hidden p-6 md:p-10 bg-background text-on-background">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}