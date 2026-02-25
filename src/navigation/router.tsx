import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthWrapper, ProtectedComponentWrapper } from '../utils/wrapper';
import Login from '../screens/Login';
import { path } from './commanPaths';
import Dashboard from '../screens/Dashboard';
import OnBoarding from '../screens/OnBoarding';

export const router = createBrowserRouter([
    {
        path: path.login,
        element: <AuthWrapper children={<Login />} />,
    },
    {
        // Shortcut: /onboarding → step 1 with dummy venue id
        path: '/onboarding',
        element: <Navigate to="/onboarding/venue-001/step/1" replace />,
    },
    {
        path: path.onBoarding,
        element: <ProtectedComponentWrapper children={<OnBoarding />} />,
    },
    {
        path: path.dashboard,
        element: <ProtectedComponentWrapper children={<Dashboard />} />,
    },
]);
