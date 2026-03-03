export const mockFacilities = [
    {
        id: '1',
        name: 'Padel Arena Dubai',
        location: 'Al Quoz, Dubai',
        city: 'Dubai',
        type: 'sports' as const,
        description:
            'Premium padel courts with professional-grade surfaces. Indoor and outdoor courts available with floodlights for evening play.',
        image_url:
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
        sports: ['Padel', 'Pickleball'],
        amenities: ['Parking', 'Changing Rooms', 'Cafe', 'Pro Shop'],
    },
    {
        id: '2',
        name: 'SportCity Courts',
        location: 'Downtown, Dubai',
        city: 'Dubai',
        type: 'sports' as const,
        description:
            'Multi-sport facility featuring top-quality courts for padel, tennis, and basketball.',
        image_url:
            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
        sports: ['Padel', 'Tennis', 'Basketball'],
        amenities: ['Parking', 'Showers', 'Coaching'],
    },
    {
        id: '3',
        name: 'Green Valley Padel',
        location: 'JLT, Dubai',
        city: 'Dubai',
        type: 'sports' as const,
        description:
            'Community-focused padel club with courts for all skill levels.',
        image_url:
            'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop',
        sports: ['Padel'],
        amenities: ['Parking', 'Water Station'],
    },
];

export const mockCourts = [
    {
        id: 'c1',
        facility_id: '1',
        name: 'Padel Court 1',
        sport: 'Padel',
        capacity: 4,
        price_per_hour: 150,
        field_size: '20m x 10m',
    },
    {
        id: 'c2',
        facility_id: '1',
        name: 'Padel Court 2',
        sport: 'Padel',
        capacity: 4,
        price_per_hour: 150,
        field_size: '20m x 10m',
    },
    {
        id: 'c7',
        facility_id: '1',
        name: 'Padel Court 3',
        sport: 'Padel',
        capacity: 4,
        price_per_hour: 150,
        field_size: '20m x 10m',
    },
    {
        id: 'c8',
        facility_id: '1',
        name: 'Padel Court 4',
        sport: 'Padel',
        capacity: 4,
        price_per_hour: 150,
        field_size: '20m x 10m',
    },
    {
        id: 'c3',
        facility_id: '1',
        name: 'Pickleball Court 1',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c9',
        facility_id: '1',
        name: 'Pickleball Court 2',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c10',
        facility_id: '1',
        name: 'Pickleball Court 3',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c11',
        facility_id: '1',
        name: 'Pickleball Court 4',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c12',
        facility_id: '1',
        name: 'Pickleball Court 5',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c13',
        facility_id: '1',
        name: 'Pickleball Court 6',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c14',
        facility_id: '1',
        name: 'Pickleball Court 7',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c15',
        facility_id: '1',
        name: 'Pickleball Court 8',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c16',
        facility_id: '1',
        name: 'Pickleball Court 9',
        sport: 'Pickleball',
        capacity: 4,
        price_per_hour: 200,
        field_size: '20m x 10m',
    },
    {
        id: 'c4',
        facility_id: '2',
        name: 'Padel Court A',
        sport: 'Padel',
        capacity: 4,
        price_per_hour: 120,
        field_size: '20m x 10m',
    },
    {
        id: 'c5',
        facility_id: '2',
        name: 'Tennis Court B',
        sport: 'Tennis',
        capacity: 4,
        price_per_hour: 120,
        field_size: '20m x 10m',
    },
    {
        id: 'c6',
        facility_id: '2',
        name: 'Basketball Court',
        sport: 'Basketball',
        capacity: 10,
        price_per_hour: 180,
        field_size: '28m x 15m',
    },
];

export const mockPlayers = [
    {
        id: 'p1',
        name: 'Ahmad Hassan',
        email: 'ahmad@email.com',
        phone: '+971 50 123 4567',
    },
    {
        id: 'p2',
        name: 'Sarah Johnson',
        email: 'sarah@email.com',
        phone: '+971 55 234 5678',
    },
    {
        id: 'p3',
        name: 'Mike Chen',
        email: 'mike@email.com',
        phone: '+971 52 345 6789',
    },
    {
        id: 'p4',
        name: 'Fatima Al-Said',
        email: 'fatima@email.com',
        phone: '+971 56 456 7890',
    },
];

export function generateTimeSlots(courtId: string, date: string) {
    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    return hours.map((h, i) => ({
        id: `ts-${courtId}-${date}-${h}`,
        court_id: courtId,
        date,
        start_time: `${h.toString().padStart(2, '0')}:00`,
        end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
        status: (i % 3 === 1
            ? 'booked'
            : i % 5 === 0
              ? 'blocked'
              : 'available') as 'available' | 'booked' | 'blocked',
    }));
}

// Helper to get today's date string
const today = new Date().toISOString().split('T')[0];

export type PaymentMethod =
    | 'card_online'
    | 'cash'
    | 'bank_transfer'
    | 'apple_pay';

export interface MockBooking {
    id: string;
    time_slot_id: string;
    player_id: string;
    player: (typeof mockPlayers)[number];
    status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
    court_fee: number;
    booking_fee: number;
    gst: number;
    total: number;
    amount_paid: number;
    payment_method: PaymentMethod;
    court_name: string;
    facility_name: string;
    start_time: string;
    end_time: string;
    date: string;
}

export const mockBookings: MockBooking[] = [
    {
        id: 'b1',
        time_slot_id: `ts-c1-${today}-8`,
        player_id: 'p1',
        player: mockPlayers[0],
        status: 'confirmed',
        court_fee: 150,
        booking_fee: 15,
        gst: 8.25,
        total: 173.25,
        amount_paid: 173.25,
        payment_method: 'card_online',
        court_name: 'Court 1',
        facility_name: 'Padel Arena Dubai',
        start_time: '08:00',
        end_time: '09:00',
        date: today,
    },
    {
        id: 'b2',
        time_slot_id: `ts-c1-${today}-11`,
        player_id: 'p2',
        player: mockPlayers[1],
        status: 'checked_in',
        court_fee: 150,
        booking_fee: 15,
        gst: 8.25,
        total: 173.25,
        amount_paid: 173.25,
        payment_method: 'apple_pay',
        court_name: 'Court 1',
        facility_name: 'Padel Arena Dubai',
        start_time: '11:00',
        end_time: '12:00',
        date: today,
    },
    {
        id: 'b3',
        time_slot_id: `ts-c4-${today}-14`,
        player_id: 'p1',
        player: mockPlayers[0],
        status: 'completed',
        court_fee: 120,
        booking_fee: 12,
        gst: 6.6,
        total: 138.6,
        amount_paid: 138.6,
        payment_method: 'cash',
        court_name: 'Court A',
        facility_name: 'SportCity Courts',
        start_time: '14:00',
        end_time: '15:00',
        date: '2026-02-08',
    },
    {
        id: 'b4',
        time_slot_id: `ts-c4-${today}-8`,
        player_id: 'p1',
        player: mockPlayers[0],
        status: 'confirmed',
        court_fee: 120,
        booking_fee: 12,
        gst: 6.6,
        total: 138.6,
        amount_paid: 138.6,
        payment_method: 'bank_transfer',
        court_name: 'Court B',
        facility_name: 'SportCity Courts',
        start_time: '08:00',
        end_time: '09:00',
        date: today,
    },
    {
        id: 'b5',
        time_slot_id: `ts-c2-${today}-11`,
        player_id: 'p1',
        player: mockPlayers[0],
        status: 'completed',
        court_fee: 150,
        booking_fee: 15,
        gst: 8.25,
        total: 173.25,
        amount_paid: 173.25,
        payment_method: 'card_online',
        court_name: 'Court 2',
        facility_name: 'Padel Arena Dubai',
        start_time: '11:00',
        end_time: '12:00',
        date: '2026-02-05',
    },
    {
        id: 'b6',
        time_slot_id: `ts-c3-${today}-8`,
        player_id: 'p1',
        player: mockPlayers[0],
        status: 'cancelled',
        court_fee: 200,
        booking_fee: 20,
        gst: 11,
        total: 231,
        amount_paid: 0,
        payment_method: 'card_online',
        court_name: 'Court 3',
        facility_name: 'Padel Arena Dubai',
        start_time: '08:00',
        end_time: '09:00',
        date: '2026-01-28',
    },
];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
    card_online: 'Card (Online)',
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    apple_pay: 'Apple Pay',
};
