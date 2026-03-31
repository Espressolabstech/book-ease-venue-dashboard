import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listAmenities = async (): Promise<ListAmenitiesResponse> => {
    return apiClient({
        url: endpoints.listAmenities,
        method: 'GET',
    });
};

export const createAmenity = async (
    payload: CreateAmenityPayload,
): Promise<CreateAmenityResponse> => {
    return apiClient({
        url: endpoints.createAmenity,
        method: 'POST',
        data: payload,
    });
};

export const updateAmenity = async (
    id: string,
    payload: UpdateAmenityPayload,
): Promise<UpdateAmenityResponse> => {
    return apiClient({
        url: endpoints.updateAmenities(id),
        method: 'PATCH',
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
