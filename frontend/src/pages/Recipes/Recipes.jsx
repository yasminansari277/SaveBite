import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePantry } from '../../context/PantryContext';

import { motion } from 'framer-motion';

import { 
   IoHeartOutline, 
  IoHeart, IoSearchOutline 
} from 'react-icons/io5';
import Card from '../../components/ui/Card';


// import Badge from '../../components/ui/Badge';
// import Button from '../../components/ui/Button';

const Recipes = () => {
  const navigate = useNavigate();

  const {
    favorites,
    toggleFavorite
  } = usePantry();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [activeTab, setActiveTab] = useState('recommended'); // recommended, all, favorites
  const [searchQuery, setSearchQuery] = useState('');
  
  
  // const [selectedDiet, setSelectedDiet] = useState('All'); // All, Vegetarian, Vegan, Gluten-Free
  // const [selectedMealType, setSelectedMealType] = useState('All'); // All, Breakfast, Lunch, Dinner
  // const [maxTime, setMaxTime] = useState(60);

  const handleFavoriteToggle = async (e, recipeId) => {
    e.stopPropagation();
    await toggleFavorite(recipeId, 'recipe');
  };

  const isFavorite = (recipeId) => {
    return favorites.some(f => f.itemId === recipeId && f.type === 'recipe');
  };


  const fetchRecipes = async () => {
  try {
    setLoading(true);
    setError('');

    const response = await fetch(
      `http://localhost/savebite/backend/receipe/receipe.php?page=${currentPage}&limit=12&search=${encodeURIComponent(searchQuery)}`
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch recipes');
    }

   const formattedRecipes = data.recipes.map((recipe) => ({
  id: recipe.id,
  title: recipe.title,
  ingredients: recipe.ingredients || [],
  directions: recipe.directions || [],
  link: recipe.link,
  source: recipe.source
}));

    setRecipes(formattedRecipes);
    setTotalPages(data.totalPages);

  } catch (err) {
    console.error('Recipe API Error:', err);
    setError('Unable to load recipes. Please try again.');
    setRecipes([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchRecipes();
}, [currentPage, searchQuery]);


  let displayedRecipes = recipes;

 // 2. Apply Search Filter
const filteredRecipes = displayedRecipes.filter(recipe => {
  const matchSearch = recipe.title
    .toLowerCase()
    .includes(searchQuery.toLowerCase().trim());

  return matchSearch;
});

return (
  <div className="flex flex-col gap-6 select-none">

    {/* Search and Tabs Header */}
    <Card className="border border-border/80 flex flex-col gap-4 p-4">

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
                px-4 py-1.5 rounded-full text-xs font-semibold
                transition-all cursor-pointer
                ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-soft shadow-primary/10'
                    : 'text-text-muted hover:text-text-main'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search recipes..."
            className="w-full h-9 pl-9 pr-4 bg-background/50 border border-border/80 rounded-full text-xs text-text-main focus:outline-none focus:border-primary"
          />

          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60 text-base" />
        </div>

      </div>

    </Card>

    {/* Loading State */}
    {loading ? (
      <Card className="py-20 text-center border border-border/85">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />

          <p className="text-sm text-text-muted">
            Loading recipes...
          </p>
        </div>
      </Card>

    ) : error ? (

      <Card className="py-20 text-center border border-border/85">
        <div className="flex flex-col items-center gap-3">

          <span className="text-4xl">⚠️</span>

          <span className="font-display font-bold text-text-main text-base">
            Unable to Load Recipes
          </span>

          <p className="text-xs text-text-muted">
            {error}
          </p>

          <button
            onClick={fetchRecipes}
            className="px-4 py-2 bg-primary text-white rounded-full text-xs font-semibold hover:opacity-90 transition"
          >
            Try Again
          </button>

        </div>
      </Card>

    ) : filteredRecipes.length === 0 ? (

      <Card className="py-20 text-center border border-border/85 flex flex-col items-center gap-3">

        <span className="text-4xl">🍲</span>

        <span className="font-display font-bold text-text-main text-base">
          No Recipes Found
        </span>

        <p className="text-xs text-text-muted max-w-xs">
          Try searching for another recipe.
        </p>

      </Card>

    ) : (

      <>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {filteredRecipes.map((recipe) => (

            <Card
              key={recipe.id}
              hoverable
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="flex flex-col justify-between border border-border/70 h-full p-0 relative overflow-hidden bg-card"
            >

              {/* Recipe Content */}
              <div>

                {/* Recipe Image */}
                <div className="w-full h-40 relative border-b border-border overflow-hidden">

                  <img
                    src={
                      recipe.image ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Favorite Button */}
                  <motion.button
                    onClick={(e) => handleFavoriteToggle(e, recipe.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.8 }}
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 12
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-card/90 backdrop-blur-xs text-text-main shadow-sm hover:text-danger hover:bg-card transition-colors cursor-pointer"
                  >
                    {isFavorite(recipe.id) ? (
                      <IoHeart className="text-danger text-lg" />
                    ) : (
                      <IoHeartOutline className="text-lg" />
                    )}
                  </motion.button>

                </div>

                {/* Recipe Information */}
                <div className="p-4 flex flex-col gap-2">

                  <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                    Recipe
                  </span>

                  <h4 className="font-display font-bold text-sm text-text-main leading-tight line-clamp-2">
                    {recipe.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1">

                    <span>
                      🥕 {recipe.ingredients.length} ingredients
                    </span>

                    {recipe.source && (
                      <>
                        <span>•</span>

                        <span className="truncate">
                          {recipe.source}
                        </span>
                      </>
                    )}

                  </div>

                </div>

              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-border/50 bg-background/25 flex items-center justify-between">

                <span className="text-[10px] text-text-muted truncate max-w-[150px]">
                  {recipe.ingredients.length} ingredients
                </span>

                <span className="text-xs font-bold text-primary hover:underline">
                  View Recipe
                </span>

              </div>

            </Card>

          ))}

        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-8">

          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-border bg-card text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-background transition-colors"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-text-main">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-border bg-card text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-background transition-colors"
          >
            Next
          </button>

        </div>

      </>

    )}

  </div>
);
};

export default Recipes;