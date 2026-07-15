import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, isSimulationMode } from './config';

// ----------------- LOCALSTORAGE MOCK DATABASE UTILITIES -----------------
const getLocalStorageDb = (collectionName) => {
  const data = localStorage.getItem(`savebite_db_${collectionName}`);
  return data ? JSON.parse(data) : [];
};

const saveLocalStorageDb = (collectionName, data) => {
  localStorage.setItem(`savebite_db_${collectionName}`, JSON.stringify(data));
};

// Seed mock collections if they are empty
const seedSimulationDatabase = () => {
  if (!localStorage.getItem('savebite_db_seeded')) {
    // 1. Initial Categories
    saveLocalStorageDb('categories', [
      { id: '1', name: 'Vegetables', icon: '🥦', color: '#81C784' },
      { id: '2', name: 'Fruits', icon: '🍎', color: '#FF8A80' },
      { id: '3', name: 'Dairy', icon: '🥛', color: '#FFF59D' },
      { id: '4', name: 'Meat', icon: '🥩', color: '#FFAB91' },
      { id: '5', name: 'Frozen', icon: '❄️', color: '#90CAF9' },
      { id: '6', name: 'Snacks', icon: '🍿', color: '#B39DDB' },
      { id: '7', name: 'Spices', icon: '🌶️', color: '#FFCC80' },
      { id: '8', name: 'Grains & Pasta', icon: '🌾', color: '#FFE082' }
    ]);

    // 2. Initial Recipes
    saveLocalStorageDb('recipes', [
      {
        id: 'rec_1',
        title: 'Green Goddess Smoothie',
        cookingTime: 5,
        calories: 180,
        difficulty: 'Easy',
        servings: 1,
        cuisine: 'Healthy',
        category: 'Breakfast',
        image: 'https://images.unsplash.com/photo-1610970881699-44a55b4cfd87?auto=format&fit=crop&w=400&q=80',
        ingredients: [
          { name: 'Spinach', amount: '2 cups', category: 'Vegetables' },
          { name: 'Banana', amount: '1', category: 'Fruits' },
          { name: 'Almond Milk', amount: '1 cup', category: 'Dairy' }
        ],
        steps: [
          'Wash spinach thoroughly.',
          'Peel banana and cut it into pieces.',
          'Add spinach, banana, and almond milk into the blender.',
          'Blend on high speed until completely smooth.',
          'Pour into a glass and serve cold.'
        ],
        nutrition: { carbs: '28g', protein: '4g', fat: '3g' },
        wasteImpact: 'Reduces overripe banana waste!'
      },
      {
        id: 'rec_2',
        title: 'Creamy Garlic Tomato Pasta',
        cookingTime: 20,
        calories: 450,
        difficulty: 'Medium',
        servings: 2,
        cuisine: 'Italian',
        category: 'Dinner',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
        ingredients: [
          { name: 'Pasta', amount: '200g', category: 'Grains & Pasta' },
          { name: 'Tomato', amount: '4 medium', category: 'Vegetables' },
          { name: 'Garlic', amount: '3 cloves', category: 'Spices' },
          { name: 'Cream', amount: '1/2 cup', category: 'Dairy' }
        ],
        steps: [
          'Boil pasta according to package instructions.',
          'Finely mince garlic and chop tomatoes.',
          'Sauté garlic in a pan with olive oil until fragrant, then add chopped tomatoes.',
          'Simmer tomatoes for 10 minutes until soft. Stir in the cream.',
          'Drain pasta, mix into the sauce, season with salt and pepper, and serve.'
        ],
        nutrition: { carbs: '65g', protein: '12g', fat: '15g' },
        wasteImpact: 'Perfect for using up soft tomatoes!'
      },
      {
        id: 'rec_3',
        title: 'Crispy Garlic Broccolini',
        cookingTime: 15,
        calories: 120,
        difficulty: 'Easy',
        servings: 2,
        cuisine: 'Asian',
        category: 'Lunch',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        ingredients: [
          { name: 'Broccoli', amount: '300g', category: 'Vegetables' },
          { name: 'Garlic', amount: '4 cloves', category: 'Spices' },
          { name: 'Soy Sauce', amount: '2 tbsp', category: 'Spices' }
        ],
        steps: [
          'Cut broccoli into medium-sized florets.',
          'Steam broccoli for 3 minutes until tender-crisp.',
          'Heat a pan with sesame oil and fry minced garlic until golden.',
          'Add broccoli and soy sauce, toss on high heat for 2 minutes, and enjoy.'
        ],
        nutrition: { carbs: '8g', protein: '3g', fat: '5g' },
        wasteImpact: 'Utilizes broccoli stalks that are usually discarded.'
      },
      {
        id: 'rec_4',
        title: 'Avocado Sourdough Toast',
        cookingTime: 8,
        calories: 290,
        difficulty: 'Easy',
        servings: 1,
        cuisine: 'Healthy',
        category: 'Breakfast',
        image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=400&q=80',
        ingredients: [
          { name: 'Avocado', amount: '1', category: 'Fruits' },
          { name: 'Bread', amount: '2 slices', category: 'Grains & Pasta' },
          { name: 'Tomato', amount: '1 small', category: 'Vegetables' }
        ],
        steps: [
          'Toast the sourdough bread slices until golden brown.',
          'Mash avocado in a bowl with a pinch of salt and pepper.',
          'Spread mashed avocado evenly over the toasted bread.',
          'Slice tomatoes and place them on top. Garnish with red pepper flakes.'
        ],
        nutrition: { carbs: '32g', protein: '8g', fat: '14g' },
        wasteImpact: 'Great way to use up soft avocados!'
      },
      {
        id: 'rec_5',
        title: 'Honey Garlic Glazed Salmon',
        cookingTime: 18,
        calories: 420,
        difficulty: 'Medium',
        servings: 2,
        cuisine: 'Healthy',
        category: 'Dinner',
        image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=400&q=80',
        ingredients: [
          { name: 'Salmon', amount: '2 fillets', category: 'Meat' },
          { name: 'Garlic', amount: '3 cloves', category: 'Spices' },
          { name: 'Soy Sauce', amount: '3 tbsp', category: 'Spices' }
        ],
        steps: [
          'Season salmon fillets with salt and black pepper.',
          'Heat olive oil in a pan and sear salmon on both sides for 4 minutes.',
          'Add minced garlic, soy sauce, and a teaspoon of honey to the pan.',
          'Spoon the glaze over salmon and cook for another 3 minutes until flaky.'
        ],
        nutrition: { carbs: '12g', protein: '34g', fat: '22g' },
        wasteImpact: 'Uses standard pantry spices and honey glaze.'
      },
      {
        id: 'rec_6',
        title: 'Feta Berry Spinach Salad',
        cookingTime: 10,
        calories: 210,
        difficulty: 'Easy',
        servings: 2,
        cuisine: 'Healthy',
        category: 'Lunch',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
        ingredients: [
          { name: 'Spinach', amount: '4 cups', category: 'Vegetables' },
          { name: 'Feta Cheese', amount: '50g', category: 'Dairy' },
          { name: 'Blueberries', amount: '1/2 cup', category: 'Fruits' }
        ],
        steps: [
          'Wash spinach thoroughly and spin dry.',
          'Toss spinach leaves, blueberries, and crumbled feta cheese in a large salad bowl.',
          'Drizzle with olive oil and a dash of balsamic vinegar, toss gently, and serve.'
        ],
        nutrition: { carbs: '15g', protein: '5g', fat: '14g' },
        wasteImpact: 'Perfect for using up excess berries or cheese leftovers.'
      }
    ]);

    // 3. User activity logs
    saveLocalStorageDb('activityLogs', [
      { id: '1', type: 'system', message: 'Welcome to SaveBite! Complete your pantry setup.', time: new Date(Date.now() - 3600000).toISOString() }
    ]);

    localStorage.setItem('savebite_db_seeded', 'true');
  }
};

if (isSimulationMode) {
  seedSimulationDatabase();
}

// ----------------- GENERIC DB OPERATIONS HELPER -----------------

// 1. Fetch collection with optional filters
export const getDocuments = async (collectionName, filters = [], orderByField = null, orderDir = 'asc', limitVal = null) => {
  if (isSimulationMode) {
    let items = getLocalStorageDb(collectionName);
    
    // Apply local filters
    filters.forEach(({ field, operator, value }) => {
      items = items.filter(item => {
        const itemVal = item[field];
        if (operator === '==' || operator === '===') return itemVal === value;
        if (operator === '!=') return itemVal !== value;
        if (operator === '>') return itemVal > value;
        if (operator === '>=') return itemVal >= value;
        if (operator === '<') return itemVal < value;
        if (operator === '<=') return itemVal <= value;
        if (operator === 'array-contains') return Array.isArray(itemVal) && itemVal.includes(value);
        return true;
      });
    });

    // Apply Sorting
    if (orderByField) {
      items.sort((a, b) => {
        if (a[orderByField] < b[orderByField]) return orderDir === 'asc' ? -1 : 1;
        if (a[orderByField] > b[orderByField]) return orderDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply Limit
    if (limitVal) {
      items = items.slice(0, limitVal);
    }

    return items;
  } else {
    try {
      const colRef = collection(db, collectionName);
      const queryConstraints = [];
      
      filters.forEach(({ field, operator, value }) => {
        queryConstraints.push(where(field, operator, value));
      });
      
      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, orderDir));
      }
      
      if (limitVal) {
        queryConstraints.push(limit(limitVal));
      }

      const q = query(colRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error(`Error loading documents from collection ${collectionName}:`, error);
      throw error;
    }
  }
};

// 2. Add document
export const addDocument = async (collectionName, data) => {
  if (isSimulationMode) {
    const items = getLocalStorageDb(collectionName);
    const newDoc = {
      id: 'doc_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...data
    };
    items.push(newDoc);
    saveLocalStorageDb(collectionName, items);
    
    // Add activity log silently for tracking
    if (collectionName !== 'activityLogs') {
      await addDocument('activityLogs', {
        type: 'create',
        message: `Added new item to ${collectionName}: ${data.name || data.title || 'unnamed'}`,
        time: new Date().toISOString()
      });
    }

    return newDoc;
  } else {
    try {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, {
        createdAt: new Date().toISOString(),
        ...data
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error adding document to collection ${collectionName}:`, error);
      throw error;
    }
  }
};

// 3. Update document
export const updateDocument = async (collectionName, docId, data) => {
  if (isSimulationMode) {
    const items = getLocalStorageDb(collectionName);
    const index = items.findIndex(item => item.id === docId);
    if (index === -1) throw new Error('Document not found');
    
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    saveLocalStorageDb(collectionName, items);

    if (collectionName !== 'activityLogs') {
      await addDocument('activityLogs', {
        type: 'update',
        message: `Updated item in ${collectionName}: ${data.name || items[index].name || items[index].title || docId}`,
        time: new Date().toISOString()
      });
    }
    
    return items[index];
  } else {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        updatedAt: new Date().toISOString(),
        ...data
      });
      return { id: docId, ...data };
    } catch (error) {
      console.error(`Error updating document in collection ${collectionName}:`, error);
      throw error;
    }
  }
};

// 4. Delete document
export const deleteDocument = async (collectionName, docId) => {
  if (isSimulationMode) {
    const items = getLocalStorageDb(collectionName);
    const index = items.findIndex(item => item.id === docId);
    if (index === -1) throw new Error('Document not found');
    
    const deletedItem = items[index];
    const updatedItems = items.filter(item => item.id !== docId);
    saveLocalStorageDb(collectionName, updatedItems);

    if (collectionName !== 'activityLogs') {
      await addDocument('activityLogs', {
        type: 'delete',
        message: `Removed item from ${collectionName}: ${deletedItem.name || deletedItem.title || docId}`,
        time: new Date().toISOString()
      });
    }

    return true;
  } else {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document in collection ${collectionName}:`, error);
      throw error;
    }
  }
};

// 5. Query details of single document
export const getDocumentById = async (collectionName, docId) => {
  if (isSimulationMode) {
    const items = getLocalStorageDb(collectionName);
    const docItem = items.find(item => item.id === docId);
    return docItem || null;
  } else {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error loading document with ID ${docId}:`, error);
      throw error;
    }
  }
};
