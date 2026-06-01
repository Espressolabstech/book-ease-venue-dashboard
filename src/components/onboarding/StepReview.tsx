import { Loader2, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../utils/twMerge';
import { DAYS } from '../../utils/days';
import { SPORT_EMOJI } from '../../utils/court';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { venueOnboard } from '../../api/adapters/onBoard';
import { getPrivateClubConfig } from '../../api/adapters/privateClub';
import { useQuery } from '@tanstack/react-query';
import { path } from '../../navigation/commanPaths';

const StepReview = ({
    venueId,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
    triggerBack,
    onBackComplete,
}: StepReviewProps) => {
    const navigate = useNavigate();
    const { token: urlToken } = useParams<{ token: string }>();
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);

    const { data: clubConfigData } = useQuery({
        queryKey: ['private-club-config'],
        queryFn: getPrivateClubConfig,
    });
    const isClubWithPoints =
        (clubConfigData?.data?.config?.isPrivateClub ?? false) &&
        (clubConfigData?.data?.config?.pointsEnabled ?? false);

    const [step1, setStep1] = useState<any>(null);
    const [step2, setStep2] = useState<any[]>([]);
    const [step3, setStep3] = useState<any[]>([]);
    const [step4, setStep4] = useState<any[]>([]);
    const [step5, setStep5] = useState<Record<string, any>>({});
    const [step6, setStep6] = useState<any>(null);
    const [step7, setStep7] = useState<any>(null);

    useEffect(() => {
        try {
            const s1 = sessionStorage.getItem('onboarding_step1');
            const s2 = sessionStorage.getItem('onboarding_step2');
            const s3 = sessionStorage.getItem('onboarding_step3');
            const s4 = sessionStorage.getItem('onboarding_step4');
            const s5 = sessionStorage.getItem('onboarding_step5');
            const s6 = sessionStorage.getItem('onboarding_step6');
            const s7 = sessionStorage.getItem('onboarding_step7');
            if (s1) setStep1(JSON.parse(s1));
            if (s2) setStep2(JSON.parse(s2));
            if (s3) setStep3(JSON.parse(s3));
            if (s4) setStep4(JSON.parse(s4));
            if (s5) setStep5(JSON.parse(s5));
            if (s6) setStep6(JSON.parse(s6));
            if (s7) setStep7(JSON.parse(s7));
        } catch {}
    }, [venueId]);

    const buildPayload = (): VenueOnboardRequestData => {
        const token = urlToken || '';

        // ── Images ────────────────────────────────────────────────────
        const venueImages: VenueOnboardRequestData['venueImages'] = [];
        if (step1?.logoUrl)
            venueImages.push({ publicUrl: step1.logoUrl, type: 'LOGO' });
        if (step1?.coverUrl)
            venueImages.push({ publicUrl: step1.coverUrl, type: 'COVER' });
        (step1?.galleryUrls || []).forEach((url: string, i: number) =>
            venueImages.push({ publicUrl: url, type: 'GALLERY', order: i }),
        );

        // ── Venue hours (open days only) ──────────────────────────────
        const venueHours = step2
            .filter((d: any) => d.is_open)
            .map((d: any) => ({
                dayOfWeek: d.day_of_week,
                openTime: d.opening_time,
                closeTime: d.closing_time,
            }));

        // ── Mapping tables ────────────────────────────────────────────
        const SPORT_MAP: Record<string, string> = {
            Pickleball: 'PICKELBALL',
            Padel: 'PADEL',
            Tennis: 'TENNIS',
            Badminton: 'BADMINTON',
            'Table Tennis': 'TABLE_TENNIS',
            Squash: 'SQUASH',
            Football: 'FOOTBALL',
            Cricket: 'CRICKET',
            'Box Cricket': 'BOX_CRICKET',
            Basketball: 'BASKETBALL',
            Volleyball: 'VOLLEYBALL',
            Swimming: 'SWIMMING',
            Hockey: 'HOCKEY',
            Golf: 'GOLF',
            Cycling: 'CYCLING',
            Yoga: 'YOGA',
            Gym: 'GYM',
            'Rifle Shooting': 'RIFLE_SHOOTING',
            Archery: 'ARCHERY',
            Boxing: 'BOXING',
            Snooker: 'SNOOKER',
        };
        const SURFACE_MAP: Record<string, string> = {
            'Artificial Grass': 'ARTIFICIAL_GRASS',
            'Sand-Filled Artificial Grass': 'SAND_FILLED_ARTIFICIAL_GRASS',
            'Panoramic Glass': 'PANORAMIC_GLASS',
            'Crystal Glass': 'CRYSTAL_GLASS',
            Asphalt: 'ASPHALT',
            Concrete: 'CONCRETE',
            'Cushioned Acrylic': 'CUSHIONED_ACRYLIC',
            'Artificial Turf': 'ARTIFICIAL_TURF',
        };
        const DAY_TO_INT: Record<string, number> = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
        };

        // ── Courts ────────────────────────────────────────────────────
        // step5 is now keyed by sport name (SportPricing), not court index
        const SHORT_TO_DAY_INT: Record<string, number> = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
        };

        const courts = step3.map((court: any) => {
            // Look up pricing by sport (new format), fall back to legacy index
            const sportPricing: any = step5[court.sport] ?? null;

            // Use custom hours when set, otherwise fall back to venue open hours
            const timeSlots =
                court.hours_type === 'custom'
                    ? court.custom_hours
                          .filter((h: any) => h.is_open)
                          .map((h: any) => ({
                              dayOfWeek: h.day_of_week,
                              startTime: h.opening_time,
                              endTime: h.closing_time,
                          }))
                    : venueHours.map((h) => ({
                          dayOfWeek: h.dayOfWeek,
                          startTime: h.openTime,
                          endTime: h.closeTime,
                      }));

            const weekendDaysInt = sportPricing?.weekend_rate_enabled
                ? (sportPricing.weekend_days as string[]).map(
                      (d: string) => DAY_TO_INT[d] ?? parseInt(d),
                  )
                : undefined;

            // Build peakHourPricings from the multi-slot arrays
            const peakHourPricings: any[] = [];

            if (
                sportPricing?.peak_enabled &&
                Array.isArray(sportPricing.peak_slots)
            ) {
                for (const slot of sportPricing.peak_slots) {
                    if (!slot.rate) continue;
                    if (slot.days && slot.days.length > 0) {
                        // One entry per day
                        for (const day of slot.days) {
                            const dow = SHORT_TO_DAY_INT[day];
                            if (dow === undefined) continue;
                            peakHourPricings.push({
                                dayOfWeek: dow,
                                startTime: slot.start,
                                endTime: slot.end,
                                pricePerSlot: isClubWithPoints ? 0 : (parseFloat(slot.rate) || 0),
                                ...(isClubWithPoints && { pointsPerSlot: parseFloat(slot.rate) || 0 }),
                            });
                        }
                    } else {
                        peakHourPricings.push({
                            startTime: slot.start,
                            endTime: slot.end,
                            pricePerSlot: isClubWithPoints ? 0 : (parseFloat(slot.rate) || 0),
                            ...(isClubWithPoints && { pointsPerSlot: parseFloat(slot.rate) || 0 }),
                        });
                    }
                }
            }

            if (
                sportPricing?.weekend_rate_enabled &&
                sportPricing?.weekend_peak_enabled &&
                Array.isArray(sportPricing.weekend_peak_slots)
            ) {
                for (const slot of sportPricing.weekend_peak_slots) {
                    if (!slot.rate) continue;
                    if (slot.days && slot.days.length > 0) {
                        for (const day of slot.days) {
                            const dow = SHORT_TO_DAY_INT[day];
                            if (dow === undefined) continue;
                            peakHourPricings.push({
                                dayOfWeek: dow,
                                startTime: slot.start,
                                endTime: slot.end,
                                pricePerSlot: isClubWithPoints ? 0 : (parseFloat(slot.rate) || 0),
                                ...(isClubWithPoints && { pointsPerSlot: parseFloat(slot.rate) || 0 }),
                                label: 'weekend_peak',
                            });
                        }
                    } else {
                        peakHourPricings.push({
                            startTime: slot.start,
                            endTime: slot.end,
                            pricePerSlot: isClubWithPoints ? 0 : (parseFloat(slot.rate) || 0),
                            ...(isClubWithPoints && { pointsPerSlot: parseFloat(slot.rate) || 0 }),
                            label: 'weekend_peak',
                        });
                    }
                }
            }

            const courtObj: any = {
                name: court.name,
                sport: SPORT_MAP[court.sport] ?? court.sport.toUpperCase(),
                courtEnvironment: court.is_indoor ? 'INDOOR' : 'OUTDOOR',
                surface:
                    SURFACE_MAP[court.surface_material] ??
                    court.surface_material,
                timeSlots,
                pricing: sportPricing
                    ? {
                          pricePerSlot: isClubWithPoints ? 0 : (parseFloat(sportPricing.base_rate) || 0),
                          ...(isClubWithPoints && { pointsPerSlot: parseFloat(sportPricing.base_rate) || 0 }),
                          ...(sportPricing.weekend_rate_enabled && {
                              weekendPricePerSlot: isClubWithPoints ? 0 : parseFloat(sportPricing.weekend_rate),
                              weekendDays: weekendDaysInt,
                              ...(isClubWithPoints && { weekendPointsPerSlot: parseFloat(sportPricing.weekend_rate) || 0 }),
                          }),
                      }
                    : undefined,
                ...(peakHourPricings.length > 0 && { peakHourPricings }),
            };

            // Only include images field if there is a photo (backend rejects empty array)
            if (court.photo_url) {
                courtObj.images = [{ publicUrl: court.photo_url }];
            }

            return courtObj;
        });

        const maxBookings = step6?.maxBookings
            ? parseInt(step6.maxBookings)
            : undefined;

        return {
            token,
            venueName: step1?.venueName || '',
            description: step1?.description,
            venuemail: step1?.venuemail || '',
            venuePhone: step1?.venuePhone || '',
            venueAddress: step1?.venueAddress || '',
            city: step1?.city || '',
            state: step1?.state,
            country: step1?.country,
            pincode: step1?.pincode,
            latitude: step1?.latitude,
            longitude: step1?.longitude,
            venueImages,
            venueHours,
            amenities: step4.map((a: any) => ({ name: a.name })),
            courts,
            advanceBookingDays: step6?.advanceDays,
            minimumNoticeMinutes: step6 ? step6.minNotice * 60 : undefined,
            cancellationPolicy: step6?.cancellationPolicy?.toUpperCase(),
            maxBookingPerPlayerDay: maxBookings,
            bankName: step7?.bankName || '',
            accountNumber: step7?.accountNumber || '',
            ifscCode: step7?.ifscCode || '',
            accountHolderName: step7?.holderName || '',
        };
    };

    const submitForReview = async () => {
        if (!agreed) {
            toast.error('Please agree to the terms and conditions.');
            return;
        }
        if (submitting) return; // prevent double-submission
        setSubmitting(true);
        try {
            await venueOnboard(buildPayload());
            [1, 2, 3, 4, 5, 6, 7].forEach((n) =>
                sessionStorage.removeItem(`onboarding_step${n}`),
            );
            sessionStorage.removeItem('inviteToken');
            sessionStorage.removeItem('inviteVenueId');
            toast.success('Venue onboarded!');
            navigate(path.dashboard);
        } catch (err: any) {
            toast.error(err?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!triggerSave) return;
        if (!agreed) {
            toast.error('Please agree to the terms and conditions.');
            onSaveComplete(false);
            return;
        }
        // Delegate to the button handler — avoids a second API call when
        // the user already clicked "Submit for Review" directly.
        if (!submitting) {
            submitForReview().then(() => onSaveComplete(true));
        }
    }, [triggerSave]); // eslint-disable-line

    useEffect(() => {
        if (!triggerExit) return;
        onExitComplete();
    }, [triggerExit]); // eslint-disable-line

    // Back from review — no data to persist, just navigate
    useEffect(() => {
        if (!triggerBack) return;
        onBackComplete();
    }, [triggerBack]); // eslint-disable-line

    const editStep = (step: number) =>
        navigate(`/onboarding/${venueId}/${urlToken}/step/${step}`);

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

    const standardAmenities = step4.filter((a: any) => !a.is_custom);
    const customAmenities = step4.filter((a: any) => a.is_custom);

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

            <SectionCard title="Venue Profile" step={1}>
                <div className="space-y-4">
                    {step1?.coverUrl && (
                        <div className="relative h-[180px] rounded-lg overflow-hidden">
                            <img
                                src={step1.coverUrl}
                                alt="Cover"
                                className="h-full w-full object-cover"
                            />
                            {step1?.logoUrl && (
                                <img
                                    src={step1.logoUrl}
                                    alt="Logo"
                                    className="absolute bottom-3 left-3 h-12 w-12 rounded-full border-2 border-card object-cover"
                                />
                            )}
                        </div>
                    )}
                    <div className="grid gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Name:</span>{' '}
                            <span className="font-medium">
                                {step1?.venueName}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">City:</span>{' '}
                            {step1?.city}
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Address:
                            </span>{' '}
                            {step1?.venueAddress}
                        </div>
                        {step1?.description && (
                            <div>
                                <span className="text-muted-foreground">
                                    Description:
                                </span>{' '}
                                {step1.description}
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground">
                                Email:
                            </span>{' '}
                            {step1?.venuemail}
                        </div>
                        {step1?.venuePhone && (
                            <div>
                                <span className="text-muted-foreground">
                                    WhatsApp:
                                </span>{' '}
                                +91 {step1.venuePhone}
                            </div>
                        )}
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Operating Hours" step={2}>
                <div className="space-y-1">
                    {step2.map((h: any) => (
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

            <SectionCard title="Courts" step={3}>
                {step3.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No courts added
                    </p>
                ) : (
                    <div className="space-y-3">
                        {step3.map((c: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                {c.photo_url ? (
                                    <img
                                        src={c.photo_url}
                                        alt={c.name}
                                        className="h-10 w-10 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                                        {SPORT_EMOJI[c.sport] ?? '🏟️'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">
                                            {c.name}
                                        </span>
                                        <span className="rounded-full bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))] px-2 py-0.5 text-[10px] font-bold">
                                            {c.sport}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {c.surface_material} ·{' '}
                                        {c.is_indoor ? 'Indoor' : 'Outdoor'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Facilities & Amenities" step={4}>
                {step4.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No amenities added
                    </p>
                ) : (
                    <div className="space-y-3">
                        {standardAmenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {standardAmenities.map((a: any) => (
                                    <span
                                        key={a.name}
                                        className="rounded-full bg-[hsl(var(--admin-navy))] px-3 py-1 text-xs text-[hsl(var(--admin-navy-foreground))]"
                                    >
                                        {a.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        {customAmenities.length > 0 && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                    Your Additions
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {customAmenities.map((a: any) => (
                                        <span
                                            key={a.name}
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

            <SectionCard title="Pricing" step={5}>
                {step3.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No pricing configured
                    </p>
                ) : (
                    <div className="space-y-4">
                        {/* Group courts by sport and show one pricing block per sport */}
                        {Array.from(
                            new Set(step3.map((c: any) => c.sport as string)),
                        ).map((sport) => {
                            const p: any = step5[sport];
                            const courtCount = step3.filter(
                                (c: any) => c.sport === sport,
                            ).length;
                            return (
                                <div key={sport} className="space-y-1">
                                    <p className="text-sm font-medium">
                                        {sport}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            ({courtCount} court
                                            {courtCount !== 1 ? 's' : ''})
                                        </span>
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                        <p>
                                            Base Rate: {isClubWithPoints ? `${p?.base_rate || 0} pts` : `₹${p?.base_rate || 0}`}/slot
                                        </p>
                                        {p?.peak_enabled &&
                                            Array.isArray(p.peak_slots) &&
                                            p.peak_slots.length > 0 && (
                                                <p>
                                                    Peak:{' '}
                                                    {p.peak_slots
                                                        .map(
                                                            (s: any) =>
                                                                isClubWithPoints
                                                                    ? `${s.rate} pts/slot (${s.start}–${s.end})`
                                                                    : `₹${s.rate}/slot (${s.start}–${s.end})`,
                                                        )
                                                        .join(', ')}
                                                </p>
                                            )}
                                        {p?.weekend_rate_enabled && (
                                            <p>
                                                Weekend: {isClubWithPoints ? `${p.weekend_rate} pts` : `₹${p.weekend_rate}`}/slot
                                                {p?.weekend_peak_enabled &&
                                                    Array.isArray(
                                                        p.weekend_peak_slots,
                                                    ) &&
                                                    p.weekend_peak_slots
                                                        .length > 0 && (
                                                        <>
                                                            {' '}
                                                            · Peak:{' '}
                                                            {p.weekend_peak_slots
                                                                .map(
                                                                    (s: any) =>
                                                                        isClubWithPoints
                                                                            ? `${s.rate} pts/slot (${s.start}–${s.end})`
                                                                            : `₹${s.rate}/slot (${s.start}–${s.end})`,
                                                                )
                                                                .join(', ')}
                                                        </>
                                                    )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Booking Rules" step={6}>
                {!step6 ? (
                    <p className="text-sm text-muted-foreground italic">
                        Not configured
                    </p>
                ) : (
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="text-muted-foreground">
                                Advance window:
                            </span>{' '}
                            {step6.advanceDays} day(s)
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Min notice:
                            </span>{' '}
                            {step6.minNotice} hour(s)
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Cancellation:
                            </span>{' '}
                            {step6.cancellationPolicy}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Auto-confirm:
                            </span>{' '}
                            {step6.autoConfirm ? 'Yes' : 'No'}
                        </p>
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Payout Details" step={7}>
                {!step7 ? (
                    <p className="text-sm text-muted-foreground italic">
                        Not configured
                    </p>
                ) : (
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="text-muted-foreground">Bank:</span>{' '}
                            {step7.bankName}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Holder:
                            </span>{' '}
                            {step7.holderName}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Account:
                            </span>{' '}
                            {maskAccount(step7.accountNumber || '')}
                        </p>
                        <p>
                            <span className="text-muted-foreground">IFSC:</span>{' '}
                            {maskIfsc(step7.ifscCode || '')}
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
                            accurate and up-to-date.
                        </p>
                        <p>
                            <strong>2. Commission.</strong> The platform charges
                            a commission on each completed booking.
                        </p>
                        <p>
                            <strong>3. Payouts.</strong> Payouts are processed
                            according to the platform's payout schedule.
                        </p>
                        <p>
                            <strong>4. Cancellation.</strong> You must honour
                            the cancellation policy selected during onboarding.
                        </p>
                        <p>
                            <strong>5. Data Protection.</strong> Both parties
                            agree to handle player and venue data in accordance
                            with applicable data protection regulations.
                        </p>
                        <p>
                            <strong>6. Termination.</strong> Either party may
                            terminate this agreement with 30 days written
                            notice.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StepReview;
