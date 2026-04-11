import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertTriangle, ArrowLeft, Calendar, Clock, CreditCard, Lock, Loader2, Plus, User, XCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DateStrip } from '../../components/DateStrip';
import { cn, formatTime } from '../../utils/twMerge';
import { getCourts } from '../../api/adapters/courts';
import { getAvailableSlots, listVenueBookings, cancelBooking } from '../../api/adapters/bookings';
import { path } from '../../navigation/commanPaths';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

type SlotItem = {
    id: string;
    courtId: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'booked' | 'pending';
};

const bookingStatusColors: Record<BookingStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-green-100 text-green-800',
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

const ListBookings = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [courts, setCourts] = useState<CourtModel[]>([]);
    const [courtsLoading, setCourtsLoading] = useState(true);
    const [slotsData, setSlotsData] = useState<Record<string, SlotItem[]>>({});
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSport, setSelectedSport] = useState<string>('');
    const [selectedCourt, setSelectedCourt] = useState('all');
    const courtScrollRef = useRef<HTMLDivElement>(null);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // Booking detail sheet state
    const [selectedSlot, setSelectedSlot] = useState<{ courtId: string; startTime: string } | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    // Fetch all venue bookings for the selected date (used to find booking detail on slot click)
    const { data: venueBookingsData } = useQuery({
        queryKey: ['venueBookings', dateStr],
        queryFn: () => listVenueBookings({ date: dateStr, limit: 100 }),
    });
    const venueBookings: BookingModel[] = venueBookingsData?.data?.bookings ?? [];

    // Find the booking matching the clicked slot
    const selectedBooking = useMemo(() => {
        if (!selectedSlot) return null;
        return venueBookings.find(
            (b) =>
                b.courtId === selectedSlot.courtId &&
                b.startTime === selectedSlot.startTime &&
                b.status !== 'CANCELLED',
        ) ?? null;
    }, [selectedSlot, venueBookings]);

    const { mutate: doCancel, isPending: cancelLoading } = useMutation({
        mutationFn: (bookingId: string) =>
            cancelBooking(bookingId, { cancelReason: 'Cancelled by venue' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venueBookings', dateStr] });
            // Refetch slots so the grid updates
            setSlotsData({});
            setCancelDialogOpen(false);
            setSelectedSlot(null);
            toast.success('Booking cancelled successfully');
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? 'Unable to cancel this booking.';
            toast.error(msg);
        },
    });

    // Fetch courts once
    useEffect(() => {
        getCourts()
            .then((res) => {
                const c = res.data.courts;
                setCourts(c);
                if (c.length > 0) setSelectedSport(c[0].sport);
            })
            .finally(() => setCourtsLoading(false));
    }, []);

    const sports = useMemo(
        () => [...new Set(courts.map((c) => c.sport))],
        [courts],
    );

    const courtsForSport = useMemo(
        () => courts.filter((c) => c.sport === selectedSport),
        [courts, selectedSport],
    );

    useEffect(() => {
        setSelectedCourt('all');
    }, [courtsForSport]);

    // Fetch slots for all courts in selected sport when date changes
    useEffect(() => {
        if (!courtsForSport.length) return;
        let cancelled = false;
        setSlotsLoading(true);

        Promise.all(
            courtsForSport.map(async (c) => {
                try {
                    const res = await getAvailableSlots(c.id, dateStr);
                    const { isClosed, session1, session2 } = res.data;
                    if (isClosed) return [c.id, []] as const;
                    const toSlots = (
                        items: AvailableSlotItem[],
                    ): SlotItem[] =>
                        items.map((s) => ({
                            id: `ts-${c.id}-${dateStr}-${s.startTime}`,
                            courtId: c.id,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            status: s.status,
                        }));
                    return [
                        c.id,
                        [
                            ...toSlots(session1 ?? []),
                            ...toSlots(session2 ?? []),
                        ],
                    ] as const;
                } catch {
                    return [c.id, []] as const;
                }
            }),
        ).then((entries) => {
            if (cancelled) return;
            setSlotsData(Object.fromEntries(entries) as Record<string, SlotItem[]>);
        }).finally(() => {
            if (!cancelled) setSlotsLoading(false);
        });

        return () => { cancelled = true; };
    }, [courtsForSport, dateStr]);

    const allCourtsSlots = useMemo(
        () =>
            courtsForSport.map((court) => ({
                court,
                slots: slotsData[court.id] ?? [],
            })),
        [courtsForSport, slotsData],
    );

    const timeLabels = allCourtsSlots[0]?.slots.map((s) => s.startTime) ?? [];

    const getSlotColor = (status: SlotItem['status']) => {
        if (status === 'booked') return 'bg-destructive';
        if (status === 'pending') return 'bg-warning/70';
        return 'bg-success';
    };

    const currentCourtSlots = slotsData[selectedCourt] ?? [];

    if (courtsLoading) {
        return (
            <div className="min-h-screen bg-background">
                <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                    <button
                        onClick={() => navigate(path.dashboard)}
                        className="rounded-full p-1 hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-semibold">Day Schedule</h1>
                </header>
                <div className="flex justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                <button
                    onClick={() => navigate(path.dashboard)}
                    className="rounded-full p-1 hover:bg-primary-foreground/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="font-semibold">Day Schedule</h1>
                <button
                    onClick={() => navigate(path.bookings)}
                    className="ml-auto rounded-full p-1 hover:bg-primary-foreground/10"
                    title="New booking"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </header>

            <main className="mx-auto max-w-lg px-4 pt-4 pb-8">
                <DateStrip selected={selectedDate} onSelect={setSelectedDate} />

                {/* Sport toggle */}
                {sports.length > 1 && (
                    <div className="mt-4 flex gap-2">
                        {sports.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSelectedSport(s)}
                                className={cn(
                                    'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all',
                                    selectedSport === s
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Court tabs */}
                <div
                    ref={courtScrollRef}
                    className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <button
                        onClick={() => setSelectedCourt('all')}
                        className={cn(
                            'snap-start shrink-0 rounded-xl px-5 py-3 text-sm font-medium transition-all min-w-[4rem] touch-manipulation',
                            selectedCourt === 'all'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-card border border-border text-foreground hover:border-primary/50',
                        )}
                    >
                        All
                    </button>
                    {courtsForSport.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCourt(c.id)}
                            className={cn(
                                'snap-start shrink-0 rounded-xl px-5 py-3 text-sm font-medium transition-all min-w-[5.5rem] touch-manipulation',
                                selectedCourt === c.id
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-card border border-border text-foreground hover:border-primary/50',
                            )}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {slotsLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : selectedCourt === 'all' ? (
                    /* ── All courts grid ─────────────────────────────────── */
                    <div className="mt-4">
                        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-success inline-block" />
                                Available
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-destructive inline-block" />
                                Booked
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-warning/70 inline-block" />
                                Pending
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <div
                                className="grid gap-px bg-border rounded-lg overflow-hidden"
                                style={{
                                    gridTemplateColumns: `3rem repeat(${courtsForSport.length}, 1fr)`,
                                }}
                            >
                                {/* Header */}
                                <div className="bg-muted/50 px-1 py-2" />
                                {courtsForSport.map((court) => (
                                    <button
                                        key={court.id}
                                        onClick={() => setSelectedCourt(court.id)}
                                        className="bg-muted/50 px-1 py-2 text-[10px] font-semibold text-muted-foreground text-center hover:bg-muted transition-colors leading-tight"
                                    >
                                        {court.name
                                            .replace(/^(Padel|Pickleball) Court\s*/i, 'C')
                                            .replace(/^Court\s*/i, 'C')}
                                    </button>
                                ))}

                                {timeLabels.map((time, rowIdx) => (
                                    <>
                                        <div
                                            key={`time-${time}`}
                                            className="bg-card flex items-center justify-center px-1 py-1.5 text-[10px] text-muted-foreground font-medium"
                                        >
                                            {formatTime(time)}
                                        </div>
                                        {allCourtsSlots.map(({ court, slots: courtSlots }) => {
                                            const slot = courtSlots[rowIdx];
                                            const color = slot
                                                ? getSlotColor(slot.status)
                                                : 'bg-muted';
                                            return (
                                                <button
                                                    key={`${court.id}-${time}`}
                                                    onClick={() => {
                                                        if (slot?.status === 'available') {
                                                            navigate(
                                                                `${path.bookings}?court=${court.id}&slot=${slot.id}&date=${dateStr}`,
                                                            );
                                                        } else if (slot?.status === 'booked' || slot?.status === 'pending') {
                                                            setSelectedSlot({ courtId: court.id, startTime: slot.startTime });
                                                        } else {
                                                            setSelectedCourt(court.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        'h-7 w-full transition-opacity',
                                                        color,
                                                        (slot?.status === 'available' || slot?.status === 'booked' || slot?.status === 'pending') && 'hover:opacity-75',
                                                        !slot && 'cursor-default',
                                                    )}
                                                />
                                            );
                                        })}
                                    </>
                                ))}
                            </div>
                        </div>

                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Tap a booked / pending cell to view that court's detail
                        </p>
                    </div>
                ) : (
                    /* ── Single court list ───────────────────────────────── */
                    <div className="mt-4 space-y-1">
                        {currentCourtSlots.length === 0 ? (
                            <p className="py-12 text-center text-sm text-muted-foreground">
                                No slots available for this date.
                            </p>
                        ) : (
                            currentCourtSlots.map((slot) => {
                                const isBooked = slot.status === 'booked';
                                const isPending = slot.status === 'pending';
                                const isAvailable = slot.status === 'available';

                                return (
                                    <div
                                        key={slot.id}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                                            isAvailable &&
                                                'bg-card border-border cursor-pointer hover:bg-success/5 hover:border-success/30',
                                            isBooked &&
                                                'bg-destructive/5 border-destructive/20 cursor-pointer hover:bg-destructive/10',
                                            isPending &&
                                                'bg-warning/5 border-warning/20 cursor-pointer hover:bg-warning/10',
                                        )}
                                        onClick={() => {
                                            if (isAvailable) {
                                                navigate(
                                                    `${path.bookings}?court=${selectedCourt}&slot=${slot.id}&date=${dateStr}`,
                                                );
                                            } else if (isBooked || isPending) {
                                                setSelectedSlot({ courtId: selectedCourt, startTime: slot.startTime });
                                            }
                                        }}
                                    >
                                        <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground">
                                            {formatTime(slot.startTime)}
                                        </div>
                                        <div
                                            className={cn(
                                                'h-8 w-1 rounded-full shrink-0',
                                                isAvailable && 'bg-success',
                                                isBooked && 'bg-destructive',
                                                isPending && 'bg-warning',
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            {isBooked ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Lock className="h-3.5 w-3.5 text-destructive" />
                                                    <p className="text-sm font-medium text-destructive">
                                                        Booked
                                                    </p>
                                                </div>
                                            ) : isPending ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Lock className="h-3.5 w-3.5 text-warning" />
                                                    <p className="text-sm font-medium text-warning">
                                                        Pending payment
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Open · tap to book
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>

            {/* Booking Detail Sheet */}
            <Sheet open={!!selectedSlot} onOpenChange={(open) => { if (!open) { setSelectedSlot(null); setCancelDialogOpen(false); } }}>
                <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Booking Details</SheetTitle>
                    </SheetHeader>

                    {selectedBooking ? (
                        <div className="space-y-4 pb-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-foreground">{selectedBooking.court?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedBooking.venue?.name}</p>
                                </div>
                                <Badge className={bookingStatusColors[selectedBooking.status] ?? ''}>
                                    {selectedBooking.status.replace(/_/g, ' ')}
                                </Badge>
                            </div>

                            <div className="space-y-2 rounded-lg bg-muted/40 p-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{format(new Date(selectedBooking.bookingDate), 'EEEE, MMMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{formatTime(selectedBooking.startTime)} – {formatTime(selectedBooking.endTime)}</span>
                                </div>
                                {selectedBooking.user && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{selectedBooking.user.name || 'Guest'} · {selectedBooking.user.countryCode}{selectedBooking.user.phone}</span>
                                    </div>
                                )}
                                {selectedBooking.payment && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>₹{selectedBooking.finalAmount} · {paymentMethodLabel[selectedBooking.payment.paymentMethod] ?? selectedBooking.payment.paymentMethod} · {selectedBooking.payment.paymentStatus}</span>
                                    </div>
                                )}
                            </div>

                            {(selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'PENDING') && (
                                <Button
                                    variant="outline"
                                    className="w-full border-destructive/40 text-destructive hover:bg-destructive/5"
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Booking
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Loading booking details…
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Cancel confirmation dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Cancel Booking?
                        </DialogTitle>
                        <DialogDescription>
                            {selectedBooking && (
                                <>
                                    Cancel booking for{' '}
                                    <span className="font-medium text-foreground">
                                        {selectedBooking.user?.name || 'Guest'}
                                    </span>{' '}
                                    on{' '}
                                    {format(new Date(selectedBooking.bookingDate), 'EEE, MMM d')}{' '}
                                    at {formatTime(selectedBooking.startTime)}?
                                    {' '}Any applicable refund will be processed automatically.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                            disabled={cancelLoading}
                        >
                            Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedBooking && doCancel(selectedBooking.id)}
                            disabled={cancelLoading}
                        >
                            {cancelLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ListBookings;
