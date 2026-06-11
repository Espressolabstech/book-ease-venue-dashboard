import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Clock,
    CreditCard,
    Loader2,
    MapPin,
    User,
    XCircle,
} from 'lucide-react';
import { getBooking, cancelBooking } from '../../api/adapters/bookings';
import { cn, formatTime } from '../../utils/twMerge';
import { path } from '../../navigation/commanPaths';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';

const statusColors: Record<BookingStatus, string> = {
    CONFIRMED: 'bg-green-100 text-green-800',
    PENDING: 'bg-amber-100 text-amber-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-600',
};

const paymentMethodLabel: Record<string, string> = {
    CASH: 'Cash',
    WALLET: 'Wallet',
    UPI: 'UPI',
    CARD: 'Card',
    NET_BANKING: 'Net Banking',
};

const ViewBooking = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<BookingModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getBooking(id)
            .then((res) => setBooking(res.data.booking))
            .catch((err) => setError(err?.message ?? 'Failed to load booking'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleCancel = async () => {
        if (!booking) return;
        setCancelling(true);
        try {
            await cancelBooking(booking.id, { cancelReason: 'Cancelled by venue' });
            setBooking((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
            setCancelDialogOpen(false);
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'message' in err
                    ? (err as { message: string }).message
                    : 'Failed to cancel booking';
            setError(msg);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-full p-1 hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-semibold">Booking Details</h1>
                </header>
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-background">
                <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-full p-1 hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-semibold">Booking Details</h1>
                </header>
                <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                    <p className="text-sm text-muted-foreground">
                        {error ?? 'Booking not found'}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate(path.dashboard)}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const canCancel =
        booking.status === 'CONFIRMED' || booking.status === 'PENDING';

    return (
        <div className="min-h-screen bg-background">
            <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-full p-1 hover:bg-primary-foreground/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="font-semibold">Booking Details</h1>
                <Badge
                    className={cn(
                        'ml-auto text-xs font-medium',
                        statusColors[booking.status],
                    )}
                >
                    {booking.status.replace(/_/g, ' ')}
                </Badge>
            </header>

            <main className="mx-auto max-w-lg px-4 py-6 space-y-4 pb-10">
                {/* Ref */}
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                        Booking Reference
                    </p>
                    <p className="font-mono font-semibold text-foreground">
                        {booking.bookingRef}
                    </p>
                </div>

                {/* Court + Date + Time */}
                <div className="rounded-xl border bg-card p-4 space-y-3">
                    {booking.court && (
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {booking.court.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {booking.court.sport.toLowerCase()}
                                    {booking.court.environment
                                        ? ` · ${booking.court.environment.toLowerCase()}`
                                        : ''}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-muted p-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-foreground">
                            {format(
                                new Date(booking.bookingDate),
                                'EEEE, d MMMM yyyy',
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-muted p-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-foreground">
                            {formatTime(booking.startTime)} –{' '}
                            {formatTime(booking.endTime)}
                            <span className="ml-2 text-xs text-muted-foreground">
                                ({booking.durationMinutes} min)
                            </span>
                        </p>
                    </div>
                </div>

                {/* Player */}
                {booking.user && (
                    <div className="rounded-xl border bg-card p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Player
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                {(booking.user.name ?? booking.user.phone)
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {booking.user.name ?? '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {booking.user.countryCode}
                                    {booking.user.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment */}
                {booking.payment && (
                    <div className="rounded-xl border bg-card p-4 space-y-2">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Payment
                        </p>
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                                <span className="text-sm text-foreground">
                                    {paymentMethodLabel[
                                        booking.payment.paymentMethod
                                    ] ?? booking.payment.paymentMethod}
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    ₹
                                    {Number(
                                        booking.payment.amount,
                                    ).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pl-7">
                            <span>Status</span>
                            <span
                                className={cn(
                                    'rounded-full px-2 py-0.5 font-medium',
                                    booking.payment.paymentStatus === 'PAID'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700',
                                )}
                            >
                                {booking.payment.paymentStatus}
                            </span>
                        </div>
                        {booking.payment.refundAmount && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground pl-7">
                                <span>Refunded</span>
                                <span>
                                    ₹
                                    {Number(
                                        booking.payment.refundAmount,
                                    ).toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* OTC notice */}
                {booking.isOtcActive && (
                    <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 text-xs text-violet-700">
                        Open to Cancel — this slot will auto-release and the
                        player will be refunded if someone else books it.
                    </div>
                )}

                {/* Cancel */}
                {canCancel && (
                    <Button
                        variant="outline"
                        className="w-full border-destructive/40 text-destructive hover:bg-destructive/5"
                        onClick={() => setCancelDialogOpen(true)}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Booking
                    </Button>
                )}

                {booking.bookedBy && (
                    <p className="text-center text-xs text-muted-foreground">
                        Booked on-site by{' '}
                        {booking.bookedBy.name ?? booking.bookedBy.phone}
                    </p>
                )}
            </main>

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Cancel Booking?
                        </DialogTitle>
                        <DialogDescription>
                            Cancel booking for{' '}
                            <span className="font-medium text-foreground">
                                {booking.user?.name ?? 'this player'}
                            </span>{' '}
                            on{' '}
                            {format(
                                new Date(booking.bookingDate),
                                'EEE, MMM d',
                            )}{' '}
                            at {formatTime(booking.startTime)}? Any applicable
                            refund will be processed automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                            disabled={cancelling}
                        >
                            Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={cancelling}
                        >
                            {cancelling && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ViewBooking;
