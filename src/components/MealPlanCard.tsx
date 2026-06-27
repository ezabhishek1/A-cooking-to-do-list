import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Coffee, Sun, Moon } from 'lucide-react';
import type { MealPlan, MealDetail } from '../utils/gemini';

interface MealPlanCardProps {
  mealPlan: MealPlan;
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({ mealPlan }) => {
  return (
    <div className="meals-grid fade-in">
      <MealItemCard type="breakfast" meal={mealPlan.breakfast} />
      <MealItemCard type="lunch" meal={mealPlan.lunch} />
      <MealItemCard type="dinner" meal={mealPlan.dinner} />
    </div>
  );
};

interface MealItemCardProps {
  type: 'breakfast' | 'lunch' | 'dinner';
  meal: MealDetail;
}

const MealItemCard: React.FC<MealItemCardProps> = ({ type, meal }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getMealTypeDetails = () => {
    switch (type) {
      case 'breakfast':
        return { label: 'Breakfast', icon: <Coffee size={18} />, badgeClass: 'breakfast' };
      case 'lunch':
        return { label: 'Lunch', icon: <Sun size={18} />, badgeClass: 'lunch' };
      case 'dinner':
        return { label: 'Dinner', icon: <Moon size={18} />, badgeClass: 'dinner' };
    }
  };

  const { label, icon, badgeClass } = getMealTypeDetails();

  return (
    <div className="meal-card glass-panel">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className={`meal-badge ${badgeClass}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', width: '100%' }}>
          {icon}
          <span>{label}</span>
        </div>
      </div>
      
      <div className="meal-info">
        <h3 className="serif-title" style={{ color: 'var(--text-primary)' }}>{meal.name}</h3>
        
        <div className="meal-meta">
          <Clock size={14} />
          <span>Active Prep Time: {meal.prepTime}</span>
        </div>
        
        <div>
          <button 
            className="meal-steps-toggle"
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span>{isOpen ? 'Hide Instructions' : 'View Instructions'}</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {isOpen && (
          <ol className="meal-instructions fade-in">
            {meal.instructions.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};
