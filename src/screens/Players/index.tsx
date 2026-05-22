import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tierConfig } from '../../utils/mockData';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    ChevronRight,
    Clock,
    Gift,
    Loader2,
    Search,
    Star,
    TrendingUp,
    Trophy,
    Users,
    Wallet,
} from 'lucide-react';
import { cn } from '../../utils/twMerge';
import TierManagementPanel from '../../layouts/TierManagementPanel';
import { path } from '../../navigation/commanPaths';
import {
    getPlayer,
    getPlayerStats,
    listPlayers,
} from '../../api/adapters/players';

// ── Tier helpers ──────────────────────────────────────────────────────────────

const TIER_RANK: Record<string, number> = { CLUB: 1, PRO: 2, ELITE: 3 };
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function effectiveTierFor(p: PlayerApiModel): PlayerApiTier {
    const ranks: number[] = [TIER_RANK[p.tier] ?? 1];
    if (p.packageTier && p.packageGrantedAt) {
        if (Date.now() - new Date(p.packageGrantedAt).getTime() < SIX_MONTHS_MS)
            ranks.push(TIER_RANK[p.packageTier] ?? 1);
    }
    if (p.graceTier && p.graceUntil && new Date() < new Date(p.graceUntil))
        ranks.push(TIER_RANK[p.graceTier] ?? 1);
    const maxRank = Math.max(...ranks);
    return (Object.entries(TIER_RANK).find(([, r]) => r === maxRank)?.[0] ?? 'CLUB') as PlayerApiTier;
}

function tierSourceFor(p: PlayerApiModel): 'earned' | 'package' | 'grace' {
    if (p.packageTier && p.packageGrantedAt) {
        const age = Date.now() - new Date(p.packageGrantedAt).getTime();
        if (age < SIX_MONTHS_MS && (TIER_RANK[p.packageTier] ?? 1) >= (TIER_RANK[p.tier] ?? 1))
            return 'package';
    }
    if (p.graceTier && p.graceUntil && new Date() < new Date(p.graceUntil))
        return 'grace';
    return 'earned';
}

function packageExpiresIn(packageGrantedAt: string): string {
    const expiresAt = new Date(new Date(packageGrantedAt).getTime() + SIX_MONTHS_MS);
    const days = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'expired';
    if (days === 1) return '1 day left';
    if (days < 30) return `${days} days left`;
    return `until ${expiresAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLastVisit(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function formatMemberSince(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });
}

function getInitials(name: string | null | undefined): string {
    if (!name) return '-';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function toTierKey(tier: PlayerApiTier): TierKey {
    return tier.toLowerCase() as TierKey;
}

const sortByMap: Record<
    'spend' | 'bookings' | 'recent',
    'topSpend' | 'mostVisited' | 'recent'
> = {
    spend: 'topSpend',
    bookings: 'mostVisited',
    recent: 'recent',
};

const bookingStatusConfig: Record<
    BookingStatus,
    { label: string; style: string }
> = {
    CONFIRMED: { label: 'Confirmed', style: 'bg-primary/10 text-primary' },
    PENDING: {
        label: 'Pending',
        style: 'bg-yellow-100 text-yellow-700',
    },
    COMPLETED: {
        label: 'Completed',
        style: 'bg-muted text-muted-foreground',
    },
    CANCELLED: {
        label: 'Cancelled',
        style: 'bg-destructive/10 text-destructive',
    },
    NO_SHOW: {
        label: 'No Show',
        style: 'bg-orange-100 text-orange-700',
    },
};

// ── Component ─────────────────────────────────────────────────────────────────

const Players = () => {
    const navigate = useNavigate();
    const [mainTab, setMainTab] = useState<MainTab>('players');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'spend' | 'bookings' | 'recent'>(
        'spend',
    );
    const [tierFilter, setTierFilter] = useState<TierKey | 'all'>('all');

    // ── Stats ──────────────────────────────────────────────────────────────────
    const [stats, setStats] = useState<PlayerStatsResponse['data'] | null>(
        null,
    );

    // ── Player list ────────────────────────────────────────────────────────────
    const [players, setPlayers] = useState<PlayerApiModel[]>([]);
    const [playersLoading, setPlayersLoading] = useState(true);

    // ── Player detail ──────────────────────────────────────────────────────────
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [detail, setDetail] =
        useState<GetPlayerApiResponse['data'] | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch stats once
    useEffect(() => {
        getPlayerStats()
            .then((res) => setStats(res.data))
            .catch(() => {});
    }, []);

    // Fetch player list when sort/tier changes (immediate) or search changes (debounced)
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

        const delay = search ? 300 : 0;
        searchTimerRef.current = setTimeout(() => {
            setPlayersLoading(true);
            const params: ListPlayersApiParams = {
                sortBy: sortByMap[sortBy],
                limit: 100,
            };
            if (search.trim()) params.search = search.trim();
            if (tierFilter !== 'all')
                params.tier = tierFilter.toUpperCase() as PlayerApiTier;

            listPlayers(params)
                .then((res) => setPlayers(res.data.players))
                .catch(() => setPlayers([]))
                .finally(() => setPlayersLoading(false));
        }, delay);

        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [search, sortBy, tierFilter]);

    // Fetch detail when a player is selected
    useEffect(() => {
        if (!selectedUserId) {
            setDetail(null);
            return;
        }
        setDetailLoading(true);
        getPlayer(selectedUserId)
            .then((res) => setDetail(res.data))
            .catch(() => setDetail(null))
            .finally(() => setDetailLoading(false));
    }, [selectedUserId]);

    // ── Tier counts from stats API ─────────────────────────────────────────────
    const tierCounts: Record<string, number> = {
        all: stats?.totalPlayers ?? 0,
        club: stats?.tierCounts.CLUB ?? 0,
        pro: stats?.tierCounts.PRO ?? 0,
        elite: stats?.tierCounts.ELITE ?? 0,
    };

    // ── Detail panel ───────────────────────────────────────────────────────────
    if (selectedUserId) {
        if (detailLoading || !detail) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            );
        }

        const { player, tierBenefit, recentBookings } = detail;
        const effTier = effectiveTierFor(player);
        const source = tierSourceFor(player);
        const tierKey = toTierKey(effTier);
        const naturalTierKey = toTierKey(player.tier);
        const tier = tierConfig[tierKey];
        const TierIcon = tier.icon;
        const initials = getInitials(player.user.name);

        return (
            <div className="min-h-screen bg-background">
                <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                    <button
                        onClick={() => setSelectedUserId(null)}
                        className="rounded-full p-1 hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-semibold">Player Profile</h1>
                </header>

                <main className="mx-auto max-w-lg px-4 pt-5 pb-10 space-y-4">
                    {/* Identity */}
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-foreground">
                                    {player.user.name}
                                </h2>
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1',
                                        tier.bg,
                                        tier.color,
                                    )}
                                >
                                    <TierIcon className="h-3 w-3" />
                                    {tier.label}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {player.user.countryCode} {player.user.phone}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Member since{' '}
                                {formatMemberSince(player.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* KPI grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground font-medium">
                                    Total Bookings
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {player.totalBookings}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {player.completedBookings} completed ·{' '}
                                {player.cancelledBookings} cancelled
                            </p>
                        </div>
                        <div className="rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground font-medium">
                                    Total Spend
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                ₹
                                {parseFloat(player.totalSpend).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Avg ₹{player.avgSpend} / session
                            </p>
                        </div>
                        <div className="rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground font-medium">
                                    Weekly Streak
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {player.weeklyStreak}{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    wks
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Last visit:{' '}
                                {formatLastVisit(player.lastVisitedAt)}
                            </p>
                        </div>
                        <div className="rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Star className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground font-medium">
                                    Completion Rate
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {player.completionRate}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {player.completedBookings} of{' '}
                                {player.totalBookings} sessions
                            </p>
                        </div>
                    </div>

                    {/* Tier Status */}
                    <div className="rounded-xl border bg-card p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <TierIcon className={cn('h-4 w-4', tier.color)} />
                            Tier Status
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5',
                                    tier.bg,
                                    tier.color,
                                )}
                            >
                                <TierIcon className="h-3.5 w-3.5" />
                                {tier.label}
                            </span>
                            {source === 'package' && (
                                <span className="rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 px-2.5 py-1 text-[10px] font-bold">
                                    Package · {player.packageGrantedAt ? packageExpiresIn(player.packageGrantedAt) : ''}
                                </span>
                            )}
                            {source === 'grace' && (
                                <span className="rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2.5 py-1 text-[10px] font-bold">
                                    Grace period · until {player.graceUntil ? new Date(player.graceUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                                </span>
                            )}
                            {effTier !== 'ELITE' && source === 'earned' && (
                                <span className="text-xs text-muted-foreground">
                                    → Next: {effTier === 'CLUB' ? 'Pro' : 'Elite'}
                                </span>
                            )}
                        </div>
                        {source === 'package' && naturalTierKey !== tierKey && (
                            <div className="text-xs text-muted-foreground">
                                Natural tier: <span className="font-medium capitalize">{tierConfig[naturalTierKey].label}</span> · package overrides until expiry
                            </div>
                        )}
                        {source === 'earned' && effTier !== 'ELITE' && (
                            <div className="text-xs text-muted-foreground">
                                ₹{parseFloat(player.windowSpend).toLocaleString()} spent this window
                                {effTier === 'CLUB'
                                    ? ` · ₹${(15000 - parseFloat(player.windowSpend)).toLocaleString()} to Pro`
                                    : ` · ₹${(25000 - parseFloat(player.windowSpend)).toLocaleString()} to Elite`}
                            </div>
                        )}
                    </div>

                    {/* Tier Perks */}
                    {tierBenefit && (
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-primary" />
                                Tier Perks
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {tierBenefit.bookingDiscountPct > 0 && (
                                    <div className="rounded-lg bg-muted px-3 py-2">
                                        <p className="font-semibold text-foreground">
                                            {tierBenefit.bookingDiscountPct}% off
                                        </p>
                                        <p className="text-muted-foreground">
                                            Booking discount
                                        </p>
                                    </div>
                                )}
                                {tierBenefit.canHoldCourt && (
                                    <div className="rounded-lg bg-muted px-3 py-2">
                                        <p className="font-semibold text-foreground">
                                            {tierBenefit.holdDurationMinutes} min
                                        </p>
                                        <p className="text-muted-foreground">
                                            Court hold
                                        </p>
                                    </div>
                                )}
                                {tierBenefit.earlyAccessHours > 0 && (
                                    <div className="rounded-lg bg-muted px-3 py-2">
                                        <p className="font-semibold text-foreground">
                                            {tierBenefit.earlyAccessHours}h early
                                        </p>
                                        <p className="text-muted-foreground">
                                            Booking access
                                        </p>
                                    </div>
                                )}
                                <div className="rounded-lg bg-muted px-3 py-2">
                                    <p className="font-semibold text-foreground">
                                        {tierBenefit.refundPercentage}%
                                    </p>
                                    <p className="text-muted-foreground">
                                        Refund within{' '}
                                        {tierBenefit.cancellationWindowHours}h
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preferences */}
                    <div className="rounded-xl border bg-card p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">
                            Preferences
                        </h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Favourite sport
                            </span>
                            <span className="font-medium text-foreground capitalize">
                                {player.preferences.favouriteSport.toLowerCase()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Favourite court
                            </span>
                            <span className="font-medium text-foreground">
                                {player.preferences.favouriteCourt}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Preferred time
                            </span>
                            <span className="font-medium text-foreground">
                                {player.preferences.preferredTime}
                            </span>
                        </div>
                    </div>

                    {/* Wallet */}
                    {player.user.wallet && (
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-primary" />
                                    Wallet
                                </h3>
                                <span className="text-base font-bold text-foreground">
                                    ₹
                                    {parseFloat(
                                        player.user.wallet.balance,
                                    ).toLocaleString()}
                                </span>
                            </div>
                            {player.user.wallet.transactions.length > 0 && (
                                <div className="space-y-2">
                                    {player.user.wallet.transactions
                                        .slice(0, 3)
                                        .map((txn) => (
                                            <div
                                                key={txn.id}
                                                className="flex items-center justify-between text-xs"
                                            >
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {txn.note}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {new Date(
                                                            txn.createdAt,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'font-semibold',
                                                        txn.type === 'CREDIT'
                                                            ? 'text-green-600'
                                                            : 'text-destructive',
                                                    )}
                                                >
                                                    {txn.type === 'CREDIT'
                                                        ? '+'
                                                        : '-'}
                                                    ₹{txn.amount}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Credit Plans */}
                    {player.user.packagePurchases?.length > 0 && (
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Gift className="h-4 w-4 text-primary" />
                                Credit Plans
                            </h3>
                            <div className="space-y-2">
                                {player.user.packagePurchases.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {p.package.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatMemberSince(
                                                    p.createdAt,
                                                )}{' '}
                                                · Unlocks{' '}
                                                {p.package.tierUnlock}
                                            </p>
                                        </div>
                                        <span className="font-semibold text-foreground">
                                            ₹{p.amountPaid}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Bookings */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">
                            Recent Bookings
                        </h3>
                        {recentBookings.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No recent bookings
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {recentBookings.map((b) => {
                                    const s =
                                        bookingStatusConfig[b.status] ??
                                        bookingStatusConfig.CONFIRMED;
                                    return (
                                        <div
                                            key={b.id}
                                            className="flex items-center gap-3 rounded-xl border bg-card p-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">
                                                    {b.court.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatLastVisit(
                                                        b.bookingDate,
                                                    )}{' '}
                                                    · {b.startTime}–{b.endTime}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {b.finalAmount > 0 && (
                                                    <span className="text-sm font-medium text-foreground">
                                                        ₹{b.finalAmount}
                                                    </span>
                                                )}
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                        s.style,
                                                    )}
                                                >
                                                    {s.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // ── List view ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background">
            <header className="bg-primary px-4 pb-5 pt-10 text-primary-foreground">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate(path.dashboard)}
                        className="rounded-full p-1 hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-semibold">Players</h1>
                </div>

                {/* Aggregate KPIs */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-primary-foreground/10 p-3 text-center">
                        <p className="text-xl font-bold">
                            {stats?.totalPlayers ?? '—'}
                        </p>
                        <p className="text-[11px] opacity-75">Total Players</p>
                    </div>
                    <div className="rounded-xl bg-primary-foreground/10 p-3 text-center">
                        <p className="text-xl font-bold">
                            {stats?.totalSessions ?? '—'}
                        </p>
                        <p className="text-[11px] opacity-75">Total Sessions</p>
                    </div>
                    <div className="rounded-xl bg-primary-foreground/10 p-3 text-center">
                        <p className="text-xl font-bold">
                            {stats
                                ? `₹${(stats.totalRevenue / 1000).toFixed(1)}k`
                                : '—'}
                        </p>
                        <p className="text-[11px] opacity-75">Total Revenue</p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-lg px-4 pt-4 pb-10">
                {/* Main tab toggle */}
                <div className="flex gap-1 rounded-xl bg-muted p-1 mb-4">
                    <button
                        onClick={() => setMainTab('players')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
                            mainTab === 'players'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground',
                        )}
                    >
                        <Users className="h-3.5 w-3.5" />
                        Players
                    </button>
                    <button
                        onClick={() => setMainTab('tiers')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
                            mainTab === 'tiers'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground',
                        )}
                    >
                        <BarChart3 className="h-3.5 w-3.5" />
                        Tier Management
                    </button>
                </div>

                {mainTab === 'tiers' ? (
                    <TierManagementPanel
                        onClose={() => setMainTab('players')}
                    />
                ) : (
                    <>
                        {/* Search */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or phone…"
                                className="w-full rounded-xl border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </div>

                        {/* Tier filter chips */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                            {(['all', 'club', 'pro', 'elite'] as const).map(
                                (t) => {
                                    const isAll = t === 'all';
                                    const conf = isAll ? null : tierConfig[t];
                                    const Icon = conf?.icon;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setTierFilter(t)}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border',
                                                tierFilter === t
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-card text-muted-foreground border-border hover:border-primary/30',
                                            )}
                                        >
                                            {Icon && (
                                                <Icon className="h-3 w-3" />
                                            )}
                                            {isAll ? 'All' : conf?.label}
                                            <span
                                                className={cn(
                                                    'rounded-full px-1.5 py-px text-[10px] ml-0.5',
                                                    tierFilter === t
                                                        ? 'bg-primary-foreground/20'
                                                        : 'bg-muted',
                                                )}
                                            >
                                                {tierCounts[t] ?? 0}
                                            </span>
                                        </button>
                                    );
                                },
                            )}
                        </div>

                        {/* Sort tabs */}
                        <div className="flex gap-2 mb-4">
                            {(['spend', 'bookings', 'recent'] as const).map(
                                (s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSortBy(s)}
                                        className={cn(
                                            'flex-1 rounded-lg py-2 text-xs font-semibold transition-all capitalize',
                                            sortBy === s
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                        )}
                                    >
                                        {s === 'spend'
                                            ? 'Top Spend'
                                            : s === 'bookings'
                                              ? 'Most Visited'
                                              : 'Recent'}
                                    </button>
                                ),
                            )}
                        </div>

                        {/* Player list */}
                        {playersLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : players.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">
                                    No players match your filters
                                </p>
                                <button
                                    onClick={() => {
                                        setTierFilter('all');
                                        setSearch('');
                                    }}
                                    className="mt-2 text-xs text-primary font-medium hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {players.map((player, idx) => {
                                    const effTier = effectiveTierFor(player);
                                    const source = tierSourceFor(player);
                                    const tierKey = toTierKey(effTier);
                                    const tier = tierConfig[tierKey];
                                    const TierIcon = tier.icon;
                                    return (
                                        <button
                                            key={player.id}
                                            onClick={() =>
                                                setSelectedUserId(player.userId)
                                            }
                                            className="w-full rounded-xl border bg-card p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left"
                                        >
                                            {sortBy !== 'recent' && (
                                                <span className="text-xs font-bold text-muted-foreground/50 w-4 shrink-0">
                                                    {idx + 1}
                                                </span>
                                            )}
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                {getInitials(player.user.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {player.user.name}
                                                    </p>
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-1.5 py-px text-[9px] font-bold shrink-0 flex items-center gap-0.5',
                                                            tier.bg,
                                                            tier.color,
                                                        )}
                                                    >
                                                        <TierIcon className="h-2.5 w-2.5" />
                                                        {tier.label}
                                                    </span>
                                                    {source === 'package' && (
                                                        <span className="rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-px text-[9px] font-bold shrink-0">
                                                            PKG
                                                        </span>
                                                    )}
                                                    {source === 'grace' && (
                                                        <span className="rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-px text-[9px] font-bold shrink-0">
                                                            GRACE
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {player.totalBookings}{' '}
                                                        sessions
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatLastVisit(
                                                            player.lastVisitedAt,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-foreground">
                                                    ₹
                                                    {parseFloat(
                                                        player.totalSpend,
                                                    ).toLocaleString()}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    avg ₹{player.avgSpend}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Top player callout */}
                        {!playersLoading &&
                            sortBy === 'spend' &&
                            players.length > 0 && (
                                <div className="mt-6 rounded-xl border bg-card p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Trophy className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Top Player This Month
                                        </h3>
                                    </div>
                                    {(() => {
                                        const top = players[0];
                                        const topTierKey = toTierKey(
                                            top.tier,
                                        );
                                        const topTier =
                                            tierConfig[topTierKey];
                                        const TopIcon = topTier.icon;
                                        return (
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                                                        topTier.bg,
                                                        topTier.color,
                                                    )}
                                                >
                                                    {getInitials(
                                                        top.user.name,
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {top.user.name}
                                                        </p>
                                                        <span
                                                            className={cn(
                                                                'rounded-full px-1.5 py-px text-[9px] font-bold flex items-center gap-0.5',
                                                                topTier.bg,
                                                                topTier.color,
                                                            )}
                                                        >
                                                            <TopIcon className="h-2.5 w-2.5" />
                                                            {topTier.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        ₹
                                                        {parseFloat(
                                                            top.totalSpend,
                                                        ).toLocaleString()}{' '}
                                                        ·{' '}
                                                        {top.totalBookings}{' '}
                                                        sessions
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Players;
