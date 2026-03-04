import { makeAutoObservable, runInAction, computed, observable } from 'mobx'
import type { Relationship } from '../services/database'
import { getById, queryByIndex } from '../services/database'
import { add, update, remove, getAll } from '../services/enhancedDatabase'

// 定义过滤选项接口
export interface RelationshipFilterOptions {
  name?: string;
  category?: string;
  nextContactFrom?: Date;
  nextContactTo?: Date;
  needsContactSoon?: boolean;
  daysThreshold?: number;
}

class RelationshipStore {
  relationships: Relationship[] = []
  loading = false
  error: Error | null = null
  
  // 当前过滤选项
  filterOptions: RelationshipFilterOptions = observable({
    name: '',
    category: '',
    nextContactFrom: undefined,
    nextContactTo: undefined,
    needsContactSoon: false,
    daysThreshold: 7
  })

  constructor() {
    makeAutoObservable(this, {
      filteredRelationships: computed,
      relationshipsNeedingContact: computed
    })
    this.loadRelationships()
  }

  // Load all relationships
  async loadRelationships() {
    this.loading = true
    this.error = null

    try {
      const relationships = await getAll('relationships')
      runInAction(() => {
        this.relationships = relationships
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Add a new relationship
  async addRelationship(relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) {
    this.loading = true
    this.error = null

    try {
      const id = await add('relationships', relationship)
      const newRelationship = await getById('relationships', id)
      
      if (newRelationship) {
        runInAction(() => {
          this.relationships.push(newRelationship as Relationship)
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

  // Update an existing relationship
  async updateRelationship(id: number, relationshipData: Partial<Relationship>) {
    this.loading = true
    this.error = null

    try {
      await update('relationships', id, relationshipData)
      const updatedRelationship = await getById('relationships', id)
      
      runInAction(() => {
        const index = this.relationships.findIndex(r => r.id === id)
        if (index !== -1 && updatedRelationship) {
          this.relationships[index] = updatedRelationship as Relationship
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

  // Delete a relationship
  async deleteRelationship(id: number) {
    this.loading = true
    this.error = null

    try {
      await remove('relationships', id)
      runInAction(() => {
        this.relationships = this.relationships.filter(r => r.id !== id)
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Get relationships by name
  async getRelationshipsByName(name: string) {
    this.loading = true
    this.error = null

    try {
      const relationships = await queryByIndex('relationships', 'by-name', name)
      runInAction(() => {
        this.loading = false
      })
      return relationships // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get relationships by category
  async getRelationshipsByCategory(category: string) {
    this.loading = true
    this.error = null

    try {
      const relationships = await queryByIndex('relationships', 'by-category', category)
      runInAction(() => {
        this.loading = false
      })
      return relationships // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get relationships by next contact date
  async getRelationshipsByNextContact(nextContact: Date) {
    this.loading = true
    this.error = null

    try {
      // Note: This is a simplification and might need adjustment for date comparison
      const relationships = await queryByIndex('relationships', 'by-nextContact', nextContact)
      runInAction(() => {
        this.loading = false
      })
      return relationships // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // 设置过滤选项方法
  setFilterOptions(options: Partial<RelationshipFilterOptions>) {
    Object.assign(this.filterOptions, options)
  }
  
  // 计算需要待联系的关系
  get relationshipsNeedingContact() {
    return computed(() => {
      const today = new Date()
      const thresholdDate = new Date()
      thresholdDate.setDate(today.getDate() + (this.filterOptions.daysThreshold || 7))
      
      return this.relationships.filter(relationship => 
        relationship.nextContact && 
        relationship.nextContact <= thresholdDate
      )
    }).get()
  }
  
  // 兼容旧的方法
  getRelationshipsNeedingContact(daysThreshold = 7) {
    this.setFilterOptions({ daysThreshold })
    return this.relationshipsNeedingContact
  }

  // 使用computed计算过滤后的关系列表
  get filteredRelationships() {
    return computed(() => {
      // 如果选择了只显示需要联系的关系
      if (this.filterOptions.needsContactSoon) {
        return this.relationshipsNeedingContact
      }
      
      return this.relationships.filter(relationship => {
        let match = true
        
        if (this.filterOptions.name && this.filterOptions.name.trim() !== '') {
          match = match && relationship.name.toLowerCase().includes(this.filterOptions.name.toLowerCase())
        }
        
        if (this.filterOptions.category && this.filterOptions.category.trim() !== '') {
          match = match && relationship.category === this.filterOptions.category
        }
        
        if (this.filterOptions.nextContactFrom !== undefined && relationship.nextContact) {
          match = match && relationship.nextContact >= this.filterOptions.nextContactFrom
        }
        
        if (this.filterOptions.nextContactTo !== undefined && relationship.nextContact) {
          match = match && relationship.nextContact <= this.filterOptions.nextContactTo
        }
        
        return match
      })
    }).get()
  }
  
  // 旧的过滤方法（保留向后兼容）
  getFilteredRelationships(filter: {
    name?: string;
    category?: string;
    nextContactFrom?: Date;
    nextContactTo?: Date;
  }) {
    // 设置过滤选项
    this.setFilterOptions({
      ...filter,
      needsContactSoon: false
    })
    
    // 返回计算后的结果
    return this.filteredRelationships
  }
}

export default RelationshipStore