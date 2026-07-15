import React, { useState } from 'react';
import { usePantry } from '../../context/PantryContext';
import { IoNotificationsOutline, IoTrashOutline, IoCheckmarkDoneOutline, IoSettingsOutline } from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const Notifications = () => {
  const { 
    notifications, 
    markNotificationRead, 
    clearNotification 
  } = usePantry();

  // Notification Preferences toggles
  const [prefExpiry, setPrefExpiry] = useState(true);
  const [prefStock, setPrefStock] = useState(true);
  const [prefMeals, setPrefMeals] = useState(false);
  const [prefSavings, setPrefSavings] = useState(true);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const note of unread) {
      await markNotificationRead(note.id);
    }
  };

  const handleClearNote = async (id) => {
    await clearNotification(id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      
      {/* Notifications List Column */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-display font-bold text-base text-text-main flex items-center gap-2">
            <IoNotificationsOutline className="text-primary" />
            <span>Alert Messages</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-danger/10 text-danger px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h3>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
            >
              <IoCheckmarkDoneOutline className="text-base" /> Mark all read
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <Card className="py-16 text-center border border-border/80 flex flex-col items-center gap-3">
              <span className="text-3xl">🔔</span>
              <span className="font-display font-bold text-text-main text-sm">No Notifications</span>
              <p className="text-xs text-text-muted max-w-xs">
                You will receive alerts about expiring items or low stock ingredients here.
              </p>
            </Card>
          ) : (
            notifications.map((note) => (
              <Card
                key={note.id}
                className={`border transition-all duration-200 ${!note.read ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-card'}`}
                noPadding
              >
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-main">
                        {note.title}
                      </span>
                      {!note.read && <Badge variant="success" size="sm">NEW</Badge>}
                      
                      <span className="text-[9px] text-text-muted">
                        {new Date(note.timestamp).toLocaleDateString()}{' • '}
                        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {note.message}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!note.read && (
                      <button
                        onClick={() => markNotificationRead(note.id)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => handleClearNote(note.id)}
                      className="p-1 rounded-full hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                      title="Delete Notification"
                    >
                      <IoTrashOutline className="text-base" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Preferences Sidebar Column */}
      <div className="flex flex-col gap-4">
        <h3 className="font-display font-bold text-base text-text-main border-b border-border/60 pb-3 flex items-center gap-2">
          <IoSettingsOutline className="text-text-muted" /> Settings
        </h3>

        <Card className="border border-border/80 flex flex-col gap-5">
          <h4 className="font-display font-bold text-xs text-text-main uppercase tracking-wide">
            Notification Preferences
          </h4>

          <div className="flex flex-col gap-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefExpiry} 
                onChange={(e) => setPrefExpiry(e.target.checked)} 
                className="rounded border-border text-primary focus:ring-primary/20 mt-0.5 cursor-pointer"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-text-main">Food Expiry Warnings</span>
                <span className="text-[10px] text-text-muted">Alert me 2 days before items expire in the pantry.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefStock} 
                onChange={(e) => setPrefStock(e.target.checked)} 
                className="rounded border-border text-primary focus:ring-primary/20 mt-0.5 cursor-pointer"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-text-main">Low Inventory Stock</span>
                <span className="text-[10px] text-text-muted">Suggest restocks for items that fall below 1 piece/200g.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefMeals} 
                onChange={(e) => setPrefMeals(e.target.checked)} 
                className="rounded border-border text-primary focus:ring-primary/20 mt-0.5 cursor-pointer"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-text-main">Daily Meal Prep Reminders</span>
                <span className="text-[10px] text-text-muted">Send alerts to outline daily planned cooking routines.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefSavings} 
                onChange={(e) => setPrefSavings(e.target.checked)} 
                className="rounded border-border text-primary focus:ring-primary/20 mt-0.5 cursor-pointer"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-text-main">Monthly Waste Digest</span>
                <span className="text-[10px] text-text-muted">Recieve environmental savings and money metrics digests.</span>
              </div>
            </label>
          </div>

          <Button variant="primary" size="sm" className="w-full mt-2" onClick={() => alert('Preferences saved!')}>
            Save Preferences
          </Button>
        </Card>
      </div>

    </div>
  );
};

export default Notifications;
