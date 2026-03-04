declare global {
    type VenueImageType = 'LOGO' | 'COVER' | 'GALLERY';

    interface VenueImageModel {
        id: string;
        venueId: string;
        url: string;
        altText: string | null;
        type: VenueImageType;
        order: number;
        createdAt: string;
        updatedAt: string;
    }

    interface ListVenueImagesParams {
        type?: VenueImageType;
    }

    interface ListVenueImagesResponse {
        data: { venueImages: VenueImageModel[] };
    }

    interface UpdateVenueImagePayload {
        url?: string;
        altText?: string;
        type?: VenueImageType;
        order?: number;
    }

    interface UpdateVenueImageResponse {
        data: { venueImage: VenueImageModel };
    }

    type DeleteVenueImageResponse = Record<string, never>;
}

export {};
