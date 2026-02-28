import { makeAutoObservable, runInAction } from 'mobx';
import type { Idea } from '../services/database';
import { getById, queryByIndex } from '../services/database';
import { add, update, remove, getAll } from '../services/enhancedDatabase';

class IdeaStore {
  ideas: Idea[] = [];
  loading = false;
  error: Error | null = null;
  lastUsedCategory: string = '灵感'; // 默认分类

  constructor() {
    makeAutoObservable(this);
    this.loadIdeas();
  }

  // Load all ideas
  async loadIdeas() {
    this.loading = true;
    this.error = null;

    try {
      const ideas = await getAll('ideas');
      runInAction(() => {
        this.ideas = ideas;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
      });
    }
  }

  // Add a new idea
  async addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) {
    // 保存最后使用的分类
    this.lastUsedCategory = idea.category;
    this.loading = true;
    this.error = null;

    try {
      const id = await add('ideas', idea);
      const newIdea = await getById('ideas', id);
      
      if (newIdea) {
        runInAction(() => {
          this.ideas.push(newIdea as Idea);
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

  // Update an existing idea
  async updateIdea(id: number, ideaData: Partial<Idea>) {
    // 如果更新包含分类信息，保存最后使用的分类
    if (ideaData.category) {
      this.lastUsedCategory = ideaData.category;
    }
    this.loading = true;
    this.error = null;

    try {
      await update('ideas', id, ideaData);
      const updatedIdea = await getById('ideas', id);
      
      runInAction(() => {
        const index = this.ideas.findIndex(i => i.id === id);
        if (index !== -1 && updatedIdea) {
          this.ideas[index] = updatedIdea as Idea;
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

  // Delete an idea
  async deleteIdea(id: number) {
    this.loading = true;
    this.error = null;

    try {
      await remove('ideas', id);
      runInAction(() => {
        this.ideas = this.ideas.filter(i => i.id !== id);
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
      });
    }
  }

  // Get ideas by date
  async getIdeasByDate(date: Date) {
    this.loading = true;
    this.error = null;

    try {
      // Note: This is a simplification and might need adjustment for date comparison
      const ideas = await queryByIndex('ideas', 'by-date', date);
      runInAction(() => {
        this.loading = false;
        return ideas;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
        return [];
      });
    }
  }

  // Get ideas by category
  async getIdeasByCategory(category: string) {
    this.loading = true;
    this.error = null;

    try {
      const ideas = await queryByIndex('ideas', 'by-category', category);
      runInAction(() => {
        this.loading = false;
        return ideas;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error));
        this.loading = false;
        return [];
      });
    }
  }

  // Filter ideas in memory
  getFilteredIdeas(filter: {
    content?: string;
    category?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    return this.ideas.filter(idea => {
      let match = true;
      
      if (filter.content !== undefined && filter.content.trim() !== '') {
        match = match && idea.content.toLowerCase().includes(filter.content.toLowerCase());
      }
      
      if (filter.category !== undefined && filter.category.trim() !== '') {
        match = match && idea.category === filter.category;
      }
      
      if (filter.fromDate !== undefined) {
        match = match && idea.date >= filter.fromDate;
      }
      
      if (filter.toDate !== undefined) {
        match = match && idea.date <= filter.toDate;
      }
      
      return match;
    });
  }
}

export default IdeaStore;