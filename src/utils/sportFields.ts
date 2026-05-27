export type EnvironmentOption = 'Indoor' | 'Covered Outdoor' | 'Outdoor';

const LOCKED_INDOOR_SPORTS = new Set(['Table Tennis', 'Squash']);
const PITCH_NAME_SPORTS = new Set(['Cricket', 'Box Cricket']);

const DEFAULT_ENVIRONMENT: Record<string, EnvironmentOption> = {
    Padel: 'Outdoor',
    Pickleball: 'Outdoor',
    Tennis: 'Outdoor',
    Badminton: 'Indoor',
    'Table Tennis': 'Indoor',
    Squash: 'Indoor',
    Football: 'Outdoor',
    Cricket: 'Outdoor',
    'Box Cricket': 'Covered Outdoor',
    Basketball: 'Indoor',
    Volleyball: 'Indoor',
};

export function getDefaultEnvironment(sport: string): EnvironmentOption {
    return DEFAULT_ENVIRONMENT[sport] ?? 'Outdoor';
}

export function isIndoorLocked(sport: string): boolean {
    return LOCKED_INDOOR_SPORTS.has(sport);
}

export function getEnvironmentOptions(_sport: string): EnvironmentOption[] {
    return ['Indoor', 'Covered Outdoor', 'Outdoor'];
}

export function getCourtLabel(sport: string): string {
    return PITCH_NAME_SPORTS.has(sport) ? 'Pitch name' : 'Court name';
}

export function getSurfaceOptions(sport: string, environment: EnvironmentOption): string[] {
    const isIndoor = environment === 'Indoor';
    switch (sport) {
        case 'Padel':
            return [
                'Artificial grass – sand filled',
                'Artificial grass – rubber filled',
                'Artificial grass – sand & rubber mix',
                'Synthetic resin / hard court',
            ];
        case 'Pickleball':
            return [
                'Hard court – concrete',
                'Hard court – asphalt',
                'Sport tiles – modular',
                'Cushioned court',
                'Artificial turf',
            ];
        case 'Tennis':
            return [
                'Clay',
                'Hard court – concrete',
                'Hard court – asphalt',
                'Grass',
                ...(isIndoor ? ['Carpet'] : []),
            ];
        case 'Badminton':
            return ['Synthetic / PU court', 'Wooden sprung floor', 'Rubber mat', 'Vinyl / PVC'];
        case 'Table Tennis':
        case 'Squash':
            return [];
        case 'Football':
            return [
                'Natural grass',
                'Artificial turf – 3G',
                'Artificial turf – 4G',
                'Hybrid grass',
            ];
        case 'Cricket':
            return ['Natural grass', 'Artificial turf', 'Concrete'];
        case 'Box Cricket':
            return [];
        case 'Basketball':
            return [
                ...(isIndoor ? ['Hardwood'] : []),
                'Hard court – concrete',
                'Hard court – asphalt',
                'Sport tiles – modular',
            ];
        case 'Volleyball':
            return ['Hardwood', 'Synthetic / PVC'];
        default:
            return [];
    }
}

export function getFormatOptions(sport: string): string[] | null {
    switch (sport) {
        case 'Football':
            return ['5-a-side', '6-a-side', '7-a-side', '11-a-side (full pitch)'];
        case 'Cricket':
            return ['Full pitch', 'Net practice'];
        default:
            return null;
    }
}

export function getCourtSizeOptions(sport: string): string[] | null {
    if (sport === 'Basketball') return ['Full court', 'Half court'];
    return null;
}

// ── API mappings ──────────────────────────────────────────────────────────────
// All display surface strings → closest backend CourtSurface enum value

export const SURFACE_TO_API: Record<string, CourtSurface> = {
    // Padel
    'Artificial grass – sand filled': 'SAND_FILLED_ARTIFICIAL_GRASS',
    'Artificial grass – rubber filled': 'ARTIFICIAL_GRASS',
    'Artificial grass – sand & rubber mix': 'SAND_FILLED_ARTIFICIAL_GRASS',
    'Synthetic resin / hard court': 'CUSHIONED_ACRYLIC',
    // Pickleball
    'Hard court – concrete': 'CONCRETE',
    'Hard court – asphalt': 'ASPHALT',
    'Sport tiles – modular': 'CUSHIONED_ACRYLIC',
    'Cushioned court': 'CUSHIONED_ACRYLIC',
    'Artificial turf': 'ARTIFICIAL_TURF',
    // Tennis
    Clay: 'ASPHALT',
    Grass: 'ARTIFICIAL_GRASS',
    Carpet: 'CUSHIONED_ACRYLIC',
    // Badminton
    'Synthetic / PU court': 'CUSHIONED_ACRYLIC',
    'Wooden sprung floor': 'CUSHIONED_ACRYLIC',
    'Rubber mat': 'ARTIFICIAL_TURF',
    'Vinyl / PVC': 'ARTIFICIAL_TURF',
    // Football / Cricket shared natural surfaces
    'Natural grass': 'ARTIFICIAL_GRASS',
    'Artificial turf – 3G': 'ARTIFICIAL_GRASS',
    'Artificial turf – 4G': 'ARTIFICIAL_GRASS',
    'Hybrid grass': 'ARTIFICIAL_GRASS',
    // Cricket-specific
    Concrete: 'CONCRETE',
    // Basketball / Volleyball
    Hardwood: 'CUSHIONED_ACRYLIC',
    'Synthetic / PVC': 'ARTIFICIAL_TURF',
    // Legacy fallbacks
    'Artificial Turf': 'ARTIFICIAL_GRASS',
    'Panoramic Glass': 'PANORAMIC_GLASS',
    'Synthetic Grass': 'ARTIFICIAL_GRASS',
    'Sand-filled Turf': 'SAND_FILLED_ARTIFICIAL_GRASS',
    'Cushioned Acrylic': 'CUSHIONED_ACRYLIC',
    'Hard Court': 'ASPHALT',
    'Outdoor Concrete': 'CONCRETE',
    'Concrete Pitch': 'CONCRETE',
    'Wooden Floor': 'CUSHIONED_ACRYLIC',
    'PU Floor': 'CUSHIONED_ACRYLIC',
    'Synthetic Mat': 'ARTIFICIAL_TURF',
    'Glass Back Wall': 'CRYSTAL_GLASS',
    Sand: 'SAND_FILLED_ARTIFICIAL_GRASS',
};

export const API_TO_SURFACE: Record<CourtSurface, string> = {
    ARTIFICIAL_GRASS: 'Artificial grass – sand filled',
    SAND_FILLED_ARTIFICIAL_GRASS: 'Artificial grass – sand filled',
    PANORAMIC_GLASS: 'Synthetic resin / hard court',
    CRYSTAL_GLASS: 'Synthetic resin / hard court',
    ASPHALT: 'Hard court – asphalt',
    CONCRETE: 'Hard court – concrete',
    CUSHIONED_ACRYLIC: 'Cushioned court',
    ARTIFICIAL_TURF: 'Artificial turf',
};

// Backend only supports INDOOR / OUTDOOR — Covered Outdoor maps to OUTDOOR
export function envToApi(env: EnvironmentOption): CourtEnvironment {
    return env === 'Indoor' ? 'INDOOR' : 'OUTDOOR';
}

export function envFromApi(env: CourtEnvironment): EnvironmentOption {
    return env === 'INDOOR' ? 'Indoor' : 'Outdoor';
}
