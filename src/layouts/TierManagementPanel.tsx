import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ALL_PERKS, CLUB_NOTE, TIERS } from '../utils/mockData';
import {
    Check,
    ChevronRight,
    Gift,
    Loader2,
    Pencil,
    Save,
    Settings2,
    TrendingUp,
    Users,
    Lock,
} from 'lucide-react';
import { cn } from '../utils/twMerge';
import { Progress } from '../components/ui/progress';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '../components/ui/sheet';

const TierManagementPanel = ({
    // onClose,
    venueId,
}: TierManagementPanelProps) => {
    const queryClient = useQueryClient();
    const [selectedTier, setSelectedTier] = useState<TierInfo | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editSpend, setEditSpend] = useState(0);

    // Load tier config from DB when venueId is available
    const { data: tierConfigs } = useQuery({
        queryKey: ['manager-tier-config', venueId],
        queryFn: async () => {
            // if (!venueId) return null;
            // const { data } = await supabase
            //     .from('venue_tier_config')
            //     .select('*')
            //     .eq('venue_id', venueId);
            // return data || [];
        },
        enabled: !!venueId,
    });

    // When opening a tier detail, initialize edit values
    useEffect(() => {
        if (selectedTier && selectedTier.key !== 'club') {
            // const dbConfig = tierConfigs?.find(
            //     (c) => c.tier_name === selectedTier.key,
            // );
            // setEditSpend(dbConfig?.min_spend ?? selectedTier.thresholds.spend);
            setIsEditing(false);
        }
    }, [selectedTier, tierConfigs]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!venueId || !selectedTier || selectedTier.key === 'club')
                return;
            // const existing = tierConfigs?.find(
            //     (c) => c.tier_name === selectedTier.key,
            // );
            // if (existing) {
            //     const { error } = await supabase
            //         .from('venue_tier_config')
            //         .update({
            //             min_spend: editSpend,
            //             updated_at: new Date().toISOString(),
            //         })
            //         .eq('id', existing.id);
            //     if (error) throw error;
            // } else {
            //     const { error } = await supabase
            //         .from('venue_tier_config')
            //         .insert({
            //             venue_id: venueId,
            //             tier_name: selectedTier.key,
            //             min_spend: editSpend,
            //         });
            //     if (error) throw error;
            // }
        },
        onSuccess: () => {
            toast.success('Tier thresholds updated');
            setIsEditing(false);
            queryClient.invalidateQueries({
                queryKey: ['manager-tier-config', venueId],
            });
        },
        onError: (err: any) => toast.error(err.message),
    });

    const totalPlayers = TIERS.reduce((s, t) => s + t.playerCount, 0);

    return (
        <div className="space-y-5">
            {/* Combined Tier Distribution + Feature Access */}
            <div className="rounded-xl border bg-card p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                        Tiers & Features
                    </h3>
                </div>

                <div className="space-y-3">
                    {TIERS.map((tier) => {
                        const pct =
                            totalPlayers > 0
                                ? Math.round(
                                      (tier.playerCount / totalPlayers) * 100,
                                  )
                                : 0;
                        const Icon = tier.icon;
                        const tierIndex = TIERS.findIndex(
                            (t) => t.key === tier.key,
                        );
                        const accessiblePerks = ALL_PERKS.filter(
                            (p) =>
                                TIERS.findIndex((t) => t.key === p.tierMin) <=
                                tierIndex,
                        );

                        return (
                            <button
                                key={tier.key}
                                onClick={() => setSelectedTier(tier)}
                                className={cn(
                                    'w-full rounded-xl border p-4 text-left hover:shadow-md transition-all',
                                    tier.border,
                                )}
                            >
                                {/* Tier header row */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                                            tier.bg,
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'h-5 w-5',
                                                tier.color,
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-foreground">
                                                {tier.label}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-medium text-foreground">
                                                    {tier.playerCount}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({pct}%)
                                                </span>
                                            </div>
                                        </div>
                                        <Progress
                                            value={pct}
                                            className="h-1.5"
                                        />
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 ml-1" />
                                </div>

                                {/* Feature pills */}
                                <div className="flex flex-wrap gap-1.5 mt-3 ml-[52px]">
                                    {ALL_PERKS.map((perk) => {
                                        const hasAccess =
                                            accessiblePerks.includes(perk);
                                        const PerkIcon = perk.icon;
                                        return (
                                            <span
                                                key={perk.id}
                                                className={cn(
                                                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    hasAccess
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted/60 text-muted-foreground/40 line-through',
                                                )}
                                            >
                                                <PerkIcon className="h-2.5 w-2.5" />
                                                {perk.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Revenue by Tier — at the bottom */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                        Revenue by Tier
                    </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {TIERS.map((tier) => {
                        const Icon = tier.icon;
                        return (
                            <div
                                key={tier.key}
                                className={cn(
                                    'rounded-lg border p-3 text-center',
                                    tier.border,
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-4 w-4 mx-auto mb-1',
                                        tier.color,
                                    )}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {tier.label}
                                </p>
                                <p className="text-sm font-bold text-foreground mt-0.5">
                                    ₹{(tier.revenue / 1000).toFixed(1)}k
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {tier.playerCount} players
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tier Detail Sheet */}
            <Sheet
                open={!!selectedTier}
                onOpenChange={() => setSelectedTier(null)}
            >
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            {selectedTier &&
                                (() => {
                                    const Icon = selectedTier.icon;
                                    return (
                                        <>
                                            <div
                                                className={cn(
                                                    'h-8 w-8 rounded-full flex items-center justify-center',
                                                    selectedTier.bg,
                                                )}
                                            >
                                                <Icon
                                                    className={cn(
                                                        'h-4 w-4',
                                                        selectedTier.color,
                                                    )}
                                                />
                                            </div>
                                            {selectedTier.label} Tier
                                        </>
                                    );
                                })()}
                        </SheetTitle>
                    </SheetHeader>

                    {selectedTier && (
                        <div className="mt-6 space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border p-3 text-center">
                                    <p className="text-lg font-bold text-foreground">
                                        {selectedTier.playerCount}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Players
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3 text-center">
                                    <p className="text-lg font-bold text-foreground">
                                        {'₹'}{' '}
                                        {(selectedTier.revenue / 1000).toFixed(
                                            1,
                                        )}
                                        k
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Revenue
                                    </p>
                                </div>
                            </div>

                            {/* Qualification Criteria */}
                            <div className="rounded-xl border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                                        Qualification Criteria
                                    </h4>
                                    {selectedTier.key !== 'club' &&
                                        !isEditing && (
                                            <button
                                                onClick={() =>
                                                    setIsEditing(true)
                                                }
                                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit
                                            </button>
                                        )}
                                </div>
                                {selectedTier.key === 'club' ? (
                                    <p className="text-sm text-muted-foreground">
                                        {CLUB_NOTE}
                                    </p>
                                ) : isEditing ? (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                                <span className="text-sm text-muted-foreground">
                                                    Min Spend (₹)
                                                </span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={editSpend}
                                                    onChange={(e) =>
                                                        setEditSpend(
                                                            +e.target.value,
                                                        )
                                                    }
                                                    className="w-24 rounded-md border bg-background px-2 py-1 text-sm font-semibold text-foreground text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() =>
                                                    saveMutation.mutate()
                                                }
                                                disabled={
                                                    saveMutation.isPending
                                                }
                                                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {saveMutation.isPending ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Save className="h-3 w-3" />
                                                )}
                                                Save
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setIsEditing(false)
                                                }
                                                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                                <span className="text-sm text-muted-foreground">
                                                    Min Spend
                                                </span>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {'₹'}{' '}
                                                    {/* {(
                                                        tierConfigs?.find(
                                                            (c) =>
                                                                c.tier_name ===
                                                                selectedTier.key,
                                                        // )?.min_spend ??
                                                        selectedTier.thresholds
                                                            .spend
                                                    ).toLocaleString()} */}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Players must reach this spend within
                                            the 8-month rolling window.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Perks & Features */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-muted-foreground" />
                                    Features & Perks
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Features are enabled or disabled at the
                                    venue level. Per-tier customization is not
                                    available.
                                </p>
                                {ALL_PERKS.map((perk) => {
                                    const Icon = perk.icon;
                                    const hasAccess =
                                        TIERS.findIndex(
                                            (t) => t.key === perk.tierMin,
                                        ) <=
                                        TIERS.findIndex(
                                            (t) => t.key === selectedTier.key,
                                        );
                                    return (
                                        <div
                                            key={perk.id}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg border p-3 transition-opacity',
                                                !hasAccess && 'opacity-40',
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    hasAccess
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground',
                                                )}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">
                                                    {perk.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {perk.description}
                                                </p>
                                            </div>
                                            {hasAccess ? (
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                            ) : (
                                                <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tier Benefits Summary */}
                            <div className="rounded-xl bg-muted/30 border p-4 space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Benefits Summary
                                </h4>
                                {selectedTier.key === 'club' && (
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>
                                            • Access to credit packages for
                                            discounted play
                                        </li>
                                        <li>• Standard booking access</li>
                                        <li>
                                            • Progress tracking toward Pro tier
                                        </li>
                                    </ul>
                                )}
                                {selectedTier.key === 'pro' && (
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• All Club benefits</li>
                                        <li>
                                            • Court Hold: reserve courts for 30
                                            min
                                        </li>
                                        <li>
                                            • Open to Cancel: list slots for
                                            takeover
                                        </li>
                                        <li>
                                            • Progress tracking toward Elite
                                            tier
                                        </li>
                                    </ul>
                                )}
                                {selectedTier.key === 'elite' && (
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• All Pro benefits</li>
                                        <li>• Early Booking Window access</li>
                                        <li>
                                            • Priority slot access before
                                            general availability
                                        </li>
                                        <li>• Highest tier recognition</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default TierManagementPanel;
