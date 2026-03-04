import { observer } from "mobx-react-lite"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../ui/card"
import { Button } from "../../ui/button"
import {
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
} from "@radix-ui/react-icons"
import type { Task } from "../../../services/database"
import {
  formatTaskStatus,
  formatTaskPriority,
} from "../../../utils/formatters"

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number | undefined) => void;
  onStatusChange: (
    task: Task,
    status: "pending" | "in-progress" | "completed"
  ) => void;
}

const TaskCard = observer(
  ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "high":
          return "text-red-500"
        case "medium":
          return "text-yellow-500"
        case "low":
          return "text-green-500"
        default:
          return "text-muted-foreground"
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
          return "bg-green-100 text-green-700"
        case "in-progress":
          return "bg-blue-100 text-blue-700"
        case "pending":
          return "bg-gray-100 text-gray-700"
        default:
          return "bg-gray-100 text-gray-700"
      }
    }

    const getTypeIndicator = (type: string) => {
      return type === "work" ? (
        <span className="px-2 mr-1 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full shrink-0">
          工作
        </span>
      ) : (
        <span className="px-2 mr-1 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full shrink-0">
          成长
        </span>
      )
    }

    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex  justify-between items-center">
            <div className="flex shrink-0 items-center align-top gap-2">
              <CardTitle className="text-lg break-all text-ellipsis overflow-hidden">
                {task.title}
              </CardTitle>
              {getTypeIndicator(task.type)}
            </div>
            <span
              className={`text-sm font-medium shrink-0 ${getPriorityColor(
                task.priority
              )}`}
            >
              {formatTaskPriority(task.priority)}优先级
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span
              className={`px-2 py-0.5 rounded-full text-xs mr-2 ${getStatusColor(
                task.status
              )}`}
            >
              {formatTaskStatus(task.status)}
            </span>
            {/* 移除截止日期显示 */}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">{task.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="flex gap-2">
            {task.status !== "completed" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-green-500 hover:text-green-700 hover:bg-green-100"
                onClick={() => onStatusChange(task, "completed")}
              >
                <CheckCircledIcon className="mr-1 h-4 w-4" />
                标记完成
              </Button>
            )}
            {task.status !== "in-progress" && task.status !== "completed" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                onClick={() => onStatusChange(task, "in-progress")}
              >
                <UpdateIcon className="mr-1 h-4 w-4" />
                开始进行
              </Button>
            )}
            {task.status === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={() => onStatusChange(task, "pending")}
              >
                <CrossCircledIcon className="mr-1 h-4 w-4" />
                重新打开
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(task.id)}
            >
              删除
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }
)

export default TaskCard
