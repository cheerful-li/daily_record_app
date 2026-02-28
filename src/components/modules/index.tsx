import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/StoreContext';

import Habits from './Habits';
import LifeMoments from './LifeMoments';
import Tasks from './Tasks';
import Relationships from './Relationships';
import Ideas from './Ideas';
import Statistics from './Statistics';

const ModuleRenderer = observer(() => {
  const uiStore = useUIStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 模拟模块加载过程
    const loadModule = async () => {
      setIsLoading(true);
      uiStore.setModuleLoading(uiStore.activeModule, true);
      
      // 模拟数据加载延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsLoading(false);
      uiStore.setModuleLoading(uiStore.activeModule, false);
    };
    
    loadModule();
  }, [uiStore.activeModule]);

  const renderModule = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full w-full py-20 animate-fade-in">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载{getModuleName(uiStore.activeModule)}中...</p>
          </div>
        </div>
      );
    }
    
    switch (uiStore.activeModule) {
      case 'habits':
        return <Habits />;
      case 'lifeMoments':
        return <LifeMoments />;
      case 'tasks':
        return <Tasks />;
      case 'relationships':
        return <Relationships />;
      case 'ideas':
        return <Ideas />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Habits />;
    }
  };
  
  // 获取模块的中文名称
  const getModuleName = (module: string): string => {
    const moduleNames: Record<string, string> = {
      habits: '微习惯',
      lifeMoments: '生活点滴',
      tasks: '待办事项',
      relationships: '关系维护',
      ideas: '灵感收集',
      statistics: '统计分析'
    };
    
    return moduleNames[module] || '模块';
  };

  return <div className="h-full">{renderModule()}</div>;
});

export default ModuleRenderer;