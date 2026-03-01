import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useHabitStore, useCheckInStore } from '../../../stores/StoreContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Button } from '../../ui/button';
import { ArrowLeftIcon, CalendarIcon } from '@radix-ui/react-icons';
import { formatDate, formatCheckInStatus } from '../../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';

const CheckInHistoryPage = observer(() => {
  const habitStore = useHabitStore();
  const checkInStore = useCheckInStore();
  const navigate = useNavigate();
  
  const [selectedHabitId, setSelectedHabitId] = useState<number | undefined>();
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('month');

  useEffect(() => {
    habitStore.loadHabits();
    checkInStore.loadCheckIns();
  }, [habitStore, checkInStore]);

  const handleBackToDashboard = () => {
    navigate('/app/habits');
  };

  // 根据时间范围过滤打卡记录
  const getFilteredCheckIns = () => {
    let fromDate: Date | undefined = undefined;
    
    if (timeRange === 'week') {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0是周日, 6是周六
      fromDate = new Date();
      fromDate.setDate(now.getDate() - dayOfWeek - 7); // 过去一周
    } else if (timeRange === 'month') {
      const now = new Date();
      fromDate = new Date();
      fromDate.setMonth(now.getMonth() - 1); // 过去一个月
    }
    
    return checkInStore.getFilteredCheckIns({
      habitId: selectedHabitId,
      fromDate
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  const filteredCheckIns = getFilteredCheckIns();

  // 获取对应习惯的名称
  const getHabitName = (habitId: number) => {
    const habit = habitStore.habits.find(h => h.id === habitId);
    return habit ? habit.name : '未知习惯';
  };

  // 获取状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'half-completed':
        return 'bg-yellow-100 text-yellow-800';
      case 'skipped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleBackToDashboard}
            className="h-9 w-9"
            aria-label="返回"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">打卡历史</h1>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>查看历史记录</CardTitle>
          <CardDescription>
            选择习惯和时间范围查看打卡记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">选择习惯</label>
              <Select 
                value={selectedHabitId?.toString() || 'all'} 
                onValueChange={(value) => setSelectedHabitId(value !== 'all' ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="所有习惯" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有习惯</SelectItem>
                  {habitStore.habits.map(habit => (
                    <SelectItem key={habit.id} value={habit.id?.toString() || ''}>
                      {habit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">时间范围</label>
              <Select value={timeRange} onValueChange={(value: 'all' | 'month' | 'week') => setTimeRange(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">最近一周</SelectItem>
                  <SelectItem value="month">最近一个月</SelectItem>
                  <SelectItem value="all">所有记录</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card className="border">
            <CardHeader className="py-3 px-4 border-b bg-muted/50">
              <CardTitle className="text-lg">打卡记录</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[400px]">
              {filteredCheckIns.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  暂无打卡记录
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCheckIns.map((checkIn) => (
                    <div key={checkIn.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {selectedHabitId ? '' : `${getHabitName(checkIn.habitId)} - `}
                          {formatDate(checkIn.date)}
                        </div>
                        {checkIn.note && (
                          <p className="text-sm text-muted-foreground mt-1">{checkIn.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(checkIn.status)}>
                          {formatCheckInStatus(checkIn.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <CalendarIcon className="inline-block mr-1 h-3 w-3" />
                          {new Date(checkIn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
});

export default CheckInHistoryPage;