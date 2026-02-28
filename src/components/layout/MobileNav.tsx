import { observer } from "mobx-react-lite";
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
  GearIcon,
} from "@radix-ui/react-icons";
import { Button } from "../ui/button";

const MobileNav = observer(() => {
  const uiStore = useUIStore();

  const handleNavClick = (module: string) => {
    uiStore.setActiveModule(module);
  };

  const toggleTheme = () => {
    uiStore.toggleTheme();
  };

  // 导航项配置
  const navItems = [
    {
      id: "habits",
      label: "微习惯",
      icon: <CheckCircledIcon className="h-4 w-4" />,
    },
    {
      id: "lifeMoments",
      label: "点滴",
      icon: <ClockIcon className="h-4 w-4" />,
    },
    { id: "tasks", label: "待办", icon: <CalendarIcon className="h-4 w-4" /> },
    {
      id: "relationships",
      label: "社交",
      icon: <PersonIcon className="h-4 w-4" />,
    },
    {
      id: "ideas",
      label: "灵感",
      icon: <LightningBoltIcon className="h-4 w-4" />,
    },
    {
      id: "statistics",
      label: "统计",
      icon: <PieChartIcon className="h-4 w-4" />,
    },
  ];

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
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                uiStore.activeModule === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/10"
              }`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="mb-1">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
});

export default MobileNav;
