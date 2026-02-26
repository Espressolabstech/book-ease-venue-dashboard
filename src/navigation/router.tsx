import { createBrowserRouter } from 'react-router-dom';
import { AuthWrapper, DashboardWrapper, ProtectedComponentWrapper } from '../utils/wrapper';
import Login from '../screens/Login';
import { path } from './commanPaths';
import Dashboard from '../screens/Dashboard';
import OnBoarding from '../screens/OnBoarding';
import VenueInvite from '../screens/VenueInvite';

export const router = createBrowserRouter([
    {
        path: path.login,
        element: <AuthWrapper children={<Login />} />,
    },
    {
        path: path.venueInvite,
        element: <VenueInvite />,
    },
    {
        path: path.onBoarding,
        element: <ProtectedComponentWrapper children={<OnBoarding />} />,
    },
    {
        path: path.dashboard,
        element: <DashboardWrapper children={<Dashboard />} />,
    },
]);
