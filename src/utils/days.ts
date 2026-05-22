import type { DaySchedule } from '../components/onboarding/ScheduleBuilder';

export const DEFAULT_SCHEDULE: DaySchedule[] = Array.from(
    { length: 7 },
    (_, i) => ({
        day_of_week: i,
        is_open: true,
        opening_time: '06:00',
        closing_time: '23:00',
    }),
);

export const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];
