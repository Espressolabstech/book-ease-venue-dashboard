import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Lock, Plus } from 'lucide-react';
import { DateStrip } from '../../components/DateStrip';
import { cn, formatTime } from '../../utils/twMerge';
import { getCourts } from '../../api/adapters/courts';
import { getAvailableSlots } from '../../api/adapters/bookings';
import { path } from '../../navigation/commanPaths';

type SlotItem = {
    id: string;
    courtId: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'booked' | 'pending';
};

const ListBookings = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [courts, setCourts] = useState<CourtModel[]>([]);
    const [courtsLoading, setCourtsLoading] = useState(true);
    const [slotsData, setSlotsData] = useState<Record<string, SlotItem[]>>({});
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSport, setSelectedSport] = useState<string>('');
    const [selectedCourt, setSelectedCourt] = useState('all');
    const courtScrollRef = useRef<HTMLDivElement>(null);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

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
                                                    disabled={slot?.status !== 'available'}
                                                    onClick={() => {
                                                        if (slot?.status === 'available') {
                                                            navigate(
                                                                `${path.bookings}?court=${court.id}&slot=${slot.id}&date=${dateStr}`,
                                                            );
                                                        } else {
                                                            setSelectedCourt(court.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        'h-7 w-full transition-opacity',
                                                        color,
                                                        slot?.status === 'available' && 'hover:opacity-75',
                                                        slot?.status !== 'available' && 'cursor-default',
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
                                                'bg-destructive/5 border-destructive/20 cursor-default',
                                            isPending &&
                                                'bg-warning/5 border-warning/20 cursor-default',
                                        )}
                                        onClick={() => {
                                            if (isAvailable) {
                                                navigate(
                                                    `${path.bookings}?court=${selectedCourt}&slot=${slot.id}&date=${dateStr}`,
                                                );
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
        </div>
    );
};

export default ListBookings;
