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
    }

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
        data: PresignedUploadResult[];
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
                pricePerHour: number;
                weekendPricePerHour?: number;
                weekendDays?: string[];
            };
            peakHourPricings?: {
                dayOfWeek?: number;
                startTime: string;
                endTime: string;
                pricePerHour: number;
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
        payOutSchedule?: string;
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
            };
        };
    }
}

export {};
