import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useHabitStore } from '../../../stores/StoreContext';
import { Button } from '../../ui/button';
import { PlusIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import type { Habit } from '../../../services/database';
import HabitForm from './HabitForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { formatFrequency } from '../../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const HabitSettings = observer(() => {
  const habitStore = useHabitStore();
  const navigate = useNavigate();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | undefined>();

  useEffect(() => {
    habitStore.loadHabits();
  }, [habitStore]);

  const handleAddHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    await habitStore.addHabit(habit);
    setIsAddDialogOpen(false);
  };

  const handleEditHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedHabit?.id) {
      await habitStore.updateHabit(selectedHabit.id, habit);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteHabit = async (habitId: number | undefined) => {
    if (habitId) {
      if (confirm('确定要删除这个习惯吗？')) {
        await habitStore.deleteHabit(habitId);
      }
    }
  };

  const handleEditClick = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsEditDialogOpen(true);
  };

  const handleBackToDashboard = () => {
    navigate('/app/habits');
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 pb-20 md:pb-6">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
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
          <h1 className="text-2xl sm:text-3xl font-bold">习惯设置</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          添加习惯
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>习惯管理</CardTitle>
          <CardDescription>
            在这里管理你的所有习惯，包括添加、编辑和删除操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          {habitStore.loading ? (
            <div className="flex justify-center py-6">
              <p>加载中...</p>
            </div>
          ) : (
            <>
            {/* 台式显示 - 仅在大屏幕显示 */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>频率</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {habitStore.habits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        <p className="text-muted-foreground">还没有添加任何习惯</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    habitStore.habits.map((habit) => (
                      <TableRow key={habit.id}>
                        <TableCell className="font-medium">{habit.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{habit.description}</TableCell>
                        <TableCell>{formatFrequency(habit.frequency)}</TableCell>
                        <TableCell>
                          <span className={`inline-block rounded-full px-2 py-1 text-xs ${habit.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {habit.active ? '激活' : '未激活'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditClick(habit)}
                            >
                              编辑
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteHabit(habit.id)}
                            >
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* 卡片式显示 - 仅在移动端显示 */}
            <div className="md:hidden space-y-4 px-1">
              {habitStore.habits.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">还没有添加任何习惯</p>
                </div>
              ) : (
                habitStore.habits.map((habit) => (
                  <Card key={habit.id} className="overflow-hidden shadow-sm">
                    <CardHeader className="p-3 sm:p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{habit.name}</CardTitle>
                        <span className={`shrink-0 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${habit.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {habit.active ? '激活' : '未激活'}
                        </span>
                      </div>
                      <CardDescription className="text-sm mt-1.5 line-clamp-2">
                        {habit.description || '无描述'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0 pb-0">
                      <p className="text-sm font-medium"><span className="text-muted-foreground font-normal">频率：</span> {formatFrequency(habit.frequency)}</p>
                    </CardContent>
                    <CardFooter className="p-2 flex justify-end gap-3 bg-muted/20">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-full px-4 h-8"
                        onClick={() => handleEditClick(habit)}
                      >
                        编辑
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full px-4 h-8"
                        onClick={() => handleDeleteHabit(habit.id)}
                      >
                        删除
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
            </>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            提示：习惯频率设置后不会影响已有的打卡记录
          </p>
        </CardFooter>
      </Card>

      {/* Add Habit Dialog */}
      <HabitForm
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddHabit}
      />

      {/* Edit Habit Dialog */}
      <HabitForm
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditHabit}
        initialData={selectedHabit}
        isEditing={true}
      />
    </div>
  );
});

export default HabitSettings;