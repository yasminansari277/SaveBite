import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePantry } from '../../context/PantryContext';
import { 
  IoMenuOutline, IoSearchOutline, IoSunnyOutline, 
  IoMoonOutline, IoNotificationsOutline, IoCloseCircleOutline 
} from 'react-icons/io5';

const Navbar = ({ toggleSidebar, title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { pantryItems, recipes, categories, notifications, markNotificationRead } = usePantry();
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Notifications dropdown
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);
  
  const unreadNotes = notifications.filter(n => !n.read);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Click outside listener for search & notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic for instant suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const filteredSug = [];

      // 1. Search Pantry Items
      const matchedPantry = pantryItems
        .filter(item => item.name.toLowerCase().includes(query))
        .slice(0, 3)
        .map(item => ({ id: item.id, type: 'pantry', name: item.name, category: item.category, detail: `In stock: ${item.quantity} ${item.unit}` }));
      
      // 2. Search Recipes
      const matchedRecipes = recipes
        .filter(item => item.title.toLowerCase().includes(query))
        .slice(0, 3)
        .map(item => ({ id: item.id, type: 'recipe', name: item.title, category: item.category, detail: `${item.cookingTime} mins • ${item.difficulty}` }));

      // 3. Search Categories
      const matchedCategories = categories
        .filter(item => item.name.toLowerCase().includes(query))
        .slice(0, 2)
        .map(item => ({ id: item.id, type: 'category', name: item.name, category: item.name, detail: 'Pantry Category' }));

      filteredSug.push(...matchedPantry, ...matchedRecipes, ...matchedCategories);
      setSuggestions(filteredSug);
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pantryItems, recipes, categories]);

  const handleSuggestionClick = (sug) => {
    setSearchQuery('');
    setShowSuggestions(false);
    
    if (sug.type === 'pantry') {
      navigate('/pantry');
    } else if (sug.type === 'recipe') {
      navigate(`/recipes/${sug.id}`);
    } else if (sug.type === 'category') {
      navigate('/pantry');
    }
  };

  const handleNotificationClick = async (note) => {
    await markNotificationRead(note.id);
    setShowNotifDropdown(false);
    navigate('/notifications');
  };

  return (
    <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between select-none">
      {/* Left side: title / toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-full hover:bg-border/60 text-text-muted transition-colors"
          aria-label="Toggle Sidebar"
        >
          <IoMenuOutline className="text-2xl" />
        </button>
        <h1 className="font-display font-bold text-lg text-text-main hidden md:block">
          {title}
        </h1>
      </div>

      {/* Center: Global Debounced Search */}
      <div ref={searchRef} className="relative w-full max-w-md mx-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search pantry, recipes, categories..."
            className="w-full h-10 pl-10 pr-8 bg-background/50 border border-border/80 rounded-full text-sm text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200"
          />
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/65 text-lg" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-text-main"
            >
              <IoCloseCircleOutline className="text-lg" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-11 left-0 right-0 bg-card border border-border shadow-soft rounded-custom overflow-hidden z-40 max-h-72 overflow-y-auto">
            {suggestions.map((sug) => (
              <div
                key={sug.id + sug.type}
                onClick={() => handleSuggestionClick(sug)}
                className="px-4 py-3 hover:bg-background flex items-center justify-between cursor-pointer border-b border-border/40 last:border-0 transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-text-main truncate">{sug.name}</span>
                  <span className="text-xs text-text-muted truncate">{sug.detail}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-primary">
                  {sug.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: theme, notification, profile */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-border/60 text-text-muted transition-colors cursor-pointer"
          aria-label="Toggle Theme"
        >
          {darkMode ? <IoSunnyOutline className="text-xl" /> : <IoMoonOutline className="text-xl" />}
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className={`p-2 rounded-full hover:bg-border/60 text-text-muted transition-colors cursor-pointer ${unreadNotes.length > 0 ? 'animate-bell' : ''}`}
            aria-label="Notifications"
          >
            <IoNotificationsOutline className="text-xl" />
            {unreadNotes.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-ping-once" />
            )}
            {unreadNotes.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
            )}
          </button>

          {/* Quick Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 top-11 w-80 bg-card border border-border shadow-soft rounded-custom overflow-hidden z-40 max-h-96 flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background/30">
                <span className="font-semibold text-sm text-text-main">Alert Center</span>
                {unreadNotes.length > 0 && (
                  <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                    {unreadNotes.length} New
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto max-h-72">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted">
                    No warnings or notifications.
                  </div>
                ) : (
                  notifications.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleNotificationClick(note)}
                      className={`px-4 py-3 border-b border-border/40 hover:bg-background/40 cursor-pointer flex flex-col gap-1 transition-colors ${!note.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-main">{note.title}</span>
                        <span className="text-[9px] text-text-muted">
                          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{note.message}</p>
                    </div>
                  ))
                )}
              </div>
              <Link
                to="/notifications"
                onClick={() => setShowNotifDropdown(false)}
                className="px-4 py-2 text-center text-xs font-semibold text-primary hover:bg-background border-t border-border block"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
