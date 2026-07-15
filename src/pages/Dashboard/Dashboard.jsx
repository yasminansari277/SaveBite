import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePantry } from '../../context/PantryContext';
import { 
  IoNutritionOutline, IoWarningOutline, IoRestaurantOutline, 
  IoListOutline, IoTimeOutline, IoWalletOutline, IoBarChartOutline 
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    pantryItems, 
    shoppingList, 
    aiRecommendedRecipes, 
    aiWastePredictions,
    activityLogs,
    loading
  } = usePantry();

  // Show animated skeletons while database resolves data asynchronously
  if (loading) {
    return (
      <div className="flex flex-col gap-6 select-none">
        <div className="h-8 bg-border/40 rounded w-1/3 animate-pulse mb-2" />
        
        {/* Quick Stats cards skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader variant="stat" count={4} />
        </div>

        {/* Suggested Recipe & Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <SkeletonLoader variant="card" count={2} />
          </div>
          <div className="flex flex-col gap-6">
            <SkeletonLoader variant="card" count={1} />
          </div>
        </div>
      </div>
    );
  }

  // 1. Calculate Stats
  const totalItems = pantryItems.length;
  
  const expiringSoonItems = pantryItems.filter(item => {
    if (!item.expiryDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(item.expiryDate);
    exp.setHours(0,0,0,0);
    const diff = Math.ceil((exp - today) / (86400000));
    return diff >= 0 && diff <= 3;
  });
  const expiringSoonCount = expiringSoonItems.length;

  const recipesCount = aiRecommendedRecipes.filter(r => r.matchPercentage >= 50).length;
  const shoppingCount = shoppingList.length;

  // Heuristics for environmental metrics
  const moneySaved = pantryItems.reduce((acc, item) => acc + (parseFloat(item.quantity) * 0.8), 0).toFixed(2);
  const carbonOffset = (totalItems * 0.4).toFixed(1);

  // Today's suggested recipe: highest match score
  const suggestedRecipe = aiRecommendedRecipes[0] || null;

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-text-main">
            Welcome back, {currentUser?.displayName || 'Eco Chef'}! 🌿
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Your smart pantry is active. You saved <b>{moneySaved ? `$${moneySaved}` : '$0.00'}</b> and offset <b>{carbonOffset}kg</b> of CO2 emissions this month!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/pantry')} variant="primary" size="sm">
            + Add Ingredient
          </Button>
        </div>
      </div>

      {/* Grid of Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          onClick={() => navigate('/pantry')} 
          hoverable 
          className="flex items-center justify-between gap-4 border border-border/80"
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-display text-text-main">{totalItems}</span>
            <span className="text-xs text-text-muted mt-0.5">Pantry Items</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <IoNutritionOutline className="text-xl" />
          </div>
        </Card>

        <Card 
          onClick={() => navigate('/pantry')} 
          hoverable 
          className="flex items-center justify-between gap-4 border border-border/80"
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-display text-text-main">{expiringSoonCount}</span>
            <span className="text-xs text-text-muted mt-0.5">Expiring Soon</span>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${expiringSoonCount > 0 ? 'bg-danger/10 text-danger animate-pulse-soft' : 'bg-border/40 text-text-muted'}`}>
            <IoWarningOutline className="text-xl" />
          </div>
        </Card>

        <Card 
          onClick={() => navigate('/recipes')} 
          hoverable 
          className="flex items-center justify-between gap-4 border border-border/80"
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-display text-text-main">{recipesCount}</span>
            <span className="text-xs text-text-muted mt-0.5">Cookable Recipes</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary/15 text-primary flex items-center justify-center">
            <IoRestaurantOutline className="text-xl" />
          </div>
        </Card>

        <Card 
          onClick={() => navigate('/shopping-list')} 
          hoverable 
          className="flex items-center justify-between gap-4 border border-border/80"
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-display text-text-main">{shoppingCount}</span>
            <span className="text-xs text-text-muted mt-0.5">Shopping List</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent/20 text-primary flex items-center justify-center">
            <IoListOutline className="text-xl" />
          </div>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Suggested Recipe of the Day & Waste Forecast */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Suggestion Card */}
          <Card className="border border-border/80 flex flex-col md:flex-row gap-5 relative overflow-hidden bg-gradient-to-br from-card to-background/20">
            {suggestedRecipe ? (
              <>
                <img 
                  src={suggestedRecipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} 
                  alt={suggestedRecipe.title}
                  className="w-full md:w-44 h-44 object-cover rounded-custom border border-border"
                />
                <div className="flex-1 flex flex-col justify-between py-1.5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="accent" size="sm">TODAY'S SUGGESTION</Badge>
                      <Badge variant="success" size="sm">{suggestedRecipe.matchPercentage}% Ingredients Matched</Badge>
                    </div>
                    <h3 className="font-display font-bold text-lg text-text-main">{suggestedRecipe.title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {suggestedRecipe.wasteImpact || 'A sustainable cooking recommendation matching ingredients currently in your fridge.'}
                    </p>
                    <div className="flex gap-4 text-xs text-text-muted mt-1">
                      <span className="flex items-center gap-1"><IoTimeOutline /> {suggestedRecipe.cookingTime} mins</span>
                      <span className="flex items-center gap-1"><IoBarChartOutline /> {suggestedRecipe.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-4">
                    <Button onClick={() => navigate(`/recipes/${suggestedRecipe.id}`)} variant="primary" size="sm">
                      Cook Now
                    </Button>
                    <Button onClick={() => navigate('/recipes')} variant="outline" size="sm">
                      Browse Recipes
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full py-10 text-center flex flex-col items-center gap-3">
                <span className="text-3xl">🍲</span>
                <span className="text-sm font-semibold text-text-main">No Recipe Matches Yet</span>
                <p className="text-xs text-text-muted max-w-xs">
                  Fill your pantry with ingredients to get automated AI recipe recommendations instantly.
                </p>
                <Button onClick={() => navigate('/pantry')} variant="secondary" size="sm">
                  Add Pantry Item
                </Button>
              </div>
            )}
          </Card>

          {/* Premium CSS Chart - Food Waste Performance */}
          <Card className="border border-border/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-text-main flex items-center gap-1.5">
                <IoBarChartOutline className="text-primary text-base" /> Monthly Food Waste Trend ($ Value)
              </h3>
              <Badge variant="neutral" size="sm">Last 6 Months</Badge>
            </div>
            
            {/* Custom Responsive CSS Chart */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-border/60 pb-2">
              {[
                { month: 'Jan', val: 42, color: 'bg-primary/30' },
                { month: 'Feb', val: 38, color: 'bg-primary/45' },
                { month: 'Mar', val: 29, color: 'bg-primary/60' },
                { month: 'Apr', val: 20, color: 'bg-primary/75' },
                { month: 'May', val: 14, color: 'bg-primary' },
                { month: 'Jun', val: 8, color: 'bg-primary-hover' }
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-6 text-[10px] font-bold text-text-main opacity-0 group-hover:opacity-100 transition-opacity">
                      ${bar.val}
                    </span>
                    <div 
                      className={`w-full max-w-[40px] rounded-t-[8px] transition-all duration-500 ease-out ${bar.color}`}
                      style={{ height: `${(bar.val / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted mt-1">{bar.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-text-muted pt-1">
              <span>📉 Waste reduced by <b>80%</b> since joining SaveBite.</span>
              <span>Target: <b>&lt; $5/mo</b></span>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Food Waste Forecast Risk Alerts & Activity Log */}
        <div className="flex flex-col gap-6">
          {/* Expiry Risk Alerts */}
          <Card className="border border-border/80 flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm text-text-main flex items-center gap-1.5">
              <IoWarningOutline className="text-danger text-base" /> High Waste Risk Alerts
            </h3>
            
            <div className="flex flex-col gap-3.5 max-h-56 overflow-y-auto">
              {aiWastePredictions.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Extreme').length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted flex flex-col gap-2">
                  <span className="text-2xl">🎉</span>
                  <span>No items at high risk of waste! Great job.</span>
                </div>
              ) : (
                aiWastePredictions
                  .filter(p => p.riskLevel === 'High' || p.riskLevel === 'Extreme')
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-text-main truncate">{item.name}</span>
                        <span className="text-[10px] text-text-muted line-clamp-2 leading-relaxed mt-0.5">{item.suggestion}</span>
                      </div>
                      <Badge variant="danger" size="sm">
                        {item.daysLeft === 0 ? 'Today' : item.daysLeft < 0 ? 'Expired' : `${item.daysLeft}d left`}
                      </Badge>
                    </div>
                  ))
              )}
            </div>
          </Card>

          {/* Recent Activity Log */}
          <Card className="border border-border/80 flex flex-col gap-4 flex-1">
            <h3 className="font-display font-bold text-sm text-text-main flex items-center gap-1.5">
              <IoTimeOutline className="text-primary text-base" /> Activity Log
            </h3>
            
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto">
              {activityLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted">
                  No activity history logged.
                </div>
              ) : (
                activityLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs leading-relaxed">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/70 mt-1" />
                      <div className="w-0.5 flex-1 bg-border/50 my-1" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-text-main font-medium">{log.message}</span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(log.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' • '}
                        {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
