declare global {
    interface PeakHourPricingModel {
        id: string;
        courtId: string;
        dayOfWeek: number | null;
        startTime: string;
        endTime: string;
        pricePerHour: number;
        label: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface ListPeakHourPricingsParams {
        courtId: string;
    }

    interface ListPeakHourPricingsResponse {
        peakHourPricings: PeakHourPricingModel[];
    }

    interface UpdatePeakHourPricingPayload {
        dayOfWeek?: number | null;
        startTime?: string;
        endTime?: string;
        pricePerHour?: number;
        label?: string | null;
        isActive?: boolean;
    }

    interface UpdatePeakHourPricingResponse {
        peakHourPricing: PeakHourPricingModel;
    }

    type DeletePeakHourPricingResponse = Record<string, never>;
}

export {};
