import { observer } from 'mobx-react-lite';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import type { Task } from '../../../services/database';

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats = observer(({ tasks }: TaskStatsProps) => {
  // Count tasks by status
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  // Count tasks by type
  const workTasks = tasks.filter(t => t.type === 'work').length;
  const growthTasks = tasks.filter(t => t.type === 'growth').length;
  
  // Count overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && 
    t.dueDate && 
    new Date(t.dueDate) < now
  ).length;
  
  // Calculate completion rate
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>任务统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">总任务数：</span>
              <span>{tasks.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">未开始：</span>
              <span>{pendingTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">进行中：</span>
              <span>{inProgressTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">已完成：</span>
              <span>{completedTasks}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">工作任务：</span>
              <span>{workTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">成长任务：</span>
              <span>{growthTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">逾期任务：</span>
              <span className="text-red-500 font-medium">{overdueTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">完成率：</span>
              <span>{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Simple progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default TaskStats;