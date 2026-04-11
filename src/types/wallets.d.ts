declare global {
    // PlayerWallet is used by the Wallets screen and PlayerRow component.
    // WalletTransaction here refers to the global one declared in players.d.ts
    // which has the real API shape: { id, type, source, amount, balanceAfter, note, createdAt }
    interface PlayerWallet {
        id: string;
        name: string;
        phone: string;
        creditBalance: number;
        totalPurchased: number;
        totalSpent: number;
        tier: string;
        lastActive: string;
        isActive: boolean;
        transactions: WalletTransaction[];
    }

    interface PlayerWalletsApiResponse {
        message: string;
        data: {
            players: ApiPlayerWallet[];
            totals: {
                totalActiveBalance: number;
                totalLiability: number;
            };
        };
    }

    interface ApiPlayerWallet {
        userId: string;
        name: string;
        phone: string;
        tier: string | null;
        totalSpend: number;
        totalBookings: number;
        lastVisitedAt: string | null;
        walletBalance: number;
        totalPurchased: number;
        isActive: boolean;
        transactions: WalletTransaction[];
    }
}

export {};
