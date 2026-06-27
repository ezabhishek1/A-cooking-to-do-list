import React from 'react';
import { ArrowLeftRight, CheckCircle } from 'lucide-react';
import type { SubstitutionItem } from '../utils/gemini';

interface SubstitutionsProps {
  substitutions: SubstitutionItem[];
  swappedItems: Record<string, { originalName: string; originalCost: number }>;
  onSwapItem: (originalName: string, swapName: string, swapCost: number) => void;
}

export const Substitutions: React.FC<SubstitutionsProps> = ({
  substitutions,
  swappedItems,
  onSwapItem,
}) => {
  // Check if a specific swap is currently applied
  const isApplied = (originalName: string) => {
    // Find if the swappedItems map contains a key corresponding to this swap
    return Object.values(swappedItems).some(
      item => item.originalName.toLowerCase().trim() === originalName.toLowerCase().trim()
    );
  };

  return (
    <div className="substitutions-card glass-panel fade-in">
      <h3 className="serif-title" style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowLeftRight size={22} />
        <span>Smart Ingredient Swaps & Explanations</span>
      </h3>

      {substitutions.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No substitutions suggested for these ingredients.</p>
      ) : (
        <div className="subs-list">
          {substitutions.map((sub, idx) => {
            const applied = isApplied(sub.originalItem);
            // Let's find original cost if we want to show it. Actually we don't have it directly here, but we know it's a cheaper swap!

            return (
              <div key={idx} className="sub-item-card" style={{ borderLeft: applied ? '4px solid var(--color-sage)' : '4px solid var(--color-saffron)' }}>
                <div className="sub-header">
                  <span>{sub.originalItem}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>&rarr;</span>
                  <span style={{ color: 'var(--color-copper)' }}>{sub.cheaperSwap}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Swap Price: <strong>${sub.swapEstimatedCost.toFixed(2)}</strong>
                  </span>
                  
                  {applied ? (
                    <span style={{ color: 'var(--color-sage)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <CheckCircle size={14} /> Applied
                    </span>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => onSwapItem(sub.originalItem, sub.cheaperSwap, sub.swapEstimatedCost)}
                    >
                      Swap Ingredient
                    </button>
                  )}
                </div>

                <p className="sub-desc">{sub.reason}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
