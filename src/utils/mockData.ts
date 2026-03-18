import {
    CalendarCheck,
    Clock,
    Crown,
    Gift,
    Shield,
    Star,
    Zap,
} from 'lucide-react';

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
    const slots = [];
    let idx = 0;
    for (let h = 7; h < 22; h++) {
        for (const m of [0, 30]) {
            const endH = m === 30 ? h + 1 : h;
            const endM = m === 30 ? 0 : 30;
            const startStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
            slots.push({
                id: `ts-${courtId}-${date}-${startStr}`,
                court_id: courtId,
                date,
                start_time: startStr,
                end_time: endStr,
                status: (idx % 3 === 1
                    ? 'booked'
                    : idx % 5 === 0
                      ? 'blocked'
                      : 'available') as 'available' | 'booked' | 'blocked',
            });
            idx++;
        }
    }
    return slots;
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

export const mockPlayerInsights: PlayerInsight[] = [
    {
        id: 'p1',
        name: 'Ahmad Hassan',
        phone: '+971 50 123 4567',
        email: 'ahmad@email.com',
        avatar: 'AH',
        joinedDate: 'Jan 2025',
        totalBookings: 42,
        completedBookings: 38,
        cancelledBookings: 4,
        totalSpend: 6532,
        avgSpend: 172,
        lastVisit: 'Today',
        favouriteCourt: 'Padel Court 1',
        favouriteSport: 'Padel',
        favouriteTime: '08:00 – 09:00',
        streak: 6,
        tier: 'pro',
        recentBookings: [
            {
                date: 'Today',
                court: 'Padel Court 1',
                time: '08:00',
                status: 'confirmed',
                amount: 173,
            },
            {
                date: 'Feb 15',
                court: 'Padel Court 2',
                time: '10:00',
                status: 'completed',
                amount: 173,
            },
            {
                date: 'Feb 12',
                court: 'Padel Court 1',
                time: '08:00',
                status: 'completed',
                amount: 173,
            },
            {
                date: 'Feb 8',
                court: 'Padel Court 3',
                time: '18:00',
                status: 'completed',
                amount: 173,
            },
        ],
    },
    {
        id: 'p2',
        name: 'Sarah Johnson',
        phone: '+971 55 234 5678',
        email: 'sarah@email.com',
        avatar: 'SJ',
        joinedDate: 'Mar 2025',
        totalBookings: 27,
        completedBookings: 24,
        cancelledBookings: 3,
        totalSpend: 4158,
        avgSpend: 154,
        lastVisit: 'Yesterday',
        favouriteCourt: 'Pickleball Court 1',
        favouriteSport: 'Pickleball',
        favouriteTime: '11:00 – 12:00',
        streak: 3,
        tier: 'pro',
        recentBookings: [
            {
                date: 'Feb 18',
                court: 'Pickleball Court 1',
                time: '11:00',
                status: 'checked_in',
                amount: 200,
            },
            {
                date: 'Feb 14',
                court: 'Pickleball Court 2',
                time: '11:00',
                status: 'completed',
                amount: 200,
            },
            {
                date: 'Feb 10',
                court: 'Pickleball Court 1',
                time: '09:00',
                status: 'completed',
                amount: 200,
            },
        ],
    },
    {
        id: 'p3',
        name: 'Mike Chen',
        phone: '+971 52 345 6789',
        email: 'mike@email.com',
        avatar: 'MC',
        joinedDate: 'Jun 2025',
        totalBookings: 15,
        completedBookings: 13,
        cancelledBookings: 2,
        totalSpend: 2295,
        avgSpend: 153,
        lastVisit: 'Feb 16',
        favouriteCourt: 'Padel Court 2',
        favouriteSport: 'Padel',
        favouriteTime: '19:00 – 20:00',
        streak: 1,
        tier: 'club',
        recentBookings: [
            {
                date: 'Feb 16',
                court: 'Padel Court 2',
                time: '19:00',
                status: 'completed',
                amount: 150,
            },
            {
                date: 'Feb 9',
                court: 'Padel Court 1',
                time: '20:00',
                status: 'completed',
                amount: 150,
            },
            {
                date: 'Feb 2',
                court: 'Padel Court 2',
                time: '19:00',
                status: 'cancelled',
                amount: 0,
            },
        ],
    },
    {
        id: 'p4',
        name: 'Fatima Al-Said',
        phone: '+971 56 456 7890',
        email: 'fatima@email.com',
        avatar: 'FA',
        joinedDate: 'Sep 2024',
        totalBookings: 61,
        completedBookings: 58,
        cancelledBookings: 3,
        totalSpend: 10980,
        avgSpend: 180,
        lastVisit: 'Today',
        favouriteCourt: 'Padel Court 1',
        favouriteSport: 'Padel',
        favouriteTime: '07:00 – 08:00',
        streak: 12,
        tier: 'elite',
        recentBookings: [
            {
                date: 'Today',
                court: 'Padel Court 1',
                time: '07:00',
                status: 'confirmed',
                amount: 150,
            },
            {
                date: 'Feb 17',
                court: 'Padel Court 3',
                time: '07:00',
                status: 'completed',
                amount: 150,
            },
            {
                date: 'Feb 16',
                court: 'Padel Court 1',
                time: '07:00',
                status: 'completed',
                amount: 150,
            },
            {
                date: 'Feb 14',
                court: 'Padel Court 2',
                time: '08:00',
                status: 'completed',
                amount: 150,
            },
        ],
    },
    {
        id: 'p5',
        name: 'Omar Khalid',
        phone: '+971 54 567 8901',
        email: 'omar@email.com',
        avatar: 'OK',
        joinedDate: 'Nov 2025',
        totalBookings: 8,
        completedBookings: 7,
        cancelledBookings: 1,
        totalSpend: 1386,
        avgSpend: 173,
        lastVisit: 'Feb 10',
        favouriteCourt: 'Pickleball Court 3',
        favouriteSport: 'Pickleball',
        favouriteTime: '16:00 – 17:00',
        streak: 0,
        tier: 'club',
        recentBookings: [
            {
                date: 'Feb 10',
                court: 'Pickleball Court 3',
                time: '16:00',
                status: 'completed',
                amount: 200,
            },
            {
                date: 'Feb 3',
                court: 'Pickleball Court 1',
                time: '17:00',
                status: 'completed',
                amount: 200,
            },
        ],
    },
    {
        id: 'p6',
        name: 'Layla Mansoor',
        phone: '+971 50 678 9012',
        email: 'layla@email.com',
        avatar: 'LM',
        joinedDate: 'Aug 2025',
        totalBookings: 19,
        completedBookings: 17,
        cancelledBookings: 2,
        totalSpend: 3420,
        avgSpend: 180,
        lastVisit: 'Feb 17',
        favouriteCourt: 'Padel Court 2',
        favouriteSport: 'Padel',
        favouriteTime: '12:00 – 13:00',
        streak: 4,
        tier: 'pro',
        recentBookings: [
            {
                date: 'Feb 17',
                court: 'Padel Court 2',
                time: '12:00',
                status: 'completed',
                amount: 150,
            },
            {
                date: 'Feb 13',
                court: 'Padel Court 1',
                time: '13:00',
                status: 'completed',
                amount: 150,
            },
        ],
    },
];

export const tierConfig: Record<
    TierKey,
    { label: string; color: string; bg: string; icon: React.ElementType }
> = {
    club: {
        label: 'Club',
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        icon: Shield,
    },
    pro: {
        label: 'Pro',
        color: 'text-primary',
        bg: 'bg-primary/10',
        icon: Star,
    },
    elite: {
        label: 'Elite',
        color: 'text-accent-foreground',
        bg: 'bg-accent/20',
        icon: Crown,
    },
};

export const ALL_PERKS: PerkConfig[] = [
    {
        id: 'hold',
        label: 'Court Hold',
        description: 'Reserve a court for 30 min before paying',
        icon: Clock,
        enabled: true,
        tierMin: 'pro',
    },
    {
        id: 'otc',
        label: 'Open to Cancel',
        description: 'List booking for someone else to take over',
        icon: CalendarCheck,
        enabled: true,
        tierMin: 'club',
    },
    {
        id: 'early_window',
        label: 'Early Booking Window',
        description: 'Book slots before general availability',
        icon: Zap,
        enabled: true,
        tierMin: 'elite',
    },
    {
        id: 'credits',
        label: 'Credit Packages',
        description: 'Purchase discounted credit bundles',
        icon: Gift,
        enabled: true,
        tierMin: 'club',
    },
];

export const TIERS: TierInfo[] = [
    {
        key: 'club',
        label: 'Club',
        icon: Shield,
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        border: 'border-border',
        playerCount: 24,
        revenue: 12400,
        perks: ALL_PERKS.filter((p) => p.tierMin === 'club'),
        thresholds: { spend: 0 },
    },
    {
        key: 'pro',
        label: 'Pro',
        icon: Star,
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/30',
        playerCount: 12,
        revenue: 28600,
        perks: ALL_PERKS.filter((p) => ['club', 'pro'].includes(p.tierMin)),
        thresholds: { spend: 1500 },
    },
    {
        key: 'elite',
        label: 'Elite',
        icon: Crown,
        color: 'text-accent-foreground',
        bg: 'bg-accent/20',
        border: 'border-accent/40',
        playerCount: 4,
        revenue: 18200,
        perks: ALL_PERKS,
        thresholds: { spend: 4000 },
    },
];

export const CLUB_NOTE = 'Achieved after first booking at this venue';

export const statusConfig = {
    confirmed: { label: 'Confirmed', style: 'bg-primary/10 text-primary' },
    checked_in: { label: 'Checked in', style: 'bg-success/10 text-success' },
    completed: { label: 'Completed', style: 'bg-muted text-muted-foreground' },
    cancelled: {
        label: 'Cancelled',
        style: 'bg-destructive/10 text-destructive',
    },
};

export const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--destructive))',
    'hsl(var(--muted-foreground))',
];
