import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Navigation links array for easy maintenance
  const navLinks = [
    { name: "Home", to: "/dashboard" },
    { name: "Add product", to: "/add-product" },
    { name: "Products", to: "/products" },
    { name: "Notification", to: "/notification" },
    { name: "Crousal", to: "/crousal" },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 shadow-xl sticky top-0 z-50 border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/*  Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold tracking-tight">
              CEO<span className="text-orange-500">Dashboard</span>
            </span>
          </div>

          {/* 2. Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive ? "text-blue-400" : "hover:text-blue-400"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* 3. Mobile Menu Button (Visible on Mobile) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Dropdown (Animated visibility) */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-slate-800 border-t border-slate-700`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "bg-slate-700 text-blue-400"
                    : "hover:bg-slate-700 hover:text-blue-400"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
