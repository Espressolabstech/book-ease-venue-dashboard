import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const listBankDetails = async (): Promise<ListBankDetailsResponse> => {
    return apiClient({
        url: endpoints.listBankDetails,
        method: 'GET',
    });
};

export const updateBankDetails = async (
    id: string,
    payload: UpdateBankDetailsPayload,
): Promise<UpdateBankDetailsResponse> => {
    return apiClient({
        url: endpoints.updateBankDetails(id),
        method: 'PUT',
        data: payload,
    });
};

export const deleteBankDetails = async (
    id: string,
): Promise<DeleteBankDetailsResponse> => {
    return apiClient({
        url: endpoints.deleteBankDetails(id),
        method: 'DELETE',
    });
};
