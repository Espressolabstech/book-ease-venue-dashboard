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
        amenities: AmenityModel[];
    }

    interface UpdateAmenityPayload {
        name?: string;
        icon?: string;
    }

    interface UpdateAmenityResponse {
        amenity: AmenityModel;
    }

    type DeleteAmenityResponse = Record<string, never>;
}

export {};
