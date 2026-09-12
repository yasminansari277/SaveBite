import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePantry } from '../../context/PantryContext';
import { IoHeart, IoTimeOutline, IoHeartOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const Favorites = () => {
  const navigate = useNavigate();
  const { recipes, favorites, toggleFavorite, aiRecommendedRecipes } = usePantry();

  // Filter recipes marked as favorite
  const favoriteRecipes = recipes.filter(r => 
    favorites.some(f => f.itemId === r.id && f.type === 'recipe')
  ).map(r => {
    // Map with AI recommendations if available
    const match = aiRecommendedRecipes.find(ar => ar.id === r.id);
    return match || { ...r, matchPercentage: 0 };
  });

  const handleFavoriteToggle = async (e, recipeId) => {
    e.stopPropagation();
    await toggleFavorite(recipeId, 'recipe');
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      
      {favoriteRecipes.length === 0 ? (
        <Card className="py-20 text-center border border-border/85 flex flex-col items-center gap-3">
          <span className="text-4xl">💚</span>
          <span className="font-display font-bold text-text-main text-base">No Favorites Saved</span>
          <p className="text-xs text-text-muted max-w-xs">
            Save recipes that you love! Go to the Recipe tab and click the heart icon on any dish card.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              hoverable
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="flex flex-col justify-between border border-border/70 h-full p-0 relative overflow-hidden bg-card"
            >
              <div>
                <div className="w-full h-40 relative border-b border-border overflow-hidden bg-background">
                  <img 
                    src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                  />
                  {/* Floating Unfavorite Button */}
                  <motion.button
                    onClick={(e) => handleFavoriteToggle(e, recipe.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 450, damping: 12 }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-card/95 backdrop-blur-xs text-danger shadow-sm hover:bg-card cursor-pointer"
                  >
                    <IoHeart className="text-lg" />
                  </motion.button>

                  {/* Overlaps matched tag */}
                  {recipe.matchPercentage > 0 && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-primary text-white px-2.5 py-1 rounded-full shadow-lg">
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

              <div className="p-4 border-t border-border/50 bg-background/25 flex items-center justify-between">
                <span className="text-[10px] text-text-muted">
                  {recipe.ingredients.length} ingredients
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

export default Favorites;
