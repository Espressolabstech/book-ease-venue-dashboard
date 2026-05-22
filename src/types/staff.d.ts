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
}

export {};
