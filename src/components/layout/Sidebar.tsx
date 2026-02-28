import { observer } from 'mobx-react-lite';
import { useUIStore } from '../../stores/StoreContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  ClockIcon,
  CalendarIcon,
  CheckCircledIcon,
  PersonIcon,
  LightningBoltIcon,
  PieChartIcon,
} from '@radix-ui/react-icons';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    id: 'habits',
    label: '微习惯',
    icon: <CheckCircledIcon className="h-5 w-5" />,
  },
  {
    id: 'lifeMoments',
    label: '生活点滴',
    icon: <ClockIcon className="h-5 w-5" />,
  },
  {
    id: 'tasks',
    label: '待办事项',
    icon: <CalendarIcon className="h-5 w-5" />,
  },
  {
    id: 'relationships',
    label: '社交关系',
    icon: <PersonIcon className="h-5 w-5" />,
  },
  {
    id: 'ideas',
    label: '灵感想法',
    icon: <LightningBoltIcon className="h-5 w-5" />,
  },
  {
    id: 'statistics',
    label: '统计数据',
    icon: <PieChartIcon className="h-5 w-5" />,
  },
];

const Sidebar = observer(() => {
  const uiStore = useUIStore();

  const handleNavClick = (module: string) => {
    uiStore.setActiveModule(module);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 z-20 w-64 border-r shadow-md bg-background/95 backdrop-blur transition-transform',
        uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="flex h-full flex-col gap-2 p-6">
        <div className="mb-4 text-sm font-medium text-muted-foreground">
          导航菜单
        </div>
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={uiStore.activeModule === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'justify-start rounded-lg transition-all duration-200 hover:scale-102',
              uiStore.activeModule === item.id ? 'font-medium shadow-sm' : 'hover:bg-accent/60'
            )}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
});

export default Sidebar;