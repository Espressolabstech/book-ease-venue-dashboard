import { useEffect, useState } from 'react';
import { DEFAULT_HOURS, PADEL_SURFACES, PICKLEBALL_SURFACES } from '../../utils/court';
import type { DaySchedule } from './ScheduleBuilder';
import { toast } from 'sonner';
import { getCourtImageUploadUrls, uploadToPresignedUrl } from '../../api/adapters/onBoard';
import { Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { cn } from '../../utils/twMerge';
import ScheduleBuilder from './ScheduleBuilder';
import { Switch } from '../ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const StepCourtSetup = ({
    venueId,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
}: StepCourtSetupProps) => {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [form, setForm] = useState<Court>({
        name: '',
        sport: '',
        surface_material: '',
        is_indoor: false,
        hours_type: 'default',
        custom_hours: DEFAULT_HOURS,
        photo_url: null,
        active: true,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [photoUploading, setPhotoUploading] = useState(false);
    const [venueHours, setVenueHours] = useState<DaySchedule[]>([]);

    // Load courts + venue hours from sessionStorage
    useEffect(() => {
        (async () => {
            try {
                const savedCourts = sessionStorage.getItem('onboarding_step3');
                if (savedCourts) setCourts(JSON.parse(savedCourts));
                const savedHours = sessionStorage.getItem('onboarding_step2');
                if (savedHours) setVenueHours(JSON.parse(savedHours));
            } catch {}
            // const [courtsRes, hoursRes] = await Promise.all([
            //     supabase
            //         .from('venue_courts')
            //         .select('*')
            //         .eq('venue_id', venueId)
            //         .order('created_at'),
            //     (supabase as any)
            //         .from('venue_hours')
            //         .select('*')
            //         .eq('venue_id', venueId)
            //         .order('day_of_week'),
            // ]);

            // if (courtsRes.data) {
            //     // Load court_hours for each court with custom hours
            //     const loadedCourts: Court[] = [];
            //     for (const c of courtsRes.data) {
            //         let customHours = DEFAULT_HOURS;
            //         if (c.hours_type === 'custom') {
            //             const { data: ch } = await (supabase as any)
            //                 .from('court_hours')
            //                 .select('*')
            //                 .eq('court_id', c.id)
            //                 .order('day_of_week');
            //             if (ch && ch.length > 0) {
            //                 customHours = ch.map((h: any) => ({
            //                     day_of_week: h.day_of_week,
            //                     is_open: h.is_open,
            //                     opening_time: h.opening_time || '06:00',
            //                     closing_time: h.closing_time || '23:00',
            //                 }));
            //             }
            //         }
            //         loadedCourts.push({
            //             id: c.id,
            //             name: c.name,
            //             sport: c.sport,
            //             surface_material: c.surface_material || '',
            //             is_indoor: c.is_indoor || false,
            //             hours_type: c.hours_type || 'default',
            //             custom_hours: customHours,
            //             photo_url: c.photo_url,
            //             active: (c as any).active !== false,
            //         });
            //     }
            //     setCourts(loadedCourts);
            // }

            // if (hoursRes.data && hoursRes.data.length > 0) {
            //     setVenueHours(
            //         hoursRes.data.map((d: any) => ({
            //             day_of_week: d.day_of_week,
            //             is_open: d.is_open,
            //             opening_time: d.opening_time || '06:00',
            //             closing_time: d.closing_time || '23:00',
            //         })),
            //     );
            // }
            setLoaded(true);
        })();
    }, [venueId]);

    const openAddModal = () => {
        setEditIndex(null);
        setForm({
            name: '',
            sport: '',
            surface_material: '',
            is_indoor: false,
            hours_type: 'default',
            custom_hours: DEFAULT_HOURS,
            photo_url: null,
            active: true,
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const openEditModal = (index: number) => {
        setEditIndex(index);
        setForm({ ...courts[index] });
        setFormErrors({});
        setModalOpen(true);
    };

    const validateForm = () => {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = 'Required';
        if (!form.sport) errs.sport = 'Required';
        if (!form.surface_material) errs.surface = 'Required';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const saveCourt = async () => {
        if (!validateForm()) return;
        onSaving(true);

        const courtId =
            form.id || (editIndex !== null ? courts[editIndex]?.id : undefined);

        if (courtId) {
            // Update
            // const { error } = await supabase
            //     .from('venue_courts')
            //     .update(courtData)
            //     .eq('id', courtId);
            // if (error) {
            //     toast.error(error.message);
            //     onSaving(false);
            //     return;
            // }
        } else {
            // Insert
            // const { data, error } = await supabase
            //     .from('venue_courts')
            //     .insert(courtData)
            //     .select('id')
            //     .single();
            // if (error) {
            //     toast.error(error.message);
            //     onSaving(false);
            //     return;
            // }
            // courtId = data.id;
        }

        // Save custom hours if applicable
        if (form.hours_type === 'custom' && courtId) {
            // await (supabase as any)
            //     .from('court_hours')
            //     .delete()
            //     .eq('court_id', courtId);
            // const rows = form.custom_hours.map((h) => ({
            //     court_id: courtId,
            //     day_of_week: h.day_of_week,
            //     is_open: h.is_open,
            //     opening_time: h.is_open ? h.opening_time : null,
            //     closing_time: h.is_open ? h.closing_time : null,
            // }));
            // await (supabase as any).from('court_hours').insert(rows);
        }

        // Update local state
        const updatedCourt: Court = { ...form, id: courtId };
        if (editIndex !== null) {
            setCourts((prev) =>
                prev.map((c, i) => (i === editIndex ? updatedCourt : c)),
            );
        } else {
            setCourts((prev) => [...prev, updatedCourt]);
        }

        onSaving(false);
        onSaved();
        setModalOpen(false);
    };

    const deleteCourt = async () => {
        if (deleteIndex === null) return;
        const court = courts[deleteIndex];
        if (court.id) {
            onSaving(true);
            // await supabase.from('venue_courts').delete().eq('id', court.id);
            onSaving(false);
            onSaved();
        }
        setCourts((prev) => prev.filter((_, i) => i !== deleteIndex));
        setDeleteIndex(null);
    };

    const handlePhotoUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            toast.error('Max 3MB');
            return;
        }

        setPhotoUploading(true);
        try {
            const res = await getCourtImageUploadUrls({
                venueId,
                images: [{ type: 'PHOTO', mimetype: file.type || 'image/jpeg' }],
            });
            const item = (res.data as any).images?.[0] ?? (Array.isArray(res.data) ? res.data[0] : res.data);
            if (!item?.uploadUrl) throw new Error('Invalid upload URL response');
            const { uploadUrl, publicUrl } = item;
            await uploadToPresignedUrl(uploadUrl, file, file.type || 'image/jpeg');
            setForm((f) => ({ ...f, photo_url: publicUrl }));
        } catch (err: any) {
            toast.error(err?.message || 'Photo upload failed');
        } finally {
            setPhotoUploading(false);
            e.target.value = '';
        }
    };

    const surfaces =
        form.sport === 'Padel'
            ? PADEL_SURFACES
            : form.sport === 'Pickleball'
              ? PICKLEBALL_SURFACES
              : [];

    // Save & Continue
    useEffect(() => {
        if (!triggerSave) return;
        if (courts.length === 0) {
            toast.error('Add at least one court to continue.');
            onSaveComplete(false);
            return;
        }
        const incomplete = courts.some(
            (c) => !c.name || !c.sport || !c.surface_material,
        );
        if (incomplete) {
            toast.error(
                'All courts must have name, sport, and surface filled in.',
            );
            onSaveComplete(false);
            return;
        }
        sessionStorage.setItem('onboarding_step3', JSON.stringify(courts));
        onSaveComplete(true);
    }, [triggerSave]); // eslint-disable-line

    // Save & Exit
    useEffect(() => {
        if (!triggerExit) return;
        onExitComplete();
    }, [triggerExit]); // eslint-disable-line

    if (!loaded) return null;

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Set up your courts
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add each court at your venue. You'll set pricing in the next
                    steps.
                </p>
            </div>

            {courts.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-muted-foreground">
                        No courts added yet
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        Add your first court below.
                    </p>
                    <Button
                        onClick={openAddModal}
                        className="mt-4 bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] hover:bg-[hsl(var(--admin-lime))]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Court
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courts.map((court, i) => (
                            <div
                                key={i}
                                className="relative rounded-xl border border-border bg-card shadow-sm overflow-hidden"
                            >
                                {/* Photo or placeholder */}
                                <div
                                    className={cn(
                                        'h-32 flex items-center justify-center',
                                        court.photo_url
                                            ? ''
                                            : court.sport === 'Padel'
                                              ? 'bg-[hsl(var(--admin-navy))]/5'
                                              : 'bg-[hsl(var(--admin-lime))]/5',
                                    )}
                                >
                                    {court.photo_url ? (
                                        <img
                                            src={court.photo_url}
                                            alt={court.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl">
                                            {court.sport === 'Padel'
                                                ? '🏸'
                                                : '🏓'}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="absolute right-2 top-2 flex gap-1">
                                    <button
                                        onClick={() => openEditModal(i)}
                                        className="rounded-full bg-card/80 p-1.5 backdrop-blur hover:bg-card"
                                    >
                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteIndex(i)}
                                        className="rounded-full bg-card/80 p-1.5 backdrop-blur hover:bg-card"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </button>
                                </div>

                                <div className="p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm">
                                            {court.name}
                                        </h3>
                                        {court.active && (
                                            <span className="h-2 w-2 rounded-full bg-[hsl(var(--admin-lime))]" />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                                court.sport === 'Padel'
                                                    ? 'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                                                    : 'bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))]',
                                            )}
                                        >
                                            {court.sport}
                                        </span>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            {court.is_indoor
                                                ? 'Indoor'
                                                : 'Outdoor'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {court.surface_material}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {court.hours_type === 'custom'
                                            ? 'Custom Hours'
                                            : 'Default Hours'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={openAddModal}
                        variant="outline"
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Court
                    </Button>
                </>
            )}

            {/* Add/Edit Court Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editIndex !== null ? 'Edit Court' : 'Add Court'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label>Court Name *</Label>
                            <Input
                                placeholder="e.g. Court 1, The Arena"
                                value={form.name}
                                onChange={(e) => {
                                    setForm((f) => ({
                                        ...f,
                                        name: e.target.value,
                                    }));
                                    setFormErrors((e) => ({ ...e, name: '' }));
                                }}
                                className={cn(
                                    formErrors.name && 'border-destructive',
                                )}
                            />
                            {formErrors.name && (
                                <p className="text-xs text-destructive">
                                    {formErrors.name}
                                </p>
                            )}
                        </div>

                        {/* Sport */}
                        <div className="space-y-1.5">
                            <Label>Sport Type *</Label>
                            <div className="flex gap-2">
                                {['Padel', 'Pickleball'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() =>
                                            setForm((f) => ({
                                                ...f,
                                                sport: s,
                                                surface_material: '',
                                            }))
                                        }
                                        className={cn(
                                            'rounded-full px-5 py-2 text-sm font-medium transition-all',
                                            form.sport === s
                                                ? s === 'Padel'
                                                    ? 'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))] scale-105'
                                                    : 'bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] scale-105'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {formErrors.sport && (
                                <p className="text-xs text-destructive">
                                    {formErrors.sport}
                                </p>
                            )}
                        </div>

                        {/* Surface */}
                        {surfaces.length > 0 && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                <Label>Surface Material *</Label>
                                <div className="flex flex-wrap gap-2">
                                    {surfaces.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() =>
                                                setForm((f) => ({
                                                    ...f,
                                                    surface_material: s,
                                                }))
                                            }
                                            className={cn(
                                                'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
                                                form.surface_material === s
                                                    ? 'border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                                                    : 'border-border text-muted-foreground hover:border-muted-foreground',
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                {formErrors.surface && (
                                    <p className="text-xs text-destructive">
                                        {formErrors.surface}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Indoor/Outdoor */}
                        <div className="space-y-1.5">
                            <Label>Indoor / Outdoor</Label>
                            <div className="flex rounded-lg border border-border overflow-hidden">
                                {[false, true].map((indoor) => (
                                    <button
                                        key={String(indoor)}
                                        onClick={() =>
                                            setForm((f) => ({
                                                ...f,
                                                is_indoor: indoor,
                                            }))
                                        }
                                        className={cn(
                                            'flex-1 py-2 text-sm font-medium transition-colors',
                                            form.is_indoor === indoor
                                                ? 'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                                                : 'text-muted-foreground hover:bg-muted',
                                        )}
                                    >
                                        {indoor ? 'Indoor' : 'Outdoor'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="space-y-2">
                            <Label>Court Hours *</Label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={form.hours_type === 'default'}
                                        onChange={() =>
                                            setForm((f) => ({
                                                ...f,
                                                hours_type: 'default',
                                            }))
                                        }
                                    />
                                    <span className="text-sm">
                                        Use Venue Default Hours
                                    </span>
                                </label>
                                {form.hours_type === 'default' &&
                                    venueHours.length > 0 && (
                                        <div className="ml-6 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-0.5">
                                            {venueHours.map((h) => (
                                                <p key={h.day_of_week}>
                                                    {DAYS[h.day_of_week]}:{' '}
                                                    {h.is_open
                                                        ? `${h.opening_time} – ${h.closing_time}`
                                                        : 'Closed'}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                {form.hours_type === 'default' &&
                                    venueHours.length === 0 && (
                                        <p className="ml-6 text-xs text-[hsl(var(--admin-status-amber))]">
                                            Complete Step 2 first to use venue
                                            default hours.
                                        </p>
                                    )}

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={form.hours_type === 'custom'}
                                        onChange={() =>
                                            setForm((f) => ({
                                                ...f,
                                                hours_type: 'custom',
                                            }))
                                        }
                                    />
                                    <span className="text-sm">
                                        Set Custom Hours
                                    </span>
                                </label>
                                {form.hours_type === 'custom' && (
                                    <div className="ml-6">
                                        <ScheduleBuilder
                                            value={form.custom_hours}
                                            onChange={(v) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    custom_hours: v,
                                                }))
                                            }
                                            showShortcuts
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Photo */}
                        <div className="space-y-1.5">
                            <Label>Court Photo (optional)</Label>
                            {form.photo_url ? (
                                <div className="relative w-fit">
                                    <img
                                        src={form.photo_url}
                                        alt=""
                                        className="h-24 rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() =>
                                            setForm((f) => ({
                                                ...f,
                                                photo_url: null,
                                            }))
                                        }
                                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors">
                                    {photoUploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Active */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Active</Label>
                                <p className="text-xs text-muted-foreground">
                                    Inactive courts won't appear for booking.
                                </p>
                            </div>
                            <Switch
                                checked={form.active}
                                onCheckedChange={(v) =>
                                    setForm((f) => ({ ...f, active: v }))
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={saveCourt}
                            className="bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] hover:bg-[hsl(var(--admin-lime))]/90"
                        >
                            Save Court
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog
                open={deleteIndex !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteIndex(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Court</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure? This will permanently remove{' '}
                            {deleteIndex !== null
                                ? courts[deleteIndex]?.name
                                : ''}
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteCourt}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default StepCourtSetup;
