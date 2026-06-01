export const endpoints = {
    // Auth Endpoints
    login: '/venue-manager-login',
    verifyOtp: '/verify-otp',
    resendOtp: '/resend-otp',

    // Onboarding Endpoints
    verifyToken: (token: string) => `/onboard/${token}/verify-invite-token`,
    venueImagesUpload: '/onboard/venue/images/upload',
    courtImagesUpload: '/onboard/court/images/upload',
    venueOnboard: '/onboard/venue',
    isOnBoarded: '/onboard/venue/is-onboarded',
    getOnBoardedVenueDetails: '/onboard/venue/details',
    updateVenueDescription: '/venue/update-description',
    updateVenueInfo: '/venue/update-info',

    // courts Endpoints
    getCourts: '/courts/list',
    createCourt: '/courts/create',
    updateCourt: (courtId: string) => `/courts/${courtId}/update`,
    deleteCourt: (courtId: string) => `/courts/${courtId}/delete`,
    viewCourt: (courtId: string) => `/courts/${courtId}/view`,

    // amenities Endpoints
    listAmenities: '/amenities/list',
    createAmenity: '/amenities/create',
    updateAmenities: (id: string) => `/amenities/${id}/update`,
    deleteAmenities: (id: string) => `/amenities/${id}/delete`,

    // bankdetials Endpoints
    listBankDetails: '/bank-details/list',
    updateBankDetails: (id: string) => `/bank-details/${id}/update`,
    deleteBankDetails: (id: string) => `/bank-details/${id}/delete`,

    // booking policy Endpoints
    listBookingPolicy: '/booking-policy/list',
    updateBookingPolicy: '/booking-policy/update',

    // Court pricing Endpoints
    listCourtPricing: '/court-pricing/list',
    updateCourtPricing: (id: string) => `/court-pricing/${id}/update`,
    deleteCourtPricing: (id: string) => `/court-pricing/${id}/delete`,

    // Peak hour pricing Endpoints
    listPeakHourPricing: '/peak-hour-pricing/list',
    createPeakHourPricing: '/peak-hour-pricing/create',
    updatePeakHourPricing: (id: string) => `/peak-hour-pricing/${id}/update`,
    deletePeakHourPricing: (id: string) => `/peak-hour-pricing/${id}/delete`,

    // time slots Endpoints
    listTimeSlots: '/time-slots/list',
    updateTimeSlot: (id: string) => `/time-slots/${id}/update`,
    deleteTimeSlot: (id: string) => `/time-slots/${id}/delete`,

    // Venue hours endpoints
    listVenueHours: '/venue-hours/list',
    saveVenueHour: '/venue-hours/save',
    updateVenueHours: (id: string) => `/venue-hours/${id}/update`,
    deleteVenueHours: (id: string) => `/venue-hours/${id}/delete`,

    // Venue Images endpoints
    listVenueImages: '/venue-images/list',
    updateVenueImage: (id: string) => `/venue-images/${id}/update`,
    deleteVenueImage: (id: string) => `/venue-images/${id}/delete`,

    // Bookings endpoints
    managerCreateBooking: '/bookings/manager/create',
    cashPayment: (bookingId: string) =>
        `/bookings/manager/${bookingId}/cash-payment`,
    cancelBooking: (bookingId: string) =>
        `/bookings/manager/${bookingId}/cancel`,
    verifyBookingPayment: (bookingId: string) =>
        `/bookings/${bookingId}/verify-payment`,
    listVenueBookings: '/bookings/venue/list',
    listVenuePlayers: '/bookings/venue/players',
    getBooking: (bookingId: string) => `/bookings/manager/${bookingId}`,

    // Available slots endpoint
    availableSlots: (courtId: string, date: string) =>
        `/venue-hours/available-slots?courtId=${courtId}&date=${date}`,

    // Analytics endpoints
    analytics: '/analytics',

    // Players endpoints
    playerStats: '/players/stats',
    addPlayer: '/players/add',
    listPlayers: '/players/list',
    getPlayer: (playerId: string) => `/players/${playerId}`,

    // Wallet endpoints
    playerWallets: '/players/wallets',

    // Downtime endpoints
    listDowntimes: '/downtime/list',
    createDowntime: '/downtime/create',
    deleteDowntime: (id: string) => `/downtime/${id}/delete`,

    // Venue staff endpoints
    listStaff: '/venue/staff',
    addStaff: '/venue/staff/add',
    updateStaffRole: (id: string) => `/venue/staff/${id}/role`,
    removeStaff: (id: string) => `/venue/staff/${id}`,

    // Private club endpoints
    privateClubConfig: '/private-club/config',
    privateClubMembers: '/private-club/members',
    privateClubMember: (memberId: string) => `/private-club/members/${memberId}`,
    privateClubMemberWallet: (memberId: string) => `/private-club/members/${memberId}/wallet`,
    privateClubAdjustPoints: '/private-club/points/adjust',
    privateClubAllocatePoints: '/private-club/points/allocate',
    privateClubMembersBulk: '/private-club/members/bulk',
};
