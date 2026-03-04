import type { Habit, CheckIn } from '../services/database'

/**
 * 判断习惯是否可打卡
 * @param habit 习惯对象
 * @param checkIns 该习惯的所有打卡记录
 * @returns 是否可打卡
 */
export const isHabitCheckInAvailable = (
  habit: Habit,
  checkIns: CheckIn[]
): boolean => {
  if (!habit.active) {
    return false
  }

  // 获取最近一次打卡记录
  const sortedCheckIns = [...checkIns]
    .filter(ci => ci.habitId === habit.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const lastCheckIn = sortedCheckIns[0]
  if (!lastCheckIn) {
    return true // 如果没有打卡记录，可以打卡
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastCheckInDate = new Date(lastCheckIn.date)
  lastCheckInDate.setHours(0, 0, 0, 0)
  
  // 如果是今天已经打过卡，不能再打卡
  if (today.getTime() === lastCheckInDate.getTime()) {
    return false
  }

  switch (habit.frequency) {
    case 'daily':
      // 每日打卡：上次打卡日期不是今天才可以打卡
      return true
    
    case 'weekly': {
      // 每周打卡：判断是否在同一自然周
      const lastWeekStart = new Date(lastCheckInDate)
      lastWeekStart.setDate(lastCheckInDate.getDate() - lastCheckInDate.getDay())
      lastWeekStart.setHours(0, 0, 0, 0)
      
      const lastWeekEnd = new Date(lastWeekStart)
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
      lastWeekEnd.setHours(23, 59, 59, 999)
      
      const currentWeekStart = new Date(today)
      currentWeekStart.setDate(today.getDate() - today.getDay())
      currentWeekStart.setHours(0, 0, 0, 0)
      
      // 如果当前时间不在上次打卡的那个自然周内，则可以打卡
      return currentWeekStart.getTime() > lastWeekStart.getTime()
    }
    
    case 'monthly': {
      // 每月打卡：判断是否在同一自然月
      return (
        today.getMonth() !== lastCheckInDate.getMonth() ||
        today.getFullYear() !== lastCheckInDate.getFullYear()
      )
    }
    
    default:
      return true
  }
}

/**
 * 获取下一次可打卡的日期
 * @param habit 习惯对象
 * @param lastCheckInDate 上次打卡日期
 * @returns 下一次可打卡的日期
 */
export const getNextCheckInDate = (habit: Habit, lastCheckInDate: Date): Date => {
  const nextDate = new Date(lastCheckInDate)
  
  switch (habit.frequency) {
    case 'daily':
      // 每日：第二天可打卡
      nextDate.setDate(nextDate.getDate() + 1)
      break
    
    case 'weekly': {
      // 每周：下一个自然周的第一天
      const dayOfWeek = nextDate.getDay() // 0 是周日, 6 是周六
      const daysUntilNextWeek = 7 - dayOfWeek
      nextDate.setDate(nextDate.getDate() + daysUntilNextWeek)
      break
    }
    
    case 'monthly': {
      // 每月：下个月的第一天
      nextDate.setMonth(nextDate.getMonth() + 1)
      nextDate.setDate(1)
      break
    }
  }
  
  return nextDate
}

/**
 * 过滤可打卡的习惯
 * @param habits 所有习惯
 * @param checkIns 所有打卡记录
 * @returns 可打卡的习惯列表
 */
export const filterCheckableHabits = (habits: Habit[], checkIns: CheckIn[]): Habit[] => {
  return habits.filter(habit => isHabitCheckInAvailable(habit, checkIns))
}

/**
 * 判断习惯今天是否需要打卡
 * @param habit 习惯对象
 * @param checkIns 所有打卡记录
 * @returns 是否需要今天打卡
 */
/**
 * 获取习惯最近一次打卡记录
 * @param habit 习惯对象
 * @param checkIns 所有打卡记录
 * @returns 最近一次打卡记录，如果没有则返回null
 */
export const getLastCheckIn = (habit: Habit, checkIns: CheckIn[]): CheckIn | null => {
  if (!habit.id) return null
  
  // 获取该习惯的所有打卡记录，并按日期降序排序
  const habitCheckIns = checkIns
    .filter(ci => ci.habitId === habit.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // 返回最近的一条记录，如果没有则返回null
  return habitCheckIns.length > 0 ? habitCheckIns[0] : null
}

/**
 * 获取习惯最近一次打卡的时间（只取小时和分钟）
 * @param habit 习惯对象
 * @param checkIns 所有打卡记录
 * @returns 最近打卡的时间值（小时*60+分钟），如果没有打卡记录则返回-1
 */
export const getLastCheckInTimeOfDay = (habit: Habit, checkIns: CheckIn[]): number => {
  const lastCheckIn = getLastCheckIn(habit, checkIns)
  if (!lastCheckIn) return -1
  
  const date = new Date(lastCheckIn.date)
  // 返回一天中的分钟数，用于比较时间先后
  return date.getHours() * 60 + date.getMinutes()
}

export const isHabitNeedsCheckInToday = (habit: Habit, checkIns: CheckIn[]): boolean => {
  // 如果习惯不活跃，不需要打卡
  if (!habit.active) {
    return false
  }
  
  // 获取今天的打卡记录
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaysCheckIns = checkIns.filter(ci => {
    const checkInDate = new Date(ci.date)
    checkInDate.setHours(0, 0, 0, 0)
    return ci.habitId === habit.id && checkInDate.getTime() === today.getTime()
  })
  
  // 如果今天已经打卡，则不需要再打卡
  if (todaysCheckIns.length > 0) {
    return false
  }
  
  // 根据频率判断今天是否需要打卡
  switch (habit.frequency) {
    case 'daily':
      // 每日习惯每天都需要打卡
      return true
      
    case 'weekly': {
      // 每周习惯，需要判断本周是否已打过卡
      const habitCheckIns = checkIns.filter(ci => ci.habitId === habit.id)
      if (habitCheckIns.length === 0) return true
      
      // 获取本周开始日期
      const currentWeekStart = new Date(today)
      currentWeekStart.setDate(today.getDate() - today.getDay())
      currentWeekStart.setHours(0, 0, 0, 0)
      
      // 检查本周内是否已有打卡记录
      const hasCheckInThisWeek = habitCheckIns.some(ci => {
        const date = new Date(ci.date)
        return date >= currentWeekStart && date <= today
      })
      
      return !hasCheckInThisWeek
    }
    
    case 'monthly': {
      // 每月习惯，需要判断本月是否已打过卡
      const habitCheckIns = checkIns.filter(ci => ci.habitId === habit.id)
      if (habitCheckIns.length === 0) return true
      
      // 获取本月开始日期
      const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      
      // 检查本月内是否已有打卡记录
      const hasCheckInThisMonth = habitCheckIns.some(ci => {
        const date = new Date(ci.date)
        return date >= currentMonthStart && date <= today
      })
      
      return !hasCheckInThisMonth
    }
    
    default:
      return true
  }
}