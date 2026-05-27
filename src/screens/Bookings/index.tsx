import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { cn, formatTime } from '../../utils/twMerge';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Loader2,
    Search,
    Share2,
    User,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { DateStrip } from '../../components/DateStrip';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
    paymentMethodDisplayLabels,
    paymentMethods,
} from '../../utils/bookings';
import { ScrollArea, ScrollBar } from '../../components/ui/scroll-area';
import { getCourts } from '../../api/adapters/courts';
import {
    addPlayer,
    cancelBooking,
    getAvailableSlots,
    getPlayerVenueWallet,
    listVenueBookings,
    listVenuePlayers,
    managerCreateBooking,
    verifyBookingPayment,
} from '../../api/adapters/bookings';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { loadRazorpayScript, openRazorpayCheckout } from '../../utils/razorpay';
import { path } from '../../navigation/commanPaths';
import { SPORT_DISPLAY } from '../../utils/settings';

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

const Booking = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const paramCourt = searchParams.get('court');
    const paramSlot = searchParams.get('slot');
    const paramDate = searchParams.get('date');
    const fromSchedule = !!paramCourt;

    // ── UI state ────────────────────────────────────────────────────────────
    const [step, setStep] = useState<Step>(
        paramCourt && paramSlot ? 'player' : 'court',
    );
    const [selectedDate, setSelectedDate] = useState(
        paramDate ? new Date(paramDate) : new Date(),
    );
    const [selectedCourt, setSelectedCourt] = useState(paramCourt || '');
    const [selectedSlots, setSelectedSlots] = useState<string[]>(
        paramSlot ? [paramSlot] : [],
    );
    const [playerSearch, setPlayerSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] =
        useState<VenuePlayerModel | null>(null);
    const [showNewPlayer, setShowNewPlayer] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerPhone, setNewPlayerPhone] = useState('');
    const [newPlayerCountryCode, setNewPlayerCountryCode] = useState('+91');
    const [paymentMethod, setPaymentMethod] =
        useState<IndianPaymentMethod>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [playerWalletBalance, setPlayerWalletBalance] = useState<
        number | null
    >(null);

    // ── API data ────────────────────────────────────────────────────────────
    type SlotItem = {
        id: string;
        court_id: string;
        date: string;
        start_time: string;
        end_time: string;
        status: 'available' | 'booked' | 'blocked';
    };

    const [courts, setCourts] = useState<CourtModel[]>([]);
    const [courtsLoading, setCourtsLoading] = useState(true);
    const [players, setPlayers] = useState<VenuePlayerModel[]>([]);
    const [playersLoading, setPlayersLoading] = useState(false);
    const [courtSlotsData, setCourtSlotsData] = useState<
        Record<string, SlotItem[]>
    >({});
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [bookedResult, setBookedResult] = useState<BookingModel | null>(null);
    const [venueBookings, setVenueBookings] = useState<BookingModel[]>([]);
    const [selectedBookedSlot, setSelectedBookedSlot] = useState<{ courtId: string; startTime: string } | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [slotsRefreshKey, setSlotsRefreshKey] = useState(0);

    // Fetch courts once
    useEffect(() => {
        setCourtsLoading(true);
        getCourts()
            .then((res) => setCourts(res.data.courts))
            .catch(() =>
                toast({
                    title: 'Failed to load courts',
                    variant: 'destructive',
                }),
            )
            .finally(() => setCourtsLoading(false));
    }, []);

    // Fetch players when entering the player step
    useEffect(() => {
        if (step !== 'player') return;
        setPlayersLoading(true);
        listVenuePlayers({ limit: 100 })
            .then((res) => setPlayers(res.data.players))
            .catch(() =>
                toast({
                    title: 'Failed to load players',
                    variant: 'destructive',
                }),
            )
            .finally(() => setPlayersLoading(false));
    }, [step]);

    // Fetch venue wallet balance when an existing player is selected
    useEffect(() => {
        if (!selectedPlayer) {
            setPlayerWalletBalance(null);
            if (paymentMethod === 'wallet') setPaymentMethod('cash');
            return;
        }
        getPlayerVenueWallet(selectedPlayer.userId)
            .then((res) => setPlayerWalletBalance(res.data.walletBalance))
            .catch(() => setPlayerWalletBalance(0));
    }, [selectedPlayer?.userId]);

    // ── Derived court / slot data ───────────────────────────────────────────
    const availableSports = useMemo(
        () => [...new Set(courts.map((c) => c.sport))],
        [courts],
    );
    const [selectedSport, setSelectedSport] = useState<string>('');

    // Sync selectedSport when courts load
    useEffect(() => {
        if (availableSports.length && !selectedSport) {
            setSelectedSport(availableSports[0]);
        }
    }, [availableSports]);

    const filteredCourts = useMemo(
        () => courts.filter((c) => c.sport === selectedSport),
        [courts, selectedSport],
    );

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // Fetch all venue bookings for the selected date (for player names on booked slots)
    useEffect(() => {
        listVenueBookings({ date: dateStr, limit: 100 })
            .then((res) => setVenueBookings(res.data.bookings))
            .catch(() => setVenueBookings([]));
    }, [dateStr]);

    // Fetch real slot availability whenever visible courts or date changes
    useEffect(() => {
        if (!filteredCourts.length) return;
        let cancelled = false;
        setSlotsLoading(true);
        Promise.all(
            filteredCourts.map(async (c) => {
                try {
                    const res = await getAvailableSlots(c.id, dateStr);
                    const { isClosed, session1, session2 } = res.data;
                    if (isClosed) return [c.id, []] as const;
                    const toSlots = (items: AvailableSlotItem[]): SlotItem[] =>
                        items.map((s) => ({
                            id: `ts-${c.id}-${dateStr}-${s.startTime}`,
                            court_id: c.id,
                            date: dateStr,
                            start_time: s.startTime,
                            end_time: s.endTime,
                            status:
                                s.status === 'available'
                                    ? 'available'
                                    : s.status === 'downtime'
                                      ? 'blocked'
                                      : 'booked',
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
        )
            .then((entries) => {
                if (cancelled) return;
                const newData = Object.fromEntries(
                    entries.map(([id, slots]) => [id, slots as SlotItem[]]),
                );
                setCourtSlotsData(newData);
                // Clear any pre-selected slots that are not available (e.g. from URL params)
                if (selectedCourt && newData[selectedCourt]) {
                    setSelectedSlots((prev) =>
                        prev.filter((id) =>
                            newData[selectedCourt].find(
                                (s) => s.id === id && s.status === 'available',
                            ),
                        ),
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setSlotsLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredCourts.map((c) => c.id).join(','), dateStr, slotsRefreshKey]);

    const courtSlots = useMemo(
        () =>
            filteredCourts.map((c) => ({
                court: c,
                slots: courtSlotsData[c.id] ?? [],
            })),
        [filteredCourts, courtSlotsData],
    );

    const hours: string[] = courtSlots[0]?.slots.map((s) => s.start_time) ?? [];

    // ── Filtered players ────────────────────────────────────────────────────
    const filteredPlayers = useMemo(() => {
        if (!playerSearch.trim()) return players;
        const q = playerSearch.toLowerCase();
        return players.filter(
            (p) =>
                (p.user.name ?? '').toLowerCase().includes(q) ||
                p.user.phone.includes(q),
        );
    }, [players, playerSearch]);

    // ── Selected slot/court data ────────────────────────────────────────────
    const selectedCourtData = courts.find((c) => c.id === selectedCourt);
    const allSlots: SlotItem[] = selectedCourt
        ? (courtSlotsData[selectedCourt] ?? [])
        : [];
    const selectedSlotObjects = selectedSlots
        .map((id) => allSlots.find((s) => s.id === id))
        .filter(Boolean) as (typeof allSlots)[number][];
    const firstSelectedSlot = selectedSlotObjects[0];
    const lastSelectedSlot =
        selectedSlotObjects[selectedSlotObjects.length - 1];

    const pricePerSlot =
        selectedCourtData?.courtPricings?.[0]?.pricePerSlot ?? 0;
    const courtFee = selectedSlots.length * pricePerSlot;
    const bookingFee = Math.round(courtFee * 0.1);
    const gst = Number(((courtFee + bookingFee) * 0.18).toFixed(2));
    const total = courtFee + bookingFee + gst;

    const canProceedFromCourt = selectedCourt && selectedSlots.length > 0;
    const canProceedFromPlayer =
        selectedPlayer !== null ||
        (showNewPlayer && newPlayerName.trim() && newPlayerPhone.trim());

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSlotTap = (courtId: string, slotId: string) => {
        const slot = (courtSlotsData[courtId] ?? []).find(
            (s) => s.id === slotId,
        );
        if (!slot) return;

        if (slot.status === 'booked') {
            setSelectedBookedSlot({ courtId, startTime: slot.start_time });
            return;
        }

        if (slot.status !== 'available') return;

        if (selectedCourt !== courtId) {
            setSelectedCourt(courtId);
            setSelectedSlots([slotId]);
            return;
        }
        const idx = selectedSlots.indexOf(slotId);
        if (idx !== -1) {
            const next = selectedSlots.slice(0, idx);
            setSelectedSlots(next);
            if (!next.length) setSelectedCourt('');
            return;
        }
        const lastId = selectedSlots[selectedSlots.length - 1];
        const lastSlot = allSlots.find((s) => s.id === lastId);
        const clicked = allSlots.find((s) => s.id === slotId);
        if (!clicked) return;
        if (!lastSlot || lastSlot.end_time === clicked.start_time) {
            setSelectedSlots([...selectedSlots, slotId]);
        } else {
            setSelectedSlots([slotId]);
        }
    };

    const selectedBookedBooking = useMemo(() => {
        if (!selectedBookedSlot) return null;
        return venueBookings.find(
            (b) =>
                b.courtId === selectedBookedSlot.courtId &&
                b.startTime === selectedBookedSlot.startTime &&
                b.status !== 'CANCELLED',
        ) ?? null;
    }, [selectedBookedSlot, venueBookings]);

    const getPlayerNameForSlot = (courtId: string, startTime: string): string | null => {
        const booking = venueBookings.find(
            (b) => b.courtId === courtId && b.startTime === startTime && b.status !== 'CANCELLED',
        );
        return booking?.user?.name ?? booking?.user?.phone ?? null;
    };

    const handleCancelBooking = async () => {
        if (!selectedBookedBooking) return;
        setCancelLoading(true);
        try {
            await cancelBooking(selectedBookedBooking.id, { cancelReason: 'Cancelled by venue' });
            const res = await listVenueBookings({ date: dateStr, limit: 100 });
            setVenueBookings(res.data.bookings);
            setSlotsRefreshKey((k) => k + 1);
            setCancelDialogOpen(false);
            setSelectedBookedSlot(null);
            toast({ title: 'Booking cancelled successfully' });
        } catch {
            toast({ title: 'Unable to cancel this booking', variant: 'destructive' });
        } finally {
            setCancelLoading(false);
        }
    };

    // Map frontend payment method to backend enum
    const toApiPaymentMethod = (pm: IndianPaymentMethod): ApiPaymentMethod => {
        const map: Record<IndianPaymentMethod, ApiPaymentMethod> = {
            upi: 'UPI',
            cash: 'CASH',
            card: 'CARD',
            net_banking: 'NET_BANKING',
            wallet: 'WALLET',
        };
        return map[pm];
    };

    const isWalletAvailable = selectedPlayer !== null && !showNewPlayer;
    const walletHasSufficientBalance =
        playerWalletBalance !== null && playerWalletBalance >= total;

    const handleShare = async () => {
        if (!bookedResult) return;
        const playerName = selectedPlayer
            ? (selectedPlayer.user.name ?? selectedPlayer.user.phone)
            : newPlayerName || newPlayerPhone;
        const text = [
            `🎾 Booking Confirmed!`,
            ``,
            `📋 Ref: ${bookedResult.bookingRef}`,
            `👤 Player: ${playerName}`,
            `🏟️ Court: ${selectedCourtData?.name ?? ''}`,
            `📅 Date: ${format(selectedDate, 'EEE, d MMM yyyy')}`,
            `⏰ Time: ${formatTime(bookedResult.startTime)} – ${formatTime(bookedResult.endTime)}`,
            `💰 Amount Paid: ₹${bookedResult.finalAmount}`,
            `💳 Payment: ${paymentMethodDisplayLabels[paymentMethod]}`,
            ``,
            `See you on the court! 🏆`,
        ].join('\n');

        if (navigator.share) {
            try {
                await navigator.share({ title: '🎾 Booking Confirmed!', text });
            } catch {
                // user cancelled or browser blocked — silently ignore
            }
        } else {
            await navigator.clipboard.writeText(text);
            toast({
                title: 'Copied to clipboard',
                description: 'Booking details copied!',
            });
        }
    };

    const handleConfirm = async () => {
        if (!selectedSlotObjects.length) return;

        setIsSubmitting(true);
        try {
            const playerPhone = selectedPlayer
                ? selectedPlayer.user.phone
                : newPlayerPhone.trim();
            const playerName = selectedPlayer
                ? (selectedPlayer.user.name ?? undefined)
                : newPlayerName.trim() || undefined;
            const playerCountryCode = selectedPlayer
                ? selectedPlayer.user.countryCode
                : newPlayerCountryCode;

            const res = await managerCreateBooking({
                courtId: selectedCourt,
                playerPhone,
                playerCountryCode,
                playerName,
                bookingDate: format(selectedDate, 'yyyy-MM-dd'),
                slots: selectedSlotObjects.map((s) => ({
                    startTime: s.start_time,
                    endTime: s.end_time,
                })),
                paymentMethod: toApiPaymentMethod(paymentMethod),
                ...(paymentMethod === 'cash' && { amount: courtFee }),
            });

            // Mark selected slots as booked optimistically
            const markBooked = () => {
                setCourtSlotsData((prev) => ({
                    ...prev,
                    [selectedCourt]: (prev[selectedCourt] ?? []).map((s) =>
                        selectedSlots.includes(s.id)
                            ? { ...s, status: 'booked' as const }
                            : s,
                    ),
                }));
            };

            // CASH — confirmed immediately
            if (!res.data.razorpay) {
                markBooked();
                setBookedResult(res.data.booking);
                setStep('success');
                return;
            }

            // Online payment — open Razorpay checkout
            const { razorpay, booking } = res.data;
            await loadRazorpayScript();

            openRazorpayCheckout({
                key: razorpay.keyId,
                amount: razorpay.amount,
                currency: razorpay.currency,
                order_id: razorpay.orderId,
                name: 'Book Ease',
                description: `Court booking · ${firstSelectedSlot ? formatTime(firstSelectedSlot.start_time) : ''} – ${lastSelectedSlot ? formatTime(lastSelectedSlot.end_time) : ''}`,
                handler: async (response) => {
                    try {
                        const verifyRes = await verifyBookingPayment(
                            booking.id,
                            {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            },
                        );
                        markBooked();
                        setBookedResult(verifyRes.data.booking);
                        setStep('success');
                    } catch (verifyErr: unknown) {
                        const msg =
                            verifyErr &&
                            typeof verifyErr === 'object' &&
                            'message' in verifyErr
                                ? (verifyErr as { message: string }).message
                                : 'Payment verification failed';
                        toast({ title: msg, variant: 'destructive' });
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast({
                            title: 'Payment cancelled',
                            variant: 'destructive',
                        });
                        setIsSubmitting(false);
                    },
                },
                theme: { color: 'hsl(var(--primary))' },
            });

            // isSubmitting stays true until handler/ondismiss resolves
            return;
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'message' in err
                    ? (err as { message: string }).message
                    : 'Failed to create booking';
            toast({ title: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepIndicator = (
        <div className="flex items-center gap-2 px-4 py-3">
            {(['court', 'player', 'payment', 'confirm'] as const).map(
                (s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div
                            className={cn(
                                'h-1.5 rounded-full flex-1 transition-colors',
                                step === 'success'
                                    ? 'bg-success'
                                    : step === s
                                      ? 'bg-primary'
                                      : [
                                              'court',
                                              'player',
                                              'payment',
                                              'confirm',
                                          ].indexOf(step) > i
                                        ? 'bg-primary/40'
                                        : 'bg-border',
                            )}
                        />
                    </div>
                ),
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                {step !== 'success' && (
                    <button
                        onClick={() => {
                            if (fromSchedule) {
                                navigate(path.bookings);
                            } else {
                                if (step === 'court') navigate(path.dashboard);
                                else if (step === 'player') setStep('court');
                                else if (step === 'payment') setStep('player');
                                else setStep('payment');
                            }
                        }}
                        className="rounded-full p-1 hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                )}
                <h1 className="font-semibold">
                    {step === 'success'
                        ? 'Booking Confirmed'
                        : fromSchedule
                          ? 'Manually creating new booking'
                          : (step === 'court' && 'Select Court & Time') ||
                            (step === 'player' && 'Select Player') ||
                            (step === 'payment' && 'Payment') ||
                            (step === 'confirm' && 'Confirm Booking')}
                </h1>
            </header>

            {stepIndicator}

            <main className="mx-auto max-w-lg px-4 pb-24">
                {/* Step 1: Court & Time — Player-style grid */}
                {step === 'court' && (
                    <div className="space-y-3">
                        {/* Sport chips */}
                        {availableSports.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {availableSports.map((sport) => (
                                    <button
                                        key={sport}
                                        onClick={() => {
                                            if (sport !== selectedSport) {
                                                setSelectedSport(sport);
                                                setSelectedCourt('');
                                                setSelectedSlots([]);
                                                setCourtSlotsData({});
                                            }
                                        }}
                                        className={cn(
                                            'rounded-full px-3 py-1.5 text-sm font-semibold transition-all',
                                            sport === selectedSport
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-accent text-accent-foreground hover:bg-accent/80',
                                        )}
                                    >
                                        {sport}
                                    </button>
                                ))}
                            </div>
                        )}

                        <DateStrip
                            selected={selectedDate}
                            onSelect={(d) => {
                                setSelectedDate(d);
                                setSelectedCourt('');
                                setSelectedSlots([]);
                                setCourtSlotsData({});
                            }}
                        />

                        {/* Grid: time rows × court columns */}
                        {courtsLoading || slotsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <ScrollArea className="mt-1">
                                <div className="min-w-0">
                                    <div className="flex sticky top-0 z-10 bg-background border-b border-border pb-2">
                                        <div className="w-14 shrink-0" />
                                        {filteredCourts.map((c, i) => (
                                            <div
                                                key={c.id}
                                                className="flex-1 min-w-[72px] text-center"
                                            >
                                                <p className="text-xs font-semibold text-foreground">
                                                    Court {i + 1}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        {hours.map((hour, hourIdx) => (
                                            <div
                                                key={hour}
                                                className="flex gap-1"
                                            >
                                                <div className="w-14 shrink-0 pt-1 text-xs text-muted-foreground font-medium">
                                                    {formatTime(hour)}
                                                </div>
                                                {courtSlots.map(
                                                    ({ court: c, slots }) => {
                                                        const slot =
                                                            slots[hourIdx];
                                                        if (!slot) return null;
                                                        const isAvailable =
                                                            slot.status ===
                                                            'available';
                                                        const isSelected =
                                                            selectedCourt ===
                                                                c.id &&
                                                            selectedSlots.includes(
                                                                slot.id,
                                                            );

                                                        return (
                                                            <button
                                                                key={`${c.id}-${slot.id}`}
                                                                disabled={
                                                                    slot.status === 'blocked'
                                                                }
                                                                onClick={() =>
                                                                    handleSlotTap(
                                                                        c.id,
                                                                        slot.id,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'flex-1 min-w-[72px] h-12 rounded-md text-center text-xs font-medium transition-all flex flex-col items-center justify-center overflow-hidden px-1',
                                                                    isAvailable &&
                                                                        !isSelected &&
                                                                        'bg-success/10 text-success border border-success/30 hover:bg-success/20',
                                                                    isSelected &&
                                                                        'bg-primary text-primary-foreground border border-primary shadow-sm',
                                                                    slot.status ===
                                                                        'booked' &&
                                                                        'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20',
                                                                    slot.status ===
                                                                        'blocked' &&
                                                                        'bg-muted/50 text-muted-foreground/50 border border-border/50 cursor-not-allowed',
                                                                )}
                                                            >
                                                                <span className="truncate w-full text-center leading-tight">
                                                                    {isAvailable
                                                                        ? 'Open'
                                                                        : slot.status === 'booked'
                                                                          ? (getPlayerNameForSlot(c.id, slot.start_time)?.split(' ')[0] ?? 'Booked')
                                                                          : '—'}
                                                                </span>
                                                                {isAvailable && (
                                                                    <span
                                                                        className={cn(
                                                                            'text-[10px] opacity-75',
                                                                            isSelected
                                                                                ? 'text-primary-foreground'
                                                                                : 'text-success',
                                                                        )}
                                                                    >
                                                                        ₹
                                                                        {c
                                                                            .courtPricings?.[0]
                                                                            ?.pricePerSlot ??
                                                                            0}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        )}
                    </div>
                )}

                {/* Step 2: Player */}
                {step === 'player' && (
                    <div className="space-y-4">
                        {!showNewPlayer ? (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or phone..."
                                        value={playerSearch}
                                        onChange={(e) =>
                                            setPlayerSearch(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>

                                <div className="space-y-1">
                                    {playersLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : filteredPlayers.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            No players found
                                        </p>
                                    ) : (
                                        filteredPlayers.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() =>
                                                    setSelectedPlayer(p)
                                                }
                                                className={cn(
                                                    'flex items-center w-full gap-3 rounded-lg border p-3 transition-colors text-left',
                                                    selectedPlayer?.id === p.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border bg-card hover:bg-muted/50',
                                                )}
                                            >
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                    {(
                                                        p.user.name ??
                                                        p.user.phone
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {p.user.name ??
                                                            p.user.phone}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {p.user.countryCode}
                                                        {p.user.phone}
                                                    </p>
                                                </div>
                                                {selectedPlayer?.id ===
                                                    p.id && (
                                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowNewPlayer(true)}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add New Player
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Name
                                    </Label>
                                    <Input
                                        placeholder="Player name"
                                        value={newPlayerName}
                                        onChange={(e) =>
                                            setNewPlayerName(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Phone
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="+91"
                                            value={newPlayerCountryCode}
                                            onChange={(e) =>
                                                setNewPlayerCountryCode(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-20 shrink-0"
                                        />
                                        <Input
                                            placeholder="9876543210"
                                            value={newPlayerPhone}
                                            onChange={(e) =>
                                                setNewPlayerPhone(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowNewPlayer(false);
                                            setNewPlayerName('');
                                            setNewPlayerPhone('');
                                        }}
                                    >
                                        Back to search
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={
                                            isAddingPlayer ||
                                            !newPlayerName.trim() ||
                                            !newPlayerPhone.trim()
                                        }
                                        onClick={async () => {
                                            setIsAddingPlayer(true);
                                            try {
                                                const res = await addPlayer({
                                                    phone: newPlayerPhone.trim(),
                                                    countryCode:
                                                        newPlayerCountryCode,
                                                    name: newPlayerName.trim(),
                                                });
                                                const { player, user } =
                                                    res.data;
                                                setSelectedPlayer({
                                                    id: player.id,
                                                    venueId: player.venueId,
                                                    userId: player.userId,
                                                    totalBookings:
                                                        player.totalBookings,
                                                    lastBookingAt: null,
                                                    createdAt: '',
                                                    user: {
                                                        id: user.id,
                                                        name: user.name,
                                                        phone: user.phone,
                                                        countryCode:
                                                            user.countryCode,
                                                        isAppUser: false,
                                                        appInviteStatus:
                                                            'PENDING',
                                                    },
                                                });
                                                setStep('payment');
                                            } catch (err: unknown) {
                                                const msg =
                                                    err &&
                                                    typeof err === 'object' &&
                                                    'message' in err
                                                        ? (
                                                              err as {
                                                                  message: string;
                                                              }
                                                          ).message
                                                        : 'Failed to add player';
                                                toast({
                                                    title: msg,
                                                    variant: 'destructive',
                                                });
                                            } finally {
                                                setIsAddingPlayer(false);
                                            }
                                        }}
                                    >
                                        {isAddingPlayer ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <UserPlus className="h-4 w-4 mr-1" />
                                        )}
                                        Add Player
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 'payment' && (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Court Fee
                                    </span>
                                    <span className="text-foreground">
                                        ₹{courtFee}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Booking Fee (10%)
                                    </span>
                                    <span className="text-foreground">
                                        ₹{bookingFee}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        GST (18%)
                                    </span>
                                    <span className="text-foreground">
                                        ₹{gst}
                                    </span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                                    <span className="text-foreground">
                                        Total
                                    </span>
                                    <span className="text-foreground">
                                        ₹{total}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">
                                Payment Method
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {paymentMethods.map((pm) => {
                                    const isWallet = pm.value === 'wallet';
                                    const disabled =
                                        isWallet &&
                                        (!isWalletAvailable ||
                                            !walletHasSufficientBalance);
                                    return (
                                        <button
                                            key={pm.value}
                                            onClick={() =>
                                                !disabled &&
                                                setPaymentMethod(pm.value)
                                            }
                                            disabled={disabled}
                                            className={cn(
                                                'rounded-lg border p-3 text-sm font-medium transition-all text-center flex flex-col items-center justify-center gap-1',
                                                paymentMethod === pm.value
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-card text-foreground hover:border-primary/50',
                                                disabled &&
                                                    'opacity-40 cursor-not-allowed hover:border-border',
                                            )}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <span>{pm.icon}</span>{' '}
                                                {pm.label}
                                            </span>
                                            {isWallet && isWalletAvailable && (
                                                <span
                                                    className={cn(
                                                        'text-[10px] font-normal',
                                                        paymentMethod ===
                                                            'wallet'
                                                            ? 'text-primary-foreground/80'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {playerWalletBalance ===
                                                    null
                                                        ? 'Loading…'
                                                        : walletHasSufficientBalance
                                                          ? `₹${playerWalletBalance.toLocaleString('en-IN')} available`
                                                          : `₹${playerWalletBalance.toLocaleString('en-IN')} — low`}
                                                </span>
                                            )}
                                            {isWallet && !isWalletAvailable && (
                                                <span className="text-[10px] font-normal text-muted-foreground">
                                                    Existing player only
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {paymentMethod === 'upi' && (
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                    UPI Transaction ID (optional)
                                </Label>
                                <Input placeholder="e.g. 1234567890@upi" />
                            </div>
                        )}
                    </div>
                )}

                {/* Step 5: Success */}
                {step === 'success' && bookedResult && (
                    <div className="flex flex-col items-center gap-6 py-8 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground">
                                Booking Confirmed!
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Ref:{' '}
                                <span className="font-mono font-medium text-foreground">
                                    {bookedResult.bookingRef}
                                </span>
                            </p>
                        </div>
                        <Card className="w-full text-left">
                            <CardContent className="p-4 space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Player
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {selectedPlayer
                                                ? (selectedPlayer.user.name ??
                                                  selectedPlayer.user.phone)
                                                : newPlayerName ||
                                                  newPlayerPhone}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Court
                                        </span>
                                        <span className="text-foreground">
                                            {selectedCourtData
                                                ? `${SPORT_DISPLAY[selectedCourtData.sport] ?? selectedCourtData.sport} · ${selectedCourtData.name}`
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Date
                                        </span>
                                        <span className="text-foreground">
                                            {format(
                                                selectedDate,
                                                'EEE, d MMM yyyy',
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Time
                                        </span>
                                        <span className="text-foreground">
                                            {formatTime(bookedResult.startTime)}{' '}
                                            – {formatTime(bookedResult.endTime)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span className="text-foreground">
                                            Amount Paid
                                        </span>
                                        <span className="text-foreground">
                                            ₹{bookedResult.finalAmount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Payment
                                        </span>
                                        <span className="text-foreground">
                                            {
                                                paymentMethodDisplayLabels[
                                                    paymentMethod
                                                ]
                                            }
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 4: Confirm */}
                {step === 'confirm' && (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <h3 className="font-semibold text-foreground">
                                    Booking Summary
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Player
                                        </span>
                                        <span className="text-foreground font-medium">
                                            {selectedPlayer
                                                ? (selectedPlayer.user.name ??
                                                  selectedPlayer.user.phone)
                                                : newPlayerName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Date
                                        </span>
                                        <span className="text-foreground">
                                            {format(
                                                selectedDate,
                                                'EEE, d MMM yyyy',
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Court
                                        </span>
                                        <span className="text-foreground">
                                            {selectedCourtData
                                                ? `${SPORT_DISPLAY[selectedCourtData.sport] ?? selectedCourtData.sport} · ${selectedCourtData.name}`
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Time
                                        </span>
                                        <span className="text-foreground">
                                            {firstSelectedSlot
                                                ? formatTime(
                                                      firstSelectedSlot.start_time,
                                                  )
                                                : ''}{' '}
                                            –{' '}
                                            {lastSelectedSlot
                                                ? formatTime(
                                                      lastSelectedSlot.end_time,
                                                  )
                                                : ''}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span className="text-foreground">
                                            Total
                                        </span>
                                        <span className="text-foreground">
                                            ₹{total}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Payment
                                        </span>
                                        <span className="text-foreground">
                                            {
                                                paymentMethodDisplayLabels[
                                                    paymentMethod
                                                ]
                                            }{' '}
                                            ·{' '}
                                            {paymentMethod === 'cash'
                                                ? 'Paid'
                                                : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>

            {/* Bottom action */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
                <div className="mx-auto max-w-lg">
                    {step === 'court' && (
                        <Button
                            className="w-full"
                            disabled={!canProceedFromCourt}
                            onClick={() => setStep('player')}
                        >
                            Select Player{' '}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    {step === 'player' && (
                        <Button
                            className="w-full"
                            disabled={!canProceedFromPlayer}
                            onClick={() => setStep('payment')}
                        >
                            Payment <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    {step === 'payment' && (
                        <Button
                            className="w-full"
                            onClick={() => setStep('confirm')}
                        >
                            Review Booking{' '}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    {step === 'confirm' && (
                        <Button
                            className="w-full"
                            disabled={isSubmitting}
                            onClick={handleConfirm}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-1" />
                            )}
                            Confirm Booking
                        </Button>
                    )}
                    {step === 'success' && (
                        <div className="flex flex-col gap-2">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={handleShare}
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Confirmation
                            </Button>
                            <Button
                                className="w-full"
                                onClick={() => navigate(path.dashboard)}
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Booked slot detail sheet */}
            <Sheet
                open={!!selectedBookedSlot}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedBookedSlot(null);
                        setCancelDialogOpen(false);
                    }
                }}
            >
                <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Booking Details</SheetTitle>
                    </SheetHeader>

                    {selectedBookedBooking ? (
                        <div className="space-y-4 pb-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-foreground">{selectedBookedBooking.court?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedBookedBooking.venue?.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedBookedBooking.isOtcActive && (
                                        <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">OTC</Badge>
                                    )}
                                    <Badge className={bookingStatusColors[selectedBookedBooking.status] ?? ''}>
                                        {selectedBookedBooking.status.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-lg bg-muted/40 p-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{format(new Date(selectedBookedBooking.bookingDate), 'EEEE, MMMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{formatTime(selectedBookedBooking.startTime)} – {formatTime(selectedBookedBooking.endTime)}</span>
                                </div>
                                {selectedBookedBooking.user && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{selectedBookedBooking.user.name || 'Guest'} · {selectedBookedBooking.user.countryCode}{selectedBookedBooking.user.phone}</span>
                                    </div>
                                )}
                                {selectedBookedBooking.payment && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>₹{Number(selectedBookedBooking.payment.amount).toLocaleString('en-IN')} · {paymentMethodLabel[selectedBookedBooking.payment.paymentMethod] ?? selectedBookedBooking.payment.paymentMethod} · {selectedBookedBooking.payment.paymentStatus}</span>
                                    </div>
                                )}
                            </div>

                            {selectedBookedBooking.isOtcActive && (
                                <div className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-xs text-violet-700">
                                    Open to Cancel — this slot will auto-release and the player will be refunded if someone else books it.
                                </div>
                            )}

                            {(selectedBookedBooking.status === 'CONFIRMED' || selectedBookedBooking.status === 'PENDING') && (
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
                            {selectedBookedBooking && (
                                <>
                                    Cancel booking for{' '}
                                    <span className="font-medium text-foreground">
                                        {selectedBookedBooking.user?.name || 'Guest'}
                                    </span>{' '}
                                    on {format(new Date(selectedBookedBooking.bookingDate), 'EEE, MMM d')} at {formatTime(selectedBookedBooking.startTime)}?
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
                            onClick={handleCancelBooking}
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

export default Booking;
