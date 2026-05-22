import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listVenueImages = async (
    params?: ListVenueImagesParams,
): Promise<ListVenueImagesResponse> => {
    return apiClient({
        url: endpoints.listVenueImages,
        method: 'GET',
        params,
    });
};

export const updateVenueImage = async (
    id: string,
    payload: UpdateVenueImagePayload,
): Promise<UpdateVenueImageResponse> => {
    return apiClient({
        url: endpoints.updateVenueImage(id),
        method: 'PUT',
        data: payload,
    });
};

export const deleteVenueImage = async (
    id: string,
): Promise<DeleteVenueImageResponse> => {
    return apiClient({
        url: endpoints.deleteVenueImage(id),
        method: 'DELETE',
    });
};
