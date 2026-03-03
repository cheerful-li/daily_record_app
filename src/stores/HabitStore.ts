import { makeAutoObservable, runInAction } from 'mobx';
import type { Habit } from '../services/database';
import { getById, queryByIndex } from '../services/database';
import { add, update, remove, getAll } from '../services/enhancedDatabase';

class HabitStore {
  habits: Habit[] = [];
  loading = false;
  error: Error | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadHabits();
  }

  // Load all habits
  async loadHabits() {
    this.loading = true;
    this.error = null;

    try {
      const habits = await getAll('habits');
      runInAction(() => {
        this.habits = habits;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
      });
    }
  }

  // Add a new habit
  async addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) {
    this.loading = true;
    this.error = null;

    try {
      const id = await add('habits', habit);
      const newHabit = await getById('habits', id);
      
      if (newHabit) {
        runInAction(() => {
          // 创建新数组以确保引用变化，触发MobX观察者更新
          this.habits = [...this.habits, newHabit as Habit];
          this.loading = false;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
      });
    }
  }

  // Update an existing habit
  async updateHabit(id: number, habitData: Partial<Habit>) {
    this.loading = true;
    this.error = null;

    try {
      await update('habits', id, habitData);
      const updatedHabit = await getById('habits', id);
      
      runInAction(() => {
        const index = this.habits.findIndex(h => h.id === id);
        if (index !== -1 && updatedHabit) {
          // 使用新数组以确保引用变化，触发MobX观察者更新
          this.habits = [
            ...this.habits.slice(0, index),
            updatedHabit as Habit,
            ...this.habits.slice(index + 1)
          ];
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
      });
    }
  }

  // Delete a habit
  async deleteHabit(id: number) {
    this.loading = true;
    this.error = null;

    try {
      await remove('habits', id);
      runInAction(() => {
        // 创建新数组以确保引用变化，触发MobX观察者更新
        this.habits = [...this.habits.filter(h => h.id !== id)];
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
      });
    }
  }

  // Get habits by frequency
  async getHabitsByFrequency(frequency: Habit['frequency']) {
    this.loading = true;
    this.error = null;

    try {
      const habits = await queryByIndex('habits', 'by-frequency', frequency);
      runInAction(() => {
        this.loading = false;
        return habits;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
        return [];
      });
    }
  }

  // Get active habits
  async getActiveHabits() {
    this.loading = true;
    this.error = null;

    try {
      const habits = await queryByIndex('habits', 'by-active', true);
      runInAction(() => {
        this.loading = false;
        return habits;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
        return [];
      });
    }
  }

  // Filter habits in memory
  getFilteredHabits(filter: {
    active?: boolean;
    frequency?: Habit['frequency'];
    name?: string;
  }) {
    return this.habits.filter(habit => {
      let match = true;
      
      if (filter.active !== undefined) {
        match = match && habit.active === filter.active;
      }
      
      if (filter.frequency !== undefined) {
        match = match && habit.frequency === filter.frequency;
      }
      
      if (filter.name !== undefined && filter.name.trim() !== '') {
        match = match && habit.name.toLowerCase().includes(filter.name.toLowerCase());
      }
      
      return match;
    });
  }
}

export default HabitStore;