import React, { useState } from 'react';
import { usePantry } from '../../context/PantryContext';
import { getUsers, deleteUser } from '../../services/firebase/auth';
import { 
  IoStatsChartOutline, IoPeopleOutline, IoRestaurantOutline, 
  IoGridOutline, IoTrashOutline
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Admin = () => {
  const { 
    recipes, 
    categories, 
    addMasterRecipe, 
    deleteMasterRecipe 
  } = usePantry();

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users, recipes, categories

  // Master Recipe form fields
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Breakfast');
  const [recipeCuisine, setRecipeCuisine] = useState('Healthy');
  const [recipeTime, setRecipeTime] = useState('');
  const [recipeCals, setRecipeCals] = useState('');
  const [recipeDifficulty, setRecipeDifficulty] = useState('Easy');
  const [recipeServings, setRecipeServings] = useState('1');
  const [recipeStepsText, setRecipeStepsText] = useState('');
  const [recipeIngsText, setRecipeIngsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulation Users
  const [simUsers, setSimUsers] = useState(getUsers());

  // Delete User (Simulation)
  const handleDeleteUser = (uid) => {
    if (window.confirm('Delete this user account?')) {
      const updated = simUsers.filter(u => u.uid !== uid);
      setSimUsers(updated);
      deleteUser(uid);
      alert('User deleted.');
    }
  };

  // Add Master Recipe submit
  const handleAddRecipeSubmit = async (e) => {
    e.preventDefault();
    if (!recipeTitle || !recipeTime || !recipeIngsText) return;

    setIsSubmitting(true);
    try {
      // Parse ingredients text (e.g. Tomato, Spinach, Cheese)
      const parsedIngredients = recipeIngsText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',');
          return {
            name: parts[0]?.trim() || 'Ingredient',
            amount: parts[1]?.trim() || '1 unit',
            category: parts[2]?.trim() || 'Vegetables'
          };
        });

      // Parse steps text
      const parsedSteps = recipeStepsText
        .split('\n')
        .map(step => step.trim())
        .filter(step => step);

      await addMasterRecipe({
        title: recipeTitle,
        category: recipeCategory,
        cuisine: recipeCuisine,
        cookingTime: parseInt(recipeTime),
        calories: parseInt(recipeCals) || 250,
        difficulty: recipeDifficulty,
        servings: parseInt(recipeServings) || 1,
        ingredients: parsedIngredients,
        steps: parsedSteps,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        nutrition: { carbs: '30g', protein: '10g', fat: '5g' }
      });

      alert('New Master Recipe published successfully!');
      
      // Clear fields
      setRecipeTitle('');
      setRecipeTime('');
      setRecipeCals('');
      setRecipeIngsText('');
      setRecipeStepsText('');
    } catch (err) {
      console.error(err);
      alert('Failed to publish recipe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this master recipe?')) {
      await deleteMasterRecipe(recipeId);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-5xl mx-auto">
      
      {/* Tab Navigation header */}
      <Card className="border border-border/80 flex items-center justify-between p-4">
        <h3 className="font-display font-bold text-sm text-text-main flex items-center gap-1.5">
          <span>🛡️</span>
          <span>Admin Controls</span>
        </h3>
        
        <div className="flex border border-border bg-background/50 rounded-full p-1 text-xs">
          {[
            { id: 'analytics', label: 'Analytics', icon: IoStatsChartOutline },
            { id: 'users', label: 'Users', icon: IoPeopleOutline },
            { id: 'recipes', label: 'Recipes', icon: IoRestaurantOutline },
            { id: 'categories', label: 'Categories', icon: IoGridOutline }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer
                  ${activeTab === tab.id 
                    ? 'bg-primary text-white shadow-soft shadow-primary/10' 
                    : 'text-text-muted hover:text-text-main'}
                `}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 1. Analytics Dashboard Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border/80 text-center flex flex-col gap-2 p-5 bg-gradient-to-br from-card to-background/35">
            <span className="text-3xl font-bold font-display text-text-main">{simUsers.length}</span>
            <span className="text-xs text-text-muted">Total Registered Users</span>
          </Card>
          <Card className="border border-border/80 text-center flex flex-col gap-2 p-5 bg-gradient-to-br from-card to-background/35">
            <span className="text-3xl font-bold font-display text-text-main">{recipes.length}</span>
            <span className="text-xs text-text-muted">Master Recipes Indexed</span>
          </Card>
          <Card className="border border-border/80 text-center flex flex-col gap-2 p-5 bg-gradient-to-br from-card to-background/35">
            <span className="text-3xl font-bold font-display text-text-main">{categories.length}</span>
            <span className="text-xs text-text-muted">Inventory Categories</span>
          </Card>

          <Card className="md:col-span-3 border border-border/80 flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-text-main">Global Usage Performance Forecast</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              This analytics console tracks environmental metrics across active user scopes. Average waste savings are estimated at <b>3.4kg/household per week</b>, netting <b>18.2kg carbon offsets</b> monthly.
            </p>
          </Card>
        </div>
      )}

      {/* 2. User Index Tab */}
      {activeTab === 'users' && (
        <Card className="border border-border/80 overflow-hidden" noPadding>
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border/60 text-xs font-bold text-text-muted">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {simUsers.map(user => (
                <tr key={user.uid}>
                  <td className="p-4 font-bold text-text-main">{user.displayName || 'No Name'}</td>
                  <td className="p-4 text-text-muted text-xs font-semibold">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'success' : 'neutral'} size="sm">
                      {user.role?.toUpperCase() || 'USER'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="p-1.5 rounded-full hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                      disabled={user.email === 'admin@savebite.com'}
                      title="Remove User"
                    >
                      <IoTrashOutline className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 3. Recipes Management Tab */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Master Form */}
          <div className="lg:col-span-1">
            <Card className="border border-border/80 p-5 flex flex-col gap-4">
              <h4 className="font-display font-bold text-sm text-text-main pb-2 border-b border-border/50">
                Publish Master Recipe
              </h4>

              <form onSubmit={handleAddRecipeSubmit} className="flex flex-col gap-3">
                <Input
                  label="Recipe Title"
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                  placeholder="E.g., Cheesy Omelette"
                  required
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Cooking Time (min)"
                    type="number"
                    value={recipeTime}
                    onChange={(e) => setRecipeTime(e.target.value)}
                    placeholder="15"
                    required
                  />
                  <Input
                    label="Calories"
                    type="number"
                    value={recipeCals}
                    onChange={(e) => setRecipeCals(e.target.value)}
                    placeholder="250"
                  />
                </div>

                <div className="w-full flex flex-col gap-1.5 mb-2">
                  <label className="text-xs font-semibold text-text-muted">Meal Category</label>
                  <select
                    value={recipeCategory}
                    onChange={(e) => setRecipeCategory(e.target.value)}
                    className="w-full h-11 px-4 bg-card border border-border rounded-custom text-sm text-text-main focus:outline-none"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>

                <Input
                  label="Ingredients (Format: Name,Qty,Category)"
                  type="textarea"
                  value={recipeIngsText}
                  onChange={(e) => setRecipeIngsText(e.target.value)}
                  placeholder="Eggs,2 pcs,Dairy&#10;Cheese,50g,Dairy"
                  rows={3}
                  helperText="One ingredient per line, comma separated."
                  required
                />

                <Input
                  label="Cooking Instructions"
                  type="textarea"
                  value={recipeStepsText}
                  onChange={(e) => setRecipeStepsText(e.target.value)}
                  placeholder="Whisk eggs.&#10;Fry in butter."
                  rows={3}
                  helperText="One instruction step per line."
                  required
                />

                <Button type="submit" isLoading={isSubmitting} variant="primary" size="md" className="w-full mt-2">
                  Publish Recipe
                </Button>
              </form>
            </Card>
          </div>

          {/* Master List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-text-main border-b border-border/60 pb-3">
              Recipe Directory
            </h4>
            
            <div className="flex flex-col gap-3">
              {recipes.map(recipe => (
                <Card key={recipe.id} className="border border-border/60 p-4" noPadding>
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={recipe.image} alt={recipe.title} className="w-12 h-12 rounded object-cover" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-main">{recipe.title}</span>
                        <span className="text-[10px] text-text-muted mt-0.5">{recipe.category} • {recipe.cookingTime} mins</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="p-2 rounded-full hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                      title="Delete recipe"
                    >
                      <IoTrashOutline className="text-base" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Categories management */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-text-main border-b border-border/60 pb-3">
              Categories Catalog
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <Card key={cat.id} className="border border-border/70 flex items-center gap-3 p-3">
                  <span className="text-xl bg-background p-2 rounded-full">{cat.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-main">{cat.name}</span>
                    <span className="text-[9px] text-text-muted mt-0.5">Color code: {cat.color}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border border-border/80 p-5 flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-text-main pb-2 border-b border-border/50">
              Create New Category
            </h4>
            <p className="text-xs text-text-muted">Category management is locked to default values in this local dashboard version.</p>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Admin;
