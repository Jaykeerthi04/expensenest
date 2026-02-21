import React, { useState } from 'react';
import { Home, PlusCircle, BarChart3, Settings, Menu, X, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/add', label: 'Add Expense', icon: <PlusCircle size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
              <Home className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900">ExpenseNest</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-1 py-2 text-sm font-medium transition-all duration-200 relative group ${
                  isActive(link.path)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                } hover:scale-105`}
              >
                {link.icon}
                <span>{link.label}</span>
                {/* Smooth bottom border indicator for active route */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                    isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Profile and Log Out Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/profile"
              className={`flex items-center space-x-1 px-1 py-2 text-sm font-medium transition-all duration-200 relative group ${
                isActive('/profile')
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              } hover:scale-105`}
            >
              <User size={18} />
              <span>Profile</span>
              {/* Smooth bottom border indicator for active route */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                  isActive('/profile') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 border-2 border-red-500 text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-105"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden transition-transform duration-200 hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium border-2 border-red-500 text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white w-full"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;