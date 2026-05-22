declare global {
    type VenueStaffRole = 'VENUE_ADMIN' | 'VENUE_MANAGER' | 'COURT_ASSISTANT';
    interface ManagerLogin {
        phone: string;
    }

    interface VerifyOtp {
        phone: string;
        otp: string;
    }

    interface AuthResponse {
        message: string;
        data: {
            token: string;
        };
    }

    interface VerifyOtpResponse {
        message: string;
        data: {
            token: string;
            id: string;
            name: string | null;
            phone: string;
            role: string;
            venueStaffRole: VenueStaffRole | null;
            isNewUser: boolean;
        };
    }

    interface ResendOtp {
        phone: string;
    }
}

export {};
