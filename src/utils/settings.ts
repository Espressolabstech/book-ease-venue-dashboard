import { AMENITY_GROUPS } from './amenities';

export { AMENITY_GROUPS };

export const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Maps DB enum value → display name
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

// Maps display name → DB enum value
export const SPORT_API: Record<string, SportType> = Object.fromEntries(
    Object.entries(SPORT_DISPLAY).map(([k, v]) => [v, k as SportType]),
);

export const ALL_SPORTS: Array<{ label: string; value: SportType }> = Object.entries(
    SPORT_DISPLAY,
).map(([value, label]) => ({ label, value: value as SportType }));

export const surfaceOptions: Record<string, string[]> = {
    Padel: ['Artificial Turf', 'Panoramic Glass', 'Synthetic Grass', 'Sand-filled Turf'],
    Pickleball: ['Cushioned Acrylic', 'Hard Court', 'Indoor Wood', 'Outdoor Concrete'],
    Tennis: ['Hard Court', 'Clay', 'Grass', 'Artificial Turf'],
    Badminton: ['Wooden Floor', 'Synthetic Mat', 'PU Floor'],
    'Table Tennis': ['Wooden Floor', 'Synthetic Mat'],
    Squash: ['Wooden Floor', 'Glass Back Wall'],
    Football: ['Natural Grass', 'Artificial Turf', 'Sand-filled Turf'],
    Cricket: ['Natural Grass', 'Artificial Turf', 'Concrete Pitch'],
    'Box Cricket': ['Artificial Turf', 'Synthetic Mat'],
    Basketball: ['Wooden Floor', 'Cushioned Acrylic', 'Outdoor Concrete'],
    Volleyball: ['Wooden Floor', 'Sand', 'Synthetic Mat'],
    Swimming: ['Tiles', 'Fibreglass'],
    Hockey: ['Artificial Turf', 'Natural Grass'],
    Golf: ['Natural Grass', 'Artificial Turf'],
    default: ['Wooden Floor', 'Synthetic Mat', 'Hard Court', 'Natural Surface'],
};

export const lightingOptions = [
    'LED Floodlights',
    'Indoor Lighting',
    'Natural Light',
    'Halogen',
];
