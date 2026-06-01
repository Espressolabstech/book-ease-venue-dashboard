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

export const ALL_SURFACES = [
    'Artificial Grass',
    'Sand-Filled Artificial Grass',
    'Panoramic Glass',
    'Crystal Glass',
    'Asphalt',
    'Concrete',
    'Cushioned Acrylic',
    'Artificial Turf',
];

// ── All sports (display name → backend enum key) ──────────────────────────────
export const ALL_SPORTS = [
    'Pickleball',
    'Padel',
    'Tennis',
    'Badminton',
    'Table Tennis',
    'Squash',
    'Football',
    'Cricket',
    'Box Cricket',
    'Basketball',
    'Volleyball',
    'Swimming',
    'Hockey',
    'Golf',
    'Cycling',
    'Yoga',
    'Gym',
    'Rifle Shooting',
    'Archery',
    'Boxing',
    'Snooker',
] as const;

export type SportName = (typeof ALL_SPORTS)[number];

// ── Surface options per sport ─────────────────────────────────────────────────
export const SPORT_SURFACES: Record<string, string[]> = {
    Pickleball: PICKLEBALL_SURFACES,
    Padel: PADEL_SURFACES,
    Tennis: [
        'Artificial Grass',
        'Sand-Filled Artificial Grass',
        'Cushioned Acrylic',
        'Asphalt',
        'Concrete',
        'Artificial Turf',
    ],
    Badminton: ['Cushioned Acrylic', 'Concrete'],
    'Table Tennis': ['Concrete', 'Cushioned Acrylic'],
    Squash: ['Cushioned Acrylic', 'Concrete'],
    Football: ['Artificial Grass', 'Artificial Turf', 'Asphalt', 'Concrete'],
    Cricket: ['Artificial Turf', 'Artificial Grass', 'Concrete'],
    'Box Cricket': ['Artificial Turf', 'Artificial Grass', 'Concrete'],
    Basketball: ['Cushioned Acrylic', 'Asphalt', 'Concrete'],
    Volleyball: ['Artificial Grass', 'Cushioned Acrylic', 'Asphalt', 'Concrete'],
    Swimming: ['Concrete'],
    Hockey: ['Artificial Turf', 'Artificial Grass', 'Asphalt', 'Concrete'],
    Golf: ['Artificial Grass', 'Artificial Turf'],
    Cycling: ['Asphalt', 'Concrete'],
    Yoga: ['Cushioned Acrylic', 'Concrete'],
    Gym: ['Cushioned Acrylic', 'Concrete'],
    'Rifle Shooting': ['Concrete', 'Cushioned Acrylic'],
    Archery: ['Concrete', 'Cushioned Acrylic', 'Artificial Grass'],
    Boxing: ['Cushioned Acrylic', 'Concrete'],
    Snooker: ['Concrete', 'Cushioned Acrylic'],
};

// ── Emoji per sport ───────────────────────────────────────────────────────────
export const SPORT_EMOJI: Record<string, string> = {
    Pickleball: '🏓',
    Padel: '🏸',
    Tennis: '🎾',
    Badminton: '🏸',
    'Table Tennis': '🏓',
    Squash: '🎱',
    Football: '⚽',
    Cricket: '🏏',
    'Box Cricket': '🏏',
    Basketball: '🏀',
    Volleyball: '🏐',
    Swimming: '🏊',
    Hockey: '🏑',
    Golf: '⛳',
    Cycling: '🚴',
    Yoga: '🧘',
    Gym: '💪',
    'Rifle Shooting': '🎯',
    Archery: '🏹',
    Boxing: '🥊',
    Snooker: '🎱',
};
