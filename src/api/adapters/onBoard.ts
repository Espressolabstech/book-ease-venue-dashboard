import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const verifyToken = async (token: string) => {
    return apiClient({ url: endpoints.verifyToken(token), method: 'GET' });
};
