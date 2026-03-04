import { makeAutoObservable, runInAction } from 'mobx'
import type { CheckIn } from '../services/database'
import { getById, queryByIndex } from '../services/database'
import { add, update, remove, getAll } from '../services/enhancedDatabase'

class CheckInStore {
  checkIns: CheckIn[] = []
  loading = false
  error: Error | null = null

  constructor() {
    makeAutoObservable(this)
    this.loadCheckIns()
  }

  // Load all check-ins
  async loadCheckIns() {
    this.loading = true
    this.error = null

    try {
      const checkIns = await getAll('checkIns')
      runInAction(() => {
        this.checkIns = checkIns
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Add a new check-in
  async addCheckIn(checkIn: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>) {
    this.loading = true
    this.error = null

    try {
      const id = await add('checkIns', checkIn)
      const newCheckIn = await getById('checkIns', id)
      
      if (newCheckIn) {
        runInAction(() => {
          // MobX会自动追踪可观察对象的变化，直接push即可
          this.checkIns.push(newCheckIn as CheckIn)
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

  // Update an existing check-in
  async updateCheckIn(id: number, checkInData: Partial<CheckIn>) {
    this.loading = true
    this.error = null

    try {
      await update('checkIns', id, checkInData)
      const updatedCheckIn = await getById('checkIns', id)
      
      runInAction(() => {
        const index = this.checkIns.findIndex(c => c.id === id)
        if (index !== -1 && updatedCheckIn) {
          // 替换整个对象引用，确保 MobX 可以检测到变化
          this.checkIns[index] = updatedCheckIn as CheckIn
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

  // Delete a check-in
  async deleteCheckIn(id: number) {
    this.loading = true
    this.error = null

    try {
      await remove('checkIns', id)
      runInAction(() => {
        // filter本身会返回新数组，无需额外的展开运算符
        this.checkIns = this.checkIns.filter(c => c.id !== id)
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Get check-ins by habit ID
  async getCheckInsByHabitId(habitId: number) {
    this.loading = true
    this.error = null

    try {
      const checkIns = await queryByIndex('checkIns', 'by-habitId', habitId)
      runInAction(() => {
        this.loading = false
      })
      return checkIns // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get check-ins by date
  async getCheckInsByDate(date: Date) {
    this.loading = true
    this.error = null

    try {
      // Note: This is a simplification and might need adjustment for date comparison
      const checkIns = await queryByIndex('checkIns', 'by-date', date)
      runInAction(() => {
        this.loading = false
      })
      return checkIns // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get check-ins by status
  async getCheckInsByStatus(status: CheckIn['status']) {
    this.loading = true
    this.error = null

    try {
      const checkIns = await queryByIndex('checkIns', 'by-status', status)
      runInAction(() => {
        this.loading = false
      })
      return checkIns // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Filter check-ins in memory
  getFilteredCheckIns(filter: {
    habitId?: number;
    status?: CheckIn['status'];
    fromDate?: Date;
    toDate?: Date;
  }) {
    return this.checkIns.filter(checkIn => {
      let match = true
      
      if (filter.habitId !== undefined) {
        match = match && checkIn.habitId === filter.habitId
      }
      
      if (filter.status !== undefined) {
        match = match && checkIn.status === filter.status
      }
      
      if (filter.fromDate !== undefined) {
        const checkInDate = new Date(checkIn.date).getTime()
        const fromDate = filter.fromDate.getTime()
        match = match && checkInDate >= fromDate
      }
      
      if (filter.toDate !== undefined) {
        const checkInDate = new Date(checkIn.date).getTime()
        const toDate = filter.toDate.getTime()
        match = match && checkInDate <= toDate
      }
      
      return match
    })
  }
}

export default CheckInStore