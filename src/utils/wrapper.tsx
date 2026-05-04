import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getToken } from './cookies.helpers';
import { path } from '../../src/navigation/commanPaths';
import { isOnBoarded } from '../api/adapters/onBoard';
import Loader from '../components/ui/loader';
import { canAccessSettings, useVenueRole } from '../hooks/useVenueRole';

export const AuthWrapper = ({ children }: WrapperProps) => {
    return getToken() ? <Navigate to={path.dashboard} replace /> : children;
};

export const ProtectedComponentWrapper = ({ children }: WrapperProps) => {
    return getToken() ? children : <Navigate to={path.login} replace />;
};

export const DashboardWrapper = ({ children }: WrapperProps) => {
    if (!getToken()) return <Navigate to={path.login} replace />;

    const { data, isLoading } = useQuery({
        queryKey: ['isOnBoarded'],
        queryFn: isOnBoarded,
    });

    if (isLoading) return <Loader />;

    if (!data?.data.isOnBoarded) {
        const inviteVenueId = sessionStorage.getItem('inviteVenueId');
        const inviteToken = sessionStorage.getItem('inviteToken');
        if (inviteVenueId && inviteToken) {
            return (
                <Navigate
                    to={`/onboarding/${inviteVenueId}/${inviteToken}/step/1`}
                    replace
                />
            );
        }
        return <Navigate to={path.login} replace />;
    }

    return children;
};

// Blocks Court Assistants from settings, players, analytics, wallets
export const VenueAdminOrManagerWrapper = ({ children }: WrapperProps) => {
    if (!getToken()) return <Navigate to={path.login} replace />;
    const role = useVenueRole();
    return canAccessSettings(role) ? children : <Navigate to={path.dashboard} replace />;
};

// Blocks everyone except Venue Admin from wallets
export const VenueAdminOnlyWrapper = ({ children }: WrapperProps) => {
    if (!getToken()) return <Navigate to={path.login} replace />;
    const role = useVenueRole();
    return role === 'VENUE_ADMIN' ? children : <Navigate to={path.dashboard} replace />;
};
