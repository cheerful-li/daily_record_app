import { makeAutoObservable, runInAction, computed, observable } from 'mobx'
import type { Task } from '../services/database'
import { getById, queryByIndex } from '../services/database'
import { add, update, remove, getAll } from '../services/enhancedDatabase'

// 定义过滤选项接口
export interface TaskFilterOptions {
  searchText?: string;
  type?: 'all' | 'work' | 'growth';
  status?: 'all' | 'pending' | 'in-progress' | 'completed';
  priority?: 'all' | 'high' | 'medium' | 'low';
}

class TaskStore {
  tasks: Task[] = []
  loading = false
  error: Error | null = null
  
  // 当前过滤选项
  filterOptions: TaskFilterOptions = observable({
    searchText: '',
    type: 'all',
    status: 'all',
    priority: 'all'
  })

  constructor() {
    makeAutoObservable(this, {
      // 确保computed属性被正确识别
      filteredTasks: computed
    })
    this.loadTasks()
  }

  // Load all tasks
  async loadTasks() {
    this.loading = true
    this.error = null

    try {
      const tasks = await getAll('tasks')
      runInAction(() => {
        this.tasks = tasks
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Add a new task
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    this.loading = true
    this.error = null

    try {
      const id = await add('tasks', task)
      const newTask = await getById('tasks', id)
      
      if (newTask) {
        runInAction(() => {
          // MobX会自动追踪并触发更新
          this.tasks.push(newTask as Task)
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

  // Update an existing task
  async updateTask(id: number, taskData: Partial<Task>) {
    this.loading = true
    this.error = null

    try {
      await update('tasks', id, taskData)
      const updatedTask = await getById('tasks', id)
      
      runInAction(() => {
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1 && updatedTask) {
          // 替换整个对象引用，确保 MobX 可以检测到变化
          this.tasks[index] = updatedTask as Task
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

  // Delete a task
  async deleteTask(id: number) {
    this.loading = true
    this.error = null

    try {
      await remove('tasks', id)
      runInAction(() => {
        // 无需展开运算符
        this.tasks = this.tasks.filter(t => t.id !== id)
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Get tasks by type
  async getTasksByType(type: Task['type']) {
    this.loading = true
    this.error = null

    try {
      const tasks = await queryByIndex('tasks', 'by-type', type)
      runInAction(() => {
        this.loading = false
      })
      return tasks // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get tasks by status
  async getTasksByStatus(status: Task['status']) {
    this.loading = true
    this.error = null

    try {
      const tasks = await queryByIndex('tasks', 'by-status', status)
      runInAction(() => {
        this.loading = false
      })
      return tasks // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get tasks by due date
  async getTasksByDueDate(dueDate: Date) {
    this.loading = true
    this.error = null

    try {
      // Note: This is a simplification and might need adjustment for date comparison
      const tasks = await queryByIndex('tasks', 'by-dueDate', dueDate)
      runInAction(() => {
        this.loading = false
      })
      return tasks // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get tasks by priority
  async getTasksByPriority(priority: Task['priority']) {
    this.loading = true
    this.error = null

    try {
      const tasks = await queryByIndex('tasks', 'by-priority', priority)
      runInAction(() => {
        this.loading = false
      })
      return tasks // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // 设置过滤选项方法
  setFilterOptions(options: Partial<TaskFilterOptions>) {
    Object.assign(this.filterOptions, options)
  }

  // 使用computed计算过滤后的任务列表
  get filteredTasks() {
    return computed(() => {
      let filtered = [...this.tasks]

      // Filter by search text (in title or description)
      if (this.filterOptions.searchText) {
        const searchLower = this.filterOptions.searchText.toLowerCase()
        filtered = filtered.filter(
          task =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
        )
      }

      // Filter by type
      if (this.filterOptions.type !== 'all') {
        filtered = filtered.filter(task => task.type === this.filterOptions.type)
      }

      // Filter by status
      if (this.filterOptions.status !== 'all') {
        filtered = filtered.filter(task => task.status === this.filterOptions.status)
      }

      // Filter by priority
      if (this.filterOptions.priority !== 'all') {
        filtered = filtered.filter(task => task.priority === this.filterOptions.priority)
      }

      // 排序逻辑
      return filtered.sort((a, b) => {
        // 1. 首先按状态排序: in-progress > pending > completed
        const statusOrder = { 'in-progress': 0, 'pending': 1, 'completed': 2 }
        const statusDiff = statusOrder[a.status] - statusOrder[b.status]
        if (statusDiff !== 0) return statusDiff
        
        // 2. 然后按优先级排序（high -> medium -> low）
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        // 3. 最后按创建时间从新到旧排序
        const timeA = new Date(a.createdAt).getTime()
        const timeB = new Date(b.createdAt).getTime()
        return timeB - timeA // 降序排列（从新到旧）
      })
    }).get()
  }
  
  // 旧的过滤方法（保留向后兼容）
  getFilteredTasks(filter: {
    type?: Task['type'];
    status?: Task['status'];
    priority?: Task['priority'];
    title?: string;
  }) {
    // 设置过滤选项
    this.setFilterOptions({
      searchText: filter.title || '',
      type: filter.type ? filter.type : 'all',
      status: filter.status ? filter.status : 'all',
      priority: filter.priority ? filter.priority : 'all'
    })
    
    // 返回计算后的结果
    return this.filteredTasks
  }
}

export default TaskStore