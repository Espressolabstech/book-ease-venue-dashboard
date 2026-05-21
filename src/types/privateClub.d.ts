declare global {
    // ── Config ────────────────────────────────────────────────────────────────

    interface PrivateClubConfig {
        id: string;
        name: string;
        isPrivateClub: boolean;
        pointsEnabled: boolean;
        monthlyPointsAllowance: number | null;
        allowanceResetDay: number;
        allowanceCarryOver: boolean;
        pointsExpiryDays: number | null;
        pointPrice: number | null;
        brandColor: string | null;
    }

    interface GetPrivateClubConfigResponse {
        data: { config: PrivateClubConfig };
    }

    interface UpdatePrivateClubConfigPayload {
        isPrivateClub?: boolean;
        pointsEnabled?: boolean;
        monthlyPointsAllowance?: number | null;
        allowanceResetDay?: number;
        allowanceCarryOver?: boolean;
        pointsExpiryDays?: number | null;
        pointPrice?: number | null;
        brandColor?: string | null;
    }

    interface UpdatePrivateClubConfigResponse {
        data: { config: PrivateClubConfig };
    }

    // ── Members ───────────────────────────────────────────────────────────────

    interface ClubMemberWalletSummary {
        balance: number;
        monthlyAllocated: number;
        monthlyUsed: number;
        lastAllocationAt: string | null;
    }

    interface ClubMember {
        id: string;
        name: string | null;
        phone: string;
        countryCode: string;
        membershipId: string | null;
        membershipExpiresAt: string | null;
        customMonthlyPoints: number | null;
        clubPointsEnabled: boolean;
        clubNotes: string | null;
        joinedAt: string | null;
        wallet: ClubMemberWalletSummary | null;
    }

    interface ListClubMembersResponse {
        data: {
            members: ClubMember[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }

    interface AddClubMemberPayload {
        phone: string;
        countryCode?: string;
        name?: string;
        membershipId?: string;
        membershipExpiresAt?: string;
        openingPoints?: number;
        customMonthlyPoints?: number;
        clubNotes?: string;
    }

    interface AddClubMemberResponse {
        data: {
            member: Pick<ClubMember, 'id' | 'name' | 'phone' | 'countryCode' | 'membershipId' | 'clubPointsEnabled'>;
            wallet: { balance: number };
        };
    }

    interface UpdateClubMemberPayload {
        name?: string;
        membershipId?: string;
        membershipExpiresAt?: string | null;
        customMonthlyPoints?: number | null;
        clubPointsEnabled?: boolean;
        clubNotes?: string;
    }

    // ── Wallet ────────────────────────────────────────────────────────────────

    type PointsTransactionType =
        | 'OPENING_BALANCE'
        | 'MONTHLY_ALLOWANCE'
        | 'ADMIN_CREDIT'
        | 'ADMIN_DEBIT'
        | 'BOOKING_DEDUCTION'
        | 'BOOKING_REFUND'
        | 'EXPIRY_DEDUCTION'
        | 'PENALTY';

    interface PointsTransaction {
        id: string;
        walletId: string;
        type: PointsTransactionType;
        points: number;
        balanceAfter: number;
        bookingId: string | null;
        note: string | null;
        expiresAt: string | null;
        createdAt: string;
        createdBy: { id: string; name: string | null } | null;
        booking: {
            bookingRef: string;
            bookingDate: string;
            court: { name: string };
        } | null;
    }

    interface GetMemberWalletResponse {
        data: {
            wallet: ClubMemberWalletSummary;
            transactions: PointsTransaction[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }

    interface AdjustPointsPayload {
        userId: string;
        type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT';
        points: number;
        note: string;
    }

    interface AdjustPointsResponse {
        data: {
            wallet: { balance: number };
            transaction: PointsTransaction;
        };
    }

    interface AllocatePointsPayload {
        userIds?: string[];
    }

    interface AllocatePointsResponse {
        data: { allocated: number; skipped: number };
    }

    // ── Member detail ─────────────────────────────────────────────────────────

    interface ClubMemberDetail {
        id: string;
        name: string | null;
        phone: string;
        countryCode: string;
        membershipId: string | null;
        membershipExpiresAt: string | null;
        customMonthlyPoints: number | null;
        clubPointsEnabled: boolean;
        clubNotes: string | null;
        joinedAt: string | null;
    }

    interface GetClubMemberResponse {
        data: {
            member: ClubMemberDetail;
            wallet: (ClubMemberWalletSummary & { transactions: PointsTransaction[] }) | null;
            recentBookings: {
                id: string;
                bookingRef: string;
                bookingDate: string;
                startTime: string;
                endTime: string;
                pointsAmount: number | null;
                status: string;
                court: { id: string; name: string; sport: string };
            }[];
        };
    }
}

export {};
