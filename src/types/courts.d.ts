declare global {
    type Section =
        | 'hub'
        | 'hours'
        | 'peak'
        | 'courts'
        | 'downtime'
        | 'facility';

    type SportType = 'PICKELBALL' | 'PADEL';
    type CourtEnvironment = 'INDOOR' | 'OUTDOOR';
    type CourtSurface =
        | 'ARTIFICIAL_GRASS'
        | 'SAND_FILLED_ARTIFICIAL_GRASS'
        | 'PANORAMIC_GLASS'
        | 'CRYSTAL_GLASS'
        | 'ASPHALT'
        | 'CONCRETE'
        | 'CUSHIONED_ACRYLIC'
        | 'ARTIFICIAL_TURF';
    type CourtStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

    interface ScheduledDowntime {
        id: string;
        courtId: string;
        startDate: string;
        endDate: string;
        reason: string;
    }

    interface CourtData {
        id: string;
        name: string;
        sport: string;
        surfaceMaterial: string;
        lighting: string;
        roofed: boolean;
        isActive: boolean;
    }

    interface OperatingHours {
        day: string;
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }

    interface PeakHourSlot {
        id: string;
        startTime: string;
        endTime: string;
        days: string[];
    }

    interface SportPeakConfig {
        sport: string;
        peakPrice: number;
        offPeakPrice: number;
        slots: PeakHourSlot[];
    }

    interface FacilityInfo {
        bio: string;
        amenities: string[];
    }

    interface CourtImage {
        id: string;
        courtId: string;
        url: string;
        altText: string | null;
        createdAt: string;
        updatedAt: string;
    }

    interface TimeSlot {
        id: string;
        courtId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface CourtPricingModel {
        id: string;
        courtId: string;
        pricePerHour: number;
        weekendPricePerHour: number | null;
        weekendDays: number[];
        createdAt: string;
        updatedAt: string;
    }

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

    interface CourtModel {
        id: string;
        venueId: string;
        sport: SportType;
        name: string;
        environment: CourtEnvironment;
        surface: CourtSurface;
        status: CourtStatus;
        isDeleted: boolean;
        createdAt: string;
        updatedAt: string;
        courtImages: CourtImage[];
        courtPricings: CourtPricingModel[];
        peakHourPricings: PeakHourPricingModel[];
        timeSlots: TimeSlot[];
    }

    interface GetCourtsParams {
        sports?: SportType;
    }

    interface GetCourtsResponse {
        courts: CourtModel[];
    }

    interface ViewCourtResponse {
        court: CourtModel;
    }

    interface CreateCourtImagePayload {
        url: string;
        altText?: string;
    }

    interface CreateCourtTimeSlotPayload {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }

    interface CreateCourtPricingPayload {
        pricePerHour: number;
        weekendPricePerHour?: number | null;
        weekendDays?: number[];
    }

    interface CreateCourtPeakHourPayload {
        dayOfWeek?: number;
        startTime: string;
        endTime: string;
        pricePerHour: number;
        label?: string;
    }

    interface CreateCourtPayload {
        name: string;
        sport: SportType;
        environment: CourtEnvironment;
        surface: CourtSurface;
        images?: CreateCourtImagePayload[];
        timeSlots?: CreateCourtTimeSlotPayload[];
        pricing?: CreateCourtPricingPayload;
        peakHourPricings?: CreateCourtPeakHourPayload[];
    }

    interface CreateCourtResponse {
        court: CourtModel;
    }

    interface UpdateCourtPayload {
        name?: string;
        sport?: SportType;
        environment?: CourtEnvironment;
        surface?: CourtSurface;
        status?: CourtStatus;
    }

    interface UpdateCourtResponse {
        court: CourtModel;
    }

    type DeleteCourtResponse = Record<string, never>;
}

export {};
