declare global {
    type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

    interface AnalyticsParams {
        period?: AnalyticsPeriod;
        from?: string;
        to?: string;
    }

    interface AnalyticsSummary {
        totalRevenue: number;
        totalBookings: number;
        checkInRate: number;
        avgBookingValue: number;
    }

    interface RevenueByDay {
        day: string;
        revenue: number;
    }

    interface BookingsByStatus {
        status: BookingStatus;
        count: number;
        revenue: number;
    }

    interface AnalyticsData {
        period: AnalyticsPeriod;
        dateRange: {
            from: string;
            to: string;
        };
        summary: AnalyticsSummary;
        revenueByDayOfWeek: RevenueByDay[];
        bookingsByStatus: BookingsByStatus[];
    }

    interface AnalyticsResponse {
        data: AnalyticsData;
    }
}

export {};
