import { useCallback, useEffect, useState } from 'react';
import { Label } from '../ui/label';
import {
    ADVANCE_OPTIONS,
    CANCELLATION_POLICIES,
    NOTICE_OPTIONS,
} from '../../utils/bookingRules';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { cn } from '../../utils/twMerge';

const StepBookingRules = ({
    venueId,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
}: StepBookingRulesProps) => {
    const [advanceDays, setAdvanceDays] = useState(7);
    const [minNotice, setMinNotice] = useState(1);
    const [cancellationPolicy, setCancellationPolicy] = useState('moderate');
    const [autoConfirm, setAutoConfirm] = useState(true);
    const [maxBookings, setMaxBookings] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        (async () => {
            // const { data } = await supabase
            //     .from('venue_booking_rules')
            //     .select('*')
            //     .eq('venue_id', venueId)
            //     .maybeSingle();

            // if (data) {
            //     setAdvanceDays(data.advance_booking_days ?? 7);
            //     setMinNotice(data.min_notice_hours ?? 1);
            //     setCancellationPolicy(data.cancellation_policy || 'moderate');
            //     setAutoConfirm(data.auto_confirm !== false);
            // }
            setLoaded(true);
        })();
    }, [venueId]);

    const autoSave = useCallback(async () => {
        onSaving(true);
        const row = {
            venue_id: venueId,
            advance_booking_days: advanceDays,
            min_notice_hours: minNotice,
            cancellation_policy: cancellationPolicy,
            auto_confirm: autoConfirm,
        };

        // const { data: existing } = await supabase
        //     .from('venue_booking_rules')
        //     .select('id')
        //     .eq('venue_id', venueId)
        //     .maybeSingle();

        // if (existing) {
        //     await supabase
        //         .from('venue_booking_rules')
        //         .update(row)
        //         .eq('venue_id', venueId);
        // } else {
        //     await supabase.from('venue_booking_rules').insert(row);
        // }
        onSaving(false);
        onSaved();
    }, [
        venueId,
        advanceDays,
        minNotice,
        cancellationPolicy,
        autoConfirm,
        onSaving,
        onSaved,
    ]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (
            maxBookings &&
            (parseInt(maxBookings) < 1 || isNaN(parseInt(maxBookings)))
        ) {
            errs.maxBookings = 'Must be a positive integer (1 or more)';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Save & Continue
    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            if (!validate()) {
                onSaveComplete(false);
                return;
            }
            await autoSave();
            // await supabase
            //     .from('onboarding_progress')
            //     .update({ current_step: 6 })
            //     .eq('venue_id', venueId);
            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    // Save & Exit
    useEffect(() => {
        if (!triggerExit) return;
        (async () => {
            await autoSave();
            onExitComplete();
        })();
    }, [triggerExit]); // eslint-disable-line

    if (!loaded) return null;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    How should bookings work?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Set the rules for how players can book your courts.
                </p>
            </div>

            {/* Advance Booking */}
            <div className="space-y-1.5">
                <Label>Advance Booking Window *</Label>
                <select
                    value={advanceDays}
                    onChange={(e) => {
                        setAdvanceDays(parseInt(e.target.value));
                        setTimeout(autoSave, 100);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    {ADVANCE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                    How far in advance can players book a court?
                </p>
            </div>

            {/* Minimum Notice */}
            <div className="space-y-1.5">
                <Label>Minimum Notice to Book *</Label>
                <select
                    value={minNotice}
                    onChange={(e) => {
                        setMinNotice(parseInt(e.target.value));
                        setTimeout(autoSave, 100);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    {NOTICE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                    How much notice do you need before a booking starts?
                </p>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-3">
                <Label>Cancellation Policy *</Label>
                <div className="space-y-2">
                    {CANCELLATION_POLICIES.map((policy) => (
                        <button
                            key={policy.value}
                            onClick={() => {
                                setCancellationPolicy(policy.value);
                                setTimeout(autoSave, 100);
                            }}
                            className={cn(
                                'w-full rounded-xl border p-4 text-left transition-all',
                                cancellationPolicy === policy.value
                                    ? 'border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))]/5 ring-1 ring-[hsl(var(--admin-navy))]'
                                    : 'border-border hover:border-muted-foreground',
                            )}
                        >
                            <p className="text-sm font-semibold">
                                {policy.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {policy.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Auto-Confirm */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label>Automatically confirm bookings</Label>
                    <Switch
                        checked={autoConfirm}
                        onCheckedChange={(v) => {
                            setAutoConfirm(v);
                            setTimeout(autoSave, 100);
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    {autoConfirm
                        ? 'Bookings are instantly confirmed when a player pays. Recommended for most venues.'
                        : 'Each booking request must be manually approved by you before it is confirmed. Players will be charged only after approval.'}
                </p>
            </div>

            {/* Max Bookings */}
            <div className="space-y-1.5">
                <Label>Maximum Bookings Per Player Per Day</Label>
                <Input
                    type="number"
                    min="1"
                    placeholder="No limit"
                    value={maxBookings}
                    onChange={(e) => {
                        setMaxBookings(e.target.value);
                        setErrors({});
                    }}
                    onBlur={autoSave}
                    className={cn(errors.maxBookings && 'border-destructive')}
                />
                <p className="text-xs text-muted-foreground">
                    Leave blank to allow unlimited bookings per player per day.
                </p>
                {errors.maxBookings && (
                    <p className="text-xs text-destructive">
                        {errors.maxBookings}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StepBookingRules;
