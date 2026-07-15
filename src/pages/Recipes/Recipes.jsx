import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePantry } from '../../context/PantryContext';
import { 
  IoRestaurantOutline, IoTimeOutline, IoHeartOutline, 
  IoHeart, IoFilterOutline, IoSearchOutline, IoTimerOutline 
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const Recipes = () => {
  const navigate = useNavigate();
  const { 
    recipes, 
    favorites, 
    toggleFavorite, 
    aiRecommendedRecipes 
  } = usePantry();

  // Filter States
  const [activeTab, setActiveTab] = useState('recommended'); // recommended, all, favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('All'); // All, Vegetarian, Vegan, Gluten-Free
  const [selectedMealType, setSelectedMealType] = useState('All'); // All, Breakfast, Lunch, Dinner
  const [maxTime, setMaxTime] = useState(60);

  const handleFavoriteToggle = async (e, recipeId) => {
    e.stopPropagation();
    await toggleFavorite(recipeId, 'recipe');
  };

  const isFavorite = (recipeId) => {
    return favorites.some(f => f.itemId === recipeId && f.type === 'recipe');
  };

  // 1. Process Selection
  let displayedRecipes = [];
  if (activeTab === 'recommended') {
    // Already sorted by AI Match Heuristics
    displayedRecipes = aiRecommendedRecipes;
  } else if (activeTab === 'all') {
    displayedRecipes = recipes.map(r => {
      // Calculate match percentage for 'all' tab as well
      const match = aiRecommendedRecipes.find(ar => ar.id === r.id);
      return match || { ...r, matchPercentage: 0 };
    });
  } else if (activeTab === 'favorites') {
    displayedRecipes = recipes
      .filter(r => isFavorite(r.id))
      .map(r => {
        const match = aiRecommendedRecipes.find(ar => ar.id === r.id);
        return match || { ...r, matchPercentage: 0 };
      });
  }

  // 2. Apply Custom UI Filters (Search, Diet, Time)
  const filteredRecipes = displayedRecipes.filter(recipe => {
    const matchSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchTime = recipe.cookingTime <= maxTime;
    
    // Diet Filters (Applied Heuristically)
    let matchDiet = true;
    if (selectedDiet !== 'All') {
      const diet = selectedDiet.toLowerCase();
      if (diet === 'vegetarian') {
        const meatTerms = ['chicken', 'beef', 'pork', 'fish', 'steak', 'salmon', 'meat'];
        matchDiet = !recipe.ingredients.some(ing => 
          meatTerms.some(term => ing.name.toLowerCase().includes(term))
        );
      }
      if (diet === 'vegan') {
        const animalTerms = ['chicken', 'beef', 'pork', 'fish', 'steak', 'salmon', 'meat', 'milk', 'cheese', 'egg', 'butter', 'cream', 'honey'];
        matchDiet = !recipe.ingredients.some(ing => 
          animalTerms.some(term => ing.name.toLowerCase().includes(term))
        );
      }
      if (diet === 'gluten-free') {
        const glutenTerms = ['pasta', 'flour', 'bread', 'wheat', 'soy sauce', 'semolina'];
        matchDiet = !recipe.ingredients.some(ing => 
          glutenTerms.some(term => ing.name.toLowerCase().includes(term))
        );
      }
    }

    // Meal Type Filter
    const matchMeal = selectedMealType === 'All' || recipe.category.toLowerCase() === selectedMealType.toLowerCase();

    return matchSearch && matchTime && matchDiet && matchMeal;
  });

  return (
    <div className="flex flex-col gap-6 select-none">
      
      {/* Search and Filters Header */}
      <Card className="border border-border/80 flex flex-col gap-4 p-4">
        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Navigation Tabs */}
          <div className="flex border border-border bg-background/50 rounded-full p-1 w-fit">
            {[
              { id: 'recommended', label: 'AI Recommended' },
              { id: 'all', label: 'All Recipes' },
              { id: 'favorites', label: 'My Favorites' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer
                  ${activeTab === tab.id 
                    ? 'bg-primary text-white shadow-soft shadow-primary/10' 
                    : 'text-text-muted hover:text-text-main'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full h-9 pl-9 pr-4 bg-background/50 border border-border/80 rounded-full text-xs text-text-main focus:outline-none focus:border-primary"
            />
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60 text-base" />
          </div>

        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-3 text-xs">
          
          {/* Diet dropdown */}
          <div className="flex items-center gap-1.5 bg-background border border-border/80 rounded-full px-3 py-1.5 text-text-muted">
            <IoFilterOutline />
            <span className="font-medium">Diet:</span>
            <select
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              className="bg-transparent border-0 outline-none text-text-main font-semibold cursor-pointer"
            >
              <option value="All">All Diets</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-Free">Gluten-Free</option>
            </select>
          </div>

          {/* Meal type filter */}
          <div className="flex items-center gap-1.5 bg-background border border-border/80 rounded-full px-3 py-1.5 text-text-muted">
            <IoRestaurantOutline />
            <span className="font-medium">Meal:</span>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="bg-transparent border-0 outline-none text-text-main font-semibold cursor-pointer"
            >
              <option value="All">All Meal Types</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* Cooking Time Slider */}
          <div className="flex items-center gap-3 bg-background border border-border/80 rounded-full px-4 py-1 text-text-muted">
            <div className="flex items-center gap-1">
              <IoTimerOutline />
              <span className="font-medium">Max Time:</span>
              <span className="font-bold text-text-main ml-0.5">{maxTime} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={maxTime}
              onChange={(e) => setMaxTime(parseInt(e.target.value))}
              className="w-24 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
          </div>

        </div>
      </Card>

      {/* Recipe Grid Listings */}
      {filteredRecipes.length === 0 ? (
        <Card className="py-20 text-center border border-border/85 flex flex-col items-center gap-3">
          <span className="text-4xl">🍲</span>
          <span className="font-display font-bold text-text-main text-base">No Recipes Found</span>
          <p className="text-xs text-text-muted max-w-xs">
            Try adjustments to your search queries, diet tags, or cooking time filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              hoverable
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="flex flex-col justify-between border border-border/70 h-full p-0 relative overflow-hidden bg-card"
            >
              <div>
                {/* Hero Image */}
                <div className="w-full h-40 relative border-b border-border overflow-hidden">
                  <img 
                    src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Floating Favorite Button */}
                  <motion.button
                    onClick={(e) => handleFavoriteToggle(e, recipe.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 450, damping: 12 }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-card/90 backdrop-blur-xs text-text-main shadow-sm hover:text-danger hover:bg-card transition-colors cursor-pointer"
                  >
                    {isFavorite(recipe.id) ? (
                      <IoHeart className="text-danger text-lg" />
                    ) : (
                      <IoHeartOutline className="text-lg" />
                    )}
                  </motion.button>

                  {/* AI overlap badge */}
                  {recipe.matchPercentage > 0 && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-primary/95 text-white px-2.5 py-1 rounded-full shadow-lg">
                      {recipe.matchPercentage}% Matched
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                    {recipe.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-text-main leading-tight truncate">
                    {recipe.title}
                  </h4>
                  <div className="flex gap-3 text-[11px] text-text-muted mt-1">
                    <span className="flex items-center gap-0.5"><IoTimeOutline /> {recipe.cookingTime} min</span>
                    <span>• {recipe.calories} kcal</span>
                    <span>• {recipe.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-border/50 bg-background/25 flex items-center justify-between">
                <span className="text-[10px] text-text-muted truncate max-w-[150px]">
                  {recipe.usesExpiringItem ? '⚠️ Uses expiring ingredients' : `${recipe.ingredients.length} ingredients`}
                </span>
                <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
                  View Recipe
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default Recipes;
