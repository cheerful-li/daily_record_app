import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useHabitStore, useCheckInStore } from '../../stores/StoreContext'
import { Button } from '../ui/button'
import { MixerHorizontalIcon, EyeOpenIcon, GearIcon, ClockIcon } from '@radix-ui/react-icons'
import HabitsList from './habits/HabitsList'

const Habits = observer(() => {
  const navigate = useNavigate()
  const habitStore = useHabitStore()
  const checkInStore = useCheckInStore()
  
  // 习惯管理操作已移至设置页面
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

  // 向CheckInStore暴露给HabitStore使用
  if (typeof window !== 'undefined') {
    window.__checkInStore = checkInStore
  }
  
  // 使用computed计算的过滤后习惯列表
  const filteredHabits = habitStore.filteredHabits

  // 已移除打卡历史相关方法

  return (
    <div className="container mx-auto">
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-bold hidden md:block">微习惯打卡</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => habitStore.setFilterOptions({ active: !habitStore.filterOptions.active })}
            className="flex items-center text-xs h-9 px-2 py-1 flex-grow sm:flex-grow-0"
          >
            <MixerHorizontalIcon className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">{habitStore.filterOptions.active ? '显示全部习惯' : '仅活跃习惯'}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => habitStore.setFilterOptions({ showOnlyCheckable: !habitStore.filterOptions.showOnlyCheckable })}
            className="flex items-center text-xs h-9 px-2 py-1 flex-grow sm:flex-grow-0"
          >
            <EyeOpenIcon className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">{habitStore.filterOptions.showOnlyCheckable ? '显示所有习惯' : '仅显示可打卡'}</span>
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
              totalHabitsCount={habitStore.habits.filter(h => h.active).length}
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