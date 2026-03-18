import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../utils/mockData';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { cn } from '../../utils/twMerge';
import { getAnalytics } from '../../api/adapters/analytics';
import { path } from '../../navigation/commanPaths';

const PERIODS: { label: string; value: AnalyticsPeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
];

const statusColors: Record<string, string> = {
    CONFIRMED: 'hsl(var(--primary))',
    COMPLETED: 'hsl(var(--success))',
    CANCELLED: 'hsl(var(--destructive))',
    NO_SHOW: 'hsl(var(--muted-foreground))',
    PENDING: 'hsl(var(--accent))',
};

const Analytics = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState<AnalyticsPeriod>('week');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = (params: AnalyticsParams) => {
        setLoading(true);
        getAnalytics(params)
            .then((res) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (period === 'custom') return;
        fetchData({ period });
    }, [period]);

    const handleCustomApply = () => {
        if (!customFrom || !customTo) return;
        fetchData({ period: 'custom', from: customFrom, to: customTo });
    };

    const statusData = (data?.bookingsByStatus ?? []).map((s) => ({
        name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
        value: s.count,
        status: s.status,
    }));

    return (
        <div className="min-h-screen bg-background">
            <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                <button
                    onClick={() => navigate(path.dashboard)}
                    className="rounded-full p-1 hover:bg-primary-foreground/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="font-semibold">Analytics</h1>
            </header>

            <main className="mx-auto max-w-lg px-4 pt-4 pb-8 space-y-4">
                {/* Period selector */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border',
                                period === p.value
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary/30',
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Custom date range */}
                {period === 'custom' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="flex-1 rounded-xl border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <span className="text-xs text-muted-foreground">
                            to
                        </span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="flex-1 rounded-xl border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <button
                            onClick={handleCustomApply}
                            disabled={!customFrom || !customTo}
                            className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                        >
                            Apply
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : !data ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-sm text-muted-foreground">
                            Failed to load analytics
                        </p>
                    </div>
                ) : (
                    <>
                        {/* KPIs */}
                        <div className="grid grid-cols-2 gap-3">
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-2xl font-bold text-primary">
                                        ₹{data.summary.totalRevenue.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Total Revenue
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-2xl font-bold text-foreground">
                                        {data.summary.totalBookings}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Bookings
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-2xl font-bold text-foreground">
                                        {data.summary.checkInRate}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Check-in Rate
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-2xl font-bold text-primary">
                                        ₹{data.summary.avgBookingValue.toFixed(0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Avg Booking Value
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue by Day */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-semibold text-foreground mb-3">
                                    Revenue by Day of Week
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={data.revenueByDayOfWeek}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="day"
                                            tick={{ fontSize: 12 }}
                                            stroke="hsl(var(--muted-foreground))"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            stroke="hsl(var(--muted-foreground))"
                                        />
                                        <Tooltip
                                            formatter={(v) =>
                                                `₹${Number(v).toLocaleString()}`
                                            }
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Bookings by Status */}
                        {statusData.length > 0 && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="text-sm font-semibold text-foreground mb-3">
                                        Bookings by Status
                                    </h3>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={200}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, value }) =>
                                                    `${name} (${value})`
                                                }
                                            >
                                                {statusData.map((s, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={
                                                            statusColors[
                                                                s.status
                                                            ] ??
                                                            COLORS[
                                                                i %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Legend */}
                                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                        {statusData.map((s, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                                            >
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            statusColors[
                                                                s.status
                                                            ] ??
                                                            COLORS[
                                                                i %
                                                                    COLORS.length
                                                            ],
                                                    }}
                                                />
                                                {s.name}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Analytics;
