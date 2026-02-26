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
};
