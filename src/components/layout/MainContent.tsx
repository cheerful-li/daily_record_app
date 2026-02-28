import { observer } from 'mobx-react-lite';
import { useUIStore } from '../../stores/StoreContext';
import { cn } from '../../lib/utils';

const MainContent: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
  const uiStore = useUIStore();

  return (
    <main
      className={cn(
        'min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-4rem)] transition-[margin-left] duration-200 pt-6 pb-16 md:pb-6 flex justify-center',
        'ml-0 bg-gradient-to-b from-background to-background/95 w-full'
      )}
    >
      <div className="max-w-[1200px] w-full px-4 md:px-8">
        {children}
      </div>
    </main>
  );
});

export default MainContent;