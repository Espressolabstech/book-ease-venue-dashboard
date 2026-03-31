import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listPeakHourPricings = async (
    params: ListPeakHourPricingsParams,
): Promise<ListPeakHourPricingsResponse> => {
    return apiClient({
        url: endpoints.listPeakHourPricing,
        method: 'GET',
        params,
    });
};

export const createPeakHourPricing = async (
    payload: CreatePeakHourPricingPayload,
): Promise<CreatePeakHourPricingResponse> => {
    return apiClient({
        url: endpoints.createPeakHourPricing,
        method: 'POST',
        data: payload,
    });
};

export const updatePeakHourPricing = async (
    id: string,
    payload: UpdatePeakHourPricingPayload,
): Promise<UpdatePeakHourPricingResponse> => {
    return apiClient({
        url: endpoints.updatePeakHourPricing(id),
        method: 'PATCH',
        data: payload,
    });
};

export const deletePeakHourPricing = async (
    id: string,
): Promise<DeletePeakHourPricingResponse> => {
    return apiClient({
        url: endpoints.deletePeakHourPricing(id),
        method: 'DELETE',
    });
};
