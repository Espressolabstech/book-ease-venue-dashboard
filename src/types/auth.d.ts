declare global {
    interface ManagerLogin {
        phone: string;
    }

    interface VerifyOtp {
        phone: string;
        otp: string;
    }
}

export {};
