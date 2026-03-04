import { makeAutoObservable, runInAction, computed, observable } from 'mobx'
import type { Idea } from '../services/database'
import { getById, queryByIndex } from '../services/database'
import { add, update, remove, getAll } from '../services/enhancedDatabase'

// 定义过滤选项接口
export interface IdeaFilterOptions {
  content?: string;
  category?: string;
  fromDate?: Date;
  toDate?: Date;
}

class IdeaStore {
  ideas: Idea[] = []
  loading = false
  error: Error | null = null
  lastUsedCategory: string = '灵感' // 默认分类
  
  // 当前过滤选项
  filterOptions: IdeaFilterOptions = observable({
    content: '',
    category: '',
    fromDate: undefined,
    toDate: undefined
  })

  constructor() {
    makeAutoObservable(this, {
      filteredIdeas: computed
    })
    this.loadIdeas()
  }

  // Load all ideas
  async loadIdeas() {
    this.loading = true
    this.error = null

    try {
      const ideas = await getAll('ideas')
      runInAction(() => {
        this.ideas = ideas
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Add a new idea
  async addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) {
    // 保存最后使用的分类
    this.lastUsedCategory = idea.category
    this.loading = true
    this.error = null

    try {
      const id = await add('ideas', idea)
      const newIdea = await getById('ideas', id)
      
      if (newIdea) {
        runInAction(() => {
          this.ideas.push(newIdea as Idea)
          this.loading = false
        })
      }
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Update an existing idea
  async updateIdea(id: number, ideaData: Partial<Idea>) {
    // 如果更新包含分类信息，保存最后使用的分类
    if (ideaData.category) {
      this.lastUsedCategory = ideaData.category
    }
    this.loading = true
    this.error = null

    try {
      await update('ideas', id, ideaData)
      const updatedIdea = await getById('ideas', id)
      
      runInAction(() => {
        const index = this.ideas.findIndex(i => i.id === id)
        if (index !== -1 && updatedIdea) {
          // 替换整个对象引用，确保 MobX 可以检测到变化
          this.ideas[index] = updatedIdea as Idea
        }
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Delete an idea
  async deleteIdea(id: number) {
    this.loading = true
    this.error = null

    try {
      await remove('ideas', id)
      runInAction(() => {
        this.ideas = this.ideas.filter(i => i.id !== id)
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Get ideas by date
  async getIdeasByDate(date: Date) {
    this.loading = true
    this.error = null

    try {
      // Note: This is a simplification and might need adjustment for date comparison
      const ideas = await queryByIndex('ideas', 'by-date', date)
      runInAction(() => {
        this.loading = false
      })
      return ideas // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get ideas by category
  async getIdeasByCategory(category: string) {
    this.loading = true
    this.error = null

    try {
      const ideas = await queryByIndex('ideas', 'by-category', category)
      runInAction(() => {
        this.loading = false
      })
      return ideas // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // 设置过滤选项方法
  setFilterOptions(options: Partial<IdeaFilterOptions>) {
    Object.assign(this.filterOptions, options)
  }

  // 使用computed计算过滤后的灵感列表
  get filteredIdeas() {
    return computed(() => {
      return this.ideas.filter(idea => {
        let match = true
        
        if (this.filterOptions.content && this.filterOptions.content.trim() !== '') {
          match = match && idea.content.toLowerCase().includes(this.filterOptions.content.toLowerCase())
        }
        
        if (this.filterOptions.category && this.filterOptions.category.trim() !== '') {
          match = match && idea.category === this.filterOptions.category
        }
        
        if (this.filterOptions.fromDate !== undefined) {
          match = match && idea.date >= this.filterOptions.fromDate
        }
        
        if (this.filterOptions.toDate !== undefined) {
          match = match && idea.date <= this.filterOptions.toDate
        }
        
        return match
      })
    }).get()
  }
  
  // 旧的过滤方法（保留向后兼容）
  getFilteredIdeas(filter: {
    content?: string;
    category?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    // 设置过滤选项
    this.setFilterOptions(filter)
    
    // 返回计算后的结果
    return this.filteredIdeas
  }
}

export default IdeaStore