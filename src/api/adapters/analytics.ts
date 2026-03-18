import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const getAnalytics = async (
    params?: AnalyticsParams,
): Promise<AnalyticsResponse> => {
    return apiClient({
        url: endpoints.analytics,
        method: 'GET',
        params,
    });
};
