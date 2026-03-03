import { BarChart3, CalendarDays, Plus, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockBookings } from '../../utils/mockData';
import { Card, CardContent } from '../../components/ui/card';
import { path } from '../../navigation/commanPaths';

const menuItems = [
    {
        icon: CalendarDays,
        label: 'Bookings',
        path: '/manager/bookings',
        color: 'bg-primary/10 text-primary',
    },
    {
        icon: Users,
        label: 'Players',
        path: '/manager/players',
        color: 'bg-success/10 text-success',
    },
    {
        icon: Plus,
        label: 'On-site Booking',
        path: '/manager/onsite-booking',
        color: 'bg-primary/10 text-primary',
    },
    {
        icon: BarChart3,
        label: 'Analytics',
        path: '/manager/analytics',
        color: 'bg-destructive/10 text-destructive',
    },
    {
        icon: Settings,
        label: 'Settings',
        path: path.settings,
        color: 'bg-muted text-muted-foreground',
    },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const todayBookings = mockBookings.filter(
        (b) => b.date === new Date().toISOString().split('T')[0],
    );
    const occupancy = Math.round((todayBookings.length / 15) * 100);

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
                                {occupancy}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Occupancy
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-foreground">
                                {todayBookings.length}
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

                {/* Today's Bookings */}
                <h3 className="mt-6 text-sm font-semibold text-foreground">
                    Upcoming Today
                </h3>
                <div className="mt-2 space-y-2 pb-6">
                    {todayBookings.map((b) => (
                        <Card
                            key={b.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/manager/booking/${b.id}`)}
                        >
                            <CardContent className="flex items-center justify-between p-3">
                                <div>
                                    <p className="font-medium text-foreground">
                                        {b.player.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {b.court_name} · {b.start_time} -{' '}
                                        {b.end_time}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        b.status === 'checked_in'
                                            ? 'bg-success/10 text-success'
                                            : 'bg-primary/10 text-primary'
                                    }`}
                                >
                                    {b.status.replace('_', ' ')}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                    {todayBookings.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No bookings today
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
