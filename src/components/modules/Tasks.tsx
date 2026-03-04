import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useTaskStore } from '../../stores/StoreContext'
import { useConfirmDialog } from '../common/ConfirmDialog'
import type { TaskFilterOptions } from '../../stores/TaskStore'
import { Button } from '../ui/button'
import { PlusIcon, MixerHorizontalIcon } from '@radix-ui/react-icons'
import type { Task } from '../../services/database'
import TasksList from './tasks/TasksList'
import TaskForm from './tasks/TaskForm'
import TaskFilter from './tasks/TaskFilter'
import TaskStats from './tasks/TaskStats'

// 使用从 TaskStore 导入的 TaskFilterOptions 类型

const Tasks = observer(() => {
  const taskStore = useTaskStore()
  const { confirm, dialog } = useConfirmDialog()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  // 不再需要在组件维护过滤状态
  const [showFilters, setShowFilters] = useState(false) // 控制筛选面板的显示/隐藏

  useEffect(() => {
    taskStore.loadTasks()
  }, [taskStore])

  // 直接使用 taskStore 的 computed 属性
  const filteredTasks = taskStore.filteredTasks

  const handleAddTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await taskStore.addTask(task)
  }

  const handleEditTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask?.id) {
      await taskStore.updateTask(selectedTask.id, task)
    }
  }

  const handleDeleteTask = async (taskId: number | undefined) => {
    if (taskId) {
      confirm({
        title: '删除任务',
        description: '确定要删除这个任务吗？此操作无法撤销。',
        confirmText: '删除',
        cancelText: '取消',
        variant: 'destructive',
        onConfirm: async () => {
          await taskStore.deleteTask(taskId)
        },
      })
    }
  }

  const handleEditClick = (task: Task) => {
    setSelectedTask(task)
    setIsEditDialogOpen(true)
  }

  const handleStatusChange = async (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (task.id) {
      await taskStore.updateTask(task.id, { ...task, status: newStatus })
    }
  }

  const handleFilterChange = (options: TaskFilterOptions) => {
    // 更新 taskStore 中的过滤选项
    taskStore.setFilterOptions(options)
  }
  
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="container mx-auto pb-20 md:pb-0">
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-bold hidden md:block">待办事项</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="ml-auto hidden md:flex">
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>添加任务</span>
        </Button>
      </div>
      
      <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_2fr] grid-cols-1">
        {/* Filters - 桌面端显示，移动端隐藏 */}
        <div className="hidden md:block space-y-4 md:space-y-6 order-1">
          <TaskFilter onFilterChange={handleFilterChange} />
          
          {/* Task Statistics - 仅桌面端显示 */}
          <TaskStats tasks={filteredTasks} />
        </div>
        
        {/* 移动端筛选面板 - 条件显示 */}
        {showFilters && (
          <div className="md:hidden mb-4 fixed bottom-26 left-4 right-4 z-30 bg-background border rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">筛选任务</h3>
              <Button variant="ghost" size="sm" onClick={toggleFilters}>关闭</Button>
            </div>
            <TaskFilter 
              onFilterChange={handleFilterChange}
            />
          </div>
        )}
        
        {/* Tasks List */}
        <div className="order-1 md:order-2">
          {taskStore.loading ? (
            <p>加载中...</p>
          ) : (
            <TasksList 
              tasks={filteredTasks} 
              onEdit={handleEditClick}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
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
          添加任务
        </Button>
      </div>

      {/* Add Task Dialog */}
      <TaskForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddTask}
      />

      {/* Edit Task Dialog */}
      <TaskForm
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditTask}
        initialData={selectedTask}
        isEditing={true}
      />
      
      {/* 确认对话框 */}
      {dialog}
    </div>
  )
})

export default Tasks