import { useState, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import HabitHeatMap from '../charts/HabitHeatMap'
import TaskPieCharts from '../charts/TaskPieCharts'
import ActivityTrendChart from '../charts/ActivityTrendChart'
import RelationshipCharts from '../charts/RelationshipCharts'
import { 
  useHabitStore, 
  useCheckInStore, 
  useLifeMomentStore, 
  useTaskStore, 
  useRelationshipStore, 
  useIdeaStore 
} from '../../stores/StoreContext'

const Statistics = observer(() => {
  // Access all stores
  const habitStore = useHabitStore()
  const checkInStore = useCheckInStore()
  const lifeMomentStore = useLifeMomentStore()
  const taskStore = useTaskStore()
  const relationshipStore = useRelationshipStore()
  const ideaStore = useIdeaStore()
  
  // Statistics state
  const [habitStats, setHabitStats] = useState({
    totalHabits: 0,
    activeHabits: 0,
    totalCheckIns: 0,
    completionRate: 0,
    streakDays: 0
  })
  
  const [momentStats, setMomentStats] = useState({
    totalMoments: 0,
    uniqueTags: 0,
    thisWeek: 0,
    thisMonth: 0
  })
  
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    workTasks: 0,
    growthTasks: 0,
    overdueCount: 0,
    completionRate: 0
  })
  
  const [relationshipStats, setRelationshipStats] = useState({
    totalRelationships: 0,
    needContactSoon: 0,
    contactedThisMonth: 0
  })
  
  const [ideaStats, setIdeaStats] = useState({
    totalIdeas: 0,
    uniqueCategories: 0,
    thisWeek: 0,
    thisMonth: 0
  })

  // 创建每个统计方法的memoized版本
  const memoizedHabitStats = useCallback(() => {
    // 内联计算函数，不再需要依赖calculateHabitStats
    const activeHabits = habitStore.habits.filter(h => h.active).length
    const totalCheckIns = checkInStore.checkIns.length
    const completedCheckIns = checkInStore.checkIns.filter(c => c.status === 'completed').length
    const completionRate = totalCheckIns > 0 ? Math.round((completedCheckIns / totalCheckIns) * 100) : 0

    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 排序打卡记录
    const sortedCheckIns = [...checkInStore.checkIns]
      .filter(c => c.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (sortedCheckIns.length > 0) {
      let currentDate = new Date(today)
      
      for (const checkIn of sortedCheckIns) {
        const checkInDate = new Date(checkIn.date)
        checkInDate.setHours(0, 0, 0, 0)
        
        const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 1) {
          streakDays++
          currentDate = new Date(checkInDate)
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
    }
    
    setHabitStats({
      totalHabits: habitStore.habits.length,
      activeHabits,
      totalCheckIns,
      completionRate,
      streakDays
    })
  }, [habitStore.habits, checkInStore.checkIns])
  
  const memoizedMomentStats = useCallback(() => {
    // 内联计算函数，不再需要依赖calculateMomentStats
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const uniqueTags = new Set<string>()
    lifeMomentStore.lifeMoments.forEach(moment => {
      moment.tags.forEach(tag => uniqueTags.add(tag))
    })
    
    const thisWeekMoments = lifeMomentStore.lifeMoments.filter(
      moment => new Date(moment.date) >= startOfWeek
    ).length
    
    const thisMonthMoments = lifeMomentStore.lifeMoments.filter(
      moment => new Date(moment.date) >= startOfMonth
    ).length
    
    setMomentStats({
      totalMoments: lifeMomentStore.lifeMoments.length,
      uniqueTags: uniqueTags.size,
      thisWeek: thisWeekMoments,
      thisMonth: thisMonthMoments
    })
  }, [lifeMomentStore.lifeMoments])
  
  const memoizedTaskStats = useCallback(() => {
    // 内联计算函数，不再需要依赖calculateTaskStats
    const completedTasks = taskStore.tasks.filter(t => t.status === 'completed').length
    const pendingTasks = taskStore.tasks.filter(t => t.status === 'pending').length
    const inProgressTasks = taskStore.tasks.filter(t => t.status === 'in-progress').length
    const workTasks = taskStore.tasks.filter(t => t.type === 'work').length
    const growthTasks = taskStore.tasks.filter(t => t.type === 'growth').length
    
    // 移除了截止日期功能，设置逾期任务为0
    const overdueTasks = 0
    
    const completionRate = taskStore.tasks.length > 0 
      ? Math.round((completedTasks / taskStore.tasks.length) * 100) 
      : 0
    
    setTaskStats({
      totalTasks: taskStore.tasks.length,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      workTasks,
      growthTasks,
      overdueCount: overdueTasks,
      completionRate
    })
  }, [taskStore.tasks])
  
  const memoizedRelationshipStats = useCallback(() => {
    // 内联计算函数，不再需要依赖calculateRelationshipStats
    const today = new Date()
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(today.getDate() + 7)
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const needContactSoon = relationshipStore.relationships.filter(
      r => r.nextContact && new Date(r.nextContact) <= sevenDaysLater
    ).length
    
    const contactedThisMonth = relationshipStore.relationships.filter(
      r => r.lastContact && new Date(r.lastContact) >= startOfMonth
    ).length
    
    setRelationshipStats({
      totalRelationships: relationshipStore.relationships.length,
      needContactSoon,
      contactedThisMonth
    })
  }, [relationshipStore.relationships])
  
  const memoizedIdeaStats = useCallback(() => {
    // 内联计算函数，不再需要依赖calculateIdeaStats
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const uniqueCategories = new Set<string>()
    ideaStore.ideas.forEach(idea => {
      uniqueCategories.add(idea.category)
    })
    
    const thisWeekIdeas = ideaStore.ideas.filter(
      idea => new Date(idea.date) >= startOfWeek
    ).length
    
    const thisMonthIdeas = ideaStore.ideas.filter(
      idea => new Date(idea.date) >= startOfMonth
    ).length
    
    setIdeaStats({
      totalIdeas: ideaStore.ideas.length,
      uniqueCategories: uniqueCategories.size,
      thisWeek: thisWeekIdeas,
      thisMonth: thisMonthIdeas
    })
  }, [ideaStore.ideas])

  const loadStatistics = useCallback(() => {
    // 调用所有统计方法
    memoizedHabitStats()
    memoizedMomentStats()
    memoizedTaskStats()
    memoizedRelationshipStats()
    memoizedIdeaStats()
  }, [
    memoizedHabitStats,
    memoizedMomentStats, 
    memoizedTaskStats,
    memoizedRelationshipStats,
    memoizedIdeaStats
  ])
  
  // Calculate statistics when data changes
  useEffect(() => {
    loadStatistics()
  }, [
    habitStore.habits, 
    checkInStore.checkIns, 
    lifeMomentStore.lifeMoments, 
    taskStore.tasks,
    relationshipStore.relationships,
    ideaStore.ideas,
    loadStatistics
  ])
  
  // 原来的计算函数已经内联到各自的useCallback中，不再需要独立定义

  return (
    <div className="container mx-auto pb-20 md:pb-0">
      <div className="mb-4">
        <h1 className="text-3xl font-bold hidden md:block">统计数据</h1>
        <p className="text-muted-foreground mt-2 text-sm">查看你的成长轨迹和习惯培养情况</p>
      </div>
      
      {/* 概览统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <Card>
          <CardHeader className="pb-2 px-4 py-3 md:px-6 md:py-4">
            <CardTitle className="text-base md:text-lg">待办事项</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2 md:px-6">
            <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{taskStats.completionRate}%</div>
            <p className="text-xs md:text-sm text-muted-foreground">任务完成率</p>
            <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span>完成任务:</span>
                <span className="font-medium">{taskStats.completedTasks}/{taskStats.totalTasks}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>进行中:</span>
                <span className="font-medium">{taskStats.inProgressTasks}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>已逾期:</span>
                <span className="font-medium text-red-500">{taskStats.overdueCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-4 py-3 md:px-6 md:py-4">
            <CardTitle className="text-base md:text-lg">微习惯</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2 md:px-6">
            <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{habitStats.completionRate}%</div>
            <p className="text-xs md:text-sm text-muted-foreground">习惯坚持率</p>
            <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span>活跃习惯:</span>
                <span className="font-medium">{habitStats.activeHabits}/{habitStats.totalHabits}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>打卡总数:</span>
                <span className="font-medium">{habitStats.totalCheckIns}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>当前连续坚持:</span>
                <span className="font-medium">{habitStats.streakDays} 天</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-4 py-3 md:px-6 md:py-4">
            <CardTitle className="text-base md:text-lg">社交关系</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2 md:px-6">
            <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{relationshipStats.totalRelationships}</div>
            <p className="text-xs md:text-sm text-muted-foreground">总联系人数</p>
            <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span>最近需联系:</span>
                <span className="font-medium">{relationshipStats.needContactSoon}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>本月已联系:</span>
                <span className="font-medium">{relationshipStats.contactedThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 数据统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-2 px-4 py-3 md:px-6 md:py-4">
            <CardTitle className="text-base md:text-lg">生活点滴</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2 md:px-6">
            <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{momentStats.totalMoments}</div>
            <p className="text-xs md:text-sm text-muted-foreground">总记录数</p>
            <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span>本周记录:</span>
                <span className="font-medium">{momentStats.thisWeek}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>本月记录:</span>
                <span className="font-medium">{momentStats.thisMonth}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>标签数量:</span>
                <span className="font-medium">{momentStats.uniqueTags}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-4 py-3 md:px-6 md:py-4">
            <CardTitle className="text-base md:text-lg">灵感想法</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2 md:px-6">
            <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{ideaStats.totalIdeas}</div>
            <p className="text-xs md:text-sm text-muted-foreground">总灵感数</p>
            <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span>本周灵感:</span>
                <span className="font-medium">{ideaStats.thisWeek}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>本月灵感:</span>
                <span className="font-medium">{ideaStats.thisMonth}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span>分类数量:</span>
                <span className="font-medium">{ideaStats.uniqueCategories}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 图表统计部分 */}
      <div className="mt-6 space-y-6">
        {/* 热力图 */}
        <HabitHeatMap weeks={7} className="w-full overflow-hidden" />
        
        {/* 活动趋势图 */}
        <ActivityTrendChart className="w-full" />
        
        {/* 任务饼图 */}
        <TaskPieCharts className="w-full" />
        
        {/* 社交关系图表 */}
        <RelationshipCharts className="w-full" />
      </div>
    </div>
  )
})

export default Statistics