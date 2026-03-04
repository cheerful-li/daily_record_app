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
  dateRange: {
    from: string;
    to: string;
  };
}

interface IdeaFilterProps {
  onFilterChange: (options: FilterOptions) => void;
  categories: string[];
}

const IdeaFilter = observer(({ onFilterChange, categories }: IdeaFilterProps) => {
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const applyFilters = useCallback((
    search: string,
    cat: string,
    from: string,
    to: string
  ) => {
    onFilterChange({
      searchText: search,
      category: cat,
      dateRange: {
        from,
        to
      }
    })
  }, [onFilterChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = e.target.value
    setSearchText(newSearchText)
    applyFilters(newSearchText, category, fromDate, toDate)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    applyFilters(searchText, value, fromDate, toDate)
  }

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromDate = e.target.value
    setFromDate(newFromDate)
    applyFilters(searchText, category, newFromDate, toDate)
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToDate = e.target.value
    setToDate(newToDate)
    applyFilters(searchText, category, fromDate, newToDate)
  }

  const clearFilters = () => {
    setSearchText('')
    setCategory('all')
    setFromDate('')
    setToDate('')
    onFilterChange({
      searchText: '',
      category: 'all',
      dateRange: { from: '', to: '' }
    })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索想法..."
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">日期范围</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              placeholder="起始日期"
              value={fromDate}
              onChange={handleFromDateChange}
            />
            <Input
              type="date"
              placeholder="结束日期"
              value={toDate}
              onChange={handleToDateChange}
            />
          </div>
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

export default IdeaFilter