import React, { useState } from 'react';
import { usePantry } from '../../context/PantryContext';
import { 
  IoCalendarOutline, IoAddOutline, IoTrashOutline, 
  IoChevronBack, IoChevronForward, IoRestaurantOutline 
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const MealPlanner = () => {
  const { recipes, mealPlans, addMealPlan, deleteMealPlan } = usePantry();
  
  // Weekly dates
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
    return new Date(today.setDate(diff));
  });

  // Modal scheduler states
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('Lunch'); // Breakfast, Lunch, Dinner
  const [schedulerRecipeId, setSchedulerRecipeId] = useState('');

  // 1. Get week days dates
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Shift weeks
  const handlePrevWeek = () => {
    const nextDate = new Date(currentWeekStart);
    nextDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(nextDate);
  };

  const handleNextWeek = () => {
    const nextDate = new Date(currentWeekStart);
    nextDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextDate);
  };

  // 2. Open Scheduler
  const openScheduler = (date, mealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setSchedulerRecipeId(recipes[0]?.id || '');
    setIsSchedulerOpen(true);
  };

  // 3. Save Meal Plan
  const handleScheduleMeal = async (e) => {
    e.preventDefault();
    if (!schedulerRecipeId || !selectedDate) return;

    const recipe = recipes.find(r => r.id === schedulerRecipeId);
    if (!recipe) return;

    try {
      await addMealPlan({
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeImage: recipe.image,
        mealType: selectedMealType,
        date: selectedDate.toISOString().split('T')[0], // yyyy-mm-dd
        calories: recipe.calories,
        cookingTime: recipe.cookingTime
      });
      setIsSchedulerOpen(false);
    } catch (err) {
      console.error('Failed to schedule meal:', err);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Delete this scheduled meal?')) {
      await deleteMealPlan(planId);
    }
  };

  // Helper: query scheduled meals for slot
  const getMealsForSlot = (dateStr, mealType) => {
    return mealPlans.filter(plan => plan.date === dateStr && plan.mealType === mealType);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      
      {/* Calendar Header Navigation */}
      <Card className="border border-border/80 flex items-center justify-between p-4">
        <h3 className="font-display font-bold text-sm text-text-main flex items-center gap-1.5">
          <IoCalendarOutline className="text-primary text-base" />
          <span>Weekly Schedule</span>
        </h3>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button 
            onClick={handlePrevWeek}
            className="p-1.5 rounded-full hover:bg-border/60 text-text-muted cursor-pointer"
          >
            <IoChevronBack />
          </button>
          
          <span className="text-text-main">
            {weekDays[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <button 
            onClick={handleNextWeek}
            className="p-1.5 rounded-full hover:bg-border/60 text-text-muted cursor-pointer"
          >
            <IoChevronForward />
          </button>
        </div>
      </Card>

      {/* Responsive Weekly Planner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <Card 
              key={dateStr} 
              className={`border p-3 flex flex-col gap-3 min-h-[350px] ${isToday ? 'border-primary/50 bg-primary/5' : 'border-border/70'}`}
              noPadding
            >
              {/* Day title header */}
              <div className="text-center border-b border-border/50 pb-2 select-none">
                <span className="text-[10px] uppercase font-bold text-text-muted block">
                  {day.toLocaleDateString([], { weekday: 'short' })}
                </span>
                <span className={`text-base font-extrabold font-display leading-none mt-0.5 inline-block w-7 h-7 rounded-full text-center pt-1.5 ${isToday ? 'bg-primary text-white shadow-soft shadow-primary/20' : 'text-text-main'}`}>
                  {day.getDate()}
                </span>
              </div>

              {/* Meal Types sections */}
              {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
                const scheduledItems = getMealsForSlot(dateStr, mealType);
                return (
                  <div key={mealType} className="flex flex-col gap-1.5 flex-1 min-h-[80px]">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase select-none px-1">
                      <span>{mealType}</span>
                      <button
                        onClick={() => openScheduler(day, mealType)}
                        className="text-primary hover:text-primary-hover p-0.5 rounded hover:bg-primary/10 transition-colors"
                        title={`Schedule ${mealType}`}
                      >
                        <IoAddOutline className="text-sm" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      {scheduledItems.length === 0 ? (
                        <div className="h-full border border-dashed border-border/60 rounded-custom flex items-center justify-center text-[9px] text-text-muted/40 italic select-none">
                          Empty
                        </div>
                      ) : (
                        scheduledItems.map((plan) => (
                          <div 
                            key={plan.id} 
                            className="bg-card border border-border rounded-custom p-2 shadow-sm flex flex-col justify-between gap-1 group relative overflow-hidden"
                          >
                            {plan.recipeImage && (
                              <div className="w-full h-10 rounded overflow-hidden mb-1">
                                <img src={plan.recipeImage} alt={plan.recipeTitle} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <span className="text-[10px] font-bold text-text-main line-clamp-2 leading-tight">
                              {plan.recipeTitle}
                            </span>
                            
                            <div className="flex items-center justify-between mt-1 text-[8px] text-text-muted">
                              <span>{plan.calories || 200} kcal</span>
                              <button
                                onClick={() => handleDeletePlan(plan.id)}
                                className="text-danger hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 bg-card/90 rounded-full p-1 border shadow-xs"
                                title="Remove meal"
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>

      {/* ----------------- SCHEDULE MEAL MODAL ----------------- */}
      <Modal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        title={`Schedule ${selectedMealType}`}
      >
        <form onSubmit={handleScheduleMeal} className="flex flex-col gap-4">
          <div className="text-xs text-text-muted">
            Date: <b>{selectedDate ? selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}</b>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted">Choose Recipe</label>
            <select
              value={schedulerRecipeId}
              onChange={(e) => setSchedulerRecipeId(e.target.value)}
              className="w-full h-11 px-4 bg-card border border-border rounded-custom text-sm text-text-main focus:outline-none focus:border-primary"
            >
              {recipes.length === 0 ? (
                <option value="">No recipes available. Add some first!</option>
              ) : (
                recipes.map(r => <option key={r.id} value={r.id}>{r.title} ({r.cookingTime} min)</option>)
              )}
            </select>
          </div>

          <div className="flex gap-2.5 mt-2 border-t border-border/60 pt-4 justify-end">
            <Button onClick={() => setIsSchedulerOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={recipes.length === 0}>
              Schedule Meal
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default MealPlanner;
