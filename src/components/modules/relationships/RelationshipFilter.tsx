import { useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { MagnifyingGlassIcon, Cross1Icon } from '@radix-ui/react-icons'

interface FilterOptions {
  searchText: string;
  category: string;
  contactStatus: 'all' | 'overdue' | 'upcoming' | 'no-date';
}

interface RelationshipFilterProps {
  onFilterChange: (options: FilterOptions) => void;
  categories: string[];
}

const RelationshipFilter = observer(({ onFilterChange, categories }: RelationshipFilterProps) => {
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [contactStatus, setContactStatus] = useState<'all' | 'overdue' | 'upcoming' | 'no-date'>('all')

  const applyFilters = useCallback((
    search: string,
    cat: string,
    status: 'all' | 'overdue' | 'upcoming' | 'no-date'
  ) => {
    onFilterChange({
      searchText: search,
      category: cat,
      contactStatus: status,
    })
  }, [onFilterChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = e.target.value
    setSearchText(newSearchText)
    applyFilters(newSearchText, category, contactStatus)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    applyFilters(searchText, value, contactStatus)
  }

  const handleContactStatusChange = (value: string) => {
    const newStatus = value as 'all' | 'overdue' | 'upcoming' | 'no-date'
    setContactStatus(newStatus)
    applyFilters(searchText, category, newStatus)
  }

  const clearFilters = () => {
    setSearchText('')
    setCategory('all')
    setContactStatus('all')
    onFilterChange({ searchText: '', category: 'all', contactStatus: 'all' })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索联系人..."
            className="pl-9"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium block mb-1">
            分类
          </label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category" className={category !== 'all' ? 'border-primary text-primary font-medium' : ''}>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有分类</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="contactStatus" className="text-sm font-medium block mb-1">
            联系状态
          </label>
          <Select value={contactStatus} onValueChange={handleContactStatusChange}>
            <SelectTrigger id="contactStatus" className={contactStatus !== 'all' ? 'border-primary text-primary font-medium' : ''}>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="overdue">已逾期</SelectItem>
              <SelectItem value="upcoming">近期需联系</SelectItem>
              <SelectItem value="no-date">未设置日期</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center"
          onClick={clearFilters}
        >
          <Cross1Icon className="h-4 w-4 mr-2" />
          清除筛选
        </Button>
      </CardContent>
    </Card>
  )
})

export default RelationshipFilter