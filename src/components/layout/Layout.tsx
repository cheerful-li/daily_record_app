import React from 'react';
import { observer } from 'mobx-react-lite';
import Header from './Header';
import MainContent from './MainContent';
import Footer from './Footer';
import MobileNav from './MobileNav';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useUIStore } from '../../stores/StoreContext';
// Navigation icons moved to Header component

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = observer(({ children }) => {
  const uiStore = useUIStore();

  const handleTabChange = (value: string) => {
    uiStore.setActiveModule(value);
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header className="hidden md:block" />
      {/* 导航标签已移至Header组件中 */}
      <div className="flex flex-1 overflow-hidden w-full">
        <MainContent>{children}</MainContent>
      </div>
      <Footer className="hidden md:block" />      
      <MobileNav />
    </div>
  );
});

export default Layout;