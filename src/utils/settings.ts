import { AMENITY_GROUPS } from './amenities';

export { AMENITY_GROUPS };

export const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SPORT_DISPLAY: Record<SportType, string> = {
    PADEL: 'Padel',
    PICKELBALL: 'Pickleball',
    TENNIS: 'Tennis',
    BADMINTON: 'Badminton',
    TABLE_TENNIS: 'Table Tennis',
    SQUASH: 'Squash',
    FOOTBALL: 'Football',
    CRICKET: 'Cricket',
    BOX_CRICKET: 'Box Cricket',
    BASKETBALL: 'Basketball',
    VOLLEYBALL: 'Volleyball',
    SWIMMING: 'Swimming',
    HOCKEY: 'Hockey',
    GOLF: 'Golf',
    CYCLING: 'Cycling',
    YOGA: 'Yoga',
    GYM: 'Gym',
    RIFLE_SHOOTING: 'Rifle Shooting',
    ARCHERY: 'Archery',
    BOXING: 'Boxing',
    SNOOKER: 'Snooker',
};

export const SPORT_API: Record<string, SportType> = Object.fromEntries(
    Object.entries(SPORT_DISPLAY).map(([k, v]) => [v, k as SportType]),
);

export const ALL_SPORTS: Array<{ label: string; value: SportType }> = Object.entries(
    SPORT_DISPLAY,
).map(([value, label]) => ({ label, value: value as SportType }));
