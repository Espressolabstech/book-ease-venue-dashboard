import { useCallback, useEffect, useState } from 'react';
import { WEEKEND_DAYS } from '../../utils/pricing';
import { weekdays } from '../../utils/settings';
import { toast } from 'sonner';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../utils/twMerge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

// ─── helpers ─────────────────────────────────────────────────────────────────

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const defaultSlot = (): PeakPricingSlot => ({
    id: `slot-${Date.now()}-${Math.random()}`,
    start: '17:00',
    end: '21:00',
    rate: '',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
});

const defaultWeekendPeakSlot = (): PeakPricingSlot => ({
    id: `wslot-${Date.now()}-${Math.random()}`,
    start: '17:00',
    end: '21:00',
    rate: '',
    days: ['Sat', 'Sun'],
});

const defaultSportPricing = (sport: string): SportPricing => ({
    sport,
    base_rate: '',
    booking_durations: [30],
    peak_enabled: false,
    peak_slots: [],
    weekend_rate_enabled: false,
    weekend_days: ['Saturday', 'Sunday'],
    weekend_rate: '',
    weekend_peak_enabled: false,
    weekend_peak_slots: [],
});

// ─── TimeInput ────────────────────────────────────────────────────────────────

const TimeInput = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) => (
    <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm"
    />
);

// ─── DayToggle ────────────────────────────────────────────────────────────────

const DayToggle = ({
    days,
    onChange,
    availableDays = ALL_DAYS,
}: {
    days: string[];
    onChange: (days: string[]) => void;
    availableDays?: string[];
}) => (
    <div className="flex flex-wrap gap-1.5">
        {availableDays.map((day) => {
            const active = days.includes(day);
            return (
                <button
                    key={day}
                    type="button"
                    onClick={() => {
                        const next = active
                            ? days.filter((d) => d !== day)
                            : [...days, day];
                        if (next.length === 0) {
                            toast.error('Select at least one day');
                            return;
                        }
                        onChange(next);
                    }}
                    className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                        active
                            ? 'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                            : 'bg-muted text-muted-foreground hover:bg-accent',
                    )}
                >
                    {day}
                </button>
            );
        })}
    </div>
);

// ─── PeakSlotRow ─────────────────────────────────────────────────────────────

const PeakSlotRow = ({
    slot,
    availableDays,
    onChange,
    onRemove,
    errorRate,
}: {
    slot: PeakPricingSlot;
    availableDays?: string[];
    onChange: (updates: Partial<PeakPricingSlot>) => void;
    onRemove: () => void;
    errorRate?: string;
}) => (
    <div className="space-y-2 rounded-lg border border-border p-3">
        {/* Time range */}
        <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1.5">
                <TimeInput
                    value={slot.start}
                    onChange={(v) => onChange({ start: v })}
                />
                <span className="shrink-0 text-xs text-muted-foreground">
                    to
                </span>
                <TimeInput
                    value={slot.end}
                    onChange={(v) => onChange({ end: v })}
                />
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="rounded p-1.5 hover:bg-destructive/10"
            >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
        </div>

        {/* Days */}
        <DayToggle
            days={slot.days}
            availableDays={availableDays}
            onChange={(d) => onChange({ days: d })}
        />

        {/* Rate */}
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
            </span>
            <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Peak rate / slot"
                value={slot.rate}
                onChange={(e) => onChange({ rate: e.target.value })}
                className={cn(
                    'pl-7 h-9 text-sm',
                    errorRate && 'border-destructive',
                )}
            />
        </div>
        {errorRate && <p className="text-xs text-destructive">{errorRate}</p>}
    </div>
);

// ─── SportPricingPanel ────────────────────────────────────────────────────────

const SportPricingPanel = ({
    pricing,
    sportKey,
    errors,
    onChange,
}: {
    pricing: SportPricing;
    sportKey: string;
    errors: Record<string, string>;
    onChange: (updates: Partial<SportPricing>) => void;
}) => {
    const updateSlot = (
        field: 'peak_slots' | 'weekend_peak_slots',
        id: string,
        updates: Partial<PeakPricingSlot>,
    ) => {
        onChange({
            [field]: pricing[field].map((s) =>
                s.id === id ? { ...s, ...updates } : s,
            ),
        });
    };

    const removeSlot = (
        field: 'peak_slots' | 'weekend_peak_slots',
        id: string,
    ) => {
        onChange({ [field]: pricing[field].filter((s) => s.id !== id) });
    };

    return (
        <div className="space-y-6">
            {/* ── Base Rate ── */}
            <div className="space-y-1.5">
                <Label>Base Rate (per slot) *</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                    </span>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={pricing.base_rate}
                        onChange={(e) =>
                            onChange({ base_rate: e.target.value })
                        }
                        className={cn(
                            'pl-7',
                            errors[`${sportKey}_base`] && 'border-destructive',
                        )}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Standard off-peak rate per 30-min slot for all{' '}
                    {pricing.sport} courts.
                </p>
                {errors[`${sportKey}_base`] && (
                    <p className="text-xs text-destructive">
                        {errors[`${sportKey}_base`]}
                    </p>
                )}
            </div>

            {/* ── Weekday Peak Pricing ── */}
            <div className="space-y-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Peak Pricing</p>
                        <p className="text-xs text-muted-foreground">
                            Charge more during busy hours (weekdays)
                        </p>
                    </div>
                    <Switch
                        checked={pricing.peak_enabled}
                        onCheckedChange={(v) =>
                            onChange({
                                peak_enabled: v,
                                peak_slots:
                                    v && pricing.peak_slots.length === 0
                                        ? [defaultSlot()]
                                        : pricing.peak_slots,
                            })
                        }
                    />
                </div>

                {pricing.peak_enabled && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        {pricing.peak_slots.map((slot) => (
                            <PeakSlotRow
                                key={slot.id}
                                slot={slot}
                                availableDays={weekdays}
                                onChange={(u) =>
                                    updateSlot('peak_slots', slot.id, u)
                                }
                                onRemove={() =>
                                    removeSlot('peak_slots', slot.id)
                                }
                                errorRate={
                                    errors[`${sportKey}_peak_${slot.id}`]
                                }
                            />
                        ))}

                        {pricing.peak_slots.length === 0 && (
                            <p className="py-2 text-center text-sm text-muted-foreground">
                                No peak windows — add one below.
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                onChange({
                                    peak_slots: [
                                        ...pricing.peak_slots,
                                        defaultSlot(),
                                    ],
                                })
                            }
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                            <Plus className="h-3 w-3" /> Add Peak Window
                        </button>

                        <p className="text-xs text-muted-foreground">
                            Each window can cover different days — e.g. a
                            morning slot and an evening slot.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Weekend Pricing ── */}
            <div className="space-y-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Weekend Pricing</p>
                        <p className="text-xs text-muted-foreground">
                            Different flat rate on weekends
                        </p>
                    </div>
                    <Switch
                        checked={pricing.weekend_rate_enabled}
                        onCheckedChange={(v) =>
                            onChange({ weekend_rate_enabled: v })
                        }
                    />
                </div>

                {pricing.weekend_rate_enabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        {/* Weekend days selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Weekend Days</Label>
                            <div className="flex gap-2">
                                {WEEKEND_DAYS.map((day) => {
                                    const active =
                                        pricing.weekend_days.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => {
                                                const next = active
                                                    ? pricing.weekend_days.filter(
                                                          (d) => d !== day,
                                                      )
                                                    : [
                                                          ...pricing.weekend_days,
                                                          day,
                                                      ];
                                                if (next.length === 0) {
                                                    toast.error(
                                                        'Select at least one day',
                                                    );
                                                    return;
                                                }
                                                onChange({
                                                    weekend_days: next,
                                                });
                                            }}
                                            className={cn(
                                                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                                                active
                                                    ? 'border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                                                    : 'border-border text-muted-foreground',
                                            )}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Weekend base rate */}
                        <div className="space-y-1.5">
                            <Label>Weekend Rate (per slot) *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    ₹
                                </span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={pricing.weekend_rate}
                                    onChange={(e) =>
                                        onChange({
                                            weekend_rate: e.target.value,
                                        })
                                    }
                                    className={cn(
                                        'pl-7',
                                        errors[`${sportKey}_weekend`] &&
                                            'border-destructive',
                                    )}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Replaces the base rate on selected weekend days.
                            </p>
                            {errors[`${sportKey}_weekend`] && (
                                <p className="text-xs text-destructive">
                                    {errors[`${sportKey}_weekend`]}
                                </p>
                            )}
                        </div>

                        {/* Weekend Peak Pricing */}
                        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium">
                                        Weekend Peak Pricing
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Extra peak windows on weekends
                                    </p>
                                </div>
                                <Switch
                                    checked={pricing.weekend_peak_enabled}
                                    onCheckedChange={(v) =>
                                        onChange({
                                            weekend_peak_enabled: v,
                                            weekend_peak_slots:
                                                v &&
                                                pricing.weekend_peak_slots
                                                    .length === 0
                                                    ? [defaultWeekendPeakSlot()]
                                                    : pricing.weekend_peak_slots,
                                        })
                                    }
                                />
                            </div>

                            {pricing.weekend_peak_enabled && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    {pricing.weekend_peak_slots.map((slot) => (
                                        <PeakSlotRow
                                            key={slot.id}
                                            slot={slot}
                                            availableDays={['Sat', 'Sun']}
                                            onChange={(u) =>
                                                updateSlot(
                                                    'weekend_peak_slots',
                                                    slot.id,
                                                    u,
                                                )
                                            }
                                            onRemove={() =>
                                                removeSlot(
                                                    'weekend_peak_slots',
                                                    slot.id,
                                                )
                                            }
                                            errorRate={
                                                errors[
                                                    `${sportKey}_wpeak_${slot.id}`
                                                ]
                                            }
                                        />
                                    ))}

                                    {pricing.weekend_peak_slots.length ===
                                        0 && (
                                        <p className="py-1 text-center text-xs text-muted-foreground">
                                            No weekend peak windows.
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChange({
                                                weekend_peak_slots: [
                                                    ...pricing.weekend_peak_slots,
                                                    defaultWeekendPeakSlot(),
                                                ],
                                            })
                                        }
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        <Plus className="h-3 w-3" /> Add Weekend
                                        Peak Window
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                            💡 Weekend peak rate overrides the weekend flat rate
                            during peak windows.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── StepPricing ─────────────────────────────────────────────────────────────

const StepPricing = ({
    venueId,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
    triggerBack,
    onBackComplete,
}: StepPricingProps) => {
    const [courts, setCourts] = useState<Court[]>([]);
    const [sports, setSports] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [pricingMap, setPricingMap] = useState<Record<string, SportPricing>>(
        {},
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const savedCourts = sessionStorage.getItem('onboarding_step3');
            if (!savedCourts) {
                setLoaded(true);
                return;
            }

            const loadedCourts: Court[] = JSON.parse(savedCourts);
            setCourts(loadedCourts);

            // Derive unique sports from courts
            const uniqueSports = Array.from(
                new Set(loadedCourts.map((c) => c.sport).filter(Boolean)),
            );
            setSports(uniqueSports);

            const savedPricing = sessionStorage.getItem('onboarding_step5');
            const existingMap: Record<string, SportPricing> = savedPricing
                ? JSON.parse(savedPricing)
                : {};

            const map: Record<string, SportPricing> = {};
            uniqueSports.forEach((sport) => {
                map[sport] = existingMap[sport] ?? defaultSportPricing(sport);
            });
            setPricingMap(map);
        } catch {}
        setLoaded(true);
    }, [venueId]);

    const activeSport = sports[activeTab] ?? '';
    const pricing = activeSport ? pricingMap[activeSport] : null;

    const updatePricing = useCallback(
        (sport: string, updates: Partial<SportPricing>) => {
            setPricingMap((prev) => ({
                ...prev,
                [sport]: { ...prev[sport], ...updates },
            }));
        },
        [],
    );

    const validateAll = useCallback(() => {
        const errs: Record<string, string> = {};
        sports.forEach((sport) => {
            const p = pricingMap[sport];
            if (!p) return;
            if (!p.base_rate || parseFloat(p.base_rate) <= 0)
                errs[`${sport}_base`] = `${sport}: Base rate is required`;

            if (p.peak_enabled) {
                p.peak_slots.forEach((slot) => {
                    if (!slot.rate || parseFloat(slot.rate) <= 0)
                        errs[`${sport}_peak_${slot.id}`] =
                            `${sport}: Peak rate required`;
                    else if (
                        parseFloat(slot.rate) <= parseFloat(p.base_rate || '0')
                    )
                        errs[`${sport}_peak_${slot.id}`] =
                            `${sport}: Peak rate must be higher than base rate`;
                });
            }

            if (p.weekend_rate_enabled) {
                if (!p.weekend_rate)
                    errs[`${sport}_weekend`] =
                        `${sport}: Weekend rate required`;
                if (p.weekend_peak_enabled) {
                    p.weekend_peak_slots.forEach((slot) => {
                        if (!slot.rate || parseFloat(slot.rate) <= 0)
                            errs[`${sport}_wpeak_${slot.id}`] =
                                `${sport}: Weekend peak rate required`;
                    });
                }
            }
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [sports, pricingMap]);

    // Save & Continue
    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            if (courts.length === 0) {
                toast.error('No courts found. Go back to Step 3.');
                onSaveComplete(false);
                return;
            }
            if (!validateAll()) {
                // Switch to the first sport tab with an error
                const firstErrSport = sports.findIndex((sport) => {
                    const p = pricingMap[sport];
                    if (!p) return false;
                    if (!p.base_rate || parseFloat(p.base_rate) <= 0)
                        return true;
                    if (
                        p.peak_enabled &&
                        p.peak_slots.some(
                            (s) => !s.rate || parseFloat(s.rate) <= 0,
                        )
                    )
                        return true;
                    if (p.weekend_rate_enabled && !p.weekend_rate) return true;
                    return false;
                });
                if (firstErrSport !== -1) setActiveTab(firstErrSport);
                toast.error('Please fix pricing errors before continuing.');
                onSaveComplete(false);
                return;
            }
            onSaving(true);
            sessionStorage.setItem(
                'onboarding_step5',
                JSON.stringify(pricingMap),
            );
            onSaving(false);
            onSaved();
            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    // Save & Exit
    useEffect(() => {
        if (!triggerExit) return;
        sessionStorage.setItem('onboarding_step5', JSON.stringify(pricingMap));
        onExitComplete();
    }, [triggerExit]); // eslint-disable-line

    // Save draft & go Back
    useEffect(() => {
        if (!triggerBack) return;
        sessionStorage.setItem('onboarding_step5', JSON.stringify(pricingMap));
        onBackComplete();
    }, [triggerBack]); // eslint-disable-line

    if (!loaded) return null;

    if (courts.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Set your court pricing
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pricing is set per sport type.
                    </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                    <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                    <div>
                        <p className="text-sm font-medium text-destructive">
                            No courts have been added yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Please go back to Step 3 and add at least one court
                            before setting pricing.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Set your court pricing
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pricing is set per sport — all courts of the same sport
                    share the same rates. You can add multiple peak windows
                    (e.g. morning &amp; evening) and weekend peak pricing.
                </p>
            </div>

            {/* Sport tabs */}
            {sports.length > 1 && (
                <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
                    {sports.map((sport, i) => {
                        const hasError = Object.keys(errors).some((k) =>
                            k.startsWith(`${sport}_`),
                        );
                        return (
                            <button
                                key={sport}
                                type="button"
                                onClick={() => setActiveTab(i)}
                                className={cn(
                                    'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                    i === activeTab
                                        ? 'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                                        : hasError
                                          ? 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20'
                                          : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                )}
                            >
                                {hasError && (
                                    <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                                )}
                                {sport}
                                <span className="text-[10px] text-muted-foreground">
                                    (
                                    {
                                        courts.filter((c) => c.sport === sport)
                                            .length
                                    }{' '}
                                    court
                                    {courts.filter((c) => c.sport === sport)
                                        .length !== 1
                                        ? 's'
                                        : ''}
                                    )
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {pricing && activeSport && (
                <SportPricingPanel
                    pricing={pricing}
                    sportKey={activeSport}
                    errors={errors}
                    onChange={(updates) => updatePricing(activeSport, updates)}
                />
            )}
        </div>
    );
};

export default StepPricing;
