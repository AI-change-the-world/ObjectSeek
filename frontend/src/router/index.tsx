import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Error from '../pages/Error';
import Dashboard from '../pages/Dashboard/Dashboard';
import SystemMonitor from '../pages/Monitor/Monitor';
import Scenario from '../pages/Scenario/ScenarioManagement';
import AlgorithmManagement from '../pages/Algo/AlgorithmManagement';
import MyStreamPage from '../pages/StreamManagement/page';

export const router = createBrowserRouter([

    {
        element: <AppLayout />,
        children: [
            { index: true, element: <Dashboard /> },  // 默认路由，匹配 "/"
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/monitor', element: <SystemMonitor /> },
            { path: '/scenario-management', element: <Scenario /> },
            { path: '/algorithm-management', element: <AlgorithmManagement /> },
            { path: '/stream-management', element: <MyStreamPage /> },
        ],
    },
    { path: '*', element: <Error /> },
]);