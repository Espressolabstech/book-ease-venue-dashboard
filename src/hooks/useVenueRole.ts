import { getVenueStaffRole } from '../utils/cookies.helpers';

export const useVenueRole = (): VenueStaffRole => {
    return getVenueStaffRole() ?? 'VENUE_ADMIN';
};

export const isVenueAdmin = (role: VenueStaffRole) => role === 'VENUE_ADMIN';
export const isVenueManager = (role: VenueStaffRole) => role === 'VENUE_MANAGER';
export const isCourtAssistant = (role: VenueStaffRole) => role === 'COURT_ASSISTANT';

export const canEdit = (role: VenueStaffRole) => role === 'VENUE_ADMIN';
export const canAccessSettings = (role: VenueStaffRole) =>
    role === 'VENUE_ADMIN' || role === 'VENUE_MANAGER';
