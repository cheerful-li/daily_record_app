import { makeAutoObservable, runInAction } from 'mobx'
import type { Relationship } from '../services/database'
import { getById, queryByIndex } from '../services/database'
import { add, update, remove, getAll } from '../services/enhancedDatabase'

class RelationshipStore {
  relationships: Relationship[] = []
  loading = false
  error: Error | null = null

  constructor() {
    makeAutoObservable(this)
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
        return relationships
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
        return []
      })
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
        return relationships
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
        return []
      })
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
        return relationships
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
        return []
      })
    }
  }

  // Get relationships that need contact soon
  getRelationshipsNeedingContact(daysThreshold = 7) {
    const today = new Date()
    const thresholdDate = new Date()
    thresholdDate.setDate(today.getDate() + daysThreshold)
    
    return this.relationships.filter(relationship => 
      relationship.nextContact && 
      relationship.nextContact <= thresholdDate
    )
  }

  // Filter relationships in memory
  getFilteredRelationships(filter: {
    name?: string;
    category?: string;
    nextContactFrom?: Date;
    nextContactTo?: Date;
  }) {
    return this.relationships.filter(relationship => {
      let match = true
      
      if (filter.name !== undefined && filter.name.trim() !== '') {
        match = match && relationship.name.toLowerCase().includes(filter.name.toLowerCase())
      }
      
      if (filter.category !== undefined && filter.category.trim() !== '') {
        match = match && relationship.category === filter.category
      }
      
      if (filter.nextContactFrom !== undefined && relationship.nextContact) {
        match = match && relationship.nextContact >= filter.nextContactFrom
      }
      
      if (filter.nextContactTo !== undefined && relationship.nextContact) {
        match = match && relationship.nextContact <= filter.nextContactTo
      }
      
      return match
    })
  }
}

export default RelationshipStore