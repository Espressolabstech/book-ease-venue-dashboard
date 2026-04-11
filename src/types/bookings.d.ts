declare global {
    type PaymentMethod = 'card_online' | 'cash' | 'bank_transfer' | 'apple_pay';

    type Step = 'court' | 'player' | 'payment' | 'confirm' | 'success';

    type IndianPaymentMethod = 'upi' | 'cash' | 'card' | 'net_banking' | 'wallet';

    type PaymentStatus = 'paid' | 'pending';

    type ApiPaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'NET_BANKING' | 'WALLET';

    type BookingStatus =
        | 'PENDING'
        | 'CONFIRMED'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'NO_SHOW';

    type BookingPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

    interface BookingPaymentModel {
        id: string;
        bookingId: string;
        amount: number;
        paymentMethod: ApiPaymentMethod;
        paymentStatus: BookingPaymentStatus;
        razorpayOrderId: string | null;
        razorpayPaymentId: string | null;
        transactionId: string | null;
        paidAt: string | null;
        refundedAt: string | null;
        refundAmount: number | null;
        refundId: string | null;
        createdAt: string;
        updatedAt: string;
    }

    interface BookingUserModel {
        id: string;
        name: string | null;
        phone: string;
        countryCode: string;
    }

    interface BookingCourtModel {
        id: string;
        name: string;
        sport: string;
        environment?: string;
        surface?: string;
    }

    interface BookingVenueModel {
        id: string;
        name: string;
        address: string | null;
        city?: string;
    }

    interface BookingModel {
        id: string;
        bookingRef: string;
        userId: string;
        courtId: string;
        venueId: string;
        bookedByUserId: string | null;
        bookingDate: string;
        startTime: string;
        endTime: string;
        durationMinutes: number;
        totalAmount: number;
        discountAmount: number;
        finalAmount: number;
        status: BookingStatus;
        notes: string | null;
        cancelReason: string | null;
        confirmedAt: string | null;
        cancelledAt: string | null;
        createdAt: string;
        updatedAt: string;
        user?: BookingUserModel;
        court?: BookingCourtModel;
        venue?: BookingVenueModel;
        payment?: BookingPaymentModel | null;
        bookedBy?: BookingUserModel | null;
    }

    interface VenuePlayerModel {
        id: string;
        venueId: string;
        userId: string;
        totalBookings: number;
        lastBookingAt: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string | null;
            phone: string;
            countryCode: string;
            isAppUser: boolean;
            appInviteStatus: string;
        };
    }

    interface ManagerCreateBookingPayload {
        courtId: string;
        playerPhone: string;
        playerCountryCode?: string;
        playerName?: string;
        bookingDate: string;
        slots: { startTime: string; endTime: string }[];
        paymentMethod: ApiPaymentMethod;
        notes?: string;
    }

    interface CashPaymentPayload {
        // body is empty; bookingId is a path param
    }

    interface VerifyBookingPaymentPayload {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }

    interface VerifyBookingPaymentResponse {
        data: {
            booking: BookingModel;
            payment: BookingPaymentModel;
        };
    }

    interface CancelBookingPayload {
        cancelReason?: string;
    }

    interface ListBookingsParams {
        date?: string;
        status?: BookingStatus;
        page?: number;
        limit?: number;
    }

    interface ListPlayersParams {
        page?: number;
        limit?: number;
    }

    interface PaginationMeta {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }

    interface ManagerCreateBookingResponse {
        data: {
            booking: BookingModel;
            razorpay?: {
                orderId: string;
                amount: number;
                currency: string;
                keyId: string;
            };
        };
    }

    interface CashPaymentResponse {
        data: { booking: BookingModel; payment: BookingPaymentModel };
    }

    interface CancelBookingResponse {
        data: {
            booking: BookingModel;
            refund?: { refundId: string; refundAmount: number };
        };
    }

    interface ListVenueBookingsResponse {
        data: { bookings: BookingModel[]; pagination: PaginationMeta };
    }

    interface GetBookingResponse {
        data: { booking: BookingModel };
    }

    interface ListVenuePlayersResponse {
        data: { players: VenuePlayerModel[]; pagination: PaginationMeta };
    }

    interface AvailableSlotItem {
        startTime: string;
        endTime: string;
        status: 'available' | 'booked' | 'pending';
    }

    interface AvailableSlotsResponse {
        data: {
            court: { id: string; name: string; sport: string };
            date: string;
            isClosed: boolean;
            session1: AvailableSlotItem[] | null;
            session2: AvailableSlotItem[] | null;
        };
    }

    interface AddPlayerPayload {
        phone: string;
        countryCode?: string;
        name?: string;
    }

    interface AddPlayerResponse {
        success: boolean;
        message: string;
        data: {
            player: {
                id: string;
                venueId: string;
                userId: string;
                tier: string;
                totalBookings: number;
                totalSpend: string;
                inviteStatus: string;
            };
            user: {
                id: string;
                name: string | null;
                phone: string;
                countryCode: string;
            };
        };
    }
}

export {};
