import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useRelationshipStore } from "../../stores/StoreContext"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"

interface RelationshipChartsProps {
  className?: string;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#22c55e", "#64748b"]

const RelationshipCharts = observer(({ className = "" }: RelationshipChartsProps) => {
  const relationshipStore = useRelationshipStore()
  
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [contactData, setContactData] = useState<Array<{ name: string; value: number }>>([])
  
  // 计算关系分类和联系状态数据
  useEffect(() => {
    if (relationshipStore.relationships.length === 0) return
    
    // 分类统计
    const categoryMap = new Map<string, number>()
    relationshipStore.relationships.forEach(rel => {
      categoryMap.set(rel.category, (categoryMap.get(rel.category) || 0) + 1)
    })
    
    const categoryChartData = Array.from(categoryMap.entries())
      .map(([category, count], index) => ({
        name: category,
        value: count,
        color: COLORS[index % COLORS.length],
      }))
    
    setCategoryData(categoryChartData)
    
    // 联系状态统计
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)
    
    // 按联系状态分组
    const within7Days = relationshipStore.relationships.filter(rel => 
      rel.lastContact && new Date(rel.lastContact) >= sevenDaysAgo
    ).length
    
    const within30Days = relationshipStore.relationships.filter(rel => 
      rel.lastContact && new Date(rel.lastContact) >= thirtyDaysAgo && new Date(rel.lastContact) < sevenDaysAgo
    ).length
    
    const within90Days = relationshipStore.relationships.filter(rel => 
      rel.lastContact && new Date(rel.lastContact) >= ninetyDaysAgo && new Date(rel.lastContact) < thirtyDaysAgo
    ).length
    
    const overNinetyDays = relationshipStore.relationships.filter(rel => 
      rel.lastContact && new Date(rel.lastContact) < ninetyDaysAgo
    ).length
    
    const noContact = relationshipStore.relationships.filter(rel => 
      !rel.lastContact
    ).length
    
    const contactChartData = [
      { name: "最近7天", value: within7Days },
      { name: "最近30天", value: within30Days },
      { name: "最近90天", value: within90Days },
      { name: "超过90天", value: overNinetyDays },
      { name: "未联系", value: noContact },
    ].filter(item => item.value > 0)
    
    setContactData(contactChartData)
    
  }, [relationshipStore.relationships])
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">社交关系统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 关系分类饼图 */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium mb-2">关系分类</h3>
            <div className="w-full h-[180px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => [`${value ?? 0}个联系人`, '数量']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  暂无数据
                </div>
              )}
            </div>
          </div>
          
          {/* 联系频率条形图 */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium mb-2">联系频率</h3>
            <div className="w-full h-[180px]">
              {contactData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contactData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 40,
                      bottom: 5,
                    }}
                  >
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip formatter={(value: number | undefined) => [`${value ?? 0}个联系人`, '数量']} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
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

export default RelationshipCharts