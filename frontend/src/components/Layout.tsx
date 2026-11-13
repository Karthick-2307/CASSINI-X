import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/discovery", label: "Discovery" },
  { path: "/explorer", label: "Explorer" },
  { path: "/analysis", label: "Analysis" },
  { path: "/geology", label: "Geology" },
  { path: "/mission", label: "Mission" },
  { path: "/reports", label: "Reports" },
  { path: "/about", label: "About" },
];

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Text Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-wider text-cyan-400 hover:text-cyan-300">
            <span className="text-white">ASTRA</span>
            <span className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded font-mono">X</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-cyan-400 border border-cyan-800/50"
                      : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-800 bg-gray-900 px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? "bg-gray-800 text-cyan-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-gray-200">ASTRA-X</span> — Planetary Analog Discovery Platform
          </div>
          <div className="font-medium text-cyan-400">
            Developed by CASSIN X
          </div>
        </div>
      </footer>
    </div>
  );
};
