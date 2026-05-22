import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ScheduleBuilder, { type DaySchedule } from './ScheduleBuilder';
import { DEFAULT_SCHEDULE } from '../../utils/days';

const StepOperatingHours = ({
    venueId,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
    triggerBack,
    onBackComplete,
}: StepOperatingHoursProps) => {
    const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
    const [loaded, setLoaded] = useState(false);

    // Load existing hours
    useEffect(() => {
        (async () => {
            // const { data } = await (supabase as any)
            //     .from('venue_hours')
            //     .select('*')
            //     .eq('venue_id', venueId)
            //     .order('day_of_week');

            // if (data && data.length > 0) {
            //     setSchedule(
            //         data.map((d: any) => ({
            //             day_of_week: d.day_of_week,
            //             is_open: d.is_open,
            //             opening_time: d.opening_time || '06:00',
            //             closing_time: d.closing_time || '23:00',
            //         })),
            //     );
            // }
            setLoaded(true);
        })();
    }, [venueId]);

    const validate = () => {
        const hasOpenDay = schedule.some((d) => d.is_open);
        if (!hasOpenDay) {
            toast.error('At least one day must be set to Open.');
            return false;
        }
        for (const day of schedule) {
            if (day.is_open) {
                if (!day.opening_time || !day.closing_time) {
                    toast.error(
                        'All open days must have opening and closing times.',
                    );
                    return false;
                }
                if (
                    day.closing_time !== '00:00' &&
                    day.closing_time <= day.opening_time
                ) {
                    toast.error('Closing time must be after opening time.');
                    return false;
                }
                if (day.evening_open_time || day.evening_close_time) {
                    if (!day.evening_open_time || !day.evening_close_time) {
                        toast.error(
                            'Evening session must have both open and close times.',
                        );
                        return false;
                    }
                    if (day.evening_open_time <= day.closing_time) {
                        toast.error(
                            'Evening session must start after the first session ends.',
                        );
                        return false;
                    }
                    if (day.evening_close_time <= day.evening_open_time) {
                        toast.error(
                            'Evening closing time must be after evening opening time.',
                        );
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const saveHours = async () => {
        onSaving(true);
        // Delete existing and re-insert
        // await (supabase as any)
        //     .from('venue_hours')
        //     .delete()
        //     .eq('venue_id', venueId);

        sessionStorage.setItem('onboarding_step2', JSON.stringify(schedule));
        onSaving(false);
        onSaved();
        return true;
    };

    // Save & Continue
    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            if (!validate()) {
                onSaveComplete(false);
                return;
            }
            const saved = await saveHours();
            if (!saved) {
                onSaveComplete(false);
                return;
            }

            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    // Save & Exit
    useEffect(() => {
        if (!triggerExit) return;
        (async () => {
            await saveHours();
            onExitComplete();
        })();
    }, [triggerExit]); // eslint-disable-line

    // Save draft & go Back
    useEffect(() => {
        if (!triggerBack) return;
        sessionStorage.setItem('onboarding_step2', JSON.stringify(schedule));
        onBackComplete();
    }, [triggerBack]); // eslint-disable-line

    if (!loaded) return null;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Set your venue's operating hours
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    These are your default opening hours. You can set custom
                    hours per court in the next step.
                </p>
            </div>

            <ScheduleBuilder
                value={schedule}
                onChange={setSchedule}
                showShortcuts
            />
        </div>
    );
};

export default StepOperatingHours;
