import { observer } from 'mobx-react-lite'
import type { Task } from '../../../services/database'
import TaskCard from './TaskCard'

interface TasksListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number | undefined) => void;
  onStatusChange: (task: Task, status: 'pending' | 'in-progress' | 'completed') => void;
}

const TasksList = observer(({ tasks, onEdit, onDelete, onStatusChange }: TasksListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <p className="mt-4 text-lg font-semibold">暂无任务</p>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            点击添加按钮来创建第一个任务
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
})

export default TasksList