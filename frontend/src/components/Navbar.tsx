'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const authContext = useAuth();

  const isAuthenticated = authContext?.isAuthenticated || false;
  const logout          = authContext?.logout || (() => {});
  const userName        = authContext?.userName || null;

  const [menuOpen, setMenuOpen] = useState(false);

  const initials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <style>{CSS}</style>

      <nav className="nb-nav">
        <div className="nb-inner">

          {/* Logo */}
          <Link href="/" className="nb-logo">
            <div className="nb-logo-box">🧈</div>
            <span className="nb-logo-txt">Makhan<b> Move</b></span>
          </Link>

          {/* Desktop links */}
          <div className="nb-desktop">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="nb-link">Dashboard</Link>
                <Link href="/new-move"  className="nb-link">New Move</Link>

                {/* Profile pill */}
                <Link href="/profile" className="nb-profile">
                  <div className="nb-avatar">{initials}</div>
                  <span className="nb-username">{userName}</span>
                </Link>

                {/* Logout */}
                <button onClick={logout} className="nb-logout">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="nb-cta">
                Login →
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="nb-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`nb-ham-line ${menuOpen ? 'nb-ham-open-1' : ''}`} />
            <span className={`nb-ham-line ${menuOpen ? 'nb-ham-open-2' : ''}`} />
            <span className={`nb-ham-line ${menuOpen ? 'nb-ham-open-3' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="nb-mobile">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="nb-mobile-link"
                  onClick={() => setMenuOpen(false)}>
                  📊 Dashboard
                </Link>
                <Link href="/new-move" className="nb-mobile-link"
                  onClick={() => setMenuOpen(false)}>
                  🚛 New Move
                </Link>
                <Link href="/profile" className="nb-mobile-profile"
                  onClick={() => setMenuOpen(false)}>
                  <div className="nb-avatar">{initials}</div>
                  <span className="nb-username">{userName}</span>
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="nb-mobile-logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="nb-mobile-cta"
                onClick={() => setMenuOpen(false)}>
                Login →
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;

/* ── CSS ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.nb-nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(37,99,235,.09);
  box-shadow: 0 2px 14px rgba(15,23,42,.05);
  font-family: 'DM Sans', sans-serif;
}

.nb-inner {
  max-width: 1100px; margin: 0 auto;
  padding: 0 28px; height: 62px;
  display: flex; align-items: center; justify-content: space-between;
}

/* logo */
.nb-logo {
  display: flex; align-items: center; gap: 9px;
  text-decoration: none;
}
.nb-logo-box {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(37,99,235,.28);
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
}
.nb-logo-box:hover { transform: rotate(-8deg) scale(1.1); }
.nb-logo-txt {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 19px; font-weight: 800;
  color: #0f172a; letter-spacing: -.02em;
}
.nb-logo-txt b { color: #2563eb; font-weight: 800; }

/* desktop links */
.nb-desktop {
  display: flex; align-items: center; gap: 6px;
}
@media (max-width: 767px) { .nb-desktop { display: none; } }

.nb-link {
  font-size: 14px; font-weight: 600; color: #475569;
  text-decoration: none; padding: 7px 14px; border-radius: 9px;
  transition: background .18s, color .18s;
}
.nb-link:hover { background: #eff6ff; color: #2563eb; }

/* profile pill */
.nb-profile {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 100px; padding: 4px 14px 4px 5px;
  text-decoration: none;
  transition: background .18s, border-color .18s, transform .2s;
  cursor: pointer;
}
.nb-profile:hover {
  background: #eff6ff; border-color: #bfdbfe;
  transform: translateY(-1px);
}

/* avatar */
.nb-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 4px rgba(37,99,235,.25);
}
.nb-username {
  font-size: 13px; font-weight: 600; color: #0f172a;
}

/* logout */
.nb-logout {
  font-size: 13px; font-weight: 700; color: #475569;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  padding: 7px 16px; border-radius: 9px; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all .18s;
}
.nb-logout:hover { background: #fee2e2; border-color: #fecaca; color: #dc2626; }

/* login CTA */
.nb-cta {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 9px 20px; border-radius: 10px;
  background: linear-gradient(135deg,#1d4ed8,#4f46e5);
  color: #fff; font-size: 13px; font-weight: 700;
  text-decoration: none;
  font-family: 'Fraunces', Georgia, serif;
  box-shadow: 0 3px 12px rgba(37,99,235,.28);
  transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s;
}
.nb-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,.38); }

/* hamburger */
.nb-hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 6px;
  border-radius: 8px;
  transition: background .15s;
}
.nb-hamburger:hover { background: #f1f5f9; }
@media (max-width: 767px) { .nb-hamburger { display: flex; } }

.nb-ham-line {
  display: block; width: 22px; height: 2px;
  background: #475569; border-radius: 2px;
  transition: transform .25s cubic-bezier(.22,1,.36,1), opacity .2s;
  transform-origin: center;
}
.nb-ham-open-1 { transform: translateY(7px) rotate(45deg); }
.nb-ham-open-2 { opacity: 0; transform: scaleX(0); }
.nb-ham-open-3 { transform: translateY(-7px) rotate(-45deg); }

/* mobile menu */
.nb-mobile {
  border-top: 1px solid #f1f5f9;
  background: #fff;
  padding: 14px 20px 18px;
  display: flex; flex-direction: column; gap: 4px;
  animation: nbSlideDown .22s cubic-bezier(.22,1,.36,1);
}
@keyframes nbSlideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.nb-mobile-link {
  display: flex; align-items: center; gap: 9px;
  font-size: 14px; font-weight: 600; color: #334155;
  text-decoration: none; padding: 11px 14px; border-radius: 10px;
  transition: background .15s, color .15s;
}
.nb-mobile-link:hover { background: #eff6ff; color: #2563eb; }

.nb-mobile-profile {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; padding: 10px 14px; border-radius: 10px;
  transition: background .15s;
}
.nb-mobile-profile:hover { background: #f8fafc; }

.nb-mobile-logout {
  margin-top: 6px; width: 100%; padding: 11px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 10px; cursor: pointer;
  font-size: 14px; font-weight: 700; color: #475569;
  font-family: 'DM Sans', sans-serif;
  transition: all .18s;
}
.nb-mobile-logout:hover { background: #fee2e2; border-color: #fecaca; color: #dc2626; }

.nb-mobile-cta {
  display: block; text-align: center;
  padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg,#1d4ed8,#4f46e5);
  color: #fff; font-size: 15px; font-weight: 700;
  text-decoration: none;
  font-family: 'Fraunces', Georgia, serif;
  box-shadow: 0 3px 12px rgba(37,99,235,.25);
}
`;