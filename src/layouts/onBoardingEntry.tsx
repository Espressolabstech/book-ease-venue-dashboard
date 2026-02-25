import { Clock, Loader2, Sparkles, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';

const OnBoardingEntry = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<InvitationStatus>('loading');
    const [invitation, setInvitation] = useState<InvitationData | null>(null);

    useEffect(() => {
        if (!token) {
            setStatus('invalid');
            return;
        }
        validateToken(token);
    }, [token]);

    const validateToken = async (tokenValue: string) => {
        setStatus('loading');

        // Case B — expired

        setStatus('valid');
    };

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--admin-bg))]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-lime))]" />
                    <p className="text-sm text-muted-foreground">
                        Validating your invitation…
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--admin-bg))] px-4">
                <div className="w-full max-w-md rounded-xl bg-card p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <XCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">
                        This link is invalid
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This invitation link doesn't exist or has been revoked.
                        Please contact the platform team for a new link.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--admin-bg))] px-4">
                <div className="w-full max-w-md rounded-xl bg-card p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--admin-status-amber))]/10">
                        <Clock className="h-8 w-8 text-[hsl(var(--admin-status-amber))]" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">
                        This link has expired
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Invitation links are valid for 72 hours. Please contact
                        the platform team to receive a new link.
                    </p>
                </div>
            </div>
        );
    }

    // Valid — welcome screen
    return (
        <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--admin-bg))] px-4">
            <div className="w-full max-w-lg rounded-xl bg-card p-8 text-center shadow-sm">
                {/* Platform logo */}
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--admin-navy))]">
                    <Sparkles className="h-6 w-6 text-[hsl(var(--admin-lime))]" />
                </div>

                <h1 className="text-2xl font-bold text-foreground">
                    Welcome, {invitation?.manager_name}!
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Let's get{' '}
                    <span className="font-semibold text-foreground">
                        {invitation?.venue_name}
                    </span>{' '}
                    set up on the platform.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                    This should take about 10–15 minutes. You can save your
                    progress and come back at any time.
                </p>

                <Button
                    onClick={() =>
                        navigate(`/onboarding/${token}/verify`, {
                            state: { invitation },
                        })
                    }
                    className="mt-8 h-12 w-full bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] hover:bg-[hsl(var(--admin-lime))]/90 text-base font-semibold"
                >
                    Get Started
                </Button>
            </div>
        </div>
    );
};

export default OnBoardingEntry;
