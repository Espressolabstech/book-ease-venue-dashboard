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
        courtPricings: CourtPricingModel[];
    }

    interface UpdateCourtPricingPayload {
        pricePerHour?: number;
        weekendPricePerHour?: number | null;
        weekendDays?: number[];
    }

    interface UpdateCourtPricingResponse {
        courtPricing: CourtPricingModel;
    }

    type DeleteCourtPricingResponse = Record<string, never>;
}

export {};
