import type { Habit, CheckIn } from '../services/database';

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
    return false;
  }

  // 获取最近一次打卡记录
  const sortedCheckIns = [...checkIns]
    .filter(ci => ci.habitId === habit.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastCheckIn = sortedCheckIns[0];
  if (!lastCheckIn) {
    return true; // 如果没有打卡记录，可以打卡
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCheckInDate = new Date(lastCheckIn.date);
  lastCheckInDate.setHours(0, 0, 0, 0);
  
  // 如果是今天已经打过卡，不能再打卡
  if (today.getTime() === lastCheckInDate.getTime()) {
    return false;
  }

  switch (habit.frequency) {
    case 'daily':
      // 每日打卡：上次打卡日期不是今天才可以打卡
      return true;
    
    case 'weekly': {
      // 每周打卡：判断是否在同一自然周
      const lastWeekStart = new Date(lastCheckInDate);
      lastWeekStart.setDate(lastCheckInDate.getDate() - lastCheckInDate.getDay());
      lastWeekStart.setHours(0, 0, 0, 0);
      
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59, 999);
      
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);
      
      // 如果当前时间不在上次打卡的那个自然周内，则可以打卡
      return currentWeekStart.getTime() > lastWeekStart.getTime();
    }
    
    case 'monthly': {
      // 每月打卡：判断是否在同一自然月
      return (
        today.getMonth() !== lastCheckInDate.getMonth() ||
        today.getFullYear() !== lastCheckInDate.getFullYear()
      );
    }
    
    default:
      return true;
  }
};

/**
 * 获取下一次可打卡的日期
 * @param habit 习惯对象
 * @param lastCheckInDate 上次打卡日期
 * @returns 下一次可打卡的日期
 */
export const getNextCheckInDate = (habit: Habit, lastCheckInDate: Date): Date => {
  const nextDate = new Date(lastCheckInDate);
  
  switch (habit.frequency) {
    case 'daily':
      // 每日：第二天可打卡
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    
    case 'weekly': {
      // 每周：下一个自然周的第一天
      const dayOfWeek = nextDate.getDay(); // 0 是周日, 6 是周六
      const daysUntilNextWeek = 7 - dayOfWeek;
      nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
      break;
    }
    
    case 'monthly': {
      // 每月：下个月的第一天
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(1);
      break;
    }
  }
  
  return nextDate;
};

/**
 * 过滤可打卡的习惯
 * @param habits 所有习惯
 * @param checkIns 所有打卡记录
 * @returns 可打卡的习惯列表
 */
export const filterCheckableHabits = (habits: Habit[], checkIns: CheckIn[]): Habit[] => {
  return habits.filter(habit => isHabitCheckInAvailable(habit, checkIns));
};