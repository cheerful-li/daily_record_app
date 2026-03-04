import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  format,
  startOfMonth,
  eachDayOfInterval,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useLifeMomentStore, useIdeaStore } from "../../stores/StoreContext"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "../ui/button"

interface ActivityTrendChartProps {
  className?: string;
}

type TimeRange = "week" | "month" | "quarter" | "year";

const ActivityTrendChart = observer(({ className = "" }: ActivityTrendChartProps) => {
  const lifeMomentStore = useLifeMomentStore()
  const ideaStore = useIdeaStore()
  
  const [timeRange, setTimeRange] = useState<TimeRange>("month")
  const [chartData, setChartData] = useState<Array<{
    date: string;
    moments: number;
    ideas: number;
  }>>([])
  
  // 根据时间范围生成图表数据
  useEffect(() => {
    // 确定日期范围
    const today = new Date()
    let startDate: Date
    let endDate = today
    let dateFormat: string
    
    switch (timeRange) {
      case "week":
        startDate = startOfWeek(today)
        endDate = endOfWeek(today)
        dateFormat = "MM-dd"
        break
      case "month":
        startDate = startOfMonth(today)
        dateFormat = "MM-dd"
        break
      case "quarter":
        startDate = subDays(today, 90)
        dateFormat = "MM-dd"
        break
      case "year":
        startDate = subDays(today, 365)
        dateFormat = "yyyy-MM"
        break
      default:
        startDate = startOfMonth(today)
        dateFormat = "MM-dd"
    }
    
    // 获取日期范围内的每一天
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
    
    // 按日期聚合生活点滴和灵感数据
    const data = dateRange.map(date => {
      // 当天的生活点滴数量
      const momentsCount = lifeMomentStore.lifeMoments.filter(moment => 
        isSameDay(new Date(moment.date), date)
      ).length
      
      // 当天的灵感数量
      const ideasCount = ideaStore.ideas.filter(idea => 
        isSameDay(new Date(idea.date), date)
      ).length
      
      return {
        date: format(date, dateFormat),
        moments: momentsCount,
        ideas: ideasCount,
      }
    })
    
    // 如果是年视图，按月聚合数据
    if (timeRange === "year") {
      const monthlyData: Record<string, { moments: number; ideas: number }> = {}
      
      data.forEach(day => {
        if (!monthlyData[day.date]) {
          monthlyData[day.date] = { moments: 0, ideas: 0 }
        }
        monthlyData[day.date].moments += day.moments
        monthlyData[day.date].ideas += day.ideas
      })
      
      const aggregatedData = Object.entries(monthlyData).map(([date, counts]) => ({
        date,
        moments: counts.moments,
        ideas: counts.ideas,
      }))
      
      setChartData(aggregatedData)
    } else {
      setChartData(data)
    }
    
  }, [timeRange, lifeMomentStore.lifeMoments, ideaStore.ideas])
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between">
          <CardTitle className="text-lg">记录活跃度趋势</CardTitle>
          <div className="flex space-x-1 mt-1">
            <Button
              size="sm"
              variant={timeRange === "week" ? "default" : "outline"}
              onClick={() => setTimeRange("week")}
              className="text-xs h-7 px-2"
            >
              周
            </Button>
            <Button
              size="sm"
              variant={timeRange === "month" ? "default" : "outline"}
              onClick={() => setTimeRange("month")}
              className="text-xs h-7 px-2"
            >
              月
            </Button>
            <Button
              size="sm"
              variant={timeRange === "quarter" ? "default" : "outline"}
              onClick={() => setTimeRange("quarter")}
              className="text-xs h-7 px-2"
            >
              季度
            </Button>
            <Button
              size="sm"
              variant={timeRange === "year" ? "default" : "outline"}
              onClick={() => setTimeRange("year")}
              className="text-xs h-7 px-2"
            >
              年
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="moments"
                  name="生活点滴"
                  stroke="#3b82f6"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="ideas"
                  name="灵感想法"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              暂无数据
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export default ActivityTrendChart