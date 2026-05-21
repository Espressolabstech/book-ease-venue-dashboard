import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Search,
    Plus,
    Users,
    ChevronRight,
    Settings2,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '../../components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/ui/dialog';
import {
    getPrivateClubConfig,
    updatePrivateClubConfig,
    listClubMembers,
    addClubMember,
    adjustPoints,
    allocateMonthlyPoints,
    updateClubMember,
    getClubMember,
} from '../../api/adapters/privateClub';
import { path } from '../../navigation/commanPaths';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return n.toLocaleString('en-IN');
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

const TX_LABELS: Record<PointsTransactionType, string> = {
    OPENING_BALANCE: 'Opening Balance',
    MONTHLY_ALLOWANCE: 'Monthly Allowance',
    ADMIN_CREDIT: 'Admin Credit',
    ADMIN_DEBIT: 'Admin Debit',
    BOOKING_DEDUCTION: 'Booking',
    BOOKING_REFUND: 'Booking Refund',
    EXPIRY_DEDUCTION: 'Points Expired',
    PENALTY: 'Penalty',
};

const CREDIT_TYPES: PointsTransactionType[] = [
    'OPENING_BALANCE',
    'MONTHLY_ALLOWANCE',
    'ADMIN_CREDIT',
    'BOOKING_REFUND',
];

// ── Sub-components ────────────────────────────────────────────────────────────

function PointsBadge({ balance }: { balance: number }) {
    const color =
        balance === 0
            ? 'bg-muted text-muted-foreground'
            : balance < 200
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700';
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
            {fmt(balance)} pts
        </span>
    );
}

function TransactionRow({ tx }: { tx: PointsTransaction }) {
    const isCredit = CREDIT_TYPES.includes(tx.type);
    return (
        <div className="flex items-start justify-between gap-2 py-2.5 border-b last:border-0">
            <div className="flex items-start gap-2">
                {isCredit ? (
                    <ArrowUpCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                ) : (
                    <ArrowDownCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                )}
                <div>
                    <p className="text-sm font-medium leading-tight">
                        {TX_LABELS[tx.type]}
                    </p>
                    {tx.note && (
                        <p className="text-xs text-muted-foreground">{tx.note}</p>
                    )}
                    {tx.booking && (
                        <p className="text-xs text-muted-foreground">
                            {tx.booking.court.name} · {fmtDate(tx.booking.bookingDate)}
                        </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                        {fmtDate(tx.createdAt)} {fmtTime(tx.createdAt)}
                    </p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p
                    className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-500'}`}
                >
                    {isCredit ? '+' : '-'}
                    {fmt(tx.points)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                    Bal: {fmt(tx.balanceAfter)}
                </p>
            </div>
        </div>
    );
}

function MemberCard({
    member,
    onClick,
}: {
    member: ClubMember;
    onClick: () => void;
}) {
    const balance = member.wallet?.balance ?? 0;
    return (
        <Card
            className="cursor-pointer active:scale-[0.99] transition-transform"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">
                                {member.name ?? 'Unnamed Member'}
                            </p>
                            {!member.clubPointsEnabled && (
                                <Badge variant="outline" className="text-[10px]">
                                    Inactive
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {member.countryCode} {member.phone}
                        </p>
                        {member.membershipId && (
                            <p className="text-xs text-muted-foreground">
                                ID: {member.membershipId}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <PointsBadge balance={balance} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                {member.wallet && (
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>
                            Monthly used:{' '}
                            <strong>{fmt(member.wallet.monthlyUsed)}</strong>
                        </span>
                        <span>
                            Allocated:{' '}
                            <strong>{fmt(member.wallet.monthlyAllocated)}</strong>
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Add Member Dialog ─────────────────────────────────────────────────────────

function AddMemberDialog({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        phone: '',
        countryCode: '+91',
        name: '',
        membershipId: '',
        openingPoints: '',
        customMonthlyPoints: '',
        clubNotes: '',
    });
    const [loading, setLoading] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((p) => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.phone.trim()) {
            toast.error('Phone number is required');
            return;
        }
        setLoading(true);
        try {
            await addClubMember({
                phone: form.phone.trim(),
                countryCode: form.countryCode.trim() || '+91',
                name: form.name.trim() || undefined,
                membershipId: form.membershipId.trim() || undefined,
                openingPoints: form.openingPoints ? parseInt(form.openingPoints) : undefined,
                customMonthlyPoints: form.customMonthlyPoints
                    ? parseInt(form.customMonthlyPoints)
                    : undefined,
                clubNotes: form.clubNotes.trim() || undefined,
            });
            toast.success('Member added');
            setForm({ phone: '', countryCode: '+91', name: '', membershipId: '', openingPoints: '', customMonthlyPoints: '', clubNotes: '' });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add Club Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="w-20">
                            <Label className="text-xs">Code</Label>
                            <Input
                                value={form.countryCode}
                                onChange={set('countryCode')}
                                placeholder="+91"
                            />
                        </div>
                        <div className="flex-1">
                            <Label className="text-xs">Phone *</Label>
                            <Input
                                value={form.phone}
                                onChange={set('phone')}
                                placeholder="9876543210"
                                type="tel"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Name</Label>
                        <Input value={form.name} onChange={set('name')} placeholder="Member name" />
                    </div>
                    <div>
                        <Label className="text-xs">Membership ID</Label>
                        <Input value={form.membershipId} onChange={set('membershipId')} placeholder="Optional" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">Opening Points</Label>
                            <Input
                                value={form.openingPoints}
                                onChange={set('openingPoints')}
                                placeholder="0"
                                type="number"
                                min={0}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Custom Monthly Pts</Label>
                            <Input
                                value={form.customMonthlyPoints}
                                onChange={set('customMonthlyPoints')}
                                placeholder="Uses venue default"
                                type="number"
                                min={1}
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Notes</Label>
                        <Input value={form.clubNotes} onChange={set('clubNotes')} placeholder="Optional" />
                    </div>
                </div>
                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Adding…' : 'Add Member'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Adjust Points Dialog ──────────────────────────────────────────────────────

function AdjustPointsDialog({
    open,
    member,
    currentBalance,
    onClose,
    onSuccess,
}: {
    open: boolean;
    member: ClubMember | ClubMemberDetail | null;
    currentBalance: number;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [type, setType] = useState<'ADMIN_CREDIT' | 'ADMIN_DEBIT'>('ADMIN_CREDIT');
    const [points, setPoints] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const preview =
        points && !isNaN(parseInt(points))
            ? type === 'ADMIN_CREDIT'
                ? currentBalance + parseInt(points)
                : currentBalance - parseInt(points)
            : null;

    const handleSubmit = async () => {
        if (!member) return;
        if (!points || parseInt(points) <= 0) {
            toast.error('Points must be a positive number');
            return;
        }
        if (!note.trim()) {
            toast.error('A note is required for audit trail');
            return;
        }
        if (type === 'ADMIN_DEBIT' && parseInt(points) > currentBalance) {
            toast.error(`Cannot debit more than current balance (${fmt(currentBalance)} pts)`);
            return;
        }
        setLoading(true);
        try {
            await adjustPoints({
                userId: member.id,
                type,
                points: parseInt(points),
                note: note.trim(),
            });
            toast.success(`Points ${type === 'ADMIN_CREDIT' ? 'added' : 'deducted'} successfully`);
            setPoints('');
            setNote('');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to adjust points');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Adjust Points</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-3 text-center">
                        <p className="text-xs text-muted-foreground">Current Balance</p>
                        <p className="text-2xl font-bold">{fmt(currentBalance)} pts</p>
                        {member && (
                            <p className="text-sm text-muted-foreground">
                                {member.name ?? member.phone}
                            </p>
                        )}
                    </div>

                    {/* Credit / Debit toggle */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setType('ADMIN_CREDIT')}
                            className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                                type === 'ADMIN_CREDIT'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-border text-muted-foreground'
                            }`}
                        >
                            <ArrowUpCircle className="mx-auto mb-1 h-5 w-5" />
                            Add Points
                        </button>
                        <button
                            onClick={() => setType('ADMIN_DEBIT')}
                            className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                                type === 'ADMIN_DEBIT'
                                    ? 'border-red-400 bg-red-50 text-red-600'
                                    : 'border-border text-muted-foreground'
                            }`}
                        >
                            <ArrowDownCircle className="mx-auto mb-1 h-5 w-5" />
                            Deduct Points
                        </button>
                    </div>

                    <div>
                        <Label className="text-xs">Points</Label>
                        <Input
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            placeholder="Enter points"
                            type="number"
                            min={1}
                        />
                    </div>

                    <div>
                        <Label className="text-xs">
                            Note <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Reason for adjustment (required)"
                        />
                    </div>

                    {preview !== null && (
                        <div className="rounded-lg border p-3 text-center">
                            <p className="text-xs text-muted-foreground">Balance after</p>
                            <p
                                className={`text-xl font-bold ${preview < 0 ? 'text-destructive' : 'text-foreground'}`}
                            >
                                {fmt(Math.max(0, preview))} pts
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        variant={type === 'ADMIN_DEBIT' ? 'destructive' : 'default'}
                    >
                        {loading ? 'Saving…' : type === 'ADMIN_CREDIT' ? 'Add Points' : 'Deduct Points'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Member Detail Sheet ───────────────────────────────────────────────────────

function MemberDetailSheet({
    memberId,
    open,
    onClose,
    onAdjust,
}: {
    memberId: string | null;
    open: boolean;
    onClose: () => void;
    onAdjust: (member: ClubMemberDetail, balance: number) => void;
}) {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['clubMember', memberId],
        queryFn: () => getClubMember(memberId!),
        enabled: !!memberId,
    });

    const detail = data?.data;
    const wallet = detail?.wallet;

    return (
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-2xl">
                <SheetHeader className="pb-2">
                    <SheetTitle className="flex items-center justify-between">
                        <span>Member Detail</span>
                        <button onClick={onClose}>
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </SheetTitle>
                </SheetHeader>

                {isLoading ? (
                    <div className="space-y-3 pt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : !detail ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        Failed to load member
                    </p>
                ) : (
                    <div className="space-y-5 pt-2">
                        {/* Identity */}
                        <div className="rounded-xl bg-muted/50 p-4 space-y-1">
                            <p className="font-semibold text-base">
                                {detail.member.name ?? 'Unnamed Member'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {detail.member.countryCode} {detail.member.phone}
                            </p>
                            {detail.member.membershipId && (
                                <p className="text-xs text-muted-foreground">
                                    Membership ID: {detail.member.membershipId}
                                </p>
                            )}
                            {detail.member.membershipExpiresAt && (
                                <p className="text-xs text-muted-foreground">
                                    Expires: {fmtDate(detail.member.membershipExpiresAt)}
                                </p>
                            )}
                            <div className="pt-1 flex items-center gap-2">
                                <div
                                    className={`h-2 w-2 rounded-full ${detail.member.clubPointsEnabled ? 'bg-green-500' : 'bg-muted-foreground'}`}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {detail.member.clubPointsEnabled ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Wallet Summary */}
                        {wallet ? (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-sm">Points Wallet</h3>
                                    <Button
                                        size="sm"
                                        onClick={() => onAdjust(detail.member, wallet.balance)}
                                    >
                                        Adjust Points
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <Card>
                                        <CardContent className="p-3 text-center">
                                            <p className="text-lg font-bold text-primary">
                                                {fmt(wallet.balance)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">Balance</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-3 text-center">
                                            <p className="text-lg font-bold">
                                                {fmt(wallet.monthlyAllocated)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">Monthly Alloc.</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-3 text-center">
                                            <p className="text-lg font-bold">
                                                {fmt(wallet.monthlyUsed)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">Used</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                {wallet.lastAllocationAt && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Last allocated: {fmtDate(wallet.lastAllocationAt)}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">
                                No wallet yet
                            </p>
                        )}

                        {/* Transaction History */}
                        {wallet && wallet.transactions.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Transaction History</h3>
                                <div className="rounded-xl border px-3">
                                    {wallet.transactions.map((tx: PointsTransaction) => (
                                        <TransactionRow key={tx.id} tx={tx} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Bookings */}
                        {detail.recentBookings.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Recent Bookings</h3>
                                <div className="space-y-2">
                                    {detail.recentBookings.map((b: GetClubMemberResponse['data']['recentBookings'][number]) => (
                                        <div
                                            key={b.id}
                                            className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{b.court.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {fmtDate(b.bookingDate)} · {b.startTime}–{b.endTime}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {b.pointsAmount != null && (
                                                    <p className="text-sm font-semibold text-primary">
                                                        {fmt(b.pointsAmount)} pts
                                                    </p>
                                                )}
                                                <Badge
                                                    variant={
                                                        b.status === 'CONFIRMED'
                                                            ? 'default'
                                                            : b.status === 'CANCELLED'
                                                              ? 'destructive'
                                                              : 'outline'
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {b.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {detail.member.clubNotes && (
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Notes</h3>
                                <p className="text-sm text-muted-foreground rounded-xl bg-muted/50 p-3">
                                    {detail.member.clubNotes}
                                </p>
                            </div>
                        )}

                        {/* Activate / Deactivate */}
                        <div className="flex items-center justify-between rounded-xl border p-3">
                            <div>
                                <p className="text-sm font-medium">Points Access</p>
                                <p className="text-xs text-muted-foreground">
                                    Allow this member to book using points
                                </p>
                            </div>
                            <ToggleAccess
                                memberId={detail.member.id}
                                enabled={detail.member.clubPointsEnabled}
                                onToggled={refetch}
                            />
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function ToggleAccess({
    memberId,
    enabled,
    onToggled,
}: {
    memberId: string;
    enabled: boolean;
    onToggled: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const toggle = async () => {
        setLoading(true);
        try {
            await updateClubMember(memberId, { clubPointsEnabled: !enabled });
            onToggled();
        } catch {
            toast.error('Failed to update access');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Switch
            checked={enabled}
            onCheckedChange={toggle}
            disabled={loading}
        />
    );
}

// ── Config Tab ────────────────────────────────────────────────────────────────

function ConfigTab() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['privateClubConfig'],
        queryFn: getPrivateClubConfig,
    });

    const config = data?.data.config;

    const [draft, setDraft] = useState<UpdatePrivateClubConfigPayload>({});
    const [saving, setSaving] = useState(false);
    const [allocating, setAllocating] = useState(false);

    useEffect(() => {
        if (config) {
            setDraft({
                isPrivateClub: config.isPrivateClub,
                pointsEnabled: config.pointsEnabled,
                monthlyPointsAllowance: config.monthlyPointsAllowance ?? undefined,
                allowanceResetDay: config.allowanceResetDay,
                allowanceCarryOver: config.allowanceCarryOver,
                pointsExpiryDays: config.pointsExpiryDays ?? undefined,
            });
        }
    }, [config]);

    const set = <K extends keyof UpdatePrivateClubConfigPayload>(
        k: K,
        v: UpdatePrivateClubConfigPayload[K],
    ) => setDraft((p) => ({ ...p, [k]: v }));

    const save = async () => {
        setSaving(true);
        try {
            await updatePrivateClubConfig(draft);
            queryClient.invalidateQueries({ queryKey: ['privateClubConfig'] });
            toast.success('Config saved');
        } catch {
            toast.error('Failed to save config');
        } finally {
            setSaving(false);
        }
    };

    const runAllocation = async () => {
        setAllocating(true);
        try {
            const res = await allocateMonthlyPoints();
            toast.success(
                `Allocated to ${res.data.allocated} members. Skipped: ${res.data.skipped}`,
            );
        } catch {
            toast.error('Failed to run allocation');
        } finally {
            setAllocating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3 pt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-2">
            {/* Enable toggles */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Private Club Mode</p>
                            <p className="text-xs text-muted-foreground">
                                Restrict access to approved members only
                            </p>
                        </div>
                        <Switch
                            checked={draft.isPrivateClub ?? false}
                            onCheckedChange={(v) => set('isPrivateClub', v)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Points System</p>
                            <p className="text-xs text-muted-foreground">
                                Allow members to book courts using points
                            </p>
                        </div>
                        <Switch
                            checked={draft.pointsEnabled ?? false}
                            onCheckedChange={(v) => set('pointsEnabled', v)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Carry Over Unused Points</p>
                            <p className="text-xs text-muted-foreground">
                                Roll unused monthly points to next month
                            </p>
                        </div>
                        <Switch
                            checked={draft.allowanceCarryOver ?? false}
                            onCheckedChange={(v) => set('allowanceCarryOver', v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Monthly allowance */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Monthly Points Allowance</h3>
                    <div>
                        <Label className="text-xs">Default Points per Member / Month</Label>
                        <Input
                            type="number"
                            min={0}
                            value={draft.monthlyPointsAllowance ?? ''}
                            onChange={(e) =>
                                set(
                                    'monthlyPointsAllowance',
                                    e.target.value ? parseInt(e.target.value) : null,
                                )
                            }
                            placeholder="e.g. 1000"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Individual members can have a custom override
                        </p>
                    </div>
                    <div>
                        <Label className="text-xs">Reset Day of Month (1–28)</Label>
                        <Input
                            type="number"
                            min={1}
                            max={28}
                            value={draft.allowanceResetDay ?? 1}
                            onChange={(e) => set('allowanceResetDay', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Points Expiry (days, leave blank = never)</Label>
                        <Input
                            type="number"
                            min={1}
                            value={draft.pointsExpiryDays ?? ''}
                            onChange={(e) =>
                                set(
                                    'pointsExpiryDays',
                                    e.target.value ? parseInt(e.target.value) : null,
                                )
                            }
                            placeholder="Never expires"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Price per Credit (₹, for member top-up)</Label>
                        <Input
                            type="number"
                            min={0}
                            step={0.5}
                            value={draft.pointPrice ?? ''}
                            onChange={(e) =>
                                set(
                                    'pointPrice',
                                    e.target.value ? parseFloat(e.target.value) : null,
                                )
                            }
                            placeholder="Leave blank to disable top-up"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Members can buy extra credits at this rate via Razorpay
                        </p>
                    </div>
                    <div>
                        <Label className="text-xs">Club Accent Color (HSL or hex)</Label>
                        <div className="flex gap-2 items-center mt-1">
                            <input
                                type="color"
                                className="h-9 w-12 rounded border cursor-pointer"
                                value={
                                    draft.brandColor
                                        ? (draft.brandColor.startsWith('#')
                                              ? draft.brandColor
                                              : '#8B6914')
                                        : '#8B6914'
                                }
                                onChange={(e) => set('brandColor', e.target.value)}
                            />
                            <Input
                                value={draft.brandColor ?? ''}
                                onChange={(e) => set('brandColor', e.target.value || null)}
                                placeholder="e.g. #8B6914 or 35 55% 42%"
                                className="flex-1"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Used for header, buttons, and date highlights in the player view
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={save} disabled={saving} className="w-full">
                {saving ? 'Saving…' : 'Save Config'}
            </Button>

            {/* Manual allocation */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold">Run Monthly Allocation</p>
                            <p className="text-xs text-muted-foreground">
                                Manually trigger the monthly points credit for all active members.
                                This resets monthly usage counters.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={runAllocation}
                            disabled={allocating}
                            className="shrink-0"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${allocating ? 'animate-spin' : ''}`} />
                            {allocating ? 'Running…' : 'Run Now'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

const ClubMembers = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [adjustTarget, setAdjustTarget] = useState<{
        member: ClubMemberDetail;
        balance: number;
    } | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ['clubMembers', debouncedSearch],
        queryFn: () => listClubMembers({ search: debouncedSearch || undefined, limit: 50 }),
    });

    const members = data?.data.members ?? [];
    const total = data?.data.pagination.total ?? 0;

    const totalBalance = members.reduce((s, m) => s + (m.wallet?.balance ?? 0), 0);
    const totalAllocated = members.reduce((s, m) => s + (m.wallet?.monthlyAllocated ?? 0), 0);

    const refetchMembers = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['clubMembers'] });
    }, [queryClient]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary px-4 pb-6 pt-10 text-primary-foreground">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(path.dashboard)}
                        className="rounded-full bg-primary-foreground/20 p-1.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold">Club Members</h1>
                        <p className="text-xs opacity-80">Points & membership management</p>
                    </div>
                    <button
                        onClick={() => setShowAddDialog(true)}
                        className="rounded-full bg-primary-foreground/20 p-1.5"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-lg px-4 -mt-4 pb-8">
                <Tabs defaultValue="members">
                    <TabsList className="w-full">
                        <TabsTrigger value="members" className="flex-1">
                            <Users className="h-3.5 w-3.5 mr-1" /> Members
                        </TabsTrigger>
                        <TabsTrigger value="config" className="flex-1">
                            <Settings2 className="h-3.5 w-3.5 mr-1" /> Config
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Members Tab ─────────────────────────────────────── */}
                    <TabsContent value="members" className="mt-3 space-y-3">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-2">
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-lg font-bold text-primary">{total}</p>
                                    <p className="text-[10px] text-muted-foreground">Members</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-lg font-bold">{fmt(totalBalance)}</p>
                                    <p className="text-[10px] text-muted-foreground">Total Balance</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-lg font-bold">{fmt(totalAllocated)}</p>
                                    <p className="text-[10px] text-muted-foreground">Monthly Alloc.</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* List */}
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                                ))}
                            </div>
                        ) : members.length === 0 ? (
                            <div className="py-12 text-center">
                                <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium">No members yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tap + to add your first club member
                                </p>
                                <Button
                                    className="mt-4"
                                    size="sm"
                                    onClick={() => setShowAddDialog(true)}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Member
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {members.map((m) => (
                                    <MemberCard
                                        key={m.id}
                                        member={m}
                                        onClick={() => setSelectedMemberId(m.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Config Tab ──────────────────────────────────────── */}
                    <TabsContent value="config" className="mt-3">
                        <ConfigTab />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Add Member Dialog */}
            <AddMemberDialog
                open={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                onSuccess={refetchMembers}
            />

            {/* Member Detail Sheet */}
            <MemberDetailSheet
                memberId={selectedMemberId}
                open={!!selectedMemberId}
                onClose={() => setSelectedMemberId(null)}
                onAdjust={(member, balance) => {
                    setSelectedMemberId(null);
                    setAdjustTarget({ member, balance });
                }}
            />

            {/* Adjust Points Dialog */}
            <AdjustPointsDialog
                open={!!adjustTarget}
                member={adjustTarget?.member ?? null}
                currentBalance={adjustTarget?.balance ?? 0}
                onClose={() => setAdjustTarget(null)}
                onSuccess={() => {
                    refetchMembers();
                    queryClient.invalidateQueries({ queryKey: ['clubMember'] });
                }}
            />
        </div>
    );
};

export default ClubMembers;
