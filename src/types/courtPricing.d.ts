declare global {
    interface CourtPricingModel {
        id: string;
        courtId: string;
        pricePerHour: number;
        weekendPricePerHour: number | null;
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
        pricePerHour?: number;
        weekendPricePerHour?: number | null;
        weekendDays?: number[];
    }

    interface UpdateCourtPricingResponse {
        data: { courtPricing: CourtPricingModel };
    }

    type DeleteCourtPricingResponse = Record<string, never>;
}

export {};
