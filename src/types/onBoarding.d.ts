import type { DaySchedule } from '../components/onboarding/ScheduleBuilder';

declare global {
    interface OnboardingShellProps {
        venueId: string;
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
}

export {};
