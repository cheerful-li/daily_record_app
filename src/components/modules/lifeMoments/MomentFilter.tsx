import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { MagnifyingGlassIcon, Cross1Icon } from '@radix-ui/react-icons'

interface FilterOptions {
  searchText: string;
  tags: string[];
  fromDate?: Date;
  toDate?: Date;
}

interface MomentFilterProps {
  onFilterChange: (options: FilterOptions) => void;
  availableTags: string[];
}

const MomentFilter = observer(({ onFilterChange, availableTags }: MomentFilterProps) => {
  const [searchText, setSearchText] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = e.target.value
    setSearchText(newSearchText)
    applyFilters(newSearchText, selectedTags, fromDate, toDate)
  }

  const handleTagClick = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
      
    setSelectedTags(newSelectedTags)
    applyFilters(searchText, newSelectedTags, fromDate, toDate)
  }

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromDate = e.target.value
    setFromDate(newFromDate)
    applyFilters(searchText, selectedTags, newFromDate, toDate)
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToDate = e.target.value
    setToDate(newToDate)
    applyFilters(searchText, selectedTags, fromDate, newToDate)
  }

  const applyFilters = (
    search: string,
    tags: string[],
    from: string,
    to: string
  ) => {
    const filterOptions: FilterOptions = {
      searchText: search,
      tags: tags,
    }

    if (from) {
      const fromDate = new Date(from)
      // 确保日期有效
      if (!isNaN(fromDate.getTime())) {
        filterOptions.fromDate = fromDate
      }
    }

    if (to) {
      const toDate = new Date(to)
      // 设置时间为当天的结束时间，并确保日期有效
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999)
        filterOptions.toDate = toDate
      }
    }

    onFilterChange(filterOptions)
  }

  const clearFilters = () => {
    setSearchText('')
    setSelectedTags([])
    setFromDate('')
    setToDate('')
    onFilterChange({ searchText: '', tags: [] })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索记录..."
            className="pl-9"
            value={searchText}
            onChange={handleSearchChange}
          />
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

        {availableTags.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">标签</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {availableTags.map((tag, index) => (
                <Button
                  key={index}
                  variant={selectedTags.includes(tag) ? "secondary" : "outline"}
                  size="sm"
                  className={`text-xs h-7 rounded-full ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground font-medium ring-1 ring-primary" : ""}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}

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

export default MomentFilter