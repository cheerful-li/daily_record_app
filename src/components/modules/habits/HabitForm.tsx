import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { DatePicker } from "../../ui/date-picker"
import { showSuccess, showError } from "../../../lib/toast"
import type { Habit } from "../../../services/database"

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Habit;
  isEditing?: boolean;
}

const HabitForm = observer(
  ({
    open,
    onClose,
    onSubmit,
    initialData,
    isEditing = false,
  }: HabitFormProps) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
      "daily"
    )
    const [active, setActive] = useState(true)
    const [startDate, setStartDate] = useState<Date | undefined>(new Date())

    // Reset form when dialog opens with initialData
    useEffect(() => {
      if (initialData) {
        setName(initialData.name)
        setDescription(initialData.description)
        setFrequency(initialData.frequency)
        setActive(initialData.active)
        setStartDate(new Date()) // You might want to store and retrieve this from the habit
      } else {
        // Reset form for a new habit
        setName("")
        setDescription("")
        setFrequency("daily")
        setActive(true)
        setStartDate(new Date())
      }
    }, [initialData, open])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      try {
        onSubmit({
          name,
          description,
          frequency,
          active,
        })
        showSuccess(isEditing ? "习惯更新成功!" : "新习惯添加成功!")
        onClose()
      } catch (error) {
        console.error("Error submitting habit:", error)
        showError(isEditing ? "习惯更新失败，请重试" : "习惯创建失败，请重试")
      }
    }

    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? "编辑习惯" : "添加新习惯"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-2 sm:py-4">
              {/* 名称字段 */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-3 md:gap-4">
                <label
                  htmlFor="name"
                  className="text-sm font-medium md:text-right"
                >
                  名称:
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-1 md:col-span-3"
                  required
                  placeholder="习惯名称"
                />
              </div>

              {/* 描述字段 */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-3 md:gap-4">
                <label
                  htmlFor="description"
                  className="text-sm font-medium md:text-right"
                >
                  描述:
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-1 md:col-span-3"
                  placeholder="习惯描述（可选）"
                />
              </div>

              {/* 频率字段 */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-3 md:gap-4">
                <label
                  htmlFor="frequency"
                  className="text-sm font-medium md:text-right"
                >
                  频率:
                </label>
                <div className="col-span-1 md:col-span-3">
                  <Select
                    value={frequency}
                    onValueChange={(value) =>
                      setFrequency(value as "daily" | "weekly" | "monthly")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择频率" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">每日</SelectItem>
                      <SelectItem value="weekly">每周</SelectItem>
                      <SelectItem value="monthly">每月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 开始日期字段 */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-3 md:gap-4">
                <label className="text-sm font-medium md:text-right">
                  开始日期:
                </label>
                <div className="col-span-1 md:col-span-3">
                  <DatePicker
                    date={startDate}
                    onDateChange={(date) => setStartDate(date)}
                    placeholder="选择开始日期"
                  />
                </div>
              </div>

              {/* 状态字段 */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-3 md:gap-4">
                <div className="text-sm font-medium md:text-right">状态:</div>
                <div className="col-span-1 md:col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={active}
                    onCheckedChange={(checked) => setActive(!!checked)}
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    激活
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-3  sm:gap-0 mt-4 sm:mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {isEditing ? "保存" : "添加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

export default HabitForm
