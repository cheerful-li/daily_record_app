import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useTaskStore } from "../../stores/StoreContext"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface TaskPieChartsProps {
  className?: string;
}

const TaskPieCharts = observer(({ className = "" }: TaskPieChartsProps) => {
  const taskStore = useTaskStore()
  
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [typeData, setTypeData] = useState<Array<{ name: string; value: number; color: string }>>([])
  
  // 计算任务状态分布和类型分布数据
  useEffect(() => {
    if (taskStore.tasks.length === 0) return
    
    // 状态分布
    const statusCounts = {
      pending: taskStore.tasks.filter(task => task.status === "pending").length,
      inProgress: taskStore.tasks.filter(task => task.status === "in-progress").length,
      completed: taskStore.tasks.filter(task => task.status === "completed").length,
    }
    
    const statusChartData = [
      { name: "未开始", value: statusCounts.pending, color: "#94a3b8" },
      { name: "进行中", value: statusCounts.inProgress, color: "#3b82f6" },
      { name: "已完成", value: statusCounts.completed, color: "#22c55e" },
    ].filter(item => item.value > 0)
    
    setStatusData(statusChartData)
    
    // 类型分布
    const typeCounts = {
      work: taskStore.tasks.filter(task => task.type === "work").length,
      growth: taskStore.tasks.filter(task => task.type === "growth").length,
    }
    
    const typeChartData = [
      { name: "工作", value: typeCounts.work, color: "#8b5cf6" },
      { name: "成长", value: typeCounts.growth, color: "#f59e0b" },
    ].filter(item => item.value > 0)
    
    setTypeData(typeChartData)
    
  }, [taskStore.tasks])
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">任务分布</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 状态分布饼图 */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium mb-2">状态分布</h3>
            <div className="w-full h-[180px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => [`${value ?? 0}个任务`, '数量']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  暂无数据
                </div>
              )}
            </div>
          </div>
          
          {/* 类型分布饼图 */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium mb-2">类型分布</h3>
            <div className="w-full h-[180px]">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => [`${value ?? 0}个任务`, '数量']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  暂无数据
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default TaskPieCharts