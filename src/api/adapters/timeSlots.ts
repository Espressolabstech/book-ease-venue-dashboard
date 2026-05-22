import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listTimeSlots = async (
    params: ListTimeSlotsParams,
): Promise<ListTimeSlotsResponse> => {
    return apiClient({
        url: endpoints.listTimeSlots,
        method: 'GET',
        params,
    });
};

export const updateTimeSlot = async (
    id: string,
    payload: UpdateTimeSlotPayload,
): Promise<UpdateTimeSlotResponse> => {
    return apiClient({
        url: endpoints.updateTimeSlot(id),
        method: 'PATCH',
        data: payload,
    });
};

export const deleteTimeSlot = async (
    id: string,
): Promise<DeleteTimeSlotResponse> => {
    return apiClient({
        url: endpoints.deleteTimeSlot(id),
        method: 'DELETE',
    });
};
