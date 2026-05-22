declare global {
    // ─── Venue Hours Model ────────────────────────────────────────────────────────

    interface VenueHoursModel {
        id: string;
        venueId: string;
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
        createdAt: string;
        updatedAt: string;
    }

    // ─── List Venue Hours ─────────────────────────────────────────────────────────

    interface ListVenueHoursResponse {
        data: { venueHours: VenueHoursModel[] };
    }

    // ─── Save (upsert) Venue Hours ────────────────────────────────────────────────

    interface SaveVenueHourPayload {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
    }

    // ─── Update Venue Hours ───────────────────────────────────────────────────────

    interface UpdateVenueHoursPayload {
        openTime?: string;
        closeTime?: string;
        isClosed?: boolean;
    }

    interface UpdateVenueHoursResponse {
        data: { venueHours: VenueHoursModel };
    }

    // ─── Delete Venue Hours ───────────────────────────────────────────────────────

    type DeleteVenueHoursResponse = Record<string, never>;
}

export {};
