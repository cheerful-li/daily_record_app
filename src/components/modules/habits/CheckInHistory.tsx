import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import type { CheckIn, Habit } from '../../../services/database'
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card'
import { formatSimpleDate, formatCheckInStatus } from '../../../utils/formatters'
import { useHabitStore, useCheckInStore } from '../../../stores/StoreContext'

interface CheckInHistoryProps {
  habitId?: number;
}

const CheckInHistory = observer(({ habitId }: CheckInHistoryProps) => {
  const [history, setHistory] = useState<CheckIn[]>([])
  const [habit, setHabit] = useState<Habit | null>(null)
  const habitStore = useHabitStore()
  const checkInStore = useCheckInStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadHistory = async () => {
      if (!habitId) return
      
      setLoading(true)
      try {
        // Get the habit
        const habitData = await habitStore.habits.find(h => h.id === habitId)
        if (habitData) {
          setHabit(habitData)
        }
        
        // Get the check-ins for this habit
        const checkIns = checkInStore.checkIns.filter(c => c.habitId === habitId)
        
        // Sort by date, most recent first
        const sortedCheckIns = [...checkIns].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        setHistory(sortedCheckIns)
      } catch (error) {
        console.error('Error loading check-in history:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadHistory()
  }, [habitId, habitStore.habits, checkInStore.checkIns])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'half-completed':
        return 'text-yellow-500'
      case 'skipped':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (!habitId || !habit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>打卡历史</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">选择一个习惯以查看其打卡历史</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>打卡历史 - {habit.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>加载中...</p>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground">暂无打卡记录</p>
        ) : (
          <div className="space-y-4">
            {history.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{formatSimpleDate(new Date(checkIn.date))}</p>
                  {checkIn.note && <p className="text-sm text-muted-foreground">{checkIn.note}</p>}
                </div>
                <div className={`font-medium ${getStatusColor(checkIn.status)}`}>
                  {formatCheckInStatus(checkIn.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default CheckInHistory