declare global {
    type BankAccountStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
    type PayOutSchedule = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

    interface BankDetailsModel {
        id: string;
        venueId: string;
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        status: BankAccountStatus;
        payOutSchedule: PayOutSchedule;
        isDeleted: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface ListBankDetailsResponse {
        data: { bankDetails: BankDetailsModel[] };
    }

    interface UpdateBankDetailsPayload {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        accountHolderName?: string;
        payOutSchedule?: PayOutSchedule;
    }

    interface UpdateBankDetailsResponse {
        data: { bankDetails: BankDetailsModel };
    }

    type DeleteBankDetailsResponse = Record<string, never>;
}

export {};
