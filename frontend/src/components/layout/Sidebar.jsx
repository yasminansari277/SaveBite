import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePantry } from '../../context/PantryContext';
import { 
  IoHomeOutline, IoHome,
  IoNutritionOutline, IoNutrition,
  IoRestaurantOutline, IoRestaurant,
  IoListOutline, IoList,
  IoCalendarOutline, IoCalendar,
  IoNotificationsOutline, IoNotifications,
  IoHeartOutline, IoHeart,
  IoPersonOutline, IoPerson,
  IoShieldCheckmarkOutline, IoShieldCheckmark,
  IoLogOutOutline, IoLeafOutline, IoClose
} from 'react-icons/io5';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { notifications } = usePantry();

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
  try {
    await logout();

    console.log("Logout successful");

    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
  }
};

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', iconOutline: IoHomeOutline, iconSolid: IoHome },
    { name: 'My Pantry', path: '/pantry', iconOutline: IoNutritionOutline, iconSolid: IoNutrition },
    { name: 'Recipes', path: '/recipes', iconOutline: IoRestaurantOutline, iconSolid: IoRestaurant },
    { name: 'Shopping List', path: '/shopping-list', iconOutline: IoListOutline, iconSolid: IoList },
    { name: 'Meal Planner', path: '/meal-planner', iconOutline: IoCalendarOutline, iconSolid: IoCalendar },
    { name: 'Favorites', path: '/favorites', iconOutline: IoHeartOutline, iconSolid: IoHeart },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      iconOutline: IoNotificationsOutline, 
      iconSolid: IoNotifications,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null 
    },
    { name: 'Profile', path: '/profile', iconOutline: IoPersonOutline, iconSolid: IoPerson },
  ];

  // If user is admin, append Admin Panel
  if (currentUser?.role === 'admin') {
    navItems.push({
      name: 'Admin Panel',
      path: '/admin',
      iconOutline: IoShieldCheckmarkOutline,
      iconSolid: IoShieldCheckmark
    });
  }

  const renderNavLinks = () => {
    return navItems.map((item) => (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={() => { if (isOpen) toggleSidebar(); }}
        className={({ isActive }) => `
          group flex items-center justify-between px-4 py-3 rounded-custom text-sm font-medium transition-all duration-200
          ${isActive 
            ? 'bg-primary text-white shadow-soft shadow-primary/20' 
            : 'text-text-muted hover:text-text-main hover:bg-border/40'}
        `}
      >
        {({ isActive }) => {
          const Icon = isActive ? item.iconSolid : item.iconOutline;
          return (
            <>
              <div className="flex items-center gap-3">
                <Icon className={`text-xl transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`
                  px-2 py-0.5 text-[10px] font-bold rounded-full
                  ${isActive ? 'bg-white text-primary' : 'bg-danger text-white'}
                `}>
                  {item.badge}
                </span>
              )}
            </>
          );
        }}
      </NavLink>
    ));
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-text-main/20 dark:bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-45 w-64 bg-card border-r border-border p-5 flex flex-col justify-between transition-transform duration-300
        lg:translate-x-0 lg:static lg:h-screen lg:z-10
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <IoLeafOutline className="text-lg" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-text-main">
                Save<span className="text-primary">Bite</span>
              </span>
            </NavLink>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-full hover:bg-border/40 text-text-muted"
            >
              <IoClose className="text-xl" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {renderNavLinks()}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="flex flex-col gap-4 border-t border-border pt-4 select-none">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder'} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full object-cover border border-border bg-border/20"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-text-main truncate">
                {currentUser?.displayName || 'User Profile'}
              </span>
              <span className="text-xs text-text-muted truncate">
                {currentUser?.email || 'user@savebite.com'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-custom text-xs font-semibold text-danger/80 hover:text-danger hover:bg-red-500/10 transition-colors"
          >
            <IoLogOutOutline className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
