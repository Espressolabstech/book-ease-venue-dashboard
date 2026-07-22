declare global {
    interface StaffMember {
        id: string;
        name: string | null;
        phone: string;
        countryCode: string;
        venueStaffRole: VenueStaffRole;
        status: string;
        createdAt: string;
    }

    interface ListStaffResponse {
        message: string;
        data: {
            staff: StaffMember[];
        };
    }
}

export {};
