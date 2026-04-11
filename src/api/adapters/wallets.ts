import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const getPlayerWallets = async (): Promise<PlayerWalletsApiResponse> => {
    return apiClient({
        url: endpoints.playerWallets,
        method: 'GET',
    });
};
