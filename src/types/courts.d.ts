declare global {
    type Section =
        | 'hub'
        | 'hours'
        | 'peak'
        | 'courts'
        | 'downtime'
        | 'facility'
        | 'policy';

    type SportType =
        | 'PICKELBALL'
        | 'PADEL'
        | 'TENNIS'
        | 'BADMINTON'
        | 'TABLE_TENNIS'
        | 'SQUASH'
        | 'FOOTBALL'
        | 'CRICKET'
        | 'BOX_CRICKET'
        | 'BASKETBALL'
        | 'VOLLEYBALL'
        | 'SWIMMING'
        | 'HOCKEY'
        | 'GOLF'
        | 'CYCLING'
        | 'YOGA'
        | 'GYM'
        | 'RIFLE_SHOOTING'
        | 'ARCHERY'
        | 'BOXING'
        | 'SNOOKER';
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
        startTime: string;
        endTime: string;
        reason: string;
        court?: { id: string; name: string; sport: string };
    }

    interface CourtData {
        id: string;
        name: string;
        sport: string;
        surfaceMaterial: string;
        lighting: string;
        roofed: boolean;
        isActive: boolean;
        pricePerSlot: number;
    }

    interface OperatingHours {
        id?: string;
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
        address: string;
        phone: string;
        latitude: string;
        longitude: string;
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
        pricePerSlot: number;
        weekendPricePerSlot: number | null;
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
        pricePerSlot: number;
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
        data: { courts: CourtModel[] };
    }

    interface ViewCourtResponse {
        data: { court: CourtModel };
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
        pricePerSlot: number;
        weekendPricePerSlot?: number | null;
        weekendDays?: number[];
    }

    interface CreateCourtPeakHourPayload {
        dayOfWeek?: number;
        startTime: string;
        endTime: string;
        pricePerSlot: number;
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
        data: { court: CourtModel };
    }

    interface UpdateCourtPayload {
        name?: string;
        sport?: SportType;
        environment?: CourtEnvironment;
        surface?: CourtSurface;
        status?: CourtStatus;
    }

    interface UpdateCourtResponse {
        data: { court: CourtModel };
    }

    type DeleteCourtResponse = Record<string, never>;
}

export {};
