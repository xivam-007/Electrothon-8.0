'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const authContext = useAuth();

  const isAuthenticated = authContext?.isAuthenticated || false;
  const logout = authContext?.logout || (() => {});
  const userName = authContext?.userName || null;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-blue-600"
        >
          MakhanMove
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-blue-600 font-semibold font-medium"
              >
                Dashboard
              </Link>

              <Link
                href="/new-move"
                className="text-slate-600 hover:text-blue-600 font-semibold font-medium"
              >
                New Move
              </Link>

              {/* Profile */}
              <Link
                href="/profile"
                className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full hover:cursor-pointer transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {userName?.charAt(0).toUpperCase()}
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  {userName}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}

        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-slate-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-4">

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="block text-slate-700 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                href="/new-move"
                className="block text-slate-700 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                New Move
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3"
                onClick={() => setMenuOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {userName?.charAt(0).toUpperCase()}
                </div>

                <span className="font-semibold text-slate-700">{userName}</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block bg-blue-600 text-white text-center py-2 rounded-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;