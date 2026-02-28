import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTaskStore } from '../../stores/StoreContext';
import { Button } from '../ui/button';
import { PlusIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import type { Task } from '../../services/database';
import TasksList from './tasks/TasksList';
import TaskForm from './tasks/TaskForm';
import TaskFilter from './tasks/TaskFilter';
import TaskStats from './tasks/TaskStats';

interface FilterOptions {
  searchText: string;
  type: 'all' | 'work' | 'growth';
  status: 'all' | 'pending' | 'in-progress' | 'completed';
  priority: 'all' | 'high' | 'medium' | 'low';
  // 移除截止日期范围
  // dueDateRange: {
  //   from: string;
  //   to: string;
  // };
}

const Tasks = observer(() => {
  const taskStore = useTaskStore();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchText: '',
    type: 'all',
    status: 'all',
    priority: 'all',
    // 移除截止日期范围
    // dueDateRange: {
    //   from: '',
    //   to: ''
    // }
  });
  const [showFilters, setShowFilters] = useState(false); // 控制筛选面板的显示/隐藏

  useEffect(() => {
    taskStore.loadTasks();
  }, [taskStore]);

  // Update filtered tasks when store data changes or filter changes
  useEffect(() => {
    applyFilters();
  }, [taskStore.tasks, filterOptions]);

  const handleAddTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await taskStore.addTask(task);
  };

  const handleEditTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask?.id) {
      await taskStore.updateTask(selectedTask.id, task);
    }
  };

  const handleDeleteTask = async (taskId: number | undefined) => {
    if (taskId) {
      if (confirm('确定要删除这个任务吗？')) {
        await taskStore.deleteTask(taskId);
      }
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = async (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (task.id) {
      await taskStore.updateTask(task.id, { ...task, status: newStatus });
    }
  };

  const handleFilterChange = (options: FilterOptions) => {
    setFilterOptions(options);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    let filtered = [...taskStore.tasks];

    // Filter by search text (in title or description)
    if (filterOptions.searchText) {
      const searchLower = filterOptions.searchText.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (filterOptions.type !== 'all') {
      filtered = filtered.filter(task => task.type === filterOptions.type);
    }

    // Filter by status
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(task => task.status === filterOptions.status);
    }

    // Filter by priority
    if (filterOptions.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterOptions.priority);
    }

    // 移除截止日期范围筛选
    // if (filterOptions.dueDateRange.from) {
    //   const fromDate = new Date(filterOptions.dueDateRange.from);
    //   filtered = filtered.filter(
    //     task => task.dueDate && new Date(task.dueDate) >= fromDate
    //   );
    // }

    // if (filterOptions.dueDateRange.to) {
    //   const toDate = new Date(filterOptions.dueDateRange.to);
    //   // Set time to end of day for inclusive comparison
    //   toDate.setHours(23, 59, 59, 999);
    //   filtered = filtered.filter(
    //     task => task.dueDate && new Date(task.dueDate) <= toDate
    //   );
    // }

    // 按优先级和创建时间排序
    filtered.sort((a, b) => {
      // 首先按优先级排序（high -> medium -> low）
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 然后按创建时间从新到旧排序
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA; // 这里用 B-A 得到降序排列（从新到旧）
    });
    
    setFilteredTasks(filtered);
  };

  return (
    <div className="container mx-auto pb-20 md:pb-0">
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <h1 className="text-3xl font-bold hidden md:block">待办事项</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="ml-auto hidden md:flex">
          <PlusIcon className="mr-2 h-4 w-4" />
          <span>添加任务</span>
        </Button>
      </div>
      
      <div className="grid gap-4 md:gap-6 md:grid-cols-[1fr_2fr] grid-cols-1">
        {/* Filters - 桌面端显示，移动端隐藏 */}
        <div className="hidden md:block space-y-4 md:space-y-6 order-1">
          <TaskFilter onFilterChange={handleFilterChange} />
          
          {/* Task Statistics - 仅桌面端显示 */}
          <TaskStats tasks={filteredTasks} />
        </div>
        
        {/* 移动端筛选面板 - 条件显示 */}
        {showFilters && (
          <div className="md:hidden mb-4 fixed bottom-26 left-4 right-4 z-30 bg-background border rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">筛选任务</h3>
              <Button variant="ghost" size="sm" onClick={toggleFilters}>关闭</Button>
            </div>
            <TaskFilter 
              onFilterChange={handleFilterChange}
            />
          </div>
        )}
        
        {/* Tasks List */}
        <div className="order-1 md:order-2">
          {taskStore.loading ? (
            <p>加载中...</p>
          ) : (
            <TasksList 
              tasks={filteredTasks} 
              onEdit={handleEditClick}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
      
      {/* 底部操作栏 - 仅移动端显示 */}
      <div className="fixed bottom-12 left-0 right-0 bg-background border-t p-4 flex justify-around z-30 md:hidden">
        <Button variant="outline" onClick={toggleFilters} className="flex-1 mr-2">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          筛选
        </Button>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex-1 ml-2" variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          添加任务
        </Button>
      </div>

      {/* Add Task Dialog */}
      <TaskForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddTask}
      />

      {/* Edit Task Dialog */}
      <TaskForm
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditTask}
        initialData={selectedTask}
        isEditing={true}
      />
    </div>
  );
});

export default Tasks;