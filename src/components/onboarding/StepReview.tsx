import { Loader2, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../utils/twMerge';
import { DAYS } from '../../utils/days';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const StepReview = ({
    venueId,
    venue,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
}: StepReviewProps) => {
    const navigate = useNavigate();
    const [hours, setHours] = useState<any[]>([]);
    const [courts, setCourts] = useState<any[]>([]);
    const [amenities, setAmenities] = useState<any[]>([]);
    const [pricing, setPricing] = useState<any[]>([]);
    const [rules, setRules] = useState<any>(null);
    const [payout, setPayout] = useState<any>(null);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            // const [hoursRes, courtsRes, amenRes, rulesRes, payoutRes] =
            //     await Promise.all([
            //         supabase
            //             .from('venue_hours')
            //             .select('*')
            //             .eq('venue_id', venueId)
            //             .order('day_of_week'),
            //         supabase
            //             .from('venue_courts')
            //             .select('*')
            //             .eq('venue_id', venueId)
            //             .order('created_at'),
            //         supabase
            //             .from('venue_amenities')
            //             .select('*')
            //             .eq('venue_id', venueId),
            //         supabase
            //             .from('venue_booking_rules')
            //             .select('*')
            //             .eq('venue_id', venueId)
            //             .maybeSingle(),
            //         supabase
            //             .from('venue_payout_details')
            //             .select('*')
            //             .eq('venue_id', venueId)
            //             .maybeSingle(),
            //     ]);

            // setHours(hoursRes.data || []);
            // setCourts(courtsRes.data || []);
            // setAmenities(amenRes.data || []);
            // setRules(rulesRes.data);
            // setPayout(payoutRes.data);

            // if (courtsRes.data && courtsRes.data.length > 0) {
            //     // const { data: pData } = await supabase
            //     //     .from('court_pricing')
            //     //     .select('*')
            //     //     .in(
            //     //         'court_id',
            //     //         courtsRes.data.map((c: any) => c.id),
            //     //     );
            //     // setPricing(pData || []);
            // }

            setLoaded(true);
        })();
    }, [venueId]);

    const submitForReview = async () => {
        if (!agreed) {
            toast.error('Please agree to the terms and conditions.');
            return;
        }
        setSubmitting(true);

        try {
            // await supabase
            //     .from('venues')
            //     .update({
            //         status: 'pending_review',
            //         submitted_at: new Date().toISOString(),
            //     })
            //     .eq('id', venueId);

            // if (venue?.invitation_id) {
            //     await supabase
            //         .from('venue_invitations')
            //         .update({ status: 'submitted' })
            //         .eq('id', venue.invitation_id);
            // }

            // await supabase
            //     .from('onboarding_progress')
            //     .update({ current_step: 8 })
            //     .eq('venue_id', venueId);

            toast.success('Venue submitted for review!');
            navigate(`/onboarding/${venueId}/submitted`, { replace: true });
        } catch (err: any) {
            toast.error('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Save & Continue = Submit
    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            if (!agreed) {
                toast.error('Please agree to the terms and conditions.');
                onSaveComplete(false);
                return;
            }
            await submitForReview();
            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    useEffect(() => {
        if (!triggerExit) return;
        onExitComplete();
    }, [triggerExit]); // eslint-disable-line

    if (!loaded) return null;

    const editStep = (step: number) =>
        navigate(`/onboarding/${venueId}/step/${step}`);

    const SectionCard = ({
        title,
        step,
        children,
    }: {
        title: string;
        step: number;
        children: React.ReactNode;
    }) => (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <h3 className="text-sm font-semibold">{title}</h3>
                <button
                    onClick={() => editStep(step)}
                    className="flex items-center gap-1 text-xs text-[hsl(var(--admin-navy))] hover:underline"
                >
                    <Pencil className="h-3 w-3" /> Edit
                </button>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );

    const maskAccount = (num: string) => {
        if (!num || num.length < 4) return '••••';
        return '•••• •••• ' + num.slice(-4);
    };

    const maskIfsc = (code: string) => {
        if (!code || code.length < 6) return code;
        return code.slice(0, 4) + '****' + code.slice(-2);
    };

    const courtPricing = (courtId: string) =>
        pricing.find((p: any) => p.court_id === courtId);

    const standardAmenities = amenities.filter((a: any) => !a.is_custom);
    const customAmenities = amenities.filter((a: any) => a.is_custom);

    // Group standard amenities by category
    const amenityGroups: Record<string, string[]> = {};
    standardAmenities.forEach((a: any) => {
        const cat = a.category || 'Other';
        if (!amenityGroups[cat]) amenityGroups[cat] = [];
        amenityGroups[cat].push(a.name);
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Review your venue details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Check everything below before submitting. You can edit any
                    section by clicking the edit button.
                </p>
            </div>

            {/* Card 1: Venue Profile */}
            <SectionCard title="Venue Profile" step={1}>
                <div className="space-y-4">
                    {venue?.cover_photo_url && (
                        <div className="relative h-[180px] rounded-lg overflow-hidden">
                            <img
                                src={venue.cover_photo_url}
                                alt="Cover"
                                className="h-full w-full object-cover"
                            />
                            {venue?.logo_url && (
                                <img
                                    src={venue.logo_url}
                                    alt="Logo"
                                    className="absolute bottom-3 left-3 h-12 w-12 rounded-full border-2 border-card object-cover"
                                />
                            )}
                        </div>
                    )}
                    <div className="grid gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Name:</span>{' '}
                            <span className="font-medium">{venue?.name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">City:</span>{' '}
                            {venue?.city}
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Address:
                            </span>{' '}
                            {venue?.address}
                        </div>
                        {venue?.description && (
                            <div>
                                <span className="text-muted-foreground">
                                    Description:
                                </span>{' '}
                                {venue?.description}
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground">
                                Email:
                            </span>{' '}
                            {venue?.contact_email}
                        </div>
                        {venue?.whatsapp_number && (
                            <div>
                                <span className="text-muted-foreground">
                                    WhatsApp:
                                </span>{' '}
                                +91 {venue?.whatsapp_number}
                            </div>
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* Card 2: Operating Hours */}
            <SectionCard title="Operating Hours" step={2}>
                <div className="space-y-1">
                    {hours.map((h: any) => (
                        <div
                            key={h.day_of_week}
                            className={cn(
                                'flex justify-between py-1.5 text-sm',
                                !h.is_open && 'opacity-50',
                            )}
                        >
                            <span className="font-medium">
                                {DAYS[h.day_of_week]}
                            </span>
                            <span>
                                {h.is_open ? (
                                    <span>
                                        {h.opening_time} – {h.closing_time}
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                        Closed
                                    </span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Card 3: Courts */}
            <SectionCard title="Courts" step={3}>
                {courts.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No courts added
                    </p>
                ) : (
                    <div className="space-y-3">
                        {courts.map((c: any) => (
                            <div key={c.id} className="flex items-center gap-3">
                                {c.photo_url ? (
                                    <img
                                        src={c.photo_url}
                                        alt={c.name}
                                        className="h-10 w-10 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                                        {c.sport === 'Padel' ? '🏸' : '🏓'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">
                                            {c.name}
                                        </span>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                c.sport === 'Padel'
                                                    ? 'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]'
                                                    : 'bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))]',
                                            )}
                                        >
                                            {c.sport}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {c.surface_material} ·{' '}
                                        {c.is_indoor ? 'Indoor' : 'Outdoor'} ·{' '}
                                        {c.hours_type === 'custom'
                                            ? 'Custom Hours'
                                            : 'Default Hours'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Card 4: Amenities */}
            <SectionCard title="Facilities & Amenities" step={4}>
                {amenities.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No amenities added
                    </p>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(amenityGroups).map(([group, items]) => (
                            <div key={group}>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                    {group}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {items.map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-full bg-[hsl(var(--admin-navy))] px-3 py-1 text-xs text-[hsl(var(--admin-navy-foreground))]"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {customAmenities.length > 0 && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                    Your Additions
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {customAmenities.map((a: any) => (
                                        <span
                                            key={a.id}
                                            className="rounded-full bg-[hsl(var(--admin-navy))] px-3 py-1 text-xs text-[hsl(var(--admin-navy-foreground))]"
                                        >
                                            {a.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>

            {/* Card 5: Pricing */}
            <SectionCard title="Pricing" step={5}>
                {courts.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No pricing configured
                    </p>
                ) : (
                    <div className="space-y-4">
                        {courts.map((c: any) => {
                            const cp = courtPricing(c.id);
                            return (
                                <div key={c.id} className="space-y-1">
                                    <p className="text-sm font-medium">
                                        {c.name}
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                        <p>
                                            Base Rate: ₹{cp?.base_rate || 0}/hr
                                        </p>
                                        <p>
                                            Durations:{' '}
                                            {(
                                                (cp?.booking_durations as number[]) || [
                                                    60,
                                                ]
                                            )
                                                .map((d: number) => `${d} min`)
                                                .join(', ')}
                                        </p>
                                        {cp?.peak_enabled && (
                                            <p>
                                                Peak: ₹{cp?.peak_rate}/hr (
                                                {cp?.peak_time_start} –{' '}
                                                {cp?.peak_time_end})
                                            </p>
                                        )}
                                        {cp?.weekend_rate_enabled && (
                                            <p>
                                                Weekend: ₹{cp?.weekend_rate}/hr
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>

            {/* Card 6: Booking Rules */}
            <SectionCard title="Booking Rules" step={6}>
                {!rules ? (
                    <p className="text-sm text-muted-foreground italic">
                        Not configured
                    </p>
                ) : (
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="text-muted-foreground">
                                Advance window:
                            </span>{' '}
                            {rules.advance_booking_days} day(s)
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Min notice:
                            </span>{' '}
                            {rules.min_notice_hours} hour(s)
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Cancellation:
                            </span>{' '}
                            {rules.cancellation_policy}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Auto-confirm:
                            </span>{' '}
                            {rules.auto_confirm ? 'Yes' : 'No'}
                        </p>
                    </div>
                )}
            </SectionCard>

            {/* Card 7: Payout Details */}
            <SectionCard title="Payout Details" step={7}>
                {!payout ? (
                    <p className="text-sm text-muted-foreground italic">
                        Not configured
                    </p>
                ) : (
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="text-muted-foreground">Bank:</span>{' '}
                            {payout.bank_name}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Holder:
                            </span>{' '}
                            {payout.account_holder_name}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Account:
                            </span>{' '}
                            {maskAccount('')}
                        </p>
                        <p>
                            <span className="text-muted-foreground">IFSC:</span>{' '}
                            {maskIfsc(payout.iban || '')}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Schedule:
                            </span>{' '}
                            {payout.payout_schedule}
                        </p>
                    </div>
                )}
            </SectionCard>

            {/* Terms & Submit */}
            <div className="space-y-4 pt-4 border-t border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                        checked={agreed}
                        onCheckedChange={(v) => setAgreed(v === true)}
                        className="mt-0.5"
                    />
                    <span className="text-sm">
                        I confirm that the information I have provided is
                        accurate and complete. I agree to the{' '}
                        <button
                            onClick={() => setTermsOpen(true)}
                            className="text-[hsl(var(--admin-navy))] underline font-medium"
                        >
                            Venue Partner Terms & Conditions
                        </button>
                        .
                    </span>
                </label>

                <Button
                    onClick={submitForReview}
                    disabled={!agreed || submitting}
                    className="w-full bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] hover:bg-[hsl(var(--admin-lime))]/90 h-12 text-base font-semibold"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{' '}
                            Submitting...
                        </>
                    ) : (
                        'Submit for Review'
                    )}
                </Button>
            </div>

            {/* Terms Modal */}
            <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Venue Partner Terms & Conditions
                        </DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-sm text-sm text-muted-foreground space-y-4">
                        <p>
                            These terms and conditions govern your use of the
                            platform as a venue partner. By submitting your
                            venue for review, you agree to the following:
                        </p>
                        <p>
                            <strong>1. Venue Listing.</strong> You warrant that
                            all information provided during onboarding is
                            accurate and up-to-date. You agree to maintain
                            accurate details for your venue including pricing,
                            availability, and contact information.
                        </p>
                        <p>
                            <strong>2. Commission.</strong> The platform charges
                            a commission on each completed booking. The rate
                            will be communicated to you separately and may be
                            updated with prior notice.
                        </p>
                        <p>
                            <strong>3. Payouts.</strong> Payouts are processed
                            according to your selected schedule, subject to a
                            minimum payout threshold and applicable verification
                            checks.
                        </p>
                        <p>
                            <strong>4. Cancellation.</strong> You must honour
                            the cancellation policy selected during onboarding.
                            The platform will handle refund processing in
                            accordance with your policy.
                        </p>
                        <p>
                            <strong>5. Data Protection.</strong> Both parties
                            agree to handle player and venue data in accordance
                            with applicable data protection regulations.
                        </p>
                        <p>
                            <strong>6. Termination.</strong> Either party may
                            terminate this agreement with 30 days written
                            notice. Outstanding payouts will be settled within
                            14 days of termination.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StepReview;
