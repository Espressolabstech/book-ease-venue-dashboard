import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const getPlayerStats = async (): Promise<PlayerStatsResponse> => {
    return apiClient({
        url: endpoints.playerStats,
        method: 'GET',
    });
};

export const listPlayers = async (
    params?: ListPlayersApiParams,
): Promise<ListPlayersApiResponse> => {
    return apiClient({
        url: endpoints.listPlayers,
        method: 'GET',
        params,
    });
};

export const getPlayer = async (
    playerId: string,
): Promise<GetPlayerApiResponse> => {
    return apiClient({
        url: endpoints.getPlayer(playerId),
        method: 'GET',
    });
};

export const addPlayer = async (
    payload: AddPlayerPayload,
): Promise<AddPlayerResponse> => {
    return apiClient({
        url: endpoints.addPlayer,
        method: 'POST',
        data: payload,
    });
};
