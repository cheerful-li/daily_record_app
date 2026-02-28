import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HabitSettings from './components/modules/habits/HabitSettings';
import CheckInHistoryPage from './components/modules/habits/CheckInHistoryPage';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/habit-settings',
    element: <HabitSettings />,
  },
  {
    path: '/checkin-history',
    element: <CheckInHistoryPage />,
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}