declare global {
    interface TimeSlotModel {
        id: string;
        courtId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface ListTimeSlotsParams {
        courtId: string;
    }

    interface ListTimeSlotsResponse {
        data: { timeSlots: TimeSlotModel[] };
    }

    interface UpdateTimeSlotPayload {
        dayOfWeek?: number;
        startTime?: string;
        endTime?: string;
        isActive?: boolean;
    }

    interface UpdateTimeSlotResponse {
        data: { timeSlot: TimeSlotModel };
    }

    type DeleteTimeSlotResponse = Record<string, never>;
}

export {};
