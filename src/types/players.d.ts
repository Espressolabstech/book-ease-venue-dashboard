declare global {
    // ── Legacy UI types (used by tierConfig / TierManagementPanel) ────────────
    export interface PlayerInsight {
        id: string;
        name: string;
        phone: string;
        email: string;
        avatar: string;
        joinedDate: string;
        totalBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        totalSpend: number;
        avgSpend: number;
        lastVisit: string;
        favouriteCourt: string;
        favouriteSport: string;
        favouriteTime: string;
        streak: number;
        tier: TierKey;
        recentBookings: {
            date: string;
            court: string;
            time: string;
            status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
            amount: number;
        }[];
    }

    type TierKey = 'club' | 'pro' | 'elite';

    interface TierManagementPanelProps {
        onClose: () => void;
        venueId?: string;
    }

    interface TierInfo {
        key: TierKey;
        label: string;
        icon: React.ElementType;
        color: string;
        bg: string;
        border: string;
        playerCount: number;
        revenue: number;
        perks: PerkConfig[];
        thresholds: { spend: number };
    }

    interface PerkConfig {
        id: string;
        label: string;
        description: string;
        icon: React.ElementType;
        enabled: boolean;
        tierMin: TierKey;
    }

    type MainTab = 'players' | 'tiers';

    // ── API types ─────────────────────────────────────────────────────────────
    type PlayerApiTier = 'CLUB' | 'PRO' | 'ELITE';
    type PlayerInviteStatus = 'PENDING' | 'NOTIFIED' | 'JOINED';
    type PlayerSport = 'PICKELBALL' | 'PADEL';

    interface PlayerApiUser {
        id: string;
        name: string;
        phone: string;
        countryCode: string;
        isAppUser: boolean;
        appInviteStatus: PlayerInviteStatus;
    }

    interface PlayerApiModel {
        id: string;
        venueId: string;
        userId: string;
        tier: PlayerApiTier;
        packageTier: PlayerApiTier | null;
        packageGrantedAt: string | null;
        graceTier: PlayerApiTier | null;
        graceUntil: string | null;
        windowSpend: string;
        totalBookings: number;
        totalSpend: string;
        avgSpend: number;
        lastVisitedAt: string;
        inviteStatus: PlayerInviteStatus;
        isAppUser: boolean;
        createdAt: string;
        updatedAt: string;
        user: PlayerApiUser;
    }

    interface WalletTransaction {
        id: string;
        type: 'CREDIT' | 'DEBIT';
        source:
            | 'BOOKING_PAYMENT'
            | 'PACKAGE_PURCHASE'
            | 'REFUND'
            | 'PROMO'
            | 'ADMIN_ADJUSTMENT';
        amount: string;
        balanceAfter: string;
        note: string;
        createdAt: string;
    }

    interface PackagePurchase {
        id: string;
        amountPaid: string;
        status: string;
        createdAt: string;
        package: {
            id: string;
            name: string;
            amount: string;
            tierUnlock: PlayerApiTier;
        };
    }

    interface PlayerApiUserDetail extends PlayerApiUser {
        wallet: {
            balance: string;
            transactions: WalletTransaction[];
        };
        packagePurchases: PackagePurchase[];
    }

    interface PlayerPreferences {
        favouriteSport: PlayerSport;
        favouriteCourt: string;
        preferredTime: string;
    }

    interface PlayerDetailModel extends Omit<PlayerApiModel, 'user'> {
        completedBookings: number;
        cancelledBookings: number;
        completionRate: number;
        weeklyStreak: number;
        preferences: PlayerPreferences;
        user: PlayerApiUserDetail;
        // Explicitly redeclared so the TS language server always resolves them
        packageTier: PlayerApiTier | null;
        packageGrantedAt: string | null;
        graceTier: PlayerApiTier | null;
        graceUntil: string | null;
        windowSpend: string;
    }

    interface TierBenefit {
        tier: PlayerApiTier;
        cancellationWindowHours: number;
        refundPercentage: number;
        bookingDiscountPct: number;
        canHoldCourt: boolean;
        holdDurationMinutes: number;
        earlyAccessHours: number;
    }

    interface PlayerRecentBooking {
        id: string;
        bookingRef: string;
        bookingDate: string;
        startTime: string;
        endTime: string;
        finalAmount: number;
        status: BookingStatus;
        payment: {
            paymentMethod: string;
            paymentStatus: BookingPaymentStatus;
        };
        court: {
            id: string;
            name: string;
            sport: string;
        };
    }

    interface PlayerStatsResponse {
        data: {
            totalPlayers: number;
            totalSessions: number;
            totalRevenue: number;
            tierCounts: {
                CLUB: number;
                PRO: number;
                ELITE: number;
            };
        };
    }

    interface ListPlayersApiParams {
        page?: number;
        limit?: number;
        search?: string;
        tier?: PlayerApiTier;
        sortBy?: 'topSpend' | 'mostVisited' | 'recent';
    }

    interface ListPlayersApiResponse {
        data: {
            players: PlayerApiModel[];
            pagination: PaginationMeta;
        };
    }

    interface GetPlayerApiResponse {
        data: {
            player: PlayerDetailModel;
            tierBenefit: TierBenefit;
            recentBookings: PlayerRecentBooking[];
        };
    }
}

export {};
