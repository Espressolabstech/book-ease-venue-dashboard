declare global {
    interface AmenityModel {
        id: string;
        venueId: string;
        name: string;
        icon: string | null;
        createdAt: string;
        updatedAt: string;
    }

    interface ListAmenitiesResponse {
        data: { amenities: AmenityModel[] };
    }

    interface CreateAmenityPayload {
        name: string;
        icon?: string;
    }

    interface CreateAmenityResponse {
        data: { amenity: AmenityModel };
    }

    interface UpdateAmenityPayload {
        name?: string;
        icon?: string;
    }

    interface UpdateAmenityResponse {
        data: { amenity: AmenityModel };
    }

    type DeleteAmenityResponse = Record<string, never>;
}

export {};
