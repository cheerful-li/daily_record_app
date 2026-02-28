import { observer } from 'mobx-react-lite';
import { useUIStore } from '../../stores/StoreContext';
import { Button } from '../ui/button';
import { MoonIcon, SunIcon, CheckCircledIcon, ClockIcon, CalendarIcon, PersonIcon, LightningBoltIcon, PieChartIcon } from '@radix-ui/react-icons';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';

interface HeaderProps {
  className?: string;
}

const Header = observer(({ className }: HeaderProps) => {
  const uiStore = useUIStore();

  const toggleTheme = () => {
    uiStore.toggleTheme();
  };
  
  const handleTabChange = (value: string) => {
    uiStore.setActiveModule(value);
  };

  return (
    <header className={cn("sticky top-0 z-30 w-full border-b bg-gradient-to-r from-background to-background/90 backdrop-blur-md shadow-sm", className)}>
      <div className="max-w-[1200px] w-full mx-auto flex items-center px-4 h-16 overflow-hidden">
        <h1 className="text-xl font-bold gradient-text mr-4 whitespace-nowrap">Daily Record</h1>
        
        <Tabs defaultValue="habits" value={uiStore.activeModule} onValueChange={handleTabChange} className="flex-1 hidden md:block">
          <TabsList className="justify-start overflow-x-auto flex-1 bg-transparent h-10 px-0 md:px-2">
            <TabsTrigger value="habits" className="flex items-center gap-1">
              <CheckCircledIcon className="h-4 w-4" />
              微习惯
            </TabsTrigger>
            <TabsTrigger value="lifeMoments" className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              生活点滴
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              待办事项
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center gap-1">
              <PersonIcon className="h-4 w-4" />
              社交关系
            </TabsTrigger>
            <TabsTrigger value="ideas" className="flex items-center gap-1">
              <LightningBoltIcon className="h-4 w-4" />
              灵感想法
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" />
              统计数据
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-auto" aria-label="Toggle theme">
          {uiStore.theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
});

export default Header;