import { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { MagnifyingGlassIcon, Cross1Icon } from '@radix-ui/react-icons'

interface FilterOptions {
  searchText: string;
  type: 'all' | 'work' | 'growth';
  status: 'all' | 'pending' | 'in-progress' | 'completed';
  priority: 'all' | 'high' | 'medium' | 'low';
}

interface TaskFilterProps {
  onFilterChange: (options: FilterOptions) => void;
}

const TaskFilter = observer(({ onFilterChange }: TaskFilterProps) => {
  const [searchText, setSearchText] = useState('')
  const [type, setType] = useState<'all' | 'work' | 'growth'>('all')
  const [status, setStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
  const [priority, setPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  // 使用useMemo创建过滤选项对象，避免不必要的重新创建
  const filterOptions = useMemo(() => ({
    searchText,
    type,
    status,
    priority,
  }), [searchText, type, status, priority])

  // 当过滤选项变化时，通知父组件
  useEffect(() => {
    onFilterChange(filterOptions)
  }, [filterOptions, onFilterChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const handleTypeChange = (value: string) => {
    setType(value as 'all' | 'work' | 'growth')
  }

  const handleStatusChange = (value: string) => {
    setStatus(value as 'all' | 'pending' | 'in-progress' | 'completed')
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value as 'all' | 'high' | 'medium' | 'low')
  }

  const clearFilters = () => {
    setSearchText('')
    setType('all')
    setStatus('all')
    setPriority('all')
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索任务..."
            className="pl-9"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>

        <div className="space-y-2">
          <div>
            <label htmlFor="type" className="text-sm font-medium block mb-1">
              任务类型
            </label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger id="type" className={type !== 'all' ? 'border-primary text-primary font-medium' : ''}>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="work">工作</SelectItem>
                <SelectItem value="growth">成长</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="status" className="text-sm font-medium block mb-1">
              任务状态
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status" className={status !== 'all' ? 'border-primary text-primary font-medium' : ''}>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">未开始</SelectItem>
                <SelectItem value="in-progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="priority" className="text-sm font-medium block mb-1">
              优先级
            </label>
            <Select value={priority} onValueChange={handlePriorityChange}>
              <SelectTrigger id="priority" className={priority !== 'all' ? 'border-primary text-primary font-medium' : ''}>
                <SelectValue placeholder="选择优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
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

export default TaskFilter