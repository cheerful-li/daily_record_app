import { observer } from "mobx-react-lite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../ui/card";
import { Button } from "../../ui/button";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons";
import type { Habit } from "../../../services/database";
import { formatFrequency, formatDate } from "../../../utils/formatters";
import { useCheckInStore } from "../../../stores/StoreContext";
import { getNextCheckInDate } from "../../../utils/habitUtils";
import { getHabitColor } from "../../../utils/getHabitColor";

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (
    habitId: number | undefined,
    status: "completed" | "half-completed" | "skipped"
  ) => void;
}

const HabitCard = observer(({ habit, onCheckIn }: HabitCardProps) => {
  const checkInStore = useCheckInStore();
  const habitColor = getHabitColor(habit);
  const handleAction = (action: () => void) => {
    // 添加点击反馈效果
    return () => {
      const button = document.activeElement as HTMLElement;
      if (button) {
        button.classList.add("scale-95");
        setTimeout(() => button.classList.remove("scale-95"), 100);
      }
      action();
    };
  };
  return (
    <Card
      className={`w-full mb-4 overflow-hidden rounded-lg shadow-sm hover:shadow transition-all duration-300 bg-white dark:bg-slate-800 border-l-4 ${habitColor.border} border-t border-r border-b border-slate-200/60 dark:border-slate-700/60`}
    >
      <CardHeader
        className={`border-b border-slate-100 dark:border-slate-700/40 pb-2 pt-2 px-3 ${habitColor.accent}`}
      >
        <CardTitle className="flex items-center justify-between">
          <span className={`font-bold text-base ${habitColor.text}`}>
            {habit.name}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${habitColor.accent} ${habitColor.text}`}
          >
            {formatFrequency(habit.frequency)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-2 px-3">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-2">
          {habit.description}
        </p>

        {(() => {
          // 获取最近一次打卡记录
          const habitCheckIns = checkInStore.checkIns.filter(
            (ci) => ci.habitId === habit.id
          );
          if (habitCheckIns.length > 0) {
            const sortedCheckIns = [...habitCheckIns].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const lastCheckIn = sortedCheckIns[0];
            const lastCheckInDate = new Date(lastCheckIn.date);
            const nextCheckInDate = getNextCheckInDate(habit, lastCheckInDate);

            // 如果不能打卡，显示下次可打卡时间
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 删除上次和下次日期显示
            // 如果需要添加其他内容可以在这里增加
            return null;
          }
          return null;
        })()}
      </CardContent>
      <CardFooter
        className={`flex justify-center rounded-b-lg border-t pb-1 pt-1 border-slate-100 dark:border-slate-700/30 ${habitColor.light}`}
      >
        <div className="flex justify-between w-full gap-1 px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-lg py-2 flex items-center justify-center font-medium text-xs transition-all bg-white dark:bg-slate-800 hover:bg-amber-100 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30"
            onClick={handleAction(() => {
              onCheckIn(habit.id, "half-completed");
              // 增加成功反馈
              const button = document.activeElement as HTMLElement;
              if (button) {
                button.textContent = "已记录!";
                button.classList.add("bg-yellow-500", "text-white");
                setTimeout(() => {
                  if (button.parentElement) {
                    button.innerHTML =
                      '<svg class="mr-1 h-4 w-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.875 7.5C9.875 8.81168 8.81168 9.875 7.5 9.875C6.18832 9.875 5.125 8.81168 5.125 7.5C5.125 6.18832 6.18832 5.125 7.5 5.125C8.81168 5.125 9.875 6.18832 9.875 7.5Z" fill="currentColor"></path></svg>部分';
                    button.classList.remove("bg-yellow-500", "text-white");
                  }
                }, 1000);
              }
            })}
          >
            <DotFilledIcon className="mr-1 h-4 w-4" />
            部分
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-lg py-2 flex items-center justify-center font-medium text-xs transition-all bg-white dark:bg-slate-800 hover:bg-red-100 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
            onClick={handleAction(() => {
              onCheckIn(habit.id, "skipped");
              // 增加成功反馈
              const button = document.activeElement as HTMLElement;
              if (button) {
                button.textContent = "已跳过!";
                button.classList.add("bg-red-500", "text-white");
                setTimeout(() => {
                  if (button.parentElement) {
                    button.innerHTML =
                      '<svg class="mr-1 h-4 w-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>跳过';
                    button.classList.remove("bg-red-500", "text-white");
                  }
                }, 1000);
              }
            })}
          >
            <CrossCircledIcon className="mr-1 h-4 w-4" />
            跳过
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-lg py-2 flex items-center justify-center font-medium text-xs transition-all bg-white dark:bg-slate-800 hover:bg-green-100 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
            onClick={handleAction(() => {
              onCheckIn(habit.id, "completed");
              // 增加成功反馈
              const button = document.activeElement as HTMLElement;
              if (button) {
                button.textContent = "已完成!";
                button.classList.add("bg-green-500", "text-white");
                setTimeout(() => {
                  if (button.parentElement) {
                    button.innerHTML =
                      '<svg class="mr-1 h-4 w-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>完成';
                    button.classList.remove("bg-green-500", "text-white");
                  }
                }, 1000);
              }
            })}
          >
            <CheckCircledIcon className="mr-1 h-4 w-4" />
            完成
          </Button>
        </div>
        {/* 编辑和删除按钮已移至设置页面 */}
      </CardFooter>
    </Card>
  );
});

export default HabitCard;
