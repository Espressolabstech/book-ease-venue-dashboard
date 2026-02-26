import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getToken } from './cookies.helpers';
import { path } from '../../src/navigation/commanPaths';
import { isOnBoarded } from '../api/adapters/onBoard';

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

    if (isLoading) return null;

    if (!data?.data.isOnBoarded) return <Navigate to="/onboarding" replace />;

    return children;
};
