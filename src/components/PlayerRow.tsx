import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Gift,
    TrendingDown,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { Separator } from '@radix-ui/react-select';

const tierColor: Record<string, string> = {
    CLUB: 'bg-accent text-accent-foreground',
    Club: 'bg-accent text-accent-foreground',
    PRO: 'bg-primary/10 text-primary',
    Pro: 'bg-primary/10 text-primary',
    ELITE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Elite: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const sourceConfig: Record<
    string,
    { label: string; icon: typeof TrendingUp; colorClass: string }
> = {
    PACKAGE_PURCHASE: { label: 'Purchase', icon: TrendingUp, colorClass: 'text-green-500' },
    BOOKING_PAYMENT: { label: 'Booking', icon: TrendingDown, colorClass: 'text-destructive' },
    REFUND: { label: 'Refund', icon: XCircle, colorClass: 'text-primary' },
    PROMO: { label: 'Promo', icon: Gift, colorClass: 'text-green-500' },
    ADMIN_ADJUSTMENT: { label: 'Adjustment', icon: Clock, colorClass: 'text-muted-foreground' },
};

export function PlayerRow({ player }: { player: PlayerWallet }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="overflow-hidden">
            <button
                className="w-full text-left"
                onClick={() => setExpanded(!expanded)}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground truncate">
                                    {player.name}
                                </p>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] shrink-0 ${tierColor[player.tier] || ''}`}
                                >
                                    {player.tier}
                                </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {player.phone}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p
                                    className={`text-lg font-bold ${player.creditBalance > 0 ? 'text-green-500' : 'text-muted-foreground'}`}
                                >
                                    ₹{player.creditBalance.toLocaleString('en-IN')}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    balance
                                </p>
                            </div>
                            {expanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                        </div>
                    </div>

                    {/* Summary chips */}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full bg-muted px-2.5 py-0.5">
                            Purchased: ₹{player.totalPurchased.toLocaleString('en-IN')}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5">
                            Spent: ₹{player.totalSpent.toLocaleString('en-IN')}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5">
                            Last active:{' '}
                            {new Date(player.lastActive).toLocaleDateString(
                                'en-GB',
                                { day: 'numeric', month: 'short' },
                            )}
                        </span>
                    </div>
                </CardContent>
            </button>

            {expanded && (
                <>
                    <Separator />
                    <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-2 bg-muted/30">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Transaction History
                        </p>
                        {player.transactions.length === 0 && (
                            <p className="text-xs text-muted-foreground py-2">
                                No transactions yet
                            </p>
                        )}
                        {player.transactions.map((tx) => {
                            const cfg = sourceConfig[tx.source] ?? {
                                label: tx.source,
                                icon: Clock,
                                colorClass: 'text-muted-foreground',
                            };
                            const Icon = cfg.icon;
                            const amount = Number(tx.amount);
                            const isCredit = tx.type === 'CREDIT';
                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between py-1.5"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Icon
                                            className={`h-3.5 w-3.5 shrink-0 ${cfg.colorClass}`}
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {tx.note ?? cfg.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {cfg.label} ·{' '}
                                                {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-xs font-semibold tabular-nums shrink-0 ${isCredit ? 'text-green-500' : 'text-destructive'}`}
                                    >
                                        {isCredit ? '+' : '-'}₹
                                        {Math.abs(amount).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </Card>
    );
}
