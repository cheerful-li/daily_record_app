import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { format, parseISO, subDays, addDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useCheckInStore, useHabitStore } from "../../stores/StoreContext";
import type { CheckIn } from "../../services/database";

interface HeatMapProps {
  weeks?: number; // 显示的周数
  className?: string;
}

const HabitHeatMap = observer(({ weeks = 7, className = "" }: HeatMapProps) => {
  const checkInStore = useCheckInStore();
  const habitStore = useHabitStore();
  const [heatmapData, setHeatmapData] = useState<{
    [key: string]: { value: number; checkIns: CheckIn[] };
  }>({});
  const [maxValue, setMaxValue] = useState<number>(0);
  
  // 计算热力图数据
  useEffect(() => {
    if (checkInStore.checkIns.length === 0) return;
    
    const now = new Date();
    const endDate = now;
    const startDate = subDays(now, weeks * 7);
    
    const data: { [key: string]: { value: number; checkIns: CheckIn[] } } = {};
    
    // 初始化所有日期
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      data[dateStr] = { value: 0, checkIns: [] };
    });
    
    // 填充打卡数据
    checkInStore.checkIns.forEach(checkIn => {
      const checkInDate = new Date(checkIn.date);
      const dateStr = format(checkInDate, "yyyy-MM-dd");
      
      if (checkInDate >= startDate && checkInDate <= endDate) {
        if (!data[dateStr]) {
          data[dateStr] = { value: 0, checkIns: [] };
        }
        
        // 根据打卡状态增加权重
        if (checkIn.status === 'completed') {
          data[dateStr].value += 1;
        } else if (checkIn.status === 'half-completed') {
          data[dateStr].value += 0.5;
        }
        
        data[dateStr].checkIns.push(checkIn);
      }
    });
    
    // 找出最大值，用于颜色梯度计算
    const max = Math.max(...Object.values(data).map(d => d.value));
    setMaxValue(max);
    
    setHeatmapData(data);
  }, [checkInStore.checkIns, weeks]);
  
  // 生成热力图日期格子
  const generateHeatmapCells = () => {
    const today = new Date();
    const startDay = subDays(today, weeks * 7);
    const firstDayOfGrid = startOfWeek(startDay, { locale: zhCN });
    
    const days = [];
    const weekLabels = [];
    
    // 生成周标签
    for (let i = 0; i < 7; i++) {
      weekLabels.push(
        <div key={`label-${i}`} className="text-xs text-muted-foreground text-center h-7 flex items-center justify-center">
          {format(addDays(firstDayOfGrid, i), 'EEE', { locale: zhCN })}
        </div>
      );
    }
    
    // 生成日期格子
    for (let week = 0; week < weeks; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = addDays(firstDayOfGrid, week * 7 + day);
        const dateStr = format(date, "yyyy-MM-dd");
        const isToday = format(today, "yyyy-MM-dd") === dateStr;
        const dayData = heatmapData[dateStr] || { value: 0, checkIns: [] };
        
        // 颜色梯度计算
        const intensity = maxValue > 0 ? dayData.value / maxValue : 0;
        
        weekDays.push(
          <div
            key={dateStr}
            title={`${dateStr}: ${dayData.checkIns.length}次打卡`}
            className={`
              w-7 h-7 rounded-sm border flex items-center justify-center text-xs
              ${isToday ? 'border-primary' : 'border-border'}
              ${intensity > 0 
                ? `bg-primary bg-opacity-${Math.max(5, Math.round(intensity * 100))}`
                : 'bg-muted bg-opacity-20'}
            `}
          >
            {format(date, 'd')}
          </div>
        );
      }
      days.push(
        <div key={`week-${week}`} className="flex gap-1">
          {weekDays}
        </div>
      );
    }
    
    return (
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 mt-7">
          {weekLabels}
        </div>
        <div className="flex flex-col gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">习惯打卡热力图</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {generateHeatmapCells()}
        </div>
        <div className="mt-3 flex items-center justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-muted bg-opacity-20 rounded-sm"></div>
              <div className="w-3 h-3 bg-primary bg-opacity-20 rounded-sm"></div>
              <div className="w-3 h-3 bg-primary bg-opacity-40 rounded-sm"></div>
              <div className="w-3 h-3 bg-primary bg-opacity-60 rounded-sm"></div>
              <div className="w-3 h-3 bg-primary bg-opacity-80 rounded-sm"></div>
            </div>
            <span>多</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default HabitHeatMap;