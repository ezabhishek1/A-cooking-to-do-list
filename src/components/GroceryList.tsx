import React from 'react';
import { ArrowLeftRight, Check, ShoppingBag } from 'lucide-react';
import type { GroceryItem, SubstitutionItem } from '../utils/gemini';

interface GroceryListProps {
  groceries: GroceryItem[];
  substitutions: SubstitutionItem[];
  swappedItems: Record<string, { originalName: string; originalCost: number }>;
  onToggleCheck: (name: string) => void;
  checkedItems: Record<string, boolean>;
  onSwapItem: (originalName: string, swapName: string, swapCost: number) => void;
  onRestoreItem: (swappedName: string) => void;
}

export const GroceryList: React.FC<GroceryListProps> = ({
  groceries,
  substitutions,
  swappedItems,
  onToggleCheck,
  checkedItems,
  onSwapItem,
  onRestoreItem,
}) => {
  // Group groceries by category
  const categories: Record<string, GroceryItem[]> = {};
  groceries.forEach(item => {
    const cat = item.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(item);
  });

  // Find if a swap exists for an item
  const findSwap = (itemName: string): SubstitutionItem | undefined => {
    // Clean strings to improve match
    const clean = (s: string) => s.toLowerCase().trim();
    return substitutions.find(sub => 
      clean(sub.originalItem) === clean(itemName) || 
      clean(itemName).includes(clean(sub.originalItem)) ||
      clean(sub.originalItem).includes(clean(itemName))
    );
  };

  return (
    <div className="grocery-layout fade-in">
      <div className="grocery-groups-grid">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="grocery-category-card glass-panel">
            <h4 className="category-title serif-title">
              <ShoppingBag size={18} />
              <span>{category}</span>
            </h4>
            
            <div className="grocery-items-list">
              {items.map(item => {
                const isChecked = !!checkedItems[item.name];
                const swapInfo = findSwap(item.name);
                const isSwapped = !!swappedItems[item.name];

                return (
                  <div key={item.name} className="grocery-item-row">
                    <div className="grocery-item-left">
                      <div 
                        className={`grocery-checkbox ${isChecked ? 'checked' : ''}`}
                        onClick={() => onToggleCheck(item.name)}
                      >
                        {isChecked && <Check size={12} />}
                      </div>
                      
                      <div>
                        <span className={`grocery-name ${isChecked ? 'checked' : ''}`}>
                          {item.name}
                        </span>
                        <span className="grocery-qty">{item.quantity}</span>
                        
                        {isSwapped && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-sage)', marginTop: '2px', fontWeight: 500 }}>
                            Swapped (saved ${(swappedItems[item.name].originalCost - item.estimatedCost).toFixed(2)})
                            <button 
                              className="btn-text" 
                              style={{ marginLeft: '6px', fontSize: '0.75rem' }}
                              onClick={() => onRestoreItem(item.name)}
                            >
                              Undo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grocery-item-right">
                      <span className="grocery-price">${item.estimatedCost.toFixed(2)}</span>
                      
                      {swapInfo && !isSwapped && (
                        <button 
                          className="swap-btn"
                          title={`Swap for cheaper alternative: ${swapInfo.cheaperSwap} ($${swapInfo.swapEstimatedCost.toFixed(2)})`}
                          onClick={() => onSwapItem(item.name, swapInfo.cheaperSwap, swapInfo.swapEstimatedCost)}
                        >
                          <ArrowLeftRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
