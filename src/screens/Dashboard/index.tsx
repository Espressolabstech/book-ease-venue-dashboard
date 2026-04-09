import { useEffect, useState } from 'react';
import { BarChart3, CalendarDays, Loader2, Plus, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { path } from '../../navigation/commanPaths';
import { listVenueBookings } from '../../api/adapters/bookings';
import { cn, formatTime } from '../../utils/twMerge';

const menuItems = [
    {
        icon: CalendarDays,
        label: 'Bookings',
        path: path.listBooking,
        color: 'bg-primary/10 text-primary',
    },
    {
        icon: Users,
        label: 'Players',
        path: path.players,
        color: 'bg-success/10 text-success',
    },
    {
        icon: Plus,
        label: 'On-site Booking',
        path: path.bookings,
        color: 'bg-primary/10 text-primary',
    },
    {
        icon: BarChart3,
        label: 'Analytics',
        path: path.analytics,
        color: 'bg-destructive/10 text-destructive',
    },
    {
        icon: Settings,
        label: 'Settings',
        path: path.settings,
        color: 'bg-muted text-muted-foreground',
    },
];

const statusStyle: Record<BookingStatus, string> = {
    CONFIRMED: 'bg-primary/10 text-primary',
    PENDING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-muted text-muted-foreground',
    CANCELLED: 'bg-destructive/10 text-destructive',
    NO_SHOW: 'bg-orange-100 text-orange-700',
};

const statusLabel: Record<BookingStatus, string> = {
    CONFIRMED: 'Confirmed',
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<BookingModel[]>([]);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        listVenueBookings({ date: today, limit: 100 })
            .then((res) => {
                setBookings(res.data.bookings);
                setTotal(res.data.pagination.total);
            })
            .catch(() => {
                setBookings([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, []);

    const occupancy =
        total !== null ? Math.round((total / 15) * 100) : null;

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-primary px-4 pb-6 pt-10 text-primary-foreground">
                <h1 className="text-xl font-bold">Manager Dashboard</h1>
                <p className="text-sm opacity-80">Padel Arena Dubai</p>
            </header>

            <main className="mx-auto max-w-lg px-4 -mt-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-primary">
                                {occupancy !== null ? `${occupancy}%` : '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Occupancy
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-foreground">
                                {total !== null ? total : '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Today's Bookings
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Menu Grid */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    {menuItems.map((item) => (
                        <Card
                            key={item.label}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent className="flex flex-col items-center gap-2 p-4">
                                <div
                                    className={`rounded-xl p-2.5 ${item.color}`}
                                >
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-foreground">
                                    {item.label}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Upcoming Today */}
                <h3 className="mt-6 text-sm font-semibold text-foreground">
                    Upcoming Today
                </h3>
                <div className="mt-2 space-y-2 pb-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    ) : bookings.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No bookings today
                        </p>
                    ) : (
                        bookings.map((b) => (
                            <Card
                                key={b.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() =>
                                    navigate(`/manager/booking/${b.id}`)
                                }
                            >
                                <CardContent className="flex items-center justify-between p-3">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {b.user?.name ?? '—'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {b.court?.name} · {formatTime(b.startTime)} –{' '}
                                            {formatTime(b.endTime)}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-0.5 text-xs font-medium',
                                            statusStyle[b.status],
                                        )}
                                    >
                                        {statusLabel[b.status]}
                                    </span>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
