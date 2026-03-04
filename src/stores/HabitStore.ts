import { makeAutoObservable, runInAction, computed, observable } from 'mobx'
import type { Habit } from '../services/database'
import type { CheckIn } from '../services/database'
import { getById, queryByIndex } from '../services/database'
import { add, update, remove, getAll } from '../services/enhancedDatabase'
import { filterCheckableHabits, isHabitNeedsCheckInToday, getLastCheckInTimeOfDay } from '../utils/habitUtils'

// 全局类型定义
declare global {
  interface Window {
    __checkInStore?: {
      checkIns: CheckIn[]
    }
  }
}

// 定义过滤选项接口
export interface HabitFilterOptions {
  active?: boolean;
  frequency?: Habit['frequency'];
  name?: string;
  showOnlyCheckable?: boolean;
}

class HabitStore {
  habits: Habit[] = []
  loading = false
  error: Error | null = null
  
  // 当前过滤选项
  filterOptions: HabitFilterOptions = observable({
    active: true,  // 默认只显示活跃习惯
    frequency: undefined,
    name: '',
    showOnlyCheckable: true  // 默认只显示可打卡习惯
  })

  constructor() {
    makeAutoObservable(this, {
      // 确保computed属性被正确识别
      filteredHabits: computed
    })
    this.loadHabits()
  }

  // Load all habits
  async loadHabits() {
    this.loading = true
    this.error = null

    try {
      const habits = await getAll('habits')
      runInAction(() => {
        this.habits = habits
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Add a new habit
  async addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) {
    this.loading = true
    this.error = null

    try {
      const id = await add('habits', habit)
      const newHabit = await getById('habits', id)
      
      if (newHabit) {
        runInAction(() => {
          this.habits.push(newHabit as Habit) // 直接修改数组，MobX会自动追踪
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

  // Update an existing habit
  async updateHabit(id: number, habitData: Partial<Habit>) {
    this.loading = true
    this.error = null

    try {
      await update('habits', id, habitData)
      const updatedHabit = await getById('habits', id)
      
      runInAction(() => {
        const index = this.habits.findIndex(h => h.id === id)
        if (index !== -1 && updatedHabit) {
          // 替换整个对象引用，确保 MobX 可以检测到变化
          this.habits[index] = updatedHabit as Habit
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

  // Delete a habit
  async deleteHabit(id: number) {
    this.loading = true
    this.error = null

    try {
      await remove('habits', id)
      runInAction(() => {
        // MobX会自动追踪数组变化，无需创建新数组
        this.habits = this.habits.filter(h => h.id !== id)
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Get habits by frequency
  async getHabitsByFrequency(frequency: Habit['frequency']) {
    this.loading = true
    this.error = null

    try {
      const habits = await queryByIndex('habits', 'by-frequency', frequency)
      runInAction(() => {
        this.loading = false
      })
      return habits // 修正返回值位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 修正返回值位置
    }
  }

  // Get active habits
  async getActiveHabits() {
    this.loading = true
    this.error = null

    try {
      const habits = await queryByIndex('habits', 'by-active', true)
      runInAction(() => {
        this.loading = false
      })
      return habits // 修正返回值位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 修正返回值位置
    }
  }

  // 设置过滤选项方法
  setFilterOptions(options: Partial<HabitFilterOptions>) {
    Object.assign(this.filterOptions, options)
  }

  // 根据打卡记录计算过滤后的习惯列表
  get filteredHabits() {
    return computed(() => {
      let filtered = [...this.habits]
      
      // 根据活跃状态过滤
      if (this.filterOptions.active !== undefined) {
        filtered = filtered.filter(habit => habit.active === this.filterOptions.active)
      }
      
      // 根据频率过滤
      if (this.filterOptions.frequency !== undefined) {
        filtered = filtered.filter(habit => habit.frequency === this.filterOptions.frequency)
      }
      
      // 根据名称过滤
      if (this.filterOptions.name && this.filterOptions.name.trim() !== '') {
        const searchLower = this.filterOptions.name.toLowerCase()
        filtered = filtered.filter(habit => habit.name.toLowerCase().includes(searchLower))
      }
      
      // 流程对象，需要在HabitStore初始化时注入
      const checkIns: CheckIn[] = window.__checkInStore?.checkIns || []
      
      // 根据打卡可用性过滤
      if (this.filterOptions.showOnlyCheckable) {
        filtered = filterCheckableHabits(filtered, checkIns)
      }
      
      // 排序逻辑
      return filtered.sort((a, b) => {
        // 1. 首先按活跃状态排序 (活跃 > 非活跃)
        if (a.active !== b.active) {
          return a.active ? -1 : 1
        }
        
        // 2. 然后按"今日需要打卡且未打卡"状态排序
        const aNeedsCheckIn = isHabitNeedsCheckInToday(a, checkIns)
        const bNeedsCheckIn = isHabitNeedsCheckInToday(b, checkIns)
        
        if (aNeedsCheckIn !== bNeedsCheckIn) {
          return aNeedsCheckIn ? -1 : 1
        }
        
        // 3. 对于每日习惯，按照上次打卡的时间排序（早上打卡的习惯排前面）
        if (a.frequency === 'daily' && b.frequency === 'daily') {
          const aTime = getLastCheckInTimeOfDay(a, checkIns)
          const bTime = getLastCheckInTimeOfDay(b, checkIns)
          
          // 如果两个习惯都有打卡记录，按时间排序
          if (aTime >= 0 && bTime >= 0) {
            return aTime - bTime // 较早时间的习惯排在前面
          }
          // 如果只有一个习惯有打卡记录，有记录的排后面（因为优先显示没有建立规律的习惯）
          else if (aTime >= 0) {
            return 1
          }
          else if (bTime >= 0) {
            return -1
          }
        }
        
        // 4. 再按频率排序 (daily > weekly > monthly)
        const frequencyOrder = { daily: 0, weekly: 1, monthly: 2 }
        if (a.frequency !== b.frequency) {
          return frequencyOrder[a.frequency] - frequencyOrder[b.frequency]
        }
        
        // 5. 最后按创建时间从新到旧排序
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }).get()
  }

  // 旧的过滤方法（保留向后兼容）
  getFilteredHabits(filter: {
    active?: boolean;
    frequency?: Habit['frequency'];
    name?: string;
  }) {
    // 设置过滤选项
    this.setFilterOptions(filter)
    
    // 返回计算后的结果
    return this.filteredHabits
  }
}

export default HabitStore