declare global {
    type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT';

    interface BookingPolicyModel {
        id: string;
        venueId: string;
        adavanceBookingDays: number;
        minimumNoticeMinutes: number;
        cancellationPolicy: CancellationPolicy;
        autoConfirm: boolean;
        maxBookingsPerPlayerDay: number | null;
        createdAt: string;
        updatedAt: string;
    }

    interface GetBookingPolicyResponse {
        bookingPolicy: BookingPolicyModel;
    }

    interface UpdateBookingPolicyPayload {
        advanceBookingDays?: number;
        minimumNoticeMinutes?: number;
        cancellationPolicy?: CancellationPolicy;
        autoConfirm?: boolean;
        maxBookingsPerPlayerDay?: number | null;
    }

    interface UpdateBookingPolicyResponse {
        bookingPolicy: BookingPolicyModel;
    }
}

export {};
