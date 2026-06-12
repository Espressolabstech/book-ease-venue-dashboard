import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const verifyToken = async (token: string) => {
    return apiClient({ url: endpoints.verifyToken(token), method: 'GET' });
};

export const isOnBoarded = async (): Promise<IsOnBoardedResponse> => {
    return apiClient({ url: endpoints.isOnBoarded, method: 'GET' });
};

export const getVenueImageUploadUrls = async (
    data: VenueImageUploadUrlRequest,
): Promise<VenueImageUploadUrlResponse> => {
    return apiClient({
        url: endpoints.venueImagesUpload,
        method: 'POST',
        data,
    });
};

export const getCourtImageUploadUrls = async (
    data: CourtImageUploadUrlRequest,
): Promise<VenueImageUploadUrlResponse> => {
    return apiClient({
        url: endpoints.courtImagesUpload,
        method: 'POST',
        data,
    });
};

export const uploadToPresignedUrl = async (
    uploadUrl: string,
    file: Blob | File,
    mimetype: string,
): Promise<void> => {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': mimetype },
    });
    if (!res.ok) throw new Error('Failed to upload image');
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

export const updateVenueDescription = async (
    description: string,
): Promise<{ data: { venue: { id: string; description: string } } }> => {
    return apiClient({
        url: endpoints.updateVenueDescription,
        method: 'PATCH',
        data: { description },
    });
};

export const updateVenueInfo = async (data: {
    name?: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
}): Promise<{
    data: {
        venue: {
            id: string;
            address: string | null;
            phone: string | null;
            latitude: number | null;
            longitude: number | null;
        };
    };
}> => {
    return apiClient({
        url: endpoints.updateVenueInfo,
        method: 'PATCH',
        data,
    });
};
