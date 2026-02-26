import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const verifyToken = async (token: string) => {
    return apiClient({ url: endpoints.verifyToken(token), method: 'GET' });
};

export const isOnBoarded = async (): Promise<IsOnBoardedResponse> => {
    return apiClient({ url: endpoints.isOnBoarded, method: 'GET' });
};

export const venueImagesUpload = async (formData: FormData) => {
    return apiClient({
        url: endpoints.venueImagesUpload,
        method: 'POST',
        data: formData,
    });
};

export const courtImagesUpload = async (formData: FormData) => {
    return apiClient({
        url: endpoints.courtImagesUpload,
        method: 'POST',
        data: formData,
    });
};

export const venueOnboard = async (data: VenueOnboardRequestData) => {
    return apiClient({ url: endpoints.venueOnboard, method: 'POST', data });
};

export const getOnBoardedVenueDetails =
    async (): Promise<GetOnBoardedVenueDetailsResponse> => {
        return apiClient({
            url: endpoints.getOnBoardedVenueDetails,
            method: 'GET',
        });
    };
