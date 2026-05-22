declare global {
    type BankAccountStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

    interface BankDetailsModel {
        id: string;
        venueId: string;
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        status: BankAccountStatus;
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
    }

    interface UpdateBankDetailsResponse {
        data: { bankDetails: BankDetailsModel };
    }

    type DeleteBankDetailsResponse = Record<string, never>;
}

export {};
