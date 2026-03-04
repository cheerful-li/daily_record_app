import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useHabitStore, useCheckInStore } from '../../stores/StoreContext'
import { Button } from '../ui/button'
import { MixerHorizontalIcon, EyeOpenIcon, GearIcon, ClockIcon } from '@radix-ui/react-icons'
import HabitsList from './habits/HabitsList'
import { filterCheckableHabits, isHabitNeedsCheckInToday, getLastCheckInTimeOfDay } from '../../utils/habitUtils'

const Habits = observer(() => {
  const navigate = useNavigate()
  const habitStore = useHabitStore()
  const checkInStore = useCheckInStore()
  
  // 习惯管理操作已移至设置页面
  // 过滤状态
  const [showOnlyActive, setShowOnlyActive] = useState(true)
  const [showOnlyCheckable, setShowOnlyCheckable] = useState(true)
  // 已移除打卡历史相关状态

  useEffect(() => {
    habitStore.loadHabits()
    checkInStore.loadCheckIns()
  }, [habitStore, checkInStore])

  // 习惯管理操作已移至设置页面

  // 直接完成打卡，不弹出备注窗口
  const handleCheckIn = async (habitId: number | undefined, status: 'completed' | 'half-completed' | 'skipped') => {
    if (habitId) {
      const checkInData = {
        habitId,
        date: new Date(),
        status,
        note: '' // 空备注
      }
      
      await checkInStore.addCheckIn(checkInData)
      // 不再在主页面显示打卡历史
    }
  }

  // 删除不需要的方法（打卡弹窗相关）

  // 习惯管理操作已移至设置页面

  // 首先根据活跃状态过滤
  const activeFilteredHabits = showOnlyActive ? 
    habitStore.habits.filter(habit => habit.active) : 
    habitStore.habits
    
  // 然后根据打卡可用性过滤
  const preFilteredHabits = showOnlyCheckable ?
    filterCheckableHabits(activeFilteredHabits, checkInStore.checkIns) :
    activeFilteredHabits
  
  // 改进的习惯排序逻辑
  const filteredHabits = [...preFilteredHabits].sort((a, b) => {
    // 1. 首先按活跃状态排序 (活跃 > 非活跃)
    if (a.active !== b.active) {
      return a.active ? -1 : 1
    }
    
    // 2. 然后按"今日需要打卡且未打卡"状态排序
    const aNeedsCheckIn = isHabitNeedsCheckInToday(a, checkInStore.checkIns)
    const bNeedsCheckIn = isHabitNeedsCheckInToday(b, checkInStore.checkIns)
    
    if (aNeedsCheckIn !== bNeedsCheckIn) {
      return aNeedsCheckIn ? -1 : 1
    }
    
    // 3. 对于每日习惯，按照上次打卡的时间排序（早上打卡的习惯排前面）
    if (a.frequency === 'daily' && b.frequency === 'daily') {
      const aTime = getLastCheckInTimeOfDay(a, checkInStore.checkIns)
      const bTime = getLastCheckInTimeOfDay(b, checkInStore.checkIns)
      
      // 如果两个习惯都有打卡记录，按时间排序
      if (aTime >= 0 && bTime >= 0) {
        return aTime - bTime // 较早时间的习惯排在前面
      }
      // 如果只有一个习惯有打卡记录，有记录的排后面（因为优先显示没有建立规律的习惯）
      else if (aTime >= 0) {
        return 1
      }
      else if (bTime >= 0) {
        return -1
      }
      // 两个习惯都没有打卡记录，继续下面的排序规则
    }
    
    // 4. 再按频率排序 (daily > weekly > monthly)
    const frequencyOrder = { daily: 0, weekly: 1, monthly: 2 }
    if (a.frequency !== b.frequency) {
      return frequencyOrder[a.frequency] - frequencyOrder[b.frequency]
    }
    
    // 5. 最后按创建时间从新到旧排序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // 已移除打卡历史相关方法

  return (
    <div className="container mx-auto">
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-bold hidden md:block">微习惯打卡</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            className="flex items-center text-xs h-9 px-2 py-1 flex-grow sm:flex-grow-0"
          >
            <MixerHorizontalIcon className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">{showOnlyActive ? '显示全部习惯' : '仅活跃习惯'}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowOnlyCheckable(!showOnlyCheckable)}
            className="flex items-center text-xs h-9 px-2 py-1 flex-grow sm:flex-grow-0"
          >
            <EyeOpenIcon className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">{showOnlyCheckable ? '显示所有习惯' : '仅显示可打卡'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('settings')}
            className="flex items-center text-xs h-9 px-2 py-1 flex-grow sm:flex-grow-0"
          >
            <GearIcon className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">习惯设置</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('history')}
            className="flex items-center text-xs h-9 px-2 py-1 flex-grow sm:flex-grow-0"
          >
            <ClockIcon className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">打卡历史</span>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div>
          {habitStore.loading ? (
            <p>加载中...</p>
          ) : (
            <HabitsList
              habits={filteredHabits}
              onCheckIn={handleCheckIn}
              totalHabitsCount={activeFilteredHabits.length}
            />
          )}
        </div>
      </div>

      {/* 习惯管理对话框已移至设置页面 */}

      {/* 打卡弹窗已被移除，改为直接打卡 */}
    </div>
  )
})

export default Habits