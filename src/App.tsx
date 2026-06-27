import { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Key, 
  Coffee, 
  UtensilsCrossed, 
  ListTodo, 
  ShoppingBag, 
  RefreshCw, 
  LogOut,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { generateMealPlan } from './utils/gemini';
import type { GeminiMealPlanResponse, GroceryItem } from './utils/gemini';
import { MealPlanCard } from './components/MealPlanCard';
import { TodoCard } from './components/TodoCard';
import { GroceryList } from './components/GroceryList';
import { BudgetHealthBar } from './components/BudgetHealthBar';
import { Substitutions } from './components/Substitutions';
import { GEMINI_API_KEY } from './config';
import './App.css';

function App() {
  // Authentication & API Key state
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');

  // User input states
  const [availableTime, setAvailableTime] = useState<string>('45 minutes');
  const [dietary, setDietary] = useState<string>('');
  const [targetBudget, setTargetBudget] = useState<number>(20);

  // App UI & Generation states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeminiMealPlanResponse | null>(null);
  
  // Dynamic Swapping & Checklist States
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [swappedItems, setSwappedItems] = useState<Record<string, { originalName: string; originalCost: number }>>({});
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'meals' | 'todo' | 'groceries'>('meals');

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);

  // Load API Key on mount (check config first, then localStorage)
  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (GEMINI_API_KEY) {
      setApiKey(GEMINI_API_KEY);
      setKeyInput(GEMINI_API_KEY);
      setIsKeySaved(true);
    } else if (savedKey) {
      setApiKey(savedKey);
      setKeyInput(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    localStorage.setItem('GEMINI_API_KEY', keyInput);
    setApiKey(keyInput);
    setIsKeySaved(true);
    showToast('Gemini API Key saved successfully!');
  };

  const handleClearKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    setKeyInput('');
    setIsKeySaved(false);
    showToast('API Key cleared.');
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Please set a valid Gemini API Key first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await generateMealPlan(apiKey, availableTime, dietary, targetBudget);
      setResult(data);
      setGroceries(data.groceries);
      setSwappedItems({});
      setCheckedGroceries({});
      setActiveTab('meals');
      showToast('Meal plan and tasks generated!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while connecting to the Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Grocery Swapping Logic
  const handleSwapItem = (originalName: string, swapName: string, swapCost: number) => {
    // 1. Update the grocery item cost and name
    setGroceries(prev => 
      prev.map(item => {
        if (item.name.toLowerCase() === originalName.toLowerCase()) {
          // Record the swap
          setSwappedItems(swaps => ({
            ...swaps,
            [swapName]: { originalName: item.name, originalCost: item.estimatedCost }
          }));
          return {
            ...item,
            name: swapName,
            estimatedCost: swapCost
          };
        }
        return item;
      })
    );
    showToast(`Swapped ${originalName} with ${swapName}!`);
  };

  const handleRestoreItem = (swappedName: string) => {
    const swapDetails = swappedItems[swappedName];
    if (!swapDetails) return;

    setGroceries(prev => 
      prev.map(item => {
        if (item.name === swappedName) {
          // Remove from swaps record
          setSwappedItems(swaps => {
            const next = { ...swaps };
            delete next[swappedName];
            return next;
          });
          return {
            ...item,
            name: swapDetails.originalName,
            estimatedCost: swapDetails.originalCost
          };
        }
        return item;
      })
    );
    showToast(`Restored original item: ${swapDetails.originalName}`);
  };

  const handleToggleGroceryCheck = (name: string) => {
    setCheckedGroceries(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Calculate current cost dynamically based on active swapped state
  const totalGroceryCost = groceries.reduce((sum, item) => sum + item.estimatedCost, 0);

  // Common diets for quick input selection
  const commonDiets = [
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Gluten-Free', value: 'Gluten-Free' },
    { label: 'Low Carb', value: 'Low Carb/Keto' },
    { label: 'High Protein', value: 'High Protein' },
    { label: 'None', value: '' }
  ];

  return (
    <div className="app-container">
      {/* Toast alert */}
      {toast && (
        <div className="toast-msg fade-in">
          <Sparkles size={18} style={{ color: 'var(--color-saffron)' }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Elegant Header Banner */}
      <header className="app-header glass-panel">
        <div className="app-branding">
          <ChefHat size={36} style={{ color: 'var(--color-copper)' }} />
          <div>
            <h1 className="serif-title">Cozy Culinary</h1>
            <p>Your personalized, budget-smart cooking advisor</p>
          </div>
        </div>
        <div>
          {isKeySaved ? (
            <div className="api-key-badge">
              <Key size={14} />
              <span>Gemini API Active</span>
              <button 
                onClick={handleClearKey}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', color: 'inherit', marginLeft: '6px' }}
                title="Sign out / Clear key"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <div className="api-key-badge missing">
              <AlertTriangle size={14} />
              <span>API Key Required</span>
            </div>
          )}
        </div>
      </header>

      {/* Screen 1: Key setup if not configured */}
      {!isKeySaved ? (
        <div className="setup-container glass-panel fade-in">
          <div className="setup-logo">
            <ChefHat size={48} />
          </div>
          <h2 className="serif-title setup-title">Welcome to Cozy Culinary</h2>
          <p className="setup-desc">
            To start planning daily meals, organizing custom timelines, and calculating grocery budgets with Gemini AI, configure a Google Gemini API Key. The key is stored locally in your browser.
          </p>
          <form onSubmit={handleSaveKey} className="setup-form">
            <label className="form-label">Google Gemini API Key</label>
            <input 
              type="password" 
              className="input-glow"
              placeholder="AIzaSy..." 
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              required
            />
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="api-link"
            >
              Get a free API Key from Google AI Studio &rarr;
            </a>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
              <Key size={18} />
              <span>Configure Workspace</span>
            </button>
          </form>
        </div>
      ) : (
        /* Screen 2: Main Workspace dashboard */
        <div className="dashboard-grid fade-in">
          {/* Inputs Sidebar */}
          <aside className="input-sidebar glass-panel">
            <h3 className="serif-title sidebar-title">
              <ChefHat size={20} />
              <span>Daily Cooking Constraints</span>
            </h3>

            <div className="input-group">
              <label className="form-label">Available Prep/Cooking Time</label>
              <select 
                className="input-glow"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
              >
                <option value="15-20 minutes">15 - 20 mins (Super Fast)</option>
                <option value="30 minutes">30 mins (Quick)</option>
                <option value="45 minutes">45 mins (Balanced)</option>
                <option value="60 minutes">60 mins (Standard)</option>
                <option value="90+ minutes">90+ mins (Lazy Sunday)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="form-label">Target Daily Budget ($ USD)</label>
              <input 
                type="number"
                min="5"
                max="200"
                className="input-glow"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label className="form-label">Dietary Preferences</label>
              <div className="diet-select-grid">
                {commonDiets.slice(0, 5).map(diet => (
                  <div 
                    key={diet.value}
                    className={`diet-chip ${dietary === diet.value ? 'selected' : ''}`}
                    onClick={() => setDietary(diet.value)}
                  >
                    {diet.label}
                  </div>
                ))}
              </div>
              <input 
                type="text"
                placeholder="Or custom: keto, no nuts, high fiber..."
                className="input-glow"
                style={{ marginTop: '8px' }}
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>Curating Recipes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Custom Day Plan</span>
                </>
              )}
            </button>
          </aside>

          {/* Core outputs display panel */}
          <main className="results-container">
            {isLoading && (
              <div className="loading-card glass-panel fade-in">
                <div className="spinner"></div>
                <h3 className="serif-title">Organizing Culinary Schedule</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                  Consulting Gemini to design healthy meal suggestions, tabulate grocery items, and balance the budget constraint...
                </p>
              </div>
            )}

            {error && (
              <div className="glass-panel fade-in" style={{ padding: '2rem', borderLeft: '5px solid var(--color-burgundy)' }}>
                <h3 className="serif-title" style={{ color: 'var(--color-burgundy)', marginTop: 0 }}>Workspace Connection Issue</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={handleGenerate}>
                    <RefreshCw size={16} />
                    <span>Try Again</span>
                  </button>
                  <button className="btn-secondary" onClick={handleClearKey}>
                    Update API Key
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && !result && (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <UtensilsCrossed size={48} style={{ color: 'var(--color-copper)', opacity: 0.3, marginBottom: '1rem' }} />
                <h3 className="serif-title" style={{ fontSize: '1.5rem', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Plan Formulated Yet</h3>
                <p style={{ maxWidth: '450px', margin: '0 auto' }}>
                  Choose your available time, target budget, and dietary preferences on the left sidebar to build a custom cooking to-do list.
                </p>
              </div>
            )}

            {!isLoading && !error && result && (
              <>
                {/* Visual Budget Health Bar (Sticky Top) */}
                <BudgetHealthBar currentCost={totalGroceryCost} targetBudget={targetBudget} />

                {/* Main Action Tabs */}
                <div className="results-tabs">
                  <button 
                    className={`tab-btn ${activeTab === 'meals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('meals')}
                  >
                    <Coffee size={16} />
                    <span>Meals Plan</span>
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'todo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('todo')}
                  >
                    <ListTodo size={16} />
                    <span>Cooking To-Do List</span>
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'groceries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('groceries')}
                  >
                    <ShoppingBag size={16} />
                    <span>Grocery Shopping List</span>
                  </button>
                </div>

                {/* Tab Outputs */}
                <div className="tab-content">
                  {activeTab === 'meals' && (
                    <MealPlanCard mealPlan={result.meals} />
                  )}

                  {activeTab === 'todo' && (
                    <TodoCard tasks={result.todoTasks} />
                  )}

                  {activeTab === 'groceries' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <GroceryList 
                        groceries={groceries}
                        substitutions={result.substitutions}
                        swappedItems={swappedItems}
                        checkedItems={checkedGroceries}
                        onToggleCheck={handleToggleGroceryCheck}
                        onSwapItem={handleSwapItem}
                        onRestoreItem={handleRestoreItem}
                      />
                      
                      <Substitutions 
                        substitutions={result.substitutions}
                        swappedItems={swappedItems}
                        onSwapItem={handleSwapItem}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
