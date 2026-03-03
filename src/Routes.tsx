import { createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import AuthProvider from './components/auth/AuthProvider';
import DataInitializer from './data/DataInitializer';
import AppLayout from './components/layout/AppLayout';
import WelcomePage from './components/WelcomePage';
import Habits from './components/modules/Habits';
import LifeMoments from './components/modules/LifeMoments';
import Tasks from './components/modules/Tasks';
import Relationships from './components/modules/Relationships';
import Ideas from './components/modules/Ideas';
import Statistics from './components/modules/Statistics';
import HabitSettings from './components/modules/habits/HabitSettings';
import CheckInHistoryPage from './components/modules/habits/CheckInHistoryPage';
import { Toaster } from './components/ui/sonner';

// 受保护路由包装器
function ProtectedRoutes() {
  return (
    <AuthProvider>
      <DataInitializer>
        <Outlet />
        <Toaster position="top-right" closeButton richColors />
      </DataInitializer>
    </AuthProvider>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/welcome',
    element: (
      <AuthProvider>
        <WelcomePage />
      </AuthProvider>
    ),
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="habits" replace />,
          },
          {
            path: 'habits',
            element: <Habits />,
          },
          {
            path: 'life-moments',
            element: <LifeMoments />,
          },
          {
            path: 'tasks',
            element: <Tasks />,
          },
          {
            path: 'relationships',
            element: <Relationships />,
          },
          {
            path: 'ideas',
            element: <Ideas />,
          },
          {
            path: 'statistics',
            element: <Statistics />,
          },
        ],
      },
      {
        path: '/habit-settings',
        element: <HabitSettings />,
      },
      {
        path: '/checkin-history',
        element: <CheckInHistoryPage />,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}