import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const getCourts = async (
    params?: GetCourtsParams,
): Promise<GetCourtsResponse> => {
    return apiClient({
        url: endpoints.getCourts,
        method: 'GET',
        params,
    });
};

export const viewCourt = async (
    courtId: string,
): Promise<ViewCourtResponse> => {
    return apiClient({
        url: endpoints.viewCourt(courtId),
        method: 'GET',
    });
};

export const createCourt = async (
    payload: CreateCourtPayload,
): Promise<CreateCourtResponse> => {
    return apiClient({
        url: endpoints.createCourt,
        method: 'POST',
        data: payload,
    });
};

export const updateCourt = async (
    courtId: string,
    payload: UpdateCourtPayload,
): Promise<UpdateCourtResponse> => {
    return apiClient({
        url: endpoints.updateCourt(courtId),
        method: 'PUT',
        data: payload,
    });
};

export const deleteCourt = async (
    courtId: string,
): Promise<DeleteCourtResponse> => {
    return apiClient({
        url: endpoints.deleteCourt(courtId),
        method: 'DELETE',
    });
};
