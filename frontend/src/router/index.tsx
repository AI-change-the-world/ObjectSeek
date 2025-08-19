import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Error from '../pages/Error';
import Dashboard from '../pages/Dashboard/Dashboard';
import SystemMonitor from '../pages/Monitor/Monitor';

export const router = createBrowserRouter([

    {
        element: <AppLayout />,
        children: [
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/monitor', element: <SystemMonitor /> },
        ],
    },
    { path: '*', element: <Error /> },
]);