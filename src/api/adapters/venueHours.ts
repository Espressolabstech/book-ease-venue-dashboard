import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listVenueHours = async (): Promise<ListVenueHoursResponse> => {
    return apiClient({
        url: endpoints.listVenueHours,
        method: 'GET',
    });
};

export const updateVenueHours = async (
    id: string,
    payload: UpdateVenueHoursPayload,
): Promise<UpdateVenueHoursResponse> => {
    return apiClient({
        url: endpoints.updateVenueHours(id),
        method: 'PATCH',
        data: payload,
    });
};

export const deleteVenueHours = async (
    id: string,
): Promise<DeleteVenueHoursResponse> => {
    return apiClient({
        url: endpoints.deleteVenueHours(id),
        method: 'DELETE',
    });
};
