import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const managerLogin = async (data: ManagerLogin) => {
    return apiClient({ url: endpoints.login, method: 'POST', data });
};

export const verifyOtp = async (data: VerifyOtp): Promise<VerifyOtpResponse> => {
    return apiClient({ url: endpoints.verifyOtp, method: 'POST', data });
};

export const resendOtp = async (data: ResendOtp) => {
    return apiClient({ url: endpoints.resendOtp, method: 'POST', data });
};
