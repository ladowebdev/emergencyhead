import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Home, Map, Settings, Menu, X, Activity, Droplet } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotificationStore();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { path: '/', icon: <Home size={24} />, label: 'Home' },
    { path: '/blood-donation', icon: <Droplet size={24} />, label: 'Blood Donation' },
    { path: '/tracking', icon: <Map size={24} />, label: 'Tracking' },
    { path: '/notifications', icon: <Bell size={24} />, label: 'Notifications', badge: unreadCount },
    { path: '/settings', icon: <Settings size={24} />, label: 'Settings' },
  ];

  return (
    <header className="bg-red-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity size={28} className="text-white" />
            <span className="font-bold text-xl">EMERGENCAHEAD</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-red-700 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 py-2 px-3 rounded-md transition-colors ${
                  location.pathname === item.path ? 'bg-red-700' : 'hover:bg-red-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-white text-red-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            <nav className="flex flex-col space-y-2 px-4 pb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-md transition-colors ${
                    location.pathname === item.path ? 'bg-red-700' : 'hover:bg-red-700'
                  }`}
                  onClick={closeMenu}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-white text-red-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;