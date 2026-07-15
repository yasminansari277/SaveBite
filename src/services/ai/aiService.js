/**
 * AI-ready Local Heuristic Engine for SaveBite.
 * Matches recipes, predicts food waste, suggests ingredient replacements, and forecasts shopping lists.
 */

// 1. Database of common ingredient substitutes
const INGREDIENT_SUBSTITUTES = {
  'milk': ['Oat Milk', 'Almond Milk', 'Soy Milk', 'Coconut Milk'],
  'almond milk': ['Oat Milk', 'Soy Milk', 'Dairy Milk', 'Coconut Milk'],
  'butter': ['Coconut Oil', 'Margarine', 'Avocado Oil', 'Applesauce'],
  'egg': ['Flaxseed Meal (1 tbsp + 3 tbsp water)', 'Chia Seed Gel', 'Mashed Banana', 'Applesauce'],
  'flour': ['Almond Flour', 'Oat Flour', 'Coconut Flour', 'Gluten-Free 1-to-1 Baking Flour'],
  'tomato': ['Canned Tomatoes', 'Tomato Paste', 'Red Bell Pepper', 'Pumpkin Puree'],
  'spinach': ['Kale', 'Swiss Chard', 'Arugula', 'Baby Bok Choy'],
  'garlic': ['Garlic Powder (1/4 tsp per clove)', 'Shallots', 'Chives', 'Onion Powder'],
  'chicken': ['Tofu', 'Tempeh', 'Seitan', 'Chickpeas', 'Jackfruit'],
  'beef': ['Portobello Mushrooms', 'Brown Lentils', 'Textured Vegetable Protein (TVP)', 'Black Beans'],
  'sugar': ['Maple Syrup', 'Honey', 'Agave Nectar', 'Stevia', 'Coconut Sugar'],
  'cream': ['Coconut Cream', 'Greek Yogurt', 'Cashew Cream', 'Silken Tofu blended']
};

/**
 * 2. Get replacements for a given ingredient
 */
export const getIngredientSubstitutes = (ingredientName) => {
  if (!ingredientName) return [];
  const query = ingredientName.toLowerCase().trim();
  
  // Direct match
  if (INGREDIENT_SUBSTITUTES[query]) {
    return INGREDIENT_SUBSTITUTES[query];
  }
  
  // Partial matches
  for (const [key, value] of Object.entries(INGREDIENT_SUBSTITUTES)) {
    if (query.includes(key) || key.includes(query)) {
      return value;
    }
  }
  
  return ['No common substitute recorded. Try adapting cooking temperature or seasoning instead.'];
};

/**
 * 3. Recommend recipes based on pantry status and preferences
 * @param {Array} pantryItems - Current pantry items in inventory
 * @param {Array} recipes - Catalog of master recipes
 * @param {Object} preferences - { dietPreference: string, mealType: string, maxTime: number }
 */
export const recommendRecipes = (pantryItems = [], recipes = [], preferences = {}) => {
  const pantryNames = pantryItems.map(item => item.name.toLowerCase().trim());
  const expiringPantryNames = pantryItems
    .filter(item => {
      const days = getDaysRemaining(item.expiryDate);
      return days >= 0 && days <= 3; // Expiring in next 3 days
    })
    .map(item => item.name.toLowerCase().trim());

  return recipes.map(recipe => {
    let matchedCount = 0;
    const matchedIngredients = [];
    const missingIngredients = [];
    let usesExpiringItem = false;

    recipe.ingredients.forEach(recipeIng => {
      const ingNameLower = recipeIng.name.toLowerCase().trim();
      
      // Check if ingredient exists in pantry (exact or partial)
      const foundInPantry = pantryItems.find(pItem => 
        pItem.name.toLowerCase().includes(ingNameLower) || 
        ingNameLower.includes(pItem.name.toLowerCase())
      );

      if (foundInPantry) {
        matchedCount++;
        matchedIngredients.push(recipeIng.name);
        
        // Check if this pantry item is expiring soon
        const days = getDaysRemaining(foundInPantry.expiryDate);
        if (days >= 0 && days <= 3) {
          usesExpiringItem = true;
        }
      } else {
        // Look if we have a substitute in pantry
        const substitutes = getIngredientSubstitutes(recipeIng.name);
        const substituteInPantry = pantryItems.find(pItem => 
          substitutes.some(sub => pItem.name.toLowerCase().includes(sub.toLowerCase()))
        );

        if (substituteInPantry) {
          matchedCount += 0.8; // Partial match score for using substitute
          matchedIngredients.push(`${recipeIng.name} (Substitute with: ${substituteInPantry.name})`);
        } else {
          missingIngredients.push(recipeIng.name);
        }
      }
    });

    const totalCount = recipe.ingredients.length;
    const matchPercentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

    // AI score booster
    let aiScore = matchPercentage;
    if (usesExpiringItem) aiScore += 15; // Give boost to recipes utilizing food about to spoil
    if (recipe.difficulty === 'Easy') aiScore += 5; // Slight boost for low complexity

    return {
      ...recipe,
      matchPercentage,
      matchedIngredients,
      missingIngredients,
      usesExpiringItem,
      aiScore
    };
  })
  // Filter by Preferences
  .filter(recipe => {
    if (preferences.dietPreference && preferences.dietPreference !== 'All') {
      const diet = preferences.dietPreference.toLowerCase();
      // Heuristic checks
      if (diet === 'vegetarian') {
        const meatTerms = ['chicken', 'beef', 'pork', 'fish', 'steak', 'salmon', 'meat'];
        const containsMeat = recipe.ingredients.some(ing => 
          meatTerms.some(term => ing.name.toLowerCase().includes(term))
        );
        if (containsMeat) return false;
      }
      if (diet === 'vegan') {
        const animalTerms = ['chicken', 'beef', 'pork', 'fish', 'steak', 'salmon', 'meat', 'milk', 'cheese', 'egg', 'butter', 'cream', 'honey'];
        const containsAnimal = recipe.ingredients.some(ing => 
          animalTerms.some(term => ing.name.toLowerCase().includes(term))
        );
        if (containsAnimal) return false;
      }
      if (diet === 'gluten-free') {
        const glutenTerms = ['pasta', 'flour', 'bread', 'wheat', 'soy sauce', 'semolina'];
        const containsGluten = recipe.ingredients.some(ing => 
          glutenTerms.some(term => ing.name.toLowerCase().includes(term))
        );
        if (containsGluten) return false;
      }
    }

    if (preferences.mealType && preferences.mealType !== 'All') {
      if (recipe.category.toLowerCase() !== preferences.mealType.toLowerCase()) return false;
    }

    if (preferences.maxTime && recipe.cookingTime > preferences.maxTime) {
      return false;
    }

    return true;
  })
  .sort((a, b) => b.aiScore - a.aiScore);
};

/**
 * 4. Predict food waste probability for items in inventory
 */
export const predictFoodWaste = (pantryItems = []) => {
  const wastePredictions = pantryItems.map(item => {
    const daysLeft = getDaysRemaining(item.expiryDate);
    let riskLevel = 'Low';
    let probability = 10; // base percentage
    let suggestion = 'Monitor storage temperature.';

    if (daysLeft < 0) {
      riskLevel = 'Extreme';
      probability = 100;
      suggestion = 'Expired. Compost if possible. Check for spoilage signs.';
    } else if (daysLeft === 0) {
      riskLevel = 'High';
      probability = 90;
      suggestion = 'Expires today! Use immediately in smoothies, stir-fry, or freeze for soup stocks.';
    } else if (daysLeft === 1) {
      riskLevel = 'High';
      probability = 75;
      suggestion = 'Expires tomorrow! Cook today or prep for freezing to extend life.';
    } else if (daysLeft <= 3) {
      riskLevel = 'Medium';
      probability = 50;
      suggestion = 'Incorporate into your upcoming meal plan. Perfect for stews or baking.';
    } else if (daysLeft <= 7) {
      riskLevel = 'Low';
      probability = 25;
      suggestion = 'Store in airtight containers to optimize shelf life.';
    }

    // High quantity increases waste risk
    if (parseFloat(item.quantity) > 3 && riskLevel !== 'Low') {
      probability = Math.min(probability + 15, 95);
      suggestion += ' Large portion size detected; consider splitting and freezing half.';
    }

    // Category specific storage hacks
    const cat = item.category?.toLowerCase() || '';
    if (cat.includes('vegetable') || cat.includes('fruit')) {
      if (daysLeft <= 3 && daysLeft >= 0) {
        suggestion += ' Keep away from ethylene-producing fruits like bananas to slow ripening.';
      }
    } else if (cat.includes('dairy')) {
      if (daysLeft <= 3 && daysLeft >= 0) {
        suggestion += ' Can be used in baking or cooked sauces where flavor integrity is secondary.';
      }
    }

    return {
      ...item,
      daysLeft,
      riskLevel,
      probability,
      suggestion
    };
  });

  return wastePredictions.sort((a, b) => b.probability - a.probability);
};

/**
 * 5. Suggest low stock items or items frequently wasted
 */
export const generateShoppingSuggestions = (pantryItems = [], shoppingList = []) => {
  const suggestions = [];
  const shoppingListNames = shoppingList.map(item => item.name.toLowerCase().trim());

  pantryItems.forEach(item => {
    const qty = parseFloat(item.quantity);
    const unit = item.unit || 'pcs';
    const isLowStock = (unit === 'pcs' && qty <= 1) || 
                       ((unit === 'g' || unit === 'ml') && qty <= 200) ||
                       ((unit === 'kg' || unit === 'l') && qty <= 0.2);

    const alreadyInShoppingList = shoppingListNames.some(name => name.includes(item.name.toLowerCase().trim()));

    if (isLowStock && !alreadyInShoppingList) {
      suggestions.push({
        id: `sug_${item.id}`,
        name: item.name,
        category: item.category,
        reason: `Low stock detected (${item.quantity} ${item.unit} remaining)`,
        suggestedQty: qty === 0 ? 1 : Math.round(qty * 2)
      });
    }
  });

  return suggestions;
};

// Helper function: calculate difference in days
const getDaysRemaining = (expiryDateStr) => {
  if (!expiryDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
