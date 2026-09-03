const database = {
  categories: [
    { id: 'category_1', name: 'Vegetables', icon: 'vegetable', color: '#81C784' },
    { id: 'category_2', name: 'Fruits', icon: 'fruit', color: '#FF8A80' },
    { id: 'category_3', name: 'Dairy', icon: 'dairy', color: '#FFF59D' },
    { id: 'category_4', name: 'Meat', icon: 'meat', color: '#FFAB91' },
    { id: 'category_5', name: 'Frozen', icon: 'frozen', color: '#90CAF9' },
    { id: 'category_6', name: 'Snacks', icon: 'snacks', color: '#B39DDB' },
    { id: 'category_7', name: 'Spices', icon: 'spices', color: '#FFCC80' },
    { id: 'category_8', name: 'Grains & Pasta', icon: 'grains', color: '#FFE082' }
  ],
  recipes: [
    {
      id: 'recipe_1', title: 'Green Goddess Smoothie', cookingTime: 5, calories: 180,
      difficulty: 'Easy', servings: 1, cuisine: 'Healthy', category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1610970881699-44a55b4cfd87?auto=format&fit=crop&w=400&q=80',
      ingredients: [{ name: 'Spinach', amount: '2 cups', category: 'Vegetables' }, { name: 'Banana', amount: '1', category: 'Fruits' }],
      steps: ['Wash the spinach.', 'Add all ingredients to a blender.', 'Blend until smooth.'],
      nutrition: { carbs: '28g', protein: '4g', fat: '3g' }
    },
    {
      id: 'recipe_2', title: 'Creamy Garlic Tomato Pasta', cookingTime: 20, calories: 450,
      difficulty: 'Medium', servings: 2, cuisine: 'Italian', category: 'Dinner',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
      ingredients: [{ name: 'Pasta', amount: '200g', category: 'Grains & Pasta' }, { name: 'Tomato', amount: '4 medium', category: 'Vegetables' }, { name: 'Garlic', amount: '3 cloves', category: 'Spices' }],
      steps: ['Boil the pasta.', 'Saute garlic and tomatoes.', 'Combine with pasta and serve.'],
      nutrition: { carbs: '65g', protein: '12g', fat: '15g' }
    },
    {
      id: 'recipe_3', title: 'Crispy Garlic Broccolini', cookingTime: 15, calories: 120,
      difficulty: 'Easy', servings: 2, cuisine: 'Asian', category: 'Lunch',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      ingredients: [{ name: 'Broccoli', amount: '300g', category: 'Vegetables' }, { name: 'Garlic', amount: '4 cloves', category: 'Spices' }],
      steps: ['Steam the broccoli.', 'Fry the garlic until golden.', 'Toss together and serve.'],
      nutrition: { carbs: '8g', protein: '3g', fat: '5g' }
    }
  ],
  ingredients: [], shoppingLists: [], mealPlans: [], favorites: [], notifications: [],
  activityLogs: [{ id: 'activity_1', type: 'system', message: 'Welcome to SaveBite! Complete your pantry setup.', time: new Date().toISOString() }]
};

const createId = () => `doc_${Math.random().toString(36).slice(2, 11)}`;

const matchesFilter = (item, { field, operator, value }) => {
  const itemValue = item[field];
  if (operator === '==' || operator === '===') return itemValue === value;
  if (operator === '!=') return itemValue !== value;
  if (operator === '>') return itemValue > value;
  if (operator === '>=') return itemValue >= value;
  if (operator === '<') return itemValue < value;
  if (operator === '<=') return itemValue <= value;
  if (operator === 'array-contains') return Array.isArray(itemValue) && itemValue.includes(value);
  return true;
};

export const getDocuments = async (collectionName, filters = [], orderByField = null, orderDir = 'asc', limitVal = null) => {
  let items = [...(database[collectionName] || [])];
  filters.forEach(filter => {
    items = items.filter(item => matchesFilter(item, filter));
  });
  if (orderByField) {
    items.sort((first, second) => {
      if (first[orderByField] === second[orderByField]) return 0;
      const result = first[orderByField] < second[orderByField] ? -1 : 1;
      return orderDir === 'asc' ? result : -result;
    });
  }
  return limitVal ? items.slice(0, limitVal) : items;
};

export const addDocument = async (collectionName, data) => {
  const item = { id: createId(), createdAt: new Date().toISOString(), ...data };
  if (!database[collectionName]) database[collectionName] = [];
  database[collectionName].push(item);
  if (collectionName !== 'activityLogs') {
    database.activityLogs.unshift({
      id: createId(), type: 'create',
      message: `Added new item to ${collectionName}: ${data.name || data.title || 'unnamed'}`,
      time: new Date().toISOString()
    });
  }
  return item;
};

export const updateDocument = async (collectionName, docId, data) => {
  const items = database[collectionName] || [];
  const index = items.findIndex(item => item.id === docId);
  if (index === -1) throw new Error('Document not found');
  items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
  return items[index];
};

export const deleteDocument = async (collectionName, docId) => {
  const items = database[collectionName] || [];
  const index = items.findIndex(item => item.id === docId);
  if (index === -1) throw new Error('Document not found');
  items.splice(index, 1);
  return true;
};

export const getDocumentById = async (collectionName, docId) => {
  return (database[collectionName] || []).find(item => item.id === docId) || null;
};
