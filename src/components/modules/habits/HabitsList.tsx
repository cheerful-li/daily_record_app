import { observer } from 'mobx-react-lite';
import type { Habit } from '../../../services/database';
import HabitCard from './HabitCard';

interface HabitsListProps {
  habits: Habit[];
  onCheckIn: (habitId: number | undefined, status: 'completed' | 'half-completed' | 'skipped') => void;
}

const HabitsList = observer(({ habits, onCheckIn }: HabitsListProps) => {
  if (habits.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <p className="mt-4 text-lg font-semibold">还没有习惯</p>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            添加你的第一个微习惯，开始培养良好的习惯吧！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onCheckIn={onCheckIn}
        />
      ))}
    </div>
  );
});

export default HabitsList;