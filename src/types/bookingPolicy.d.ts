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
        minimumSlotMinutes: number;
        createdAt: string;
        updatedAt: string;
    }

    interface GetBookingPolicyResponse {
        data: { bookingPolicy: BookingPolicyModel };
    }

    interface UpdateBookingPolicyPayload {
        advanceBookingDays?: number;
        minimumNoticeMinutes?: number;
        cancellationPolicy?: CancellationPolicy;
        autoConfirm?: boolean;
        maxBookingsPerPlayerDay?: number | null;
        minimumSlotMinutes?: number;
    }

    interface UpdateBookingPolicyResponse {
        data: { bookingPolicy: BookingPolicyModel };
    }
}

export {};
