/**
 * Format frequency to a human-readable string
 */
export const formatFrequency = (frequency: string): string => {
  switch (frequency) {
    case 'daily':
      return '每日'
    case 'weekly':
      return '每周'
    case 'monthly':
      return '每月'
    default:
      return frequency
  }
}

/**
 * Format date to a human-readable string
 */
export const formatDate = (date: Date | string | number): string => {
  // 确保传入的日期是合法的Date对象
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    try {
      date = new Date(date)
      if (isNaN(date.getTime())) {
        console.error('无效的日期:', date)
        return '无效日期'
      }
    } catch (error) {
      console.error('日期格式化错误:', error)
      return '无效日期'
    }
  }
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date to a simple date string (YYYY-MM-DD)
 */
export const formatSimpleDate = (date: Date | string | number): string => {
  // 确保传入的日期是合法的Date对象
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    try {
      date = new Date(date)
      if (isNaN(date.getTime())) {
        console.error('无效的日期:', date)
        return '无效日期'
      }
    } catch (error) {
      console.error('日期格式化错误:', error)
      return '无效日期'
    }
  }
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

/**
 * Format task status to a human-readable string
 */
export const formatTaskStatus = (status: string): string => {
  switch (status) {
    case 'pending':
      return '未开始'
    case 'in-progress':
      return '进行中'
    case 'completed':
      return '已完成'
    default:
      return status
  }
}

/**
 * Format task priority to a human-readable string
 */
export const formatTaskPriority = (priority: string): string => {
  switch (priority) {
    case 'low':
      return '低'
    case 'medium':
      return '中'
    case 'high':
      return '高'
    default:
      return priority
  }
}

/**
 * Format check-in status to a human-readable string
 */
export const formatCheckInStatus = (status: string): string => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'half-completed':
      return '部分完成'
    case 'skipped':
      return '已跳过'
    default:
      return status
  }
}