declare global {
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

    interface ResendOtp {
        phone: string;
    }
}

export {};
