import { createBrowserRouter } from 'react-router-dom';
import {
    AuthWrapper,
    DashboardWrapper,
    ProtectedComponentWrapper,
} from '../utils/wrapper';
import Login from '../screens/Login';
import { path } from './commanPaths';
import Dashboard from '../screens/Dashboard';
import OnBoarding from '../screens/OnBoarding';
import VenueInvite from '../screens/VenueInvite';
import Settings from '../screens/Settings';
import Bookings from '../screens/Bookings';
import ListBookings from '../screens/Bookings/ListBookings';
import Players from '../screens/Players';
import Analytics from '../screens/Analytics';
import Wallets from '../screens/Wallets';

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
    {
        path: path.settings,
        element: <ProtectedComponentWrapper children={<Settings />} />,
    },
    {
        path: path.bookings,
        element: <ProtectedComponentWrapper children={<Bookings />} />,
    },
    {
        path: path.listBooking,
        element: <ProtectedComponentWrapper children={<ListBookings />} />,
    },
    {
        path: path.players,
        element: <ProtectedComponentWrapper children={<Players />} />,
    },
    {
        path: path.analytics,
        element: <ProtectedComponentWrapper children={<Analytics />} />,
    },
    {
        path: path.wallet,
        element: <ProtectedComponentWrapper children={<Wallets />} />,
    },
]);
