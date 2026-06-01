import type { DaySchedule } from '../components/onboarding/ScheduleBuilder';

declare global {
    interface OnboardingShellProps {
        venueId: string;
        token: string;
        venue: any;
        progress: any;
        currentStep: number;
        saving?: boolean;
        saved?: boolean;
        children: React.ReactNode;
        onSaveAndContinue?: () => void;
        onSaveAndExit?: () => void;
        onBack?: () => void;
        isContinuing?: boolean;
    }

    interface StepVenueProfileProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    interface StepOperatingHoursProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    interface StepCourtSetupProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    interface Court {
        id?: string;
        name: string;
        sport: string;
        surface_material: string;
        is_indoor: boolean;
        hours_type: string;
        custom_hours: DaySchedule[];
        photo_url: string | null;
        active: boolean;
    }

    interface StepAmenitiesProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    interface StepPricingProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    interface PeakPricingSlot {
        id: string;
        start: string;
        end: string;
        rate: string;
        days: string[]; // SHORT_DAYS: 'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun'
    }

    /** One entry per sport (e.g. "Padel", "Pickleball").
     *  All courts of the same sport share the same pricing config. */
    interface SportPricing {
        sport: string;
        base_rate: string;
        booking_durations: number[];
        // Weekday peak slots (multiple morning/evening windows)
        peak_enabled: boolean;
        peak_slots: PeakPricingSlot[];
        // Weekend flat rate
        weekend_rate_enabled: boolean;
        weekend_days: string[]; // full day names: 'Saturday', 'Sunday'
        weekend_rate: string;
        // Weekend peak pricing (optional extra on top of weekend rate)
        weekend_peak_enabled: boolean;
        weekend_peak_slots: PeakPricingSlot[];
    }

    /** Kept for backwards compat - step5 is now Record<sport, SportPricing> */
    interface CourtPricing {
        court_id: string;
        base_rate: string;
        booking_durations: number[];
        peak_enabled: boolean;
        peak_time_start: string;
        peak_time_end: string;
        peak_rate: string;
        weekend_rate_enabled: boolean;
        weekend_days: string[];
        weekend_rate: string;
    }

    interface StepBookingRulesProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    interface StepPayoutDetailsProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    interface StepReviewProps {
        venueId: string;
        venue: any;
        onNext: () => void;
        onSaving: (saving: boolean) => void;
        onSaved: () => void;
        triggerSave: boolean;
        onSaveComplete: (success: boolean) => void;
        triggerExit: boolean;
        onExitComplete: () => void;
        triggerBack: boolean;
        onBackComplete: () => void;
    }

    type InvitationStatus = 'loading' | 'invalid' | 'expired' | 'valid';

    interface InvitationData {
        id: string;
        venue_name: string;
        manager_name: string;
        mobile: string;
        country_code: string;
        token: string;
        status: string;
        expires_at: string;
    }

    interface PresignedUploadResult {
        uploadUrl: string;
        key: string;
        publicUrl: string;
        type: 'LOGO' | 'COVER' | 'GALLERY' | 'PHOTO';
        order: number;
    }

    interface VenueImageUploadUrlRequest {
        venueId: string;
        images: {
            type: 'LOGO' | 'COVER' | 'GALLERY';
            mimetype: string;
            order?: number;
        }[];
    }

    interface CourtImageUploadUrlRequest {
        venueId: string;
        images: {
            type: string;
            mimetype: string;
        }[];
    }

    interface VenueImageUploadUrlResponse {
        message: string;
        data: PresignedUploadResult[] | { images: PresignedUploadResult[] };
    }

    // kept for backward compat, prefer VenueImageUploadUrlResponse
    interface ImageUploadResponse {
        message: string;
        data: {
            publicUrl: string;
        };
    }

    interface IsOnBoardedResponse {
        message: string;
        data: {
            isOnBoarded: boolean;
        };
    }

    interface VenueOnboardRequestData {
        token: string;
        venueName: string;
        description?: string;
        venuemail: string;
        venuePhone: string;
        venueAddress: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        latitude?: number;
        longitude?: number;
        venueHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean;
        }[];
        venueImages?: {
            publicUrl: string;
            type: 'LOGO' | 'COVER' | 'GALLERY';
            order?: number;
        }[];
        amenities?: {
            name: string;
            icon?: string;
        }[];
        courts?: {
            name: string;
            sport: string;
            courtEnvironment: string;
            surface: string;
            images?: {
                publicUrl: string;
                altText?: string;
            }[];
            timeSlots?: {
                dayOfWeek: number;
                startTime: string;
                endTime: string;
            }[];
            pricing?: {
                pricePerSlot: number;
                pointsPerSlot?: number;
                weekendPricePerSlot?: number;
                weekendPointsPerSlot?: number;
                weekendDays?: string[];
            };
            peakHourPricings?: {
                dayOfWeek?: number;
                startTime: string;
                endTime: string;
                pricePerSlot: number;
                pointsPerSlot?: number;
                label?: string;
            }[];
        }[];
        advanceBookingDays?: number;
        minimumNoticeMinutes?: number;
        cancellationPolicy?: string;
        maxBookingPerPlayerDay?: number;
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    }

    interface GetOnBoardedVenueDetailsResponse {
        message: string;
        success: boolean;
        data: {
            venue: {
                name: string;
                email: string;
                phone: string;
                city: string;
                state: string;
                country: string;
                pincode: string;
                address?: string;
                latitude?: number;
                longitude?: number;
                description?: string;
            };
        };
    }
}

export {};
