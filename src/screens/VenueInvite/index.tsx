import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getToken } from '../../utils/cookies.helpers';

const VenueInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        // Strip anything after the CUID (guards against pasting raw JSON with adjacent fields)
        const rawVenueId = searchParams.get('venueId') ?? '';
        const venueId = rawVenueId.match(/^c[0-9a-z]{24}/)?.[0] ?? '';

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
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
};

export default VenueInvite;
