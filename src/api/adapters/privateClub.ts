import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const getPrivateClubConfig = async (): Promise<GetPrivateClubConfigResponse> =>
    apiClient({ url: endpoints.privateClubConfig, method: 'GET' });

export const updatePrivateClubConfig = async (
    payload: UpdatePrivateClubConfigPayload,
): Promise<UpdatePrivateClubConfigResponse> =>
    apiClient({ url: endpoints.privateClubConfig, method: 'PUT', data: payload });

export const listClubMembers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
}): Promise<ListClubMembersResponse> =>
    apiClient({ url: endpoints.privateClubMembers, method: 'GET', params });

export const getClubMember = async (
    memberId: string,
): Promise<GetClubMemberResponse> =>
    apiClient({ url: endpoints.privateClubMember(memberId), method: 'GET' });

export const addClubMember = async (
    payload: AddClubMemberPayload,
): Promise<AddClubMemberResponse> =>
    apiClient({ url: endpoints.privateClubMembers, method: 'POST', data: payload });

export const updateClubMember = async (
    memberId: string,
    payload: UpdateClubMemberPayload,
): Promise<{ data: { member: ClubMemberDetail } }> =>
    apiClient({ url: endpoints.privateClubMember(memberId), method: 'PATCH', data: payload });

export const getMemberWallet = async (
    memberId: string,
    params?: { page?: number; limit?: number },
): Promise<GetMemberWalletResponse> =>
    apiClient({ url: endpoints.privateClubMemberWallet(memberId), method: 'GET', params });

export const adjustPoints = async (
    payload: AdjustPointsPayload,
): Promise<AdjustPointsResponse> =>
    apiClient({ url: endpoints.privateClubAdjustPoints, method: 'POST', data: payload });

export const allocateMonthlyPoints = async (
    payload?: AllocatePointsPayload,
): Promise<AllocatePointsResponse> =>
    apiClient({ url: endpoints.privateClubAllocatePoints, method: 'POST', data: payload ?? {} });

export const bulkAddClubMembers = async (
    members: { firstName: string; lastName: string; phone: string; countryCode?: string }[],
): Promise<{
    data: {
        added: { phone: string; name: string }[];
        skipped: { phone: string; reason: string }[];
        errors: { phone: string; reason: string }[];
    };
}> =>
    apiClient({ url: endpoints.privateClubMembersBulk, method: 'POST', data: { members } });
