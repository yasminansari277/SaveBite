import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Map routes to display titles
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setPageTitle('Dashboard');
    else if (path.startsWith('/pantry')) setPageTitle('My Pantry');
    else if (path.startsWith('/recipes')) setPageTitle('AI Recipes');
    else if (path.startsWith('/shopping-list')) setPageTitle('Shopping List');
    else if (path.startsWith('/meal-planner')) setPageTitle('Meal Planner');
    else if (path.startsWith('/favorites')) setPageTitle('Favorites');
    else if (path.startsWith('/notifications')) setPageTitle('Notifications');
    else if (path.startsWith('/profile')) setPageTitle('Profile Settings');
    else if (path.startsWith('/admin')) setPageTitle('Admin Analytics');
    else setPageTitle('SaveBite');
  }, [location]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar - responsive layout */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} title={pageTitle} />

        {/* Dynamic page outlet with animated route transition */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

