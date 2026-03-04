import { useState, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useRelationshipStore } from '../../stores/StoreContext'
import { Button } from '../ui/button'
import { PlusIcon, MixerHorizontalIcon } from '@radix-ui/react-icons'
import type { Relationship } from '../../services/database'
import RelationshipsList from './relationships/RelationshipsList'
import RelationshipDetail from './relationships/RelationshipDetail'
import RelationshipForm from './relationships/RelationshipForm'
import ContactForm from './relationships/ContactForm'
import RelationshipFilter from './relationships/RelationshipFilter'

interface FilterOptions {
  searchText: string;
  category: string;
  contactStatus: 'all' | 'overdue' | 'upcoming' | 'no-date';
}

const Relationships = observer(() => {
  const relationshipStore = useRelationshipStore()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | undefined>()
  const [filteredRelationships, setFilteredRelationships] = useState<Relationship[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchText: '',
    category: 'all',
    contactStatus: 'all'
  })
  const [showFilters, setShowFilters] = useState(false) // 控制筛选面板的显示/隐藏

  useEffect(() => {
    relationshipStore.loadRelationships()
  }, [relationshipStore])

  // Extract unique categories from relationships
  useEffect(() => {
    const uniqueCategories = new Set<string>()
    relationshipStore.relationships.forEach(relationship => {
      uniqueCategories.add(relationship.category)
    })
    setCategories(Array.from(uniqueCategories))
  }, [relationshipStore.relationships])

  const applyFilters = useCallback(() => {
    let filtered = [...relationshipStore.relationships]
    const today = new Date()
    
    // Filter by search text (in name or notes)
    if (filterOptions.searchText) {
      const searchLower = filterOptions.searchText.toLowerCase()
      filtered = filtered.filter(
        relationship =>
          relationship.name.toLowerCase().includes(searchLower) ||
          (relationship.notes && relationship.notes.toLowerCase().includes(searchLower))
      )
    }

    // Filter by category
    if (filterOptions.category !== 'all') {
      filtered = filtered.filter(relationship => relationship.category === filterOptions.category)
    }

    // Filter by contact status
    if (filterOptions.contactStatus !== 'all') {
      switch (filterOptions.contactStatus) {
        case 'overdue':
          filtered = filtered.filter(relationship => 
            relationship.nextContact && new Date(relationship.nextContact) < today
          )
          break
        case 'upcoming':
          filtered = filtered.filter(relationship => {
            if (!relationship.nextContact) return false
            
            const nextContact = new Date(relationship.nextContact)
            const weekLater = new Date(today)
            weekLater.setDate(today.getDate() + 7)
            
            return nextContact >= today && nextContact <= weekLater
          })
          break
        case 'no-date':
          filtered = filtered.filter(relationship => !relationship.nextContact)
          break
      }
    }

    // Sort by next contact date (due first) then by name
    filtered.sort((a, b) => {
      if (a.nextContact && b.nextContact) {
        // Both have next contact dates - sort by date (sooner first)
        return new Date(a.nextContact).getTime() - new Date(b.nextContact).getTime()
      } else if (a.nextContact) {
        return -1 // a has next contact date, b doesn't
      } else if (b.nextContact) {
        return 1 // b has next contact date, a doesn't
      } else {
        // Neither has next contact date - sort by name
        return a.name.localeCompare(b.name)
      }
    })
    
    setFilteredRelationships(filtered)
  }, [relationshipStore.relationships, filterOptions])

  // Update filtered relationships when store data changes or filter changes
  useEffect(() => {
    applyFilters()
  }, [relationshipStore.relationships, filterOptions, applyFilters])

  const handleAddRelationship = async (relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => {
    await relationshipStore.addRelationship(relationship)
  }

  const handleEditRelationship = async (relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedRelationship?.id) {
      await relationshipStore.updateRelationship(selectedRelationship.id, relationship)
    }
  }

  const handleDeleteRelationship = async (relationshipId: number | undefined) => {
    if (relationshipId) {
      if (confirm('确定要删除这个联系人吗？')) {
        await relationshipStore.deleteRelationship(relationshipId)
        if (selectedRelationship?.id === relationshipId) {
          setSelectedRelationship(undefined)
        }
      }
    }
  }

  const handleEditClick = (relationship: Relationship) => {
    setSelectedRelationship(relationship)
    setIsEditDialogOpen(true)
  }


  const handleUpdateContact = (relationship: Relationship) => {
    setSelectedRelationship(relationship)
    setIsContactDialogOpen(true)
  }

  const handleContactSubmit = async (
    relationshipId: number | undefined,
    lastContact: Date,
    nextContact?: Date,
    notes?: string
  ) => {
    if (relationshipId && selectedRelationship) {
      const updatedData: Partial<Relationship> = {
        lastContact,
      }
      
      if (nextContact) {
        updatedData.nextContact = nextContact
      }
      
      // Append new notes to existing notes
      if (notes) {
        const currentDate = new Date()
        const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
        const newNote = `[${formattedDate}] ${notes}\n\n`
        
        if (selectedRelationship.notes) {
          updatedData.notes = newNote + selectedRelationship.notes
        } else {
          updatedData.notes = newNote
        }
      }
      
      await relationshipStore.updateRelationship(relationshipId, updatedData)
    }
  }

  const handleFilterChange = (options: FilterOptions) => {
    setFilterOptions(options)
  }
  
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="container mx-auto pb-20 md:pb-0">
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-bold hidden md:block">社交关系</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="ml-auto hidden md:flex">
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>添加联系人</span>
        </Button>
      </div>
      
      <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_2fr_1.5fr] grid-cols-1">
        {/* Filters - 桌面端显示，移动端隐藏 */}
        <div className="hidden md:block order-1">
          <RelationshipFilter 
            onFilterChange={handleFilterChange} 
            categories={categories} 
          />
        </div>
        
        {/* 移动端筛选面板 - 条件显示 */}
        {showFilters && (
          <div className="md:hidden mb-4 fixed bottom-26 left-4 right-4 z-30 bg-background border rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">筛选联系人</h3>
              <Button variant="ghost" size="sm" onClick={toggleFilters}>关闭</Button>
            </div>
            <RelationshipFilter 
              onFilterChange={handleFilterChange} 
              categories={categories}
            />
          </div>
        )}
        
        {/* Relationships List */}
        <div className="order-1 md:order-2">
          {relationshipStore.loading ? (
            <p>加载中...</p>
          ) : (
            <RelationshipsList 
              relationships={filteredRelationships} 
              onEdit={handleEditClick}
              onDelete={handleDeleteRelationship}
              onUpdateContact={handleUpdateContact}
            />
          )}
        </div>
        
        {/* Relationship Detail - 仅桌面端显示 */}
        <div className="hidden md:block order-3">
          <RelationshipDetail relationship={selectedRelationship} />
        </div>
      </div>
      
      {/* 底部操作栏 - 仅移动端显示 */}
      <div className="fixed bottom-12 left-0 right-0 bg-background border-t p-4 flex justify-around z-30 md:hidden">
        <Button variant="outline" onClick={toggleFilters} className="flex-1 mr-2">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          筛选
        </Button>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex-1 ml-2" variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          添加联系人
        </Button>
      </div>

      {/* Add Relationship Dialog */}
      <RelationshipForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddRelationship}
      />

      {/* Edit Relationship Dialog */}
      <RelationshipForm
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditRelationship}
        initialData={selectedRelationship}
        isEditing={true}
      />

      {/* Contact Dialog */}
      <ContactForm
        open={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        onSubmit={handleContactSubmit}
        relationship={selectedRelationship}
      />
    </div>
  )
})

export default Relationships