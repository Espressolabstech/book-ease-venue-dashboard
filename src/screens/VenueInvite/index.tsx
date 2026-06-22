import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedLoader } from '../../components/AnimatedLoader';
import { getToken } from '../../utils/cookies.helpers';

const VenueInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const venueId = searchParams.get('venueId');

        if (!token || !venueId) {
            navigate('/login', { replace: true });
            return;
        }

        sessionStorage.setItem('inviteToken', token);
        sessionStorage.setItem('inviteVenueId', venueId);

        if (getToken()) {
            navigate(`/onboarding/${venueId}/${token}/step/1`, { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, []); // eslint-disable-line

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <AnimatedLoader />
        </div>
    );
};

export default VenueInvite;
