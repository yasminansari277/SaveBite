import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IoPersonOutline, IoMoonOutline, IoSunnyOutline, IoGlobeOutline, IoLogOutOutline } from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Profile = () => {
  const { currentUser, logout, isSimulationMode } = useAuth();
  
  // Settings states
  const [name, setName] = useState(currentUser?.displayName || '');
  const [email] = useState(currentUser?.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.photoURL || '');
  const [language, setLanguage] = useState('English');
  const [isUpdating, setIsUpdating] = useState(false);

  // Theme states
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('savebite_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('savebite_theme', 'light');
    }
  };

  const avatarsList = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=mark',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=jessica',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=eco-champion',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=chef',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=admin'
  ];

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      // Simulate profile updates in localstorage
      if (isSimulationMode) {
        const users = JSON.parse(localStorage.getItem('savebite_users')) || [];
        const index = users.findIndex(u => u.uid === currentUser.uid);
        if (index !== -1) {
          users[index].displayName = name;
          users[index].photoURL = selectedAvatar;
          localStorage.setItem('savebite_users', JSON.stringify(users));
          localStorage.setItem('savebite_current_user', JSON.stringify(users[index]));
        }
      }
      alert('Profile updated successfully!');
      window.location.reload(); // Refresh session layout
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none max-w-4xl mx-auto">
      
      {/* Avatar Panel */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card className="border border-border/80 p-6 text-center flex flex-col items-center gap-4">
          <img 
            src={selectedAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder'} 
            alt="Avatar Preset" 
            className="w-24 h-24 rounded-full object-cover border-2 border-primary bg-border/20"
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-text-main">{currentUser?.displayName || 'User Profile'}</span>
            <span className="text-xs text-text-muted">{currentUser?.email}</span>
            <div className="mt-2 flex justify-center gap-1.5">
              <Badge variant="success" size="sm">{currentUser?.role?.toUpperCase() || 'USER'}</Badge>
              {isSimulationMode && <Badge variant="neutral" size="sm">SIM MODE</Badge>}
            </div>
          </div>
        </Card>

        {/* Quick Settings */}
        <Card className="border border-border/80 p-5 flex flex-col gap-4">
          <h4 className="font-display font-bold text-xs text-text-main uppercase tracking-wide">
            App Customization
          </h4>

          {/* Theme switcher */}
          <div className="flex items-center justify-between text-xs font-semibold text-text-main border-b border-border/40 pb-3">
            <span className="flex items-center gap-2">
              {darkMode ? <IoMoonOutline /> : <IoSunnyOutline />} Dark Mode Toggle
            </span>
            <button 
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${darkMode ? 'bg-primary' : 'bg-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {/* Language selector */}
          <div className="flex items-center justify-between text-xs font-semibold text-text-main">
            <span className="flex items-center gap-2">
              <IoGlobeOutline /> Display Language
            </span>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); alert('Display language changed!'); }}
              className="bg-transparent border-0 outline-none text-primary font-bold cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Edit Details */}
      <div className="lg:col-span-2">
        <Card className="border border-border/80 p-6 flex flex-col gap-5 h-full justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-text-main border-b border-border/60 pb-3 mb-5">
              Account Details
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={IoPersonOutline}
                required
              />

              <Input
                label="Email Address"
                value={email}
                icon={IoPersonOutline}
                disabled
                helperText="Email changes are locked in this dashboard version."
              />

              {/* Avatar Selector */}
              <div className="flex flex-col gap-2.5 mt-2">
                <span className="text-xs font-semibold text-text-muted">Choose Avatar Preset</span>
                <div className="grid grid-cols-6 gap-3">
                  {avatarsList.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`
                        w-12 h-12 rounded-full overflow-hidden border-2 bg-background cursor-pointer transition-transform hover:scale-105
                        ${selectedAvatar === avatar ? 'border-primary shadow-soft shadow-primary/20 scale-105' : 'border-border/60'}
                      `}
                    >
                      <img src={avatar} alt="Preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-2 border-t border-border/60 pt-4">
                <Button 
                  type="submit" 
                  isLoading={isUpdating} 
                  variant="primary" 
                  size="md"
                >
                  Save Profile Settings
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Profile;
