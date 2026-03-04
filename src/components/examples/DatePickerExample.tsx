import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { DatePicker } from '../ui/date-picker'
import { DateRangePicker } from '../ui/date-range-picker'
import { Label } from '../ui/label'

export function DatePickerExample() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>日期选择器示例</CardTitle>
          <CardDescription>
            展示如何使用DatePicker和DateRangePicker组件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 单日期选择器 */}
          <div className="space-y-2">
            <Label htmlFor="single-date">选择单个日期</Label>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="请选择日期"
            />
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                已选择: {selectedDate.toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>

          {/* 日期范围选择器 */}
          <div className="space-y-2">
            <Label htmlFor="date-range">选择日期范围</Label>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              placeholder="请选择日期范围"
            />
            {dateRange?.from && (
              <p className="text-sm text-muted-foreground">
                已选择: {dateRange.from.toLocaleDateString('zh-CN')}
                {dateRange.to && ` - ${dateRange.to.toLocaleDateString('zh-CN')}`}
              </p>
            )}
          </div>

          {/* 禁用状态示例 */}
          <div className="space-y-2">
            <Label htmlFor="disabled-date">禁用状态</Label>
            <DatePicker
              date={undefined}
              onDateChange={() => {}}
              placeholder="此日期选择器已禁用"
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}