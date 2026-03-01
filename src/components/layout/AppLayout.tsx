import { observer } from 'mobx-react-lite';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MainContent from './MainContent';
import Footer from './Footer';
import MobileNav from './MobileNav';

const AppLayout = observer(() => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header className="hidden md:block" />
      <div className="flex flex-1 overflow-hidden w-full">
        <MainContent>
          <Outlet />
        </MainContent>
      </div>
      <Footer className="hidden md:block" />
      <MobileNav />
    </div>
  );
});

export default AppLayout;
