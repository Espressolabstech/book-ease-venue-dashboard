import { endpoints } from '../../config/apiEndpoints';
import apiClient from '../client/apiClient';

export const managerCreateBooking = async (
    payload: ManagerCreateBookingPayload,
): Promise<ManagerCreateBookingResponse> => {
    return apiClient({
        url: endpoints.managerCreateBooking,
        method: 'POST',
        data: payload,
    });
};

export const verifyBookingPayment = async (
    bookingId: string,
    payload: VerifyBookingPaymentPayload,
): Promise<VerifyBookingPaymentResponse> => {
    return apiClient({
        url: endpoints.verifyBookingPayment(bookingId),
        method: 'POST',
        data: payload,
    });
};

export const cashPayment = async (
    bookingId: string,
): Promise<CashPaymentResponse> => {
    return apiClient({
        url: endpoints.cashPayment(bookingId),
        method: 'POST',
    });
};

export const cancelBooking = async (
    bookingId: string,
    payload?: CancelBookingPayload,
): Promise<CancelBookingResponse> => {
    return apiClient({
        url: endpoints.cancelBooking(bookingId),
        method: 'PATCH',
        data: payload,
    });
};

export const listVenueBookings = async (
    params?: ListBookingsParams,
): Promise<ListVenueBookingsResponse> => {
    return apiClient({
        url: endpoints.listVenueBookings,
        method: 'GET',
        params,
    });
};

export const listVenuePlayers = async (
    params?: ListPlayersParams,
): Promise<ListVenuePlayersResponse> => {
    return apiClient({
        url: endpoints.listVenuePlayers,
        method: 'GET',
        params,
    });
};

export const getAvailableSlots = async (
    courtId: string,
    date: string,
): Promise<AvailableSlotsResponse> => {
    return apiClient({
        url: endpoints.availableSlots(courtId, date),
        method: 'GET',
    });
};

export const addPlayer = async (
    payload: AddPlayerPayload,
): Promise<AddPlayerResponse> => {
    return apiClient({
        url: endpoints.addPlayer,
        method: 'POST',
        data: payload,
    });
};

export const getBooking = async (
    bookingId: string,
): Promise<GetBookingResponse> => {
    return apiClient({
        url: endpoints.getBooking(bookingId),
        method: 'GET',
    });
};
