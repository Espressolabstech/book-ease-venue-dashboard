import { useCallback, useEffect, useState } from 'react';
import {
    DURATIONS,
    generateTimeOptions,
    WEEKEND_DAYS,
} from '../../utils/pricing';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/twMerge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

const StepPricing = ({
    venueId,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
}: StepPricingProps) => {
    const [courts, setCourts] = useState<Court[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [pricingMap, setPricingMap] = useState<Record<string, CourtPricing>>(
        {},
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loaded, setLoaded] = useState(false);

    const timeOptions = generateTimeOptions();

    useEffect(() => {
        try {
            const savedCourts = sessionStorage.getItem('onboarding_step3');
            if (!savedCourts) { setLoaded(true); return; }

            const loadedCourts: Court[] = JSON.parse(savedCourts);
            setCourts(loadedCourts);

            const savedPricing = sessionStorage.getItem('onboarding_step5');
            const existingMap: Record<string, CourtPricing> = savedPricing
                ? JSON.parse(savedPricing)
                : {};

            const map: Record<string, CourtPricing> = {};
            loadedCourts.forEach((_court, i) => {
                const key = String(i);
                map[key] = existingMap[key] ?? {
                    court_id: key,
                    base_rate: '',
                    booking_durations: [60],
                    peak_enabled: false,
                    peak_time_start: '17:00',
                    peak_time_end: '21:00',
                    peak_rate: '',
                    weekend_rate_enabled: false,
                    weekend_days: ['Saturday', 'Sunday'],
                    weekend_rate: '',
                };
            });
            setPricingMap(map);
        } catch {}
        setLoaded(true);
    }, [venueId]);

    const currentCourt = courts[activeTab];
    const currentKey = String(activeTab);
    const pricing = currentCourt ? pricingMap[currentKey] : null;

    const updatePricing = useCallback(
        (key: string, updates: Partial<CourtPricing>) => {
            setPricingMap((prev) => ({
                ...prev,
                [key]: { ...prev[key], ...updates },
            }));
        },
        [],
    );

    const autoSaveCourt = useCallback(
        async (_key: string) => {
            onSaving(true);
            onSaving(false);
            onSaved();
        },
        [onSaving, onSaved],
    );

    const switchTab = (newIndex: number) => {
        setActiveTab(newIndex);
        setErrors({});
    };

    const validateAll = () => {
        const errs: Record<string, string> = {};
        courts.forEach((court, i) => {
            const key = String(i);
            const p = pricingMap[key];
            if (!p) return;
            const prefix = court.name;
            if (!p.base_rate || parseFloat(p.base_rate) <= 0)
                errs[`${key}_base`] = `${prefix}: Base rate is required`;
            if (p.booking_durations.length === 0)
                errs[`${key}_dur`] = `${prefix}: Select at least one duration`;
            if (p.peak_enabled) {
                if (!p.peak_rate)
                    errs[`${key}_peak`] = `${prefix}: Peak rate required`;
                else if (
                    parseFloat(p.peak_rate) <= parseFloat(p.base_rate || '0')
                )
                    errs[`${key}_peak`] =
                        `${prefix}: Peak rate should be higher than base rate`;
            }
            if (p.weekend_rate_enabled && !p.weekend_rate)
                errs[`${key}_weekend`] = `${prefix}: Weekend rate required`;
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

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
                toast.error('Please fix pricing errors before continuing.');
                onSaveComplete(false);
                return;
            }
            sessionStorage.setItem(
                'onboarding_step5',
                JSON.stringify(pricingMap),
            );
            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    // Save & Exit
    useEffect(() => {
        if (!triggerExit) return;
        sessionStorage.setItem('onboarding_step5', JSON.stringify(pricingMap));
        onExitComplete();
    }, [triggerExit]); // eslint-disable-line

    if (!loaded) return null;

    if (courts.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Set your court pricing
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pricing is set per court.
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

    const toggleDuration = (key: string, dur: number) => {
        const p = pricingMap[key];
        const current = p.booking_durations;
        if (current.includes(dur)) {
            if (current.length <= 1) {
                toast.error('At least one duration must be selected.');
                return;
            }
            updatePricing(key, {
                booking_durations: current.filter((d) => d !== dur),
            });
        } else {
            updatePricing(key, {
                booking_durations: [...current, dur].sort((a, b) => a - b),
            });
        }
    };

    const renderTimeline = (p: CourtPricing) => {
        if (!p.peak_enabled) return null;
        const startHour = 6;
        const endHour = 24;
        const totalHours = endHour - startHour;
        const peakStartH =
            parseInt(p.peak_time_start.split(':')[0]) +
            parseInt(p.peak_time_start.split(':')[1]) / 60;
        const peakEndH =
            p.peak_time_end === '00:00'
                ? 24
                : parseInt(p.peak_time_end.split(':')[0]) +
                  parseInt(p.peak_time_end.split(':')[1]) / 60;
        const leftPct = Math.max(
            0,
            ((peakStartH - startHour) / totalHours) * 100,
        );
        const widthPct = Math.max(
            0,
            ((peakEndH - peakStartH) / totalHours) * 100,
        );

        return (
            <div className="mt-3 space-y-1">
                <div className="relative h-6 rounded-full bg-[hsl(var(--admin-navy))]/20 overflow-hidden">
                    <div
                        className="absolute top-0 h-full rounded-full bg-[hsl(var(--admin-lime))]"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>06:00</span>
                    {p.peak_enabled && (
                        <span className="text-[hsl(var(--admin-lime))] font-medium">
                            Peak: {p.peak_time_start} – {p.peak_time_end}
                        </span>
                    )}
                    <span>00:00</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Set your court pricing
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pricing is set per court. You can offer peak and weekend
                    rates.
                </p>
            </div>

            {/* Court tabs */}
            {courts.length > 1 && (
                <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
                    {courts.map((court, i) => (
                        <button
                            key={i}
                            onClick={() => switchTab(i)}
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                i === activeTab
                                    ? 'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                            )}
                        >
                            {court.name}
                            <span
                                className={cn(
                                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                    court.sport === 'Padel'
                                        ? 'bg-[hsl(var(--admin-navy-foreground))]/20'
                                        : 'bg-[hsl(var(--admin-lime))]/30',
                                )}
                            >
                                {court.sport}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {pricing && currentCourt && (
                <div className="space-y-6">
                    {/* Base Rate */}
                    <div className="space-y-1.5">
                        <Label>Base Rate (per hour) *</Label>
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
                                    updatePricing(currentKey, {
                                        base_rate: e.target.value,
                                    })
                                }
                                onBlur={() => autoSaveCourt(currentKey)}
                                className={cn(
                                    'pl-7',
                                    errors[`${currentKey}_base`] &&
                                        'border-destructive',
                                )}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Price per hour during standard hours.
                        </p>
                        {errors[`${currentKey}_base`] && (
                            <p className="text-xs text-destructive">
                                {errors[`${currentKey}_base`]}
                            </p>
                        )}
                    </div>

                    {/* Booking Durations */}
                    <div className="space-y-1.5">
                        <Label>Available Booking Durations *</Label>
                        <div className="flex flex-wrap gap-2">
                            {DURATIONS.map((d) => {
                                const active =
                                    pricing.booking_durations.includes(d.value);
                                return (
                                    <button
                                        key={d.value}
                                        onClick={() => {
                                            toggleDuration(currentKey, d.value);
                                            setTimeout(
                                                () =>
                                                    autoSaveCourt(currentKey),
                                                100,
                                            );
                                        }}
                                        className={cn(
                                            'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                                            active
                                                ? 'border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))] scale-105'
                                                : 'border-border text-foreground hover:border-muted-foreground',
                                        )}
                                    >
                                        {d.label}
                                    </button>
                                );
                            })}
                        </div>
                        {errors[`${currentKey}_dur`] && (
                            <p className="text-xs text-destructive">
                                {errors[`${currentKey}_dur`]}
                            </p>
                        )}
                    </div>

                    {/* Peak Pricing */}
                    <div className="space-y-4 rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Peak Pricing
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Charge more during busy hours
                                </p>
                            </div>
                            <Switch
                                checked={pricing.peak_enabled}
                                onCheckedChange={(v) => {
                                    updatePricing(currentKey, {
                                        peak_enabled: v,
                                    });
                                    setTimeout(
                                        () => autoSaveCourt(currentKey),
                                        100,
                                    );
                                }}
                            />
                        </div>

                        {pricing.peak_enabled && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">From</Label>
                                        <select
                                            value={pricing.peak_time_start}
                                            onChange={(e) => {
                                                updatePricing(currentKey, {
                                                    peak_time_start:
                                                        e.target.value,
                                                });
                                                setTimeout(
                                                    () =>
                                                        autoSaveCourt(
                                                            currentKey,
                                                        ),
                                                    100,
                                                );
                                            }}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            {timeOptions.map((t) => (
                                                <option
                                                    key={`s-${t}`}
                                                    value={t}
                                                >
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">To</Label>
                                        <select
                                            value={pricing.peak_time_end}
                                            onChange={(e) => {
                                                updatePricing(currentKey, {
                                                    peak_time_end:
                                                        e.target.value,
                                                });
                                                setTimeout(
                                                    () =>
                                                        autoSaveCourt(
                                                            currentKey,
                                                        ),
                                                    100,
                                                );
                                            }}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            {timeOptions.map((t) => (
                                                <option
                                                    key={`e-${t}`}
                                                    value={t}
                                                >
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Peak hours apply daily within your venue's
                                    operating hours.
                                </p>

                                <div className="space-y-1.5">
                                    <Label>Peak Rate (per hour) *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            ₹
                                        </span>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={pricing.peak_rate}
                                            onChange={(e) =>
                                                updatePricing(currentKey, {
                                                    peak_rate: e.target.value,
                                                })
                                            }
                                            onBlur={() =>
                                                autoSaveCourt(currentKey)
                                            }
                                            className={cn(
                                                'pl-7',
                                                errors[`${currentKey}_peak`] &&
                                                    'border-destructive',
                                            )}
                                        />
                                    </div>
                                    {errors[`${currentKey}_peak`] && (
                                        <p className="text-xs text-destructive">
                                            {errors[`${currentKey}_peak`]}
                                        </p>
                                    )}
                                </div>

                                {renderTimeline(pricing)}
                            </div>
                        )}
                    </div>

                    {/* Weekend Pricing */}
                    <div className="space-y-4 rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Weekend Pricing
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Different rate for weekends
                                </p>
                            </div>
                            <Switch
                                checked={pricing.weekend_rate_enabled}
                                onCheckedChange={(v) => {
                                    updatePricing(currentKey, {
                                        weekend_rate_enabled: v,
                                    });
                                    setTimeout(
                                        () => autoSaveCourt(currentKey),
                                        100,
                                    );
                                }}
                            />
                        </div>

                        {pricing.weekend_rate_enabled && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Weekend Days
                                    </Label>
                                    <div className="flex gap-2">
                                        {WEEKEND_DAYS.map((day) => {
                                            const active =
                                                pricing.weekend_days.includes(
                                                    day,
                                                );
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => {
                                                        const next = active
                                                            ? pricing.weekend_days.filter(
                                                                  (d) =>
                                                                      d !== day,
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
                                                        updatePricing(
                                                            currentKey,
                                                            {
                                                                weekend_days:
                                                                    next,
                                                            },
                                                        );
                                                        setTimeout(
                                                            () =>
                                                                autoSaveCourt(
                                                                    currentKey,
                                                                ),
                                                            100,
                                                        );
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

                                <div className="space-y-1.5">
                                    <Label>Weekend Rate (per hour) *</Label>
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
                                                updatePricing(currentKey, {
                                                    weekend_rate: e.target.value,
                                                })
                                            }
                                            onBlur={() =>
                                                autoSaveCourt(currentKey)
                                            }
                                            className={cn(
                                                'pl-7',
                                                errors[
                                                    `${currentKey}_weekend`
                                                ] && 'border-destructive',
                                            )}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This rate applies instead of the base
                                        rate on selected weekend days.
                                    </p>
                                    {errors[`${currentKey}_weekend`] && (
                                        <p className="text-xs text-destructive">
                                            {errors[`${currentKey}_weekend`]}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                    💡 If a weekend slot also falls in peak
                                    hours, the weekend rate applies.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepPricing;
