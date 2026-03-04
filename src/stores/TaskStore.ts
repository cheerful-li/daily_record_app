import { makeAutoObservable, runInAction } from 'mobx'
import type { Task } from '../services/database'
import { getById, queryByIndex } from '../services/database'
import { add, update, remove, getAll } from '../services/enhancedDatabase'

class TaskStore {
  tasks: Task[] = []
  loading = false
  error: Error | null = null

  constructor() {
    makeAutoObservable(this)
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
          // 直接替换数组中的元素
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

  // Filter tasks in memory
  getFilteredTasks(filter: {
    type?: Task['type'];
    status?: Task['status'];
    priority?: Task['priority'];
    title?: string;
    fromDueDate?: Date;
    toDueDate?: Date;
  }) {
    return this.tasks.filter(task => {
      let match = true
      
      if (filter.type !== undefined) {
        match = match && task.type === filter.type
      }
      
      if (filter.status !== undefined) {
        match = match && task.status === filter.status
      }
      
      if (filter.priority !== undefined) {
        match = match && task.priority === filter.priority
      }
      
      if (filter.title !== undefined && filter.title.trim() !== '') {
        match = match && task.title.toLowerCase().includes(filter.title.toLowerCase())
      }
      
      // 移除了截止日期过滤功能
      // if (filter.fromDueDate !== undefined && task.dueDate) {
      //   match = match && task.dueDate >= filter.fromDueDate
      // }
      // 
      // if (filter.toDueDate !== undefined && task.dueDate) {
      //   match = match && task.dueDate <= filter.toDueDate
      // }
      
      return match
    })
  }
}

export default TaskStore