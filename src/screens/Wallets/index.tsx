import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs';
import { PlayerRow } from '../../components/PlayerRow';
import { getPlayerWallets } from '../../api/adapters/wallets';
import { path } from '../../navigation/commanPaths';

function toPlayerWallet(p: ApiPlayerWallet): PlayerWallet {
    return {
        id: p.userId,
        name: p.name,
        phone: p.phone,
        creditBalance: p.walletBalance,
        totalPurchased: p.totalPurchased,
        totalSpent: p.totalSpend,
        tier: p.tier ?? 'CLUB',
        lastActive: p.lastVisitedAt ?? new Date().toISOString(),
        isActive: p.isActive,
        transactions: p.transactions,
    };
}

const Wallets = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['playerWallets'],
        queryFn: getPlayerWallets,
    });

    const allPlayers = (data?.data.players ?? []).map(toPlayerWallet);
    const totals = data?.data.totals;

    const activeWallets = allPlayers.filter((p) => p.isActive);
    const pastWallets = allPlayers.filter((p) => !p.isActive);

    const filterBySearch = (players: PlayerWallet[]) =>
        players.filter(
            (p) =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.phone.includes(search),
        );

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-primary px-4 pb-6 pt-10 text-primary-foreground">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(path.dashboard)}
                        className="rounded-full bg-primary-foreground/20 p-1.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Player Wallets</h1>
                        <p className="text-xs opacity-80">
                            Credit balances &amp; usage
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-lg px-4 -mt-4 pb-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Wallet className="mx-auto h-5 w-5 text-primary mb-1" />
                            {isLoading ? (
                                <div className="h-8 w-24 mx-auto rounded bg-muted animate-pulse mt-1" />
                            ) : (
                                <p className="text-2xl font-bold text-primary">
                                    ₹
                                    {(
                                        totals?.totalActiveBalance ?? 0
                                    ).toLocaleString('en-IN')}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Active Balances
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                            {isLoading ? (
                                <div className="h-8 w-24 mx-auto rounded bg-muted animate-pulse mt-1" />
                            ) : (
                                <p className="text-2xl font-bold text-foreground">
                                    ₹
                                    {(
                                        totals?.totalLiability ?? 0
                                    ).toLocaleString('en-IN')}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Total Liability
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="active" className="mt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value="active" className="flex-1">
                            Active ({filterBySearch(activeWallets).length})
                        </TabsTrigger>
                        <TabsTrigger value="past" className="flex-1">
                            Past ({filterBySearch(pastWallets).length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-3 space-y-3">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-20 rounded-xl bg-muted animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : filterBySearch(activeWallets).length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No active wallets found
                            </p>
                        ) : (
                            filterBySearch(activeWallets).map((player) => (
                                <PlayerRow key={player.id} player={player} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="mt-3 space-y-3">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="h-20 rounded-xl bg-muted animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : filterBySearch(pastWallets).length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No past wallets found
                            </p>
                        ) : (
                            filterBySearch(pastWallets).map((player) => (
                                <PlayerRow key={player.id} player={player} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Wallets;
