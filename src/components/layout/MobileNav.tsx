import { observer } from "mobx-react-lite";
import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../../stores/StoreContext";
import {
  CheckCircledIcon,
  ClockIcon,
  CalendarIcon,
  PersonIcon,
  LightningBoltIcon,
  PieChartIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const navItems = [
  { path: "/app/habits", id: "habits", label: "微习惯", icon: CheckCircledIcon },
  { path: "/app/life-moments", id: "lifeMoments", label: "点滴", icon: ClockIcon },
  { path: "/app/tasks", id: "tasks", label: "待办", icon: CalendarIcon },
  { path: "/app/relationships", id: "relationships", label: "社交", icon: PersonIcon },
  { path: "/app/ideas", id: "ideas", label: "灵感", icon: LightningBoltIcon },
  { path: "/app/statistics", id: "statistics", label: "统计", icon: PieChartIcon },
];

const MobileNav = observer(() => {
  const uiStore = useUIStore();
  const location = useLocation();

  const toggleTheme = () => {
    uiStore.toggleTheme();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-[2px] h-6 right-2 z-40 md:hidden"
        aria-label="Toggle theme"
      >
        {uiStore.theme === "light" ? (
          <MoonIcon className="h-5 w-5" />
        ) : (
          <SunIcon className="h-5 w-5" />
        )}
      </Button>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background backdrop-blur-md shadow-md md:hidden">
        <div className="grid grid-cols-6 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/10"
                )}
              >
                <span className="mb-1">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
});

export default MobileNav;
