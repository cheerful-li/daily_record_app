import { makeAutoObservable, runInAction, computed, observable } from "mobx"
import type { LifeMoment } from "../services/database"
import { getById, queryByIndex } from "../services/database"
import { add, update, remove, getAll } from "../services/enhancedDatabase"

// 定义过滤选项接口
export interface LifeMomentFilterOptions {
  title?: string;
  tags?: string[];
  fromDate?: Date;
  toDate?: Date;
}

class LifeMomentStore {
  lifeMoments: LifeMoment[] = []
  loading = false
  error: Error | null = null
  
  // 当前过滤选项
  filterOptions: LifeMomentFilterOptions = observable({
    title: '',
    tags: [],
    fromDate: undefined,
    toDate: undefined
  })

  constructor() {
    makeAutoObservable(this, {
      filteredLifeMoments: computed
    })
    this.loadLifeMoments()
  }

  // Load all life moments
  async loadLifeMoments() {
    this.loading = true
    this.error = null

    try {
      const lifeMoments = await getAll("lifeMoments")
      runInAction(() => {
        this.lifeMoments = lifeMoments
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Add a new life moment
  async addLifeMoment(
    lifeMoment: Omit<LifeMoment, "id" | "createdAt" | "updatedAt">
  ) {
    this.loading = true
    this.error = null

    try {
      const id = await add("lifeMoments", lifeMoment)
      const newLifeMoment = await getById("lifeMoments", id)

      if (newLifeMoment) {
        runInAction(() => {
          this.lifeMoments.push(newLifeMoment as LifeMoment)
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

  // Update an existing life moment
  async updateLifeMoment(id: number, lifeMomentData: Partial<LifeMoment>) {
    this.loading = true
    this.error = null

    try {
      console.log("在LifeMomentStore中更新生活点滴:", {
        id,
        data: lifeMomentData,
      })

      // 首先获取现有数据
      const existingLifeMoment = await getById("lifeMoments", id)
      if (!existingLifeMoment) {
        throw new Error(`未找到ID为${id}的生活点滴记录`)
      }

      // 处理tags数组，确保是简单字符串数组
      const processedData: Partial<LifeMoment> = { ...lifeMomentData }
      if (lifeMomentData.tags) {
        // 确保标签是简单的字符串数组
        processedData.tags = lifeMomentData.tags.map((tag) => String(tag))
      }

      // 处理日期字段
      if (lifeMomentData.date) {
        // 确保日期是有效的Date对象
        try {
          const date = new Date(lifeMomentData.date)
          if (!isNaN(date.getTime())) {
            processedData.date = date
          } else {
            // 如果日期无效，使用当前日期
            processedData.date = new Date()
            console.warn("使用了无效的日期，已替换为当前日期")
          }
        } catch (error) {
          // 如果转换日期出错，使用当前日期
          processedData.date = new Date()
          console.error("处理日期时发生错误，已替换为当前日期:", error)
        }
      }

      // 移除所有可能导致序列化错误的属性
      if (
        processedData.attachments &&
        Array.isArray(processedData.attachments)
      ) {
        processedData.attachments = processedData.attachments.map((att) =>
          String(att)
        )
      }

      console.log("处理后的数据:", processedData)

      await update("lifeMoments", id, processedData)
      const updatedLifeMoment = await getById("lifeMoments", id)
      console.log("更新后读取到的生活点滴:", updatedLifeMoment)

      runInAction(() => {
        const index = this.lifeMoments.findIndex((l) => l.id === id)
        if (index !== -1 && updatedLifeMoment) {
          // 替换整个对象引用，确保 MobX 可以检测到变化
          this.lifeMoments[index] = updatedLifeMoment as LifeMoment
          console.log("已更新内存中的生活点滴数据")
        } else {
          console.error("找不到要更新的生活点滴或更新后的数据为空", {
            index,
            updatedLifeMoment,
          })
        }
        this.loading = false
      })
    } catch (error) {
      console.error("更新生活点滴时发生错误:", error)
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Delete a life moment
  async deleteLifeMoment(id: number) {
    this.loading = true
    this.error = null

    try {
      await remove("lifeMoments", id)
      runInAction(() => {
        this.lifeMoments = this.lifeMoments.filter((l) => l.id !== id)
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
    }
  }

  // Get life moments by date
  async getLifeMomentsByDate(date: Date) {
    this.loading = true
    this.error = null

    try {
      // Note: This is a simplification and might need adjustment for date comparison
      const lifeMoments = await queryByIndex("lifeMoments", "by-date", date)
      runInAction(() => {
        this.loading = false
      })
      return lifeMoments // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // Get life moments by tag
  async getLifeMomentsByTag(tag: string) {
    this.loading = true
    this.error = null

    try {
      const lifeMoments = await queryByIndex("lifeMoments", "by-tags", [tag])
      runInAction(() => {
        this.loading = false
      })
      return lifeMoments // 正确的返回位置
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error : new Error(String(error))
        this.loading = false
      })
      return [] // 正确的返回位置
    }
  }

  // 设置过滤选项方法
  setFilterOptions(options: Partial<LifeMomentFilterOptions>) {
    Object.assign(this.filterOptions, options)
  }

  // 使用computed计算过滤后的生活点滴列表
  get filteredLifeMoments() {
    return computed(() => {
      return this.lifeMoments.filter((lifeMoment) => {
        let match = true

        if (this.filterOptions.title && this.filterOptions.title.trim() !== "") {
          match =
            match &&
            lifeMoment.title.toLowerCase().includes(this.filterOptions.title.toLowerCase())
        }

        if (this.filterOptions.tags && this.filterOptions.tags.length > 0) {
          match =
            match && this.filterOptions.tags.some((tag) => lifeMoment.tags.includes(tag))
        }

        if (this.filterOptions.fromDate !== undefined) {
          match = match && lifeMoment.date >= this.filterOptions.fromDate
        }

        if (this.filterOptions.toDate !== undefined) {
          match = match && lifeMoment.date <= this.filterOptions.toDate
        }

        return match
      })
    }).get()
  }

  // 旧的过滤方法（保留向后兼容）
  getFilteredLifeMoments(filter: {
    title?: string;
    tags?: string[];
    fromDate?: Date;
    toDate?: Date;
  }) {
    // 设置过滤选项
    this.setFilterOptions(filter)
    
    // 返回计算后的结果
    return this.filteredLifeMoments
  }
}

export default LifeMomentStore
