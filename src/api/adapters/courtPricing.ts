import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listCourtPricings = async (
    params: ListCourtPricingsParams,
): Promise<ListCourtPricingsResponse> => {
    return apiClient({
        url: endpoints.listCourtPricing,
        method: 'GET',
        params,
    });
};

export const updateCourtPricing = async (
    id: string,
    payload: UpdateCourtPricingPayload,
): Promise<UpdateCourtPricingResponse> => {
    return apiClient({
        url: endpoints.updateCourtPricing(id),
        method: 'PUT',
        data: payload,
    });
};

export const deleteCourtPricing = async (
    id: string,
): Promise<DeleteCourtPricingResponse> => {
    return apiClient({
        url: endpoints.deleteCourtPricing(id),
        method: 'DELETE',
    });
};
