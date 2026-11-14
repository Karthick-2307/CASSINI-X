import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { AstraXLogo, CassinXLogo, Button } from "./ui";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/discovery", label: "Discovery" },
  { path: "/explorer", label: "Explorer" },
  { path: "/analysis", label: "Analysis" },
  { path: "/geology", label: "Geology" },
  { path: "/mission", label: "Mission" },
  { path: "/reports", label: "Reports" },
  { path: "/assistant", label: "Assistant" },
  { path: "/about", label: "About" },
];

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 starfield-bg selection:bg-sky-500/30 selection:text-sky-200">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0 group">
            <AstraXLogo size="md" className="group-hover:opacity-90 transition-opacity" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-btn text-xs font-medium tracking-wide transition-all duration-fast ${
                    isActive
                      ? "bg-white/10 text-sky-400 font-semibold border border-sky-400/30 shadow-glow"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action on right */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link to="/discovery">
              <Button variant="primary" size="sm">
                Launch Explorer
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex xl:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn text-text-muted hover:text-text-primary hover:bg-panel border border-transparent hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-panel/95 backdrop-blur-xl border-b border-border px-4 pt-3 pb-5 space-y-2">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-btn text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-raised text-accent-cyan border border-border"
                        : "text-text-muted hover:bg-raised/60 hover:text-text-primary"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <Link to="/discovery" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Launch Explorer
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black/90 backdrop-blur-xl border-t border-white/10 mt-16 py-10 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <AstraXLogo size="md" />
              <p className="text-xs text-slate-400 max-w-md">
                Discover Earth. Understand Other Worlds. Prepare for Exploration.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <Link to="/" className="hover:text-sky-400 transition-colors">Home</Link>
              <Link to="/dashboard" className="hover:text-sky-400 transition-colors">Dashboard</Link>
              <Link to="/discovery" className="hover:text-sky-400 transition-colors">Discovery</Link>
              <Link to="/explorer" className="hover:text-sky-400 transition-colors">Explorer</Link>
              <Link to="/analysis" className="hover:text-sky-400 transition-colors">Analysis</Link>
              <Link to="/about" className="hover:text-sky-400 transition-colors">About</Link>
            </div>

            <div className="flex flex-col items-start md:items-end space-y-1">
              <span className="text-xs text-slate-400">Developed by</span>
              <CassinXLogo />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400/80 font-mono">
            <div>
              ASTRA-X • Platform Version 0.1.0 • Built for Planetary Science Research
            </div>
            <div className="text-center sm:text-right text-[11px] max-w-xl text-slate-400/70">
              ASTRA-X provides scientific decision support. Results are not certified for landing or habitation safety.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
