import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listAmenities = async (): Promise<ListAmenitiesResponse> => {
    return apiClient({
        url: endpoints.listAmenities,
        method: 'GET',
    });
};

export const updateAmenity = async (
    id: string,
    payload: UpdateAmenityPayload,
): Promise<UpdateAmenityResponse> => {
    return apiClient({
        url: endpoints.updateAmenities(id),
        method: 'PUT',
        data: payload,
    });
};

export const deleteAmenity = async (
    id: string,
): Promise<DeleteAmenityResponse> => {
    return apiClient({
        url: endpoints.deleteAmenities(id),
        method: 'DELETE',
    });
};
