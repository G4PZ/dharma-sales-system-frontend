'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, X, LogOut } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

function getInitials(name?: string): string {
  if (!name) return 'DH';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logoutUser } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Mobile search bar overlay */}
      {mobileSearchOpen ? (
        <div className="flex sm:hidden items-center gap-2 w-full">
          <GlobalSearch
            className="flex-1"
            onCloseMobile={() => setMobileSearchOpen(false)}
          />
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Left side: Hamburger + Search Input */}
          <div className="flex items-center gap-3 md:gap-6 flex-1 max-w-xl">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="w-full max-w-md hidden sm:block">
              <GlobalSearch />
            </div>
          </div>

          {/* Right side: Notifications + User Profile */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 text-slate-600 rounded-xl hover:bg-slate-100 sm:hidden cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Profile Widget & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 pl-1 py-1 cursor-pointer select-none group focus:outline-none"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {/* Avatar Image or Initials Badge */}
                {user?.picture ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.picture}
                    alt={user.name || 'Usuario'}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-slate-100"
                  />
                ) : (
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0B192C] text-white font-semibold text-xs shadow-sm ring-2 ring-slate-100">
                    {initials}
                  </div>
                )}

                {/* User Details */}
                <div className="hidden md:block text-left max-w-[150px]">
                  <div className="text-sm font-semibold text-slate-800 leading-tight truncate">
                    {user?.name || 'Usuario Dharma'}
                  </div>
                  <div className="text-[11px] font-normal text-slate-500 leading-tight truncate">
                    {user?.email || 'Administrador'}
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-400">Sesión iniciada como</p>
                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                      {user?.name || 'Usuario Dharma'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <div className="p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logoutUser();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
