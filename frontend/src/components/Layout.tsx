import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { AstraXLogo, CassinXLogo } from "./ui";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/discovery", label: "Discovery" },
  { path: "/reports", label: "Reports" },
  { path: "/about", label: "About" },
];

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-accent/20 selection:text-accent">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <AstraXLogo size="md" />
          </Link>

          {/* Desktop Navigation Links (Exactly 4 links) */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `text-sm font-sans font-medium py-1 transition-colors relative ${
                    isActive
                      ? "text-text-primary border-b-2 border-accent"
                      : "text-text-muted hover:text-text-primary"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          <div className="md:hidden bg-surface border-b border-border px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-btn text-sm font-sans font-medium transition-colors ${
                    isActive
                      ? "bg-raised text-accent border border-border"
                      : "text-text-muted hover:text-text-primary hover:bg-raised"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Clean, Restrained Footer */}
      <footer className="border-t border-border mt-16 py-10 text-sm text-text-muted bg-surface/50">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <AstraXLogo size="sm" />
              <p className="text-xs text-text-muted max-w-md">
                Terrestrial planetary analog discovery and explainable feature comparison.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-text-muted">
              <span>Developed by</span>
              <CassinXLogo />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-muted/80 pt-4 border-t border-border">
            <p className="max-w-xl">
              ASTRA-X provides scientific decision support. Results do not certify landing or habitation safety.
            </p>
            <div className="text-[11px] font-mono text-text-muted/60 space-x-3">
              <span>Earth: NASA Blue Marble</span>
              <span>•</span>
              <span>Mars: USGS MOLA</span>
              <span>•</span>
              <span>Moon: USGS LOLA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
