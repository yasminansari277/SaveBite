import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePantry } from '../../context/PantryContext';
import { getIngredientSubstitutes } from '../../services/ai/aiService';
import { 
  IoArrowBack, IoTimeOutline, IoRestaurantOutline, IoBarChartOutline, 
  IoCheckmarkCircle, IoAlertCircle, IoHeartOutline, IoHeart, 
  IoAddCircleOutline, IoPlayOutline, IoChevronForward, IoChevronBack 
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    recipes, 
    pantryItems, 
    favorites, 
    toggleFavorite, 
    addShoppingItem, 
    updatePantryItem, 
    deletePantryItem 
  } = usePantry();

  const [recipe, setRecipe] = useState(null);
  const [inStockIngredients, setInStockIngredients] = useState([]);
  const [missingIngredients, setMissingIngredients] = useState([]);

  // Cook Mode states
  const [isCookModalOpen, setIsCookModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Load Recipe details
  useEffect(() => {
    const selected = recipes.find(r => r.id === id);
    if (selected) {
      setRecipe(selected);
      analyzeIngredientStock(selected);
    }
  }, [id, recipes, pantryItems]);

  // Check ingredient overlaps
  const analyzeIngredientStock = (currentRecipe) => {
    const inStock = [];
    const missing = [];

    currentRecipe.ingredients.forEach(recIng => {
      const ingNameLower = recIng.name.toLowerCase().trim();
      
      const foundItem = pantryItems.find(pItem => 
        pItem.name.toLowerCase().includes(ingNameLower) || 
        ingNameLower.includes(pItem.name.toLowerCase())
      );

      if (foundItem) {
        inStock.push({ ...recIng, pantryItem: foundItem });
      } else {
        const substitutes = getIngredientSubstitutes(recIng.name);
        const subInPantry = pantryItems.find(pItem => 
          substitutes.some(sub => pItem.name.toLowerCase().includes(sub.toLowerCase()))
        );

        if (subInPantry) {
          inStock.push({ ...recIng, pantryItem: subInPantry, isSubstitute: true });
        } else {
          missing.push(recIng);
        }
      }
    });

    setInStockIngredients(inStock);
    setMissingIngredients(missing);
  };

  const handleFavoriteToggle = async () => {
    if (!recipe) return;
    await toggleFavorite(recipe.id, 'recipe');
  };

  const isFav = recipe ? favorites.some(f => f.itemId === recipe.id && f.type === 'recipe') : false;

  // Add missing items to shopping checklist
  const handleAddMissingToShoppingList = async () => {
    if (missingIngredients.length === 0) return;
    
    try {
      for (const ing of missingIngredients) {
        await addShoppingItem({
          name: ing.name,
          category: ing.category || 'Grains & Pasta',
          quantity: 1, // Default quantity
          unit: 'pcs',
          notes: `Required for ${recipe.title}`
        });
      }
      alert('All missing ingredients have been added to your shopping list!');
    } catch (err) {
      console.error(err);
      alert('Failed to export ingredients.');
    }
  };

  // Complete Cooking process & deduct items
  const handleCompleteCooking = async () => {
    try {
      for (const ing of inStockIngredients) {
        const pItem = ing.pantryItem;
        
        // Simple quantity deduction: extract numeric values
        const recipeQtyMatch = ing.amount ? ing.amount.match(/(\d+(\.\d+)?)/) : null;
        const recipeQtyValue = recipeQtyMatch ? parseFloat(recipeQtyMatch[0]) : 1;
        const currentQty = parseFloat(pItem.quantity) || 0;

        if (currentQty <= recipeQtyValue) {
          // If pantry stock is less than or equal to required amount, delete item
          await deletePantryItem(pItem.id);
        } else {
          // Deduct quantity
          const newQty = (currentQty - recipeQtyValue).toFixed(1);
          await updatePantryItem(pItem.id, { quantity: parseFloat(newQty) });
        }
      }

      setIsCookModalOpen(false);
      alert(`🎉 Congratulations! You successfully cooked "${recipe.title}". Pantry ingredients updated!`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Cooking deduction failed:', err);
      alert('Error updating pantry inventory.');
    }
  };

  if (!recipe) {
    return (
      <div className="py-16 text-center text-text-muted">
        Loading recipe details...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none max-w-4xl mx-auto">
      {/* Back link */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors w-fit cursor-pointer"
      >
        <IoArrowBack /> Back to recipes
      </button>

      {/* Hero Header Card */}
      <Card className="border border-border/80 p-0 overflow-hidden relative">
        <div className="w-full h-64 md:h-80 relative">
          <img 
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm" className="bg-white/95 text-primary border-none">
                  {recipe.category}
                </Badge>
                <Badge variant="info" size="sm" className="bg-white/10 text-white border-white/20">
                  {recipe.cuisine}
                </Badge>
              </div>
              <h2 className="font-display font-extrabold text-2xl md:text-3xl leading-tight">
                {recipe.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-2.5">
              <motion.button
                onClick={handleFavoriteToggle}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 450, damping: 12 }}
                className="p-3 rounded-full bg-white/15 backdrop-blur-xs hover:bg-white/25 text-white transition-colors cursor-pointer"
              >
                {isFav ? <IoHeart className="text-danger" /> : <IoHeartOutline />}
              </motion.button>
              <Button 
                onClick={() => { setActiveStep(0); setIsCookModalOpen(true); }} 
                variant="primary" 
                size="md" 
                className="shadow-2xl shadow-black/35 font-semibold"
                icon={IoPlayOutline}
              >
                Cook Now
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4 border border-border/80">
          <IoTimeOutline className="mx-auto text-xl text-primary mb-1" />
          <span className="text-[10px] uppercase font-bold text-text-muted">COOKING TIME</span>
          <div className="text-sm font-extrabold text-text-main mt-0.5">{recipe.cookingTime} Mins</div>
        </Card>
        <Card className="text-center p-4 border border-border/80">
          <IoRestaurantOutline className="mx-auto text-xl text-primary mb-1" />
          <span className="text-[10px] uppercase font-bold text-text-muted">CALORIES</span>
          <div className="text-sm font-extrabold text-text-main mt-0.5">{recipe.calories} Kcal</div>
        </Card>
        <Card className="text-center p-4 border border-border/80">
          <IoBarChartOutline className="mx-auto text-xl text-primary mb-1" />
          <span className="text-[10px] uppercase font-bold text-text-muted">DIFFICULTY</span>
          <div className="text-sm font-extrabold text-text-main mt-0.5">{recipe.difficulty}</div>
        </Card>
      </div>

      {/* Double Column details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ingredients Checklist */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-text-main">Ingredients</h3>
          
          <div className="flex flex-col gap-3">
            {/* In Stock */}
            {inStockIngredients.map((ing, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 border border-[#C8E6C9] bg-[#E8F5E9]/45 rounded-custom text-xs">
                <IoCheckmarkCircle className="text-primary text-base flex-shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-text-main leading-tight">{ing.name}</span>
                  <span className="text-[10px] text-text-muted mt-0.5">Needed: {ing.amount}</span>
                  {ing.isSubstitute && (
                    <span className="text-[9px] text-primary font-bold mt-1">
                      💡 Replacing with: {ing.pantryItem.name}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Missing */}
            {missingIngredients.map((ing, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 border border-[#FFCDD2] bg-[#FFEBEE]/40 rounded-custom text-xs">
                <IoAlertCircle className="text-danger text-base flex-shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-text-main leading-tight">{ing.name}</span>
                  <span className="text-[10px] text-text-muted mt-0.5">Needed: {ing.amount}</span>
                  
                  {/* Substitute ideas */}
                  <span className="text-[9px] text-[#C62828] font-bold mt-1">
                    🔍 Try replacing with: {getIngredientSubstitutes(ing.name)[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {missingIngredients.length > 0 && (
            <Button 
              onClick={handleAddMissingToShoppingList} 
              variant="secondary" 
              size="sm" 
              className="w-full mt-2"
              icon={IoAddCircleOutline}
            >
              Export Missing to List
            </Button>
          )}
        </div>

        {/* Cooking Steps */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-text-main">Instructions</h3>
          
          <Card className="border border-border/80 flex flex-col gap-4">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 text-xs leading-relaxed border-b border-border/40 pb-4 last:border-0 last:pb-0">
                <div className="w-6 h-6 rounded-full bg-secondary/15 text-primary flex items-center justify-center font-bold font-display flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-text-main pt-0.5">{step}</p>
              </div>
            ))}
          </Card>
        </div>

      </div>

      {/* ----------------- COOK NOW PROGRESS MODAL ----------------- */}
      <Modal
        isOpen={isCookModalOpen}
        onClose={() => setIsCookModalOpen(false)}
        title="Interactive Cooking Assistant 🍳"
        size="md"
      >
        <div className="flex flex-col gap-6 py-2 select-none">
          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted">
              <span>COOKING STEPS PROGRESS</span>
              <span>STEP {activeStep + 1} OF {recipe.steps.length}</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((activeStep + 1) / recipe.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Step Panel */}
          <div className="bg-background/50 border border-border p-6 rounded-custom flex flex-col gap-4 items-center text-center py-10 min-h-40 justify-center">
            <span className="text-3xl">🥦</span>
            <p className="text-sm font-semibold text-text-main leading-relaxed">
              {recipe.steps[activeStep]}
            </p>
          </div>

          {/* Control Navigation buttons */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <Button
              onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))}
              disabled={activeStep === 0}
              variant="outline"
              size="sm"
              icon={IoChevronBack}
            >
              Back
            </Button>
            
            {activeStep === recipe.steps.length - 1 ? (
              <Button
                onClick={handleCompleteCooking}
                variant="primary"
                size="sm"
              >
                Complete Cooking 🎉
              </Button>
            ) : (
              <Button
                onClick={() => setActiveStep(prev => Math.min(prev + 1, recipe.steps.length - 1))}
                variant="primary"
                size="sm"
              >
                Next Step <IoChevronForward className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default RecipeDetails;
