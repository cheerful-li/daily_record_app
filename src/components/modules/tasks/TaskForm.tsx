import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
// 移除进度和日期相关组件导入
import { format } from 'date-fns';
import { showSuccess, showError } from '../../../lib/toast';
import type { Task } from '../../../services/database';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Task;
  isEditing?: boolean;
}

const TaskForm = observer(({ open, onClose, onSubmit, initialData, isEditing = false }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'work' | 'growth'>('work');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  // 移除进度和截止日期

  // Reset form when dialog opens with initialData
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setType(initialData.type);
      setStatus(initialData.status);
      setPriority(initialData.priority);
      // 移除进度和截止日期设置
    } else {
      // Reset form for a new task
      setTitle('');
      setDescription('');
      setType('work');
      setStatus('pending');
      setPriority('medium');
      // 移除进度和截止日期重置
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        description,
        type,
        status,
        priority,
      };
      
      // 移除截止日期保存
      
      onSubmit(taskData);
      showSuccess(isEditing ? '任务更新成功!' : '新任务添加成功!');
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
      showError(isEditing ? '任务更新失败，请重试' : '任务创建失败，请重试');
    }
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as 'pending' | 'in-progress' | 'completed';
    setStatus(newStatus);
    // 移除进度更新逻辑
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑任务' : '添加新任务'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium">
                标题:
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
                placeholder="任务标题"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                描述:
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="任务描述（可选）"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="type" className="text-right text-sm font-medium">
                类型:
              </label>
              <div className="col-span-3">
                <Select value={type} onValueChange={(value) => setType(value as 'work' | 'growth')}>
                  <SelectTrigger className="border-primary text-primary font-medium">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">工作</SelectItem>
                    <SelectItem value="growth">成长</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">
                状态:
              </label>
              <div className="col-span-3">
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="border-primary text-primary font-medium">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">未开始</SelectItem>
                    <SelectItem value="in-progress">进行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 移除进度显示 */}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="priority" className="text-right text-sm font-medium">
                优先级:
              </label>
              <div className="col-span-3">
                <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
                  <SelectTrigger className={getPriorityColor()}>
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high" className="text-red-500">高</SelectItem>
                    <SelectItem value="medium" className="text-yellow-500">中</SelectItem>
                    <SelectItem value="low" className="text-green-500">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 移除截止日期选择器 */}
          </div>
          
          <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-none sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              取消
            </Button>
            <Button type="submit" className="w-full sm:w-auto">{isEditing ? '保存' : '添加'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default TaskForm;