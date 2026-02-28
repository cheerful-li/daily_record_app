import type { Habit } from '../services/database';

// 返回统一的中性色调类名
export const getHabitColor = (habit: Habit): {
  border: string,
  accent: string,
  light: string,
  text: string
} => {
  // 使用统一的中性色调
  return {
    border: 'border-slate-300 dark:border-slate-700',
    accent: 'bg-slate-100 dark:bg-slate-800/60',
    light: 'bg-slate-50/70 dark:bg-slate-900/30',
    text: 'text-slate-700 dark:text-slate-300'
  };
};