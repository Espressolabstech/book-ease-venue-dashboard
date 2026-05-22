import type { DaySchedule } from '../components/onboarding/ScheduleBuilder';

export const DEFAULT_HOURS: DaySchedule[] = Array.from(
    { length: 7 },
    (_, i) => ({
        day_of_week: i,
        is_open: true,
        opening_time: '06:00',
        closing_time: '23:00',
    }),
);

export const PADEL_SURFACES = [
    'Artificial Grass',
    'Sand-Filled Artificial Grass',
    'Panoramic Glass',
    'Crystal Glass',
];

export const PICKLEBALL_SURFACES = [
    'Asphalt',
    'Concrete',
    'Cushioned Acrylic',
    'Artificial Turf',
];
