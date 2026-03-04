import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { format, subDays, addDays, startOfWeek, eachDayOfInterval } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useCheckInStore } from "../../stores/StoreContext"
import type { CheckIn } from "../../services/database"

interface HeatMapProps {
  weeks?: number; // 显示的周数
  className?: string;
}

const HabitHeatMap = observer(({ weeks = 7, className = "" }: HeatMapProps) => {
  const checkInStore = useCheckInStore()
  const [heatmapData, setHeatmapData] = useState<{
    [key: string]: { value: number; checkIns: CheckIn[] };
  }>({})
  
  // 计算热力图数据
  useEffect(() => {
    if (checkInStore.checkIns.length === 0) return
    
    const now = new Date()
    const endDate = now
    const startDate = subDays(now, weeks * 7)
    
    const data: { [key: string]: { value: number; checkIns: CheckIn[] } } = {}
    
    // 初始化所有日期
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(date => {
      const dateStr = format(date, "yyyy-MM-dd")
      data[dateStr] = { value: 0, checkIns: [] }
    })
    
    // 填充打卡数据
    checkInStore.checkIns.forEach(checkIn => {
      const checkInDate = new Date(checkIn.date)
      const dateStr = format(checkInDate, "yyyy-MM-dd")
      
      if (checkInDate >= startDate && checkInDate <= endDate) {
        if (!data[dateStr]) {
          data[dateStr] = { value: 0, checkIns: [] }
        }
        
        // 根据打卡状态增加权重
        if (checkIn.status === 'completed') {
          data[dateStr].value += 1
        } else if (checkIn.status === 'half-completed') {
          data[dateStr].value += 0.5
        }
        
        data[dateStr].checkIns.push(checkIn)
      }
    })

    setHeatmapData(data)
  }, [checkInStore.checkIns, weeks])
  
  // 根据打卡次数确定颜色级别
  const getColorClass = (value: number) => {
    if (value === 0) return 'bg-slate-100 dark:bg-slate-800'
    if (value <= 0.5) return 'bg-emerald-200 dark:bg-emerald-900/50'
    if (value <= 1) return 'bg-emerald-300 dark:bg-emerald-800'
    if (value <= 2) return 'bg-emerald-400 dark:bg-emerald-700'
    if (value <= 3) return 'bg-emerald-500 dark:bg-emerald-600'
    return 'bg-emerald-600 dark:bg-emerald-500'
  }

  // 生成热力图日期格子
  const generateHeatmapCells = () => {
    const today = new Date()
    const startDay = subDays(today, weeks * 7)
    const firstDayOfGrid = startOfWeek(startDay, { locale: zhCN })

    // 生成所有日期数据
    const allDates: { date: Date; dateStr: string; isToday: boolean; value: number; checkIns: CheckIn[] }[] = []
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        const date = addDays(firstDayOfGrid, week * 7 + day)
        const dateStr = format(date, "yyyy-MM-dd")
        const isToday = format(today, "yyyy-MM-dd") === dateStr
        const dayData = heatmapData[dateStr] || { value: 0, checkIns: [] }
        allDates.push({
          date,
          dateStr,
          isToday,
          value: dayData.value,
          checkIns: dayData.checkIns,
        })
      }
    }

    // 生成星期标签（纵向排列）
    const weekLabels = []
    for (let i = 0; i < 7; i++) {
      const labelDate = addDays(firstDayOfGrid, i)
      weekLabels.push(
        <div key={`label-${i}`} className="text-xs text-muted-foreground w-7 h-7 flex items-center justify-center">
          {format(labelDate, 'EEEEE', { locale: zhCN })}
        </div>
      )
    }

    // 按星期几分组（0=周一, 6=周日）
    const dayOfWeekRows = []
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const rowCells = []
      for (let week = 0; week < weeks; week++) {
        const index = week * 7 + dayOfWeek
        const dayData = allDates[index]
        if (dayData) {
          rowCells.push(
            <div
              key={dayData.dateStr}
              title={`${dayData.dateStr}: ${dayData.checkIns.length}次打卡`}
              className={`
                w-7 h-7 rounded-sm border flex items-center justify-center text-[10px] font-medium
                ${dayData.isToday ? 'border-primary border-2' : 'border-border'}
                ${getColorClass(dayData.value)}
              `}
            >
              {format(dayData.date, 'd')}
            </div>
          )
        }
      }
      dayOfWeekRows.push(
        <div key={`row-${dayOfWeek}`} className="flex gap-1 items-center">
          {rowCells}
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        <div className="flex flex-col justify-between">
          {weekLabels}
        </div>
        <div className="flex flex-col gap-1">
          {dayOfWeekRows}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">习惯打卡热力图</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <div className="overflow-x-auto pb-2 flex justify-center">
          {generateHeatmapCells()}
        </div>
        <div className="mt-4 flex items-center justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm border border-border"></div>
              <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900/50 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-700 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-600 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-500 rounded-sm"></div>
            </div>
            <span>多</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default HabitHeatMap