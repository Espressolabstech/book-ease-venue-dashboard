import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const managerLogin = async (data: ManagerLogin) => {
    return apiClient({ url: endpoints.login, method: 'POST', data });
};

export const verifyOtp = async (data: VerifyOtp) => {
    return apiClient({ url: endpoints.verifyOtp, method: 'POST', data });
};
