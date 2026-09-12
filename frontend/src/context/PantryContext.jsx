import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { 
  getDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument 
} from '../services/firebase/firestore';
import { 
  recommendRecipes, 
  predictFoodWaste, 
  generateShoppingSuggestions 
} from '../services/ai/aiService';

const PantryContext = createContext();

export const usePantry = () => useContext(PantryContext);

export const PantryProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Data States
  const [pantryItems, setPantryItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);

  // AI-Derived States
  const [aiRecommendedRecipes, setAiRecommendedRecipes] = useState([]);
  const [aiWastePredictions, setAiWastePredictions] = useState([]);
  const [aiShoppingSuggestions, setAiShoppingSuggestions] = useState([]);

  // Fetch all user-related data when user changes
  useEffect(() => {
    const loadAllData = async () => {
      if (!currentUser) {
        // Clear all states if logged out
        setPantryItems([]);
        setShoppingList([]);
        setMealPlans([]);
        setFavorites([]);
        setNotifications([]);
        setActivityLogs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const uid = currentUser.uid;

        // Fetch user specific collections
        const pantry = await getDocuments('ingredients', [{ field: 'userId', operator: '==', value: uid }]);
        const list = await getDocuments('shoppingLists', [{ field: 'userId', operator: '==', value: uid }]);
        const plans = await getDocuments('mealPlans', [{ field: 'userId', operator: '==', value: uid }]);
        const favs = await getDocuments('favorites', [{ field: 'userId', operator: '==', value: uid }]);
        const notes = await getDocuments('notifications', [{ field: 'userId', operator: '==', value: uid }]);
        const logs = await getDocuments('activityLogs', [], 'time', 'desc');

        // Fetch global collections
        const allRecipes = await getDocuments('recipes');
        const cats = await getDocuments('categories');

        setPantryItems(pantry);
        setShoppingList(list);
        setMealPlans(plans);
        setFavorites(favs);
        setNotifications(notes);
        setActivityLogs(logs);
        setRecipes(allRecipes);
        setCategories(cats);

        // Generate initial expiry alerts in notification list
        generateAutomaticExpiryNotifications(pantry, notes, uid);

      } catch (error) {
        console.error('Error loading database data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [currentUser]);

  // Recalculate AI suggestions when pantry items, recipes, or shopping list changes
  useEffect(() => {
    if (pantryItems.length >= 0 && recipes.length > 0) {
      const recommended = recommendRecipes(pantryItems, recipes);
      const waste = predictFoodWaste(pantryItems);
      const restock = generateShoppingSuggestions(pantryItems, shoppingList);

      setAiRecommendedRecipes(recommended);
      setAiWastePredictions(waste);
      setAiShoppingSuggestions(restock);
    }
  }, [pantryItems, recipes, shoppingList]);

  // Helper: auto-generate notifications for expiring food
  const generateAutomaticExpiryNotifications = async (pantry, existingNotes, uid) => {
    const today = new Date();
    today.setHours(0,0,0,0);

    pantry.forEach(async (item) => {
      if (!item.expiryDate) return;
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0,0,0,0);
      const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0 && daysLeft <= 2) {
        // Check if alert already exists to prevent duplicate spamming
        const exists = existingNotes.some(n => n.itemId === item.id && n.type === 'expiry');
        if (!exists) {
          const typeStr = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : 'in 2 days';
          const alertMsg = `⚠️ EXPIRED ALERT: Your "${item.name}" expires ${typeStr}. Use it soon!`;
          
          const newNote = await addNotification({
            userId: uid,
            itemId: item.id,
            type: 'expiry',
            title: 'Expiry Alert',
            message: alertMsg,
            read: false,
            timestamp: new Date().toISOString()
          });

          if (newNote) {
            setNotifications(prev => [newNote, ...prev]);
          }
        }
      }
    });
  };

  // ----------------- PANTRY OPERATIONS -----------------
  const addPantryItem = async (itemData) => {
    if (!currentUser) return;
    const item = await addDocument('ingredients', {
      ...itemData,
      userId: currentUser.uid
    });
    setPantryItems(prev => [item, ...prev]);
    return item;
  };

  const updatePantryItem = async (itemId, updatedData) => {
    const updated = await updateDocument('ingredients', itemId, updatedData);
    setPantryItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updated } : item));
    return updated;
  };

  const deletePantryItem = async (itemId) => {
    await deleteDocument('ingredients', itemId);
    setPantryItems(prev => prev.filter(item => item.id !== itemId));
  };

  // ----------------- RECIPE OPERATIONS -----------------
  const addMasterRecipe = async (recipeData) => {
    const recipe = await addDocument('recipes', recipeData);
    setRecipes(prev => [recipe, ...prev]);
    return recipe;
  };

  const deleteMasterRecipe = async (recipeId) => {
    await deleteDocument('recipes', recipeId);
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  // ----------------- SHOPPING LIST OPERATIONS -----------------
  const addShoppingItem = async (itemData) => {
    if (!currentUser) return;
    const item = await addDocument('shoppingLists', {
      ...itemData,
      userId: currentUser.uid,
      completed: false
    });
    setShoppingList(prev => [item, ...prev]);
    return item;
  };

  const updateShoppingItem = async (itemId, updatedData) => {
    const updated = await updateDocument('shoppingLists', itemId, updatedData);
    setShoppingList(prev => prev.map(item => item.id === itemId ? { ...item, ...updated } : item));
    return updated;
  };

  const deleteShoppingItem = async (itemId) => {
    await deleteDocument('shoppingLists', itemId);
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  const clearShoppingList = async () => {
    const toDelete = [...shoppingList];
    for (const item of toDelete) {
      await deleteDocument('shoppingLists', item.id);
    }
    setShoppingList([]);
  };

  // Transfer shopping item to pantry inventory
  const transferToPantry = async (shoppingItem, pantryDetails = {}) => {
    if (!currentUser) return;
    // Add to pantry
    const addedItem = await addPantryItem({
      name: shoppingItem.name,
      category: shoppingItem.category || 'Grains & Pasta',
      quantity: shoppingItem.quantity || 1,
      unit: shoppingItem.unit || 'pcs',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: pantryDetails.expiryDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Default 7 days
      storageLocation: pantryDetails.storageLocation || 'Pantry',
      notes: 'Added from shopping list',
      image: '',
      barcode: ''
    });

    // Delete from shopping list
    await deleteShoppingItem(shoppingItem.id);
    return addedItem;
  };

  // ----------------- MEAL PLAN OPERATIONS -----------------
  const addMealPlan = async (planData) => {
    if (!currentUser) return;
    const plan = await addDocument('mealPlans', {
      ...planData,
      userId: currentUser.uid
    });
    setMealPlans(prev => [plan, ...prev]);
    return plan;
  };

  const deleteMealPlan = async (planId) => {
    await deleteDocument('mealPlans', planId);
    setMealPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  // ----------------- FAVORITES OPERATIONS -----------------
  const toggleFavorite = async (itemId, type = 'recipe') => {
    if (!currentUser) return;
    const existing = favorites.find(f => f.itemId === itemId && f.type === type);
    
    if (existing) {
      await deleteDocument('favorites', existing.id);
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
      return false;
    } else {
      const fav = await addDocument('favorites', {
        userId: currentUser.uid,
        itemId,
        type,
        addedAt: new Date().toISOString()
      });
      setFavorites(prev => [fav, ...prev]);
      return true;
    }
  };

  // ----------------- NOTIFICATIONS OPERATIONS -----------------
  const addNotification = async (notificationData) => {
    if (!currentUser) return;
    return await addDocument('notifications', {
      ...notificationData,
      userId: currentUser.uid
    });
  };

  const markNotificationRead = async (noteId) => {
    await updateDocument('notifications', noteId, { read: true });
    setNotifications(prev => prev.map(n => n.id === noteId ? { ...n, read: true } : n));
  };

  const clearNotification = async (noteId) => {
    await deleteDocument('notifications', noteId);
    setNotifications(prev => prev.filter(n => n.id !== noteId));
  };

  const value = {
    // States
    pantryItems,
    recipes,
    shoppingList,
    mealPlans,
    favorites,
    notifications,
    categories,
    activityLogs,
    loading,

    // AI
    aiRecommendedRecipes,
    aiWastePredictions,
    aiShoppingSuggestions,

    // Operations
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    addMasterRecipe,
    deleteMasterRecipe,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    clearShoppingList,
    transferToPantry,
    addMealPlan,
    deleteMealPlan,
    toggleFavorite,
    markNotificationRead,
    clearNotification
  };

  return (
    <PantryContext.Provider value={value}>
      {children}
    </PantryContext.Provider>
  );
};
