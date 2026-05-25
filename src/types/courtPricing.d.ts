declare global {
    interface CourtPricingModel {
        id: string;
        courtId: string;
        pricePerSlot: number;
        pointsPerSlot?: number | null;
        weekendPricePerSlot: number | null;
        weekendDays: number[];
        createdAt: string;
        updatedAt: string;
    }

    interface ListCourtPricingsParams {
        courtId: string;
    }

    interface ListCourtPricingsResponse {
        data: { courtPricings: CourtPricingModel[] };
    }

    interface UpdateCourtPricingPayload {
        pricePerSlot?: number;
        pointsPerSlot?: number;
        weekendPricePerSlot?: number | null;
        weekendDays?: number[];
    }

    interface UpdateCourtPricingResponse {
        data: { courtPricing: CourtPricingModel };
    }

    type DeleteCourtPricingResponse = Record<string, never>;
}

export {};
