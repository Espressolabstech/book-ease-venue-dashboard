import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Plus, Trash2, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
    addStaff,
    listStaff,
    removeStaff,
    updateStaffRole,
} from '../../api/adapters/staff';
import { path } from '../../navigation/commanPaths';

const ROLE_LABELS: Record<VenueStaffRole, string> = {
    VENUE_ADMIN: 'Venue Admin',
    VENUE_MANAGER: 'Venue Manager',
    COURT_ASSISTANT: 'Court Assistant',
};

const ROLE_COLORS: Record<VenueStaffRole, string> = {
    VENUE_ADMIN: 'bg-primary/10 text-primary',
    VENUE_MANAGER: 'bg-blue-100 text-blue-700',
    COURT_ASSISTANT: 'bg-muted text-muted-foreground',
};

const Staff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [adding, setAdding] = useState(false);
    const [removeId, setRemoveId] = useState<string | null>(null);
    const [removing, setRemoving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        venueStaffRole: 'VENUE_MANAGER' as 'VENUE_MANAGER' | 'COURT_ASSISTANT',
    });

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await listStaff();
            setStaff(res.data.staff);
        } catch {
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAdd = async () => {
        if (!form.phone.trim()) {
            toast.error('Phone number is required');
            return;
        }
        setAdding(true);
        try {
            await addStaff({
                phone: form.phone.trim(),
                name: form.name.trim() || undefined,
                venueStaffRole: form.venueStaffRole,
            });
            toast.success('Staff member added');
            setForm({ name: '', phone: '', venueStaffRole: 'VENUE_MANAGER' });
            setShowAdd(false);
            fetchStaff();
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Failed to add staff');
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async () => {
        if (!removeId) return;
        setRemoving(true);
        try {
            await removeStaff(removeId);
            toast.success('Staff member removed');
            setRemoveId(null);
            fetchStaff();
        } catch {
            toast.error('Failed to remove staff');
        } finally {
            setRemoving(false);
        }
    };

    const handleRoleChange = async (
        id: string,
        role: 'VENUE_MANAGER' | 'COURT_ASSISTANT',
    ) => {
        try {
            await updateStaffRole(id, role);
            toast.success('Role updated');
            fetchStaff();
        } catch {
            toast.error('Failed to update role');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-8">
            <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                <button
                    onClick={() => navigate(path.dashboard)}
                    className="rounded-full p-1 hover:bg-primary-foreground/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="font-semibold">Venue Staff</h1>
                <button
                    onClick={() => setShowAdd((p) => !p)}
                    className="ml-auto flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-sm font-medium hover:bg-primary-foreground/20"
                >
                    <Plus className="h-4 w-4" />
                    Add Staff
                </button>
            </header>

            <main className="mx-auto max-w-lg px-4 pt-4 space-y-4">
                {/* Add Staff Form */}
                {showAdd && (
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <h2 className="font-semibold text-foreground">
                                Add New Staff Member
                            </h2>

                            <div className="space-y-2">
                                <Label htmlFor="staff-name">
                                    Name{' '}
                                    <span className="text-muted-foreground text-xs">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="staff-name"
                                    placeholder="Full name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="staff-phone">
                                    Phone Number
                                </Label>
                                <Input
                                    id="staff-phone"
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            phone: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(
                                        [
                                            'VENUE_MANAGER',
                                            'COURT_ASSISTANT',
                                        ] as const
                                    ).map((role) => (
                                        <button
                                            key={role}
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    venueStaffRole: role,
                                                }))
                                            }
                                            className={`rounded-lg border p-3 text-left text-sm transition-all ${
                                                form.venueStaffRole === role
                                                    ? 'border-primary bg-primary/5 font-medium text-primary'
                                                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                                            }`}
                                        >
                                            <p className="font-medium">
                                                {ROLE_LABELS[role]}
                                            </p>
                                            <p className="text-xs mt-0.5 opacity-70">
                                                {role === 'VENUE_MANAGER'
                                                    ? 'View settings, manage bookings'
                                                    : 'Bookings only'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowAdd(false);
                                        setForm({
                                            name: '',
                                            phone: '',
                                            venueStaffRole: 'VENUE_MANAGER',
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleAdd}
                                    disabled={adding}
                                >
                                    {adding ? (
                                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-1.5 h-4 w-4" />
                                    )}
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Staff List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                ) : staff.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <UserCog className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                No staff members yet.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAdd(true)}
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Add your first staff member
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {staff.map((member) => (
                            <Card key={member.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {member.name ?? '—'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {member.countryCode} {member.phone}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-3">
                                        {/* Role selector */}
                                        <select
                                            value={member.venueStaffRole}
                                            onChange={(e) =>
                                                handleRoleChange(
                                                    member.id,
                                                    e.target.value as
                                                        | 'VENUE_MANAGER'
                                                        | 'COURT_ASSISTANT',
                                                )
                                            }
                                            className={`rounded-full border-0 px-3 py-1 text-xs font-medium outline-none cursor-pointer ${ROLE_COLORS[member.venueStaffRole]}`}
                                        >
                                            <option value="VENUE_MANAGER">
                                                Venue Manager
                                            </option>
                                            <option value="COURT_ASSISTANT">
                                                Court Assistant
                                            </option>
                                        </select>

                                        <button
                                            onClick={() =>
                                                setRemoveId(member.id)
                                            }
                                            className="rounded p-1.5 hover:bg-destructive/10 text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <AlertDialog
                open={!!removeId}
                onOpenChange={() => setRemoveId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove their access to the venue dashboard.
                            They can be re-added at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemove}
                            disabled={removing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {removing ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : null}
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Staff;
