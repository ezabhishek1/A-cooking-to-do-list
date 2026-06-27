import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface BudgetHealthBarProps {
  currentCost: number;
  targetBudget: number;
}

export const BudgetHealthBar: React.FC<BudgetHealthBarProps> = ({ currentCost, targetBudget }) => {
  const percentage = targetBudget > 0 ? (currentCost / targetBudget) * 100 : 0;
  const isOver = currentCost > targetBudget;
  const isClose = !isOver && percentage >= 80;

  let colorClass = 'green';
  let warningClass = 'warning-green';
  let message = 'Your meal plan is fully within budget!';
  let Icon = CheckCircle;

  if (isOver) {
    colorClass = 'red';
    warningClass = 'warning-red';
    message = `Over budget by $${(currentCost - targetBudget).toFixed(2)}! Try swapping ingredients for cheaper alternatives.`;
    Icon = AlertTriangle;
  } else if (isClose) {
    colorClass = 'yellow';
    warningClass = 'warning-yellow';
    message = `Approaching your budget limit (remaining: $${(targetBudget - currentCost).toFixed(2)}).`;
    Icon = Info;
  }

  // Cap percentage at 100% for bar filling
  const displayPercentage = Math.min(percentage, 100);

  return (
    <div className="budget-bar-card glass-panel fade-in">
      <div className="budget-stats">
        <span>Daily Cost: <strong style={{ color: isOver ? 'var(--color-burgundy)' : 'inherit' }}>${currentCost.toFixed(2)}</strong></span>
        <span>Budget Goal: <strong>${targetBudget.toFixed(2)}</strong></span>
      </div>
      
      <div className="budget-progress-track">
        <div 
          className={`budget-progress-fill ${colorClass}`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>

      <div className={`budget-warning ${warningClass}`}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
    </div>
  );
};
