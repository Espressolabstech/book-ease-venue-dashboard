import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const getBookingPolicy = async (): Promise<GetBookingPolicyResponse> => {
    return apiClient({
        url: endpoints.listBookingPolicy,
        method: 'GET',
    });
};

export const updateBookingPolicy = async (
    payload: UpdateBookingPolicyPayload,
): Promise<UpdateBookingPolicyResponse> => {
    return apiClient({
        url: endpoints.updateBookingPolicy,
        method: 'PUT',
        data: payload,
    });
};
