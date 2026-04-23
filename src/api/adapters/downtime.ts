import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listDowntimes = (courtId?: string) =>
    apiClient({
        url: courtId
            ? `${endpoints.listDowntimes}?courtId=${courtId}`
            : endpoints.listDowntimes,
        method: 'GET',
    });

export const createDowntime = (data: {
    courtId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    reason: string;
}) => apiClient({ url: endpoints.createDowntime, method: 'POST', data });

export const deleteDowntime = (id: string) =>
    apiClient({ url: endpoints.deleteDowntime(id), method: 'DELETE' });
