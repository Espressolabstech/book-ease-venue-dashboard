import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listStaff = () =>
    apiClient<{ data: { staff: StaffMember[] } }>({ url: endpoints.listStaff, method: 'GET' });

export const addStaff = (data: {
    phone: string;
    countryCode?: string;
    venueStaffRole: 'VENUE_MANAGER' | 'COURT_ASSISTANT';
    name?: string;
}) => apiClient({ url: endpoints.addStaff, method: 'POST', data });

export const updateStaffRole = (
    id: string,
    venueStaffRole: 'VENUE_MANAGER' | 'COURT_ASSISTANT',
) =>
    apiClient({
        url: endpoints.updateStaffRole(id),
        method: 'PATCH',
        data: { venueStaffRole },
    });

export const removeStaff = (id: string) =>
    apiClient({ url: endpoints.removeStaff(id), method: 'DELETE' });
