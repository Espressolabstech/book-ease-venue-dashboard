import { ArrowLeft, Save } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { canEdit, useVenueRole } from '../../hooks/useVenueRole';
import { toast } from 'sonner';
import HubView from '../../components/settings/hubView';
import HoursSection from '../../components/settings/hoursSection';
import PeakSection from '../../components/settings/peakSection';
import CourtsSection from '../../components/settings/courtSection';
import DowntimeSection from '../../components/settings/downtimeSection';
import FacilitySection from '../../components/settings/facilitySection';
import BookingRulesSection from '../../components/settings/bookingRulesSection';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { path } from '../../navigation/commanPaths';
import {
    getCourts,
    createCourt,
    updateCourt,
    deleteCourt as deleteCourtApi,
} from '../../api/adapters/courts';
import { listVenueHours, saveVenueHour } from '../../api/adapters/venueHours';
import {
    listPeakHourPricings,
    createPeakHourPricing,
    deletePeakHourPricing,
} from '../../api/adapters/peakHourPricing';
import { updateCourtPricing } from '../../api/adapters/courtPricing';
import {
    listAmenities,
    createAmenity,
    deleteAmenity,
} from '../../api/adapters/amenities';
import {
    getOnBoardedVenueDetails,
    updateVenueDescription,
    updateVenueInfo,
} from '../../api/adapters/onBoard';
import { getPrivateClubConfig } from '../../api/adapters/privateClub';
import {
    listDowntimes,
    createDowntime as createDowntimeApi,
    deleteDowntime as deleteDowntimeApi,
} from '../../api/adapters/downtime';
import {
    getBookingPolicy,
    updateBookingPolicy,
} from '../../api/adapters/bookingPolicy';
import { SPORT_DISPLAY, SPORT_API } from '../../utils/settings';
import { API_TO_SURFACE, SURFACE_TO_API, envFromApi, envToApi, getSurfaceOptions } from '../../utils/sportFields';
import type { EnvironmentOption } from '../../utils/sportFields';

// ── Day index helpers ─────────────────────────────────────────────────────────
const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function venueHoursToOperatingHours(
    apiHours: VenueHoursModel[],
): OperatingHours[] {
    return DAY_NAMES.map((day, i) => {
        const entry = apiHours.find((h) => h.dayOfWeek === i);
        return {
            day,
            isOpen: entry ? !entry.isClosed : true,
            openTime: entry?.openTime ?? '08:00',
            closeTime: entry?.closeTime ?? '22:00',
            id: entry?.id,
        };
    });
}

// ── Day index helpers (continued) ─────────────────────────────────────────────

function courtModelToCourtData(c: CourtModel, isClub = false): CourtData {
    return {
        id: c.id,
        name: c.name,
        sport: SPORT_DISPLAY[c.sport] ?? c.sport,
        environment: envFromApi(c.environment),
        surfaceMaterial: API_TO_SURFACE[c.surface] ?? c.surface,
        isActive: c.status === 'ACTIVE',
        pricePerSlot: isClub
            ? (c.courtPricings[0]?.pointsPerSlot ?? c.courtPricings[0]?.pricePerSlot ?? 0)
            : (c.courtPricings[0]?.pricePerSlot ?? 0),
    };
}

const defaultHours: OperatingHours[] = DAY_NAMES.map((day) => ({
    day,
    isOpen: true,
    openTime: '08:00',
    closeTime: '22:00',
}));

const Settings = () => {
    const navigate = useNavigate();
    const role = useVenueRole();
    const readOnly = !canEdit(role);
    const [section, setSection] = useState<Section>('hub');
    const [activeSport, setActiveSport] = useState('Padel');

    // ── API-backed state ──
    const [isClub, setIsClub] = useState(false);
    const isClubRef = useRef(false);
    const [courts, setCourts] = useState<CourtData[]>([]);
    const [courtsRaw, setCourtsRaw] = useState<CourtModel[]>([]);
    const [hours, setHours] = useState<OperatingHours[]>(defaultHours);
    const [peakConfigs, setPeakConfigs] = useState<SportPeakConfig[]>([]);
    const [amenities, setAmenities] = useState<AmenityModel[]>([]);
    const [facility, setFacility] = useState<FacilityInfo>({
        bio: '',
        amenities: [],
        address: '',
        phone: '',
        latitude: '',
        longitude: '',
    });

    // ── Loading / saving flags ──
    const [loadingSection, setLoadingSection] = useState<Section | null>(null);
    const [savingHours, setSavingHours] = useState(false);
    const [savingPeak, setSavingPeak] = useState(false);
    const [savingFacility, setSavingFacility] = useState(false);
    const [bookingPolicy, setBookingPolicy] =
        useState<BookingPolicyModel | null>(null);
    const [loadingPolicy, setLoadingPolicy] = useState(false);
    const [savingPolicy, setSavingPolicy] = useState(false);
    const [policyDraft, setPolicyDraft] = useState<UpdateBookingPolicyPayload>(
        {},
    );

    // ── Local UI state ──
    const [downtimes, setDowntimes] = useState<ScheduledDowntime[]>([]);
    const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<CourtData | null>(null);
    const [deleteCourtId, setDeleteCourtId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddDowntime, setShowAddDowntime] = useState<string | null>(null);
    const [newDowntime, setNewDowntime] = useState({
        courtId: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        reason: '',
    });
    const [newCourt, setNewCourt] = useState<Omit<CourtData, 'id'>>({
        name: '',
        sport: activeSport,
        environment: 'Indoor',
        surfaceMaterial: '',
        isActive: true,
        pricePerSlot: 0,
    });

    // ── Data fetchers ────────────────────────────────────────────────────────────

    const fetchCourts = useCallback(async () => {
        setLoadingSection('courts');
        try {
            const res = await getCourts();
            setCourtsRaw(res.data.courts);
            setCourts(res.data.courts.map((c) => courtModelToCourtData(c, isClubRef.current)));
        } catch {
            toast.error('Failed to load courts');
        } finally {
            setLoadingSection(null);
        }
    }, []);

    const fetchHours = useCallback(async () => {
        setLoadingSection('hours');
        try {
            const res = await listVenueHours();
            setHours(venueHoursToOperatingHours(res.data.venueHours));
        } catch {
            toast.error('Failed to load operating hours');
        } finally {
            setLoadingSection(null);
        }
    }, []);

    const fetchPeakHours = useCallback(async () => {
        if (!courtsRaw.length) return;
        setLoadingSection('peak');
        try {
            // Fetch peak pricings for every court, then group by sport
            const allPeaks = await Promise.all(
                courtsRaw.map((c) =>
                    listPeakHourPricings({ courtId: c.id }).then((r) => ({
                        sport: SPORT_DISPLAY[c.sport] ?? c.sport,
                        offPeakPrice: isClubRef.current
                            ? (c.courtPricings[0]?.pointsPerSlot ?? c.courtPricings[0]?.pricePerSlot ?? 0)
                            : (c.courtPricings[0]?.pricePerSlot ?? 0),
                        peaks: r.data.peakHourPricings,
                    })),
                ),
            );

            // One config per display-sport.
            // Merge peaks from ALL courts (not just the first) so that if court 1
            // has no peaks but court 2 does, we still see them. Deduplicate by
            // startTime|endTime|dayOfWeek so multiple courts don't create duplicate rows.
            const bySport: Record<string, SportPeakConfig> = {};
            for (const { sport, offPeakPrice, peaks } of allPeaks) {
                if (!bySport[sport]) {
                    bySport[sport] = {
                        sport,
                        offPeakPrice,
                        peakPrice: 0,
                        slots: [],
                    };
                }
                const config = bySport[sport];
                // Use the first non-empty court's prices as representative
                if (peaks.length > 0 && config.peakPrice === 0) {
                    config.peakPrice = isClubRef.current
                        ? (peaks[0].pointsPerSlot ?? peaks[0].pricePerSlot)
                        : peaks[0].pricePerSlot;
                    config.offPeakPrice = offPeakPrice;
                }
                // Build a dedup key per unique {startTime, endTime, dayOfWeek}
                const seen = new Set(
                    config.slots.map(
                        (s) => `${s.startTime}|${s.endTime}|${s.days[0] ?? ''}`,
                    ),
                );
                for (const p of peaks) {
                    const dayStr =
                        p.dayOfWeek !== null ? SHORT_DAYS[p.dayOfWeek] : '';
                    const key = `${p.startTime}|${p.endTime}|${dayStr}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        config.slots.push({
                            id: p.id,
                            startTime: p.startTime,
                            endTime: p.endTime,
                            // dayOfWeek null means "all days" — expand so UI shows
                            // all days highlighted instead of none
                            days:
                                p.dayOfWeek !== null
                                    ? [SHORT_DAYS[p.dayOfWeek]]
                                    : [
                                          'Mon',
                                          'Tue',
                                          'Wed',
                                          'Thu',
                                          'Fri',
                                          'Sat',
                                          'Sun',
                                      ],
                        });
                    }
                }
            }

            // Use only sports that actually have courts
            const configs: SportPeakConfig[] = Object.values(bySport);

            setPeakConfigs(configs);
        } catch {
            toast.error('Failed to load peak hours');
        } finally {
            setLoadingSection(null);
        }
    }, [courtsRaw]);

    const fetchAmenities = useCallback(async () => {
        try {
            const [amenitiesRes, venueRes] = await Promise.all([
                listAmenities(),
                getOnBoardedVenueDetails(),
            ]);
            setAmenities(amenitiesRes.data.amenities);
            setFacility({
                bio: venueRes.data.venue.description ?? '',
                amenities: amenitiesRes.data.amenities.map(
                    (a: AmenityModel) => a.name,
                ),
                address: venueRes.data.venue.address ?? '',
                phone: venueRes.data.venue.phone ?? '',
                latitude:
                    venueRes.data.venue.latitude != null
                        ? String(venueRes.data.venue.latitude)
                        : '',
                longitude:
                    venueRes.data.venue.longitude != null
                        ? String(venueRes.data.venue.longitude)
                        : '',
            });
        } catch {
            toast.error('Failed to load amenities');
        }
    }, []);

    const fetchDowntimes = useCallback(async () => {
        try {
            const res = (await listDowntimes()) as {
                data: { downtimes: ScheduledDowntime[] };
            };
            setDowntimes(res.data.downtimes);
        } catch {
            toast.error('Failed to load downtimes');
        }
    }, []);

    const fetchClubConfig = useCallback(async () => {
        try {
            const res = await getPrivateClubConfig();
            const club = res.data.config.isPrivateClub && res.data.config.pointsEnabled;
            isClubRef.current = club;
            setIsClub(club);
        } catch {
            // Not a club venue — leave isClub as false
        }
    }, []);

    const fetchPolicy = useCallback(async () => {
        setLoadingPolicy(true);
        try {
            const res = await getBookingPolicy();
            setBookingPolicy(res.data.bookingPolicy);
            setPolicyDraft({});
        } catch {
            toast.error('Failed to load booking rules');
        } finally {
            setLoadingPolicy(false);
        }
    }, []);

    const savePolicy = async () => {
        setSavingPolicy(true);
        try {
            const res = await updateBookingPolicy(policyDraft);
            setBookingPolicy(res.data.bookingPolicy);
            setPolicyDraft({});
            toast.success('Booking rules saved');
        } catch {
            toast.error('Failed to save booking rules');
        } finally {
            setSavingPolicy(false);
        }
    };

    // ── Initial load ─────────────────────────────────────────────────────────────

    // Re-derive court display data when isClub resolves (avoids double API call)
    useEffect(() => {
        if (courtsRaw.length) {
            setCourts(courtsRaw.map((c) => courtModelToCourtData(c, isClub)));
        }
    }, [isClub]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchClubConfig();
        fetchCourts();
        fetchHours();
        fetchAmenities();
        fetchPolicy();
        fetchDowntimes();
    }, [fetchClubConfig, fetchCourts, fetchHours, fetchAmenities, fetchPolicy, fetchDowntimes]);

    useEffect(() => {
        if (courtsRaw.length) fetchPeakHours();
    }, [courtsRaw, fetchPeakHours]);

    const sectionTitle: Record<Section, string> = {
        hub: 'Venue Management',
        hours: 'Operating Hours',
        peak: 'Pricing & Peak Hours',
        courts: activeSport ? `${activeSport} Courts` : 'Manage Courts',
        downtime: 'Scheduled Downtime',
        facility: 'Facility Info',
        policy: 'Booking Rules',
    };

    const goBack = () => {
        if (section === 'hub') navigate(path.dashboard);
        else if (section === 'courts' && activeSport) {
            // From sport-specific courts view → go back to sport picker
            setActiveSport('');
            setShowAddForm(false);
            setEditingCourtId(null);
            setEditForm(null);
        } else {
            setSection('hub');
            setShowAddForm(false);
            setEditingCourtId(null);
            setEditForm(null);
        }
    };

    // ── Operating hours (local toggle + bulk save) ────────────────────────────
    const toggleDay = (i: number) =>
        setHours((p) =>
            p.map((h, idx) => (idx === i ? { ...h, isOpen: !h.isOpen } : h)),
        );
    const updateTime = (
        i: number,
        field: 'openTime' | 'closeTime',
        v: string,
    ) =>
        setHours((p) =>
            p.map((h, idx) => (idx === i ? { ...h, [field]: v } : h)),
        );

    const saveHours = async () => {
        setSavingHours(true);
        try {
            await Promise.all(
                hours.map((h, i) =>
                    saveVenueHour({
                        dayOfWeek: i,
                        openTime: h.isOpen ? h.openTime : '00:00',
                        closeTime: h.isOpen ? h.closeTime : '00:00',
                        isClosed: !h.isOpen,
                    }),
                ),
            );
            toast.success('Operating hours saved');
            fetchHours();
        } catch {
            toast.error('Failed to save hours');
        } finally {
            setSavingHours(false);
        }
    };

    // ── Peak hours ────────────────────────────────────────────────────────────
    const getSportPeak = (sport: string) =>
        peakConfigs.find((c) => c.sport === sport) || {
            sport,
            peakPrice: 0,
            offPeakPrice: 0,
            slots: [],
        };

    const updateSportPrice = (
        sport: string,
        field: 'peakPrice' | 'offPeakPrice',
        value: number,
    ) => {
        setPeakConfigs((prev) =>
            prev.map((c) => (c.sport === sport ? { ...c, [field]: value } : c)),
        );
    };

    const addPeakSlot = (sport: string) => {
        setPeakConfigs((prev) =>
            prev.map((c) =>
                c.sport === sport
                    ? {
                          ...c,
                          slots: [
                              ...c.slots,
                              {
                                  id: `p${Date.now()}`,
                                  startTime: '',
                                  endTime: '',
                                  days: [],
                              },
                          ],
                      }
                    : c,
            ),
        );
    };

    const updatePeakSlot = (
        sport: string,
        slotId: string,
        updates: Partial<PeakHourSlot>,
    ) => {
        setPeakConfigs((prev) =>
            prev.map((c) =>
                c.sport === sport
                    ? {
                          ...c,
                          slots: c.slots.map((s) =>
                              s.id === slotId ? { ...s, ...updates } : s,
                          ),
                      }
                    : c,
            ),
        );
    };

    const removePeakSlot = (sport: string, slotId: string) => {
        // Only update local state — save uses full replace so it will delete
        // all DB records (across every court) and recreate from current state.
        setPeakConfigs((prev) =>
            prev.map((c) =>
                c.sport === sport
                    ? { ...c, slots: c.slots.filter((s) => s.id !== slotId) }
                    : c,
            ),
        );
    };

    const togglePeakDay = (sport: string, slotId: string, day: string) => {
        const config = getSportPeak(sport);
        const slot = config.slots.find((s) => s.id === slotId);
        if (!slot) return;
        const days = slot.days.includes(day)
            ? slot.days.filter((d) => d !== day)
            : [...slot.days, day];
        updatePeakSlot(sport, slotId, { days });
    };

    const savePeakHours = async () => {
        setSavingPeak(true);
        try {
            // All courts grouped by display-sport
            const courtsBySportDisplay: Record<string, string[]> = {};
            for (const c of courtsRaw) {
                const displaySport = SPORT_DISPLAY[c.sport] ?? c.sport;
                if (!courtsBySportDisplay[displaySport])
                    courtsBySportDisplay[displaySport] = [];
                courtsBySportDisplay[displaySport].push(c.id);
            }

            // Full replace: for each sport, delete ALL existing peak records
            // across ALL courts, then create fresh records from current state.
            // This ensures day changes persist and all courts stay in sync.
            for (const config of peakConfigs) {
                const courtIds = courtsBySportDisplay[config.sport] ?? [];

                // Fetch and delete every existing active record for all courts
                const existingResults = await Promise.all(
                    courtIds.map((id) => listPeakHourPricings({ courtId: id })),
                );
                const allExistingIds = existingResults.flatMap((r) =>
                    r.data.peakHourPricings.map((p) => p.id),
                );
                await Promise.all(
                    allExistingIds.map((id) => deletePeakHourPricing(id)),
                );

                // Create one record per court × per slot × per selected day.
                // Skip slots with no days or no times (incomplete entries).
                const validSlots = config.slots.filter(
                    (s) => s.startTime && s.endTime && s.days.length > 0,
                );
                await Promise.all(
                    courtIds.flatMap((courtId) =>
                        validSlots.flatMap((s) =>
                            s.days.map((day) => {
                                const dayOfWeek = SHORT_DAYS.indexOf(day);
                                return createPeakHourPricing({
                                    courtId,
                                    startTime: s.startTime,
                                    endTime: s.endTime,
                                    pricePerSlot: isClub ? 0 : config.peakPrice,
                                    ...(isClub ? { pointsPerSlot: config.peakPrice } : {}),
                                    ...(dayOfWeek >= 0 ? { dayOfWeek } : {}),
                                });
                            }),
                        ),
                    ),
                );
            }

            // Also update offPeakPrice (base court pricing) for each sport
            await Promise.all(
                peakConfigs.map((c) => {
                    const apiSport = SPORT_API[c.sport];
                    const sportCourts = courtsRaw.filter(
                        (r) => r.sport === apiSport,
                    );
                    return Promise.all(
                        sportCourts
                            .filter((r) => r.courtPricings[0])
                            .map((r) =>
                                updateCourtPricing(r.courtPricings[0].id, isClub
                                    ? { pricePerSlot: 0, pointsPerSlot: c.offPeakPrice }
                                    : { pricePerSlot: c.offPeakPrice },
                                ),
                            ),
                    );
                }),
            );

            toast.success('Peak hours & pricing saved');
            fetchCourts(); // refreshes courtsRaw → triggers useEffect → fetchPeakHours with fresh offPeakPrice
        } catch {
            toast.error('Failed to save peak hours');
        } finally {
            setSavingPeak(false);
        }
    };

    // ── First-time pricing dialog ─────────────────────────────────────────────
    const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
    const [pendingCourt, setPendingCourt] = useState<Omit<CourtData, 'id'> | null>(null);
    const [pendingPricing, setPendingPricing] = useState<{
        offPeakPrice: string;
        peakEnabled: boolean;
        peakPrice: string;
        startTime: string;
        endTime: string;
        days: string[];
    }>({
        offPeakPrice: '',
        peakEnabled: false,
        peakPrice: '',
        startTime: '17:00',
        endTime: '22:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    });

    // ── Court CRUD ────────────────────────────────────────────────────────────
    const startEdit = (court: CourtData) => {
        setEditingCourtId(court.id);
        setEditForm({ ...court });
    };
    const cancelEdit = () => {
        setEditingCourtId(null);
        setEditForm(null);
    };
    const saveEdit = async () => {
        if (!editForm) return;
        try {
            const environment: CourtEnvironment = envToApi(editForm.environment);
            const status: CourtStatus = editForm.isActive
                ? 'ACTIVE'
                : 'INACTIVE';
            const rawCourt = courtsRaw.find((c) => c.id === editForm.id);
            const pricingId = rawCourt?.courtPricings[0]?.id;
            await updateCourt(editForm.id, {
                name: editForm.name,
                environment,
                status,
            });
            if (pricingId) {
                await updateCourtPricing(
                    pricingId,
                    isClub
                        ? { pricePerSlot: 0, pointsPerSlot: editForm.pricePerSlot }
                        : { pricePerSlot: editForm.pricePerSlot },
                );
            }
            cancelEdit();
            toast.success('Court updated');
            fetchCourts();
        } catch {
            toast.error('Failed to update court');
        }
    };
    const commitCourt = async (court: Omit<CourtData, 'id'>) => {
        try {
            const sport: SportType = (SPORT_API[court.sport] ?? 'PADEL') as SportType;
            const environment: CourtEnvironment = envToApi(court.environment);
            const timeSlots = hours
                .map((h, i) =>
                    h.isOpen
                        ? { dayOfWeek: i, startTime: h.openTime, endTime: h.closeTime }
                        : null,
                )
                .filter(Boolean) as CreateCourtTimeSlotPayload[];

            await createCourt({
                name: court.name,
                sport,
                environment,
                surface: SURFACE_TO_API[court.surfaceMaterial] ?? 'ARTIFICIAL_GRASS',
                timeSlots,
                pricing: isClub
                    ? { pricePerSlot: 0, pointsPerSlot: court.pricePerSlot }
                    : { pricePerSlot: court.pricePerSlot },
            });
            const addedSport = court.sport;
            setShowAddForm(false);
            setActiveSport(addedSport);
            setNewCourt({ name: '', sport: addedSport, environment: 'Indoor', surfaceMaterial: '', isActive: true, pricePerSlot: 0 });
            toast.success('Court added');
            fetchCourts();
        } catch {
            toast.error('Failed to add court');
        }
    };

    const addCourt = async () => {
        if (!newCourt.name.trim()) {
            toast.error('Court name is required');
            return;
        }
        const availableSurfaces = getSurfaceOptions(newCourt.sport, newCourt.environment as EnvironmentOption);
        if (availableSurfaces.length > 0 && !newCourt.surfaceMaterial) {
            toast.error('Surface material is required');
            return;
        }
        // If this sport has no pricing yet, show the pricing dialog first
        const existingConfig = peakConfigs.find((c) => c.sport === newCourt.sport);
        if (!existingConfig || existingConfig.offPeakPrice <= 0) {
            setPendingCourt({ ...newCourt });
            setPendingPricing({ offPeakPrice: '', peakEnabled: false, peakPrice: '', startTime: '17:00', endTime: '22:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] });
            setPricingDialogOpen(true);
            return;
        }
        await commitCourt(newCourt);
    };

    const confirmPricingAndAddCourt = async () => {
        if (!pendingCourt) return;
        const off = parseFloat(pendingPricing.offPeakPrice);
        if (!off || off <= 0) { toast.error('Enter a valid rate'); return; }
        const peak = pendingPricing.peakEnabled ? parseFloat(pendingPricing.peakPrice) : off;
        if (pendingPricing.peakEnabled && (!peak || peak <= off)) {
            toast.error('Peak rate must be higher than standard rate');
            return;
        }
        const courtToAdd = { ...pendingCourt, pricePerSlot: off };
        // Store pricing config locally so it's available for future courts of same sport
        setPeakConfigs((prev) => {
            const others = prev.filter((c) => c.sport !== courtToAdd.sport);
            return [
                ...others,
                {
                    sport: courtToAdd.sport,
                    offPeakPrice: off,
                    peakPrice: peak,
                    slots: pendingPricing.peakEnabled
                        ? [{ id: `p${Date.now()}`, startTime: pendingPricing.startTime, endTime: pendingPricing.endTime, days: pendingPricing.days.length ? pendingPricing.days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }]
                        : [],
                },
            ];
        });
        setPricingDialogOpen(false);
        setPendingCourt(null);
        await commitCourt(courtToAdd);
    };
    const handleDeleteCourt = async () => {
        if (!deleteCourtId) return;
        try {
            await deleteCourtApi(deleteCourtId);
            setDeleteCourtId(null);
            toast.success('Court deleted');
            fetchCourts();
        } catch {
            toast.error('Failed to delete court');
        }
    };

    // ── Downtime ──────────────────────────────────────────────────────────────
    const addDowntimeEntry = async () => {
        if (
            !newDowntime.courtId ||
            !newDowntime.startDate ||
            !newDowntime.startTime ||
            !newDowntime.endTime ||
            !newDowntime.reason.trim()
        ) {
            toast.error('Court, date, time range & reason required');
            return;
        }
        try {
            await createDowntimeApi({
                courtId: newDowntime.courtId,
                startDate: newDowntime.startDate,
                endDate: newDowntime.endDate || newDowntime.startDate,
                startTime: newDowntime.startTime,
                endTime: newDowntime.endTime,
                reason: newDowntime.reason,
            });
            setShowAddDowntime(null);
            setNewDowntime({
                courtId: '',
                startDate: '',
                endDate: '',
                startTime: '',
                endTime: '',
                reason: '',
            });
            toast.success('Downtime scheduled');
            fetchDowntimes();
        } catch {
            toast.error('Failed to schedule downtime');
        }
    };

    const removeDowntime = async (id: string) => {
        try {
            await deleteDowntimeApi(id);
            setDowntimes((prev) => prev.filter((d) => d.id !== id));
            toast.success('Downtime removed');
        } catch {
            toast.error('Failed to remove downtime');
        }
    };

    // ── Facility / Amenities ──────────────────────────────────────────────────
    const toggleAmenity = async (amenityName: string) => {
        const isCurrentlyActive = facility.amenities.includes(amenityName);
        const existing = amenities.find((a) => a.name === amenityName);

        // Optimistic UI update
        setFacility((prev) => ({
            ...prev,
            amenities: isCurrentlyActive
                ? prev.amenities.filter((a) => a !== amenityName)
                : [...prev.amenities, amenityName],
        }));

        try {
            if (isCurrentlyActive && existing) {
                // Deselect → delete the DB record
                await deleteAmenity(existing.id);
                setAmenities((prev) =>
                    prev.filter((a) => a.id !== existing.id),
                );
            } else if (!isCurrentlyActive && !existing) {
                // Select → create a new DB record
                const res = await createAmenity({ name: amenityName });
                setAmenities((prev) => [...prev, res.data.amenity]);
            }
            // If existing + not active → already exists, nothing to do
        } catch {
            toast.error('Failed to update amenity');
            fetchAmenities(); // Revert on error
        }
    };

    const saveFacility = async () => {
        setSavingFacility(true);
        try {
            // Amenity toggles are saved individually on tap.
            await updateVenueDescription(facility.bio);
            await updateVenueInfo({
                address: facility.address || undefined,
                phone: facility.phone || undefined,
                latitude: facility.latitude
                    ? parseFloat(facility.latitude)
                    : undefined,
                longitude: facility.longitude
                    ? parseFloat(facility.longitude)
                    : undefined,
            });
            toast.success('Facility info saved');
        } catch {
            toast.error('Failed to save facility info');
        } finally {
            setSavingFacility(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-8">
            <header className="flex items-center gap-3 bg-primary px-4 pb-4 pt-10 text-primary-foreground">
                <button
                    onClick={goBack}
                    className="rounded-full p-1 hover:bg-primary-foreground/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="font-semibold">{sectionTitle[section]}</h1>
                {loadingSection === section && (
                    <span className="ml-auto text-xs opacity-70">Loading…</span>
                )}
            </header>

            <main className="mx-auto max-w-lg px-4 pt-4">
                {section === 'hub' && (
                    <HubView
                        courts={courts}
                        downtimes={downtimes}
                        peakConfigs={peakConfigs}
                        facility={facility}
                        onNavigate={(s, sport) => {
                            setSection(s);

                            if (sport === '') {
                                // Navigate to sport picker
                                setActiveSport('');
                                setShowAddForm(false);
                            } else if (sport === '__new__') {
                                setActiveSport('');
                                setShowAddForm(true);
                                setNewCourt({ name: '', sport: 'Padel', environment: 'Indoor', surfaceMaterial: '', isActive: true, pricePerSlot: 0 });
                            } else if (sport) {
                                setActiveSport(sport);
                                setNewCourt((p) => ({ ...p, sport }));
                            }
                        }}
                    />
                )}
                {section === 'hours' && (
                    <HoursSection
                        hours={hours}
                        toggleDay={toggleDay}
                        updateTime={updateTime}
                        onSave={saveHours}
                        saving={savingHours}
                    />
                )}
                {section === 'peak' && (
                    <PeakSection
                        peakConfigs={peakConfigs}
                        addSlot={addPeakSlot}
                        updateSlot={updatePeakSlot}
                        removeSlot={removePeakSlot}
                        toggleDay={togglePeakDay}
                        updatePrice={updateSportPrice}
                        onSave={savePeakHours}
                        saving={savingPeak}
                        readOnly={readOnly}
                        isClub={isClub}
                    />
                )}
                {section === 'courts' && (
                    <CourtsSection
                        sport={activeSport}
                        allCourts={courts}
                        courts={activeSport ? courts.filter((c) => c.sport === activeSport) : []}
                        isClub={isClub}
                        downtimes={downtimes}
                        editingCourtId={editingCourtId}
                        editForm={editForm}
                        showAddForm={showAddForm}
                        newCourt={newCourt}
                        onSelectSport={(s) => {
                            setActiveSport(s);
                            setNewCourt((p) => ({ ...p, sport: s }));
                        }}
                        onStartEdit={startEdit}
                        onCancelEdit={cancelEdit}
                        onSaveEdit={saveEdit}
                        onAddCourt={addCourt}
                        onSetShowAdd={setShowAddForm}
                        onSetDeleteId={setDeleteCourtId}
                        onNewCourtChange={(u) =>
                            setNewCourt((p) => ({ ...p, ...u }))
                        }
                        onEditFormChange={(u) =>
                            setEditForm((p) => (p ? { ...p, ...u } : p))
                        }
                        onNavigate={(s) => setSection(s)}
                    />
                )}
                {section === 'downtime' && (
                    <DowntimeSection
                        courts={courts}
                        downtimes={downtimes}
                        showAdd={!!showAddDowntime}
                        newDowntime={newDowntime}
                        onShowAdd={() => setShowAddDowntime('open')}
                        onCancelAdd={() => {
                            setShowAddDowntime(null);
                            setNewDowntime({
                                courtId: '',
                                startDate: '',
                                endDate: '',
                                startTime: '',
                                endTime: '',
                                reason: '',
                            });
                        }}
                        onNewChange={(u) =>
                            setNewDowntime((p) => ({ ...p, ...u }))
                        }
                        onAdd={addDowntimeEntry}
                        onRemove={removeDowntime}
                    />
                )}
                {section === 'facility' && (
                    <FacilitySection
                        facility={facility}
                        onBioChange={(bio) =>
                            setFacility((p) => ({ ...p, bio }))
                        }
                        onFieldChange={(field, value) =>
                            setFacility((p) => ({ ...p, [field]: value }))
                        }
                        onToggleAmenity={toggleAmenity}
                        onSave={saveFacility}
                        saving={savingFacility}
                        readOnly={readOnly}
                    />
                )}
                {section === 'policy' && (
                    <BookingRulesSection
                        policy={
                            bookingPolicy
                                ? {
                                      ...bookingPolicy,
                                      ...(policyDraft.advanceBookingDays !==
                                          undefined && {
                                          adavanceBookingDays:
                                              policyDraft.advanceBookingDays,
                                      }),
                                      ...(policyDraft.minimumNoticeMinutes !==
                                          undefined && {
                                          minimumNoticeMinutes:
                                              policyDraft.minimumNoticeMinutes,
                                      }),
                                      ...(policyDraft.minimumSlotMinutes !==
                                          undefined && {
                                          minimumSlotMinutes:
                                              policyDraft.minimumSlotMinutes,
                                      }),
                                      ...(policyDraft.cancellationPolicy !==
                                          undefined && {
                                          cancellationPolicy:
                                              policyDraft.cancellationPolicy,
                                      }),
                                      ...(policyDraft.autoConfirm !==
                                          undefined && {
                                          autoConfirm: policyDraft.autoConfirm,
                                      }),
                                      ...(policyDraft.maxBookingsPerPlayerDay !==
                                          undefined && {
                                          maxBookingsPerPlayerDay:
                                              policyDraft.maxBookingsPerPlayerDay,
                                      }),
                                  }
                                : null
                        }
                        loading={loadingPolicy}
                        saving={savingPolicy}
                        onChange={(updates) =>
                            setPolicyDraft((p) => ({ ...p, ...updates }))
                        }
                        onSave={savePolicy}
                    />
                )}
            </main>

            <AlertDialog
                open={!!deleteCourtId}
                onOpenChange={() => setDeleteCourtId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Court</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this court and all its
                            scheduled slots.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourt}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── First-time pricing dialog ── */}
            <Dialog
                open={pricingDialogOpen}
                onOpenChange={(open) => {
                    if (!open) { setPricingDialogOpen(false); setPendingCourt(null); }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Set {pendingCourt?.sport} pricing</DialogTitle>
                        <DialogDescription>
                            Set a rate before adding your first {pendingCourt?.sport} court. All {pendingCourt?.sport} courts share these rates — you can refine them later under Pricing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {!pendingPricing.peakEnabled ? (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    {isClub ? 'Points per slot' : 'Rate per slot'}
                                </Label>
                                <div className="relative">
                                    {!isClub && (
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground">₹</span>
                                    )}
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        value={pendingPricing.offPeakPrice}
                                        onChange={(e) => setPendingPricing((p) => ({ ...p, offPeakPrice: e.target.value }))}
                                        placeholder="150"
                                        className={`h-11 text-base font-medium ${!isClub ? 'pl-7' : ''}`}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">Standard rate</Label>
                                    <div className="relative">
                                        {!isClub && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>}
                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            value={pendingPricing.offPeakPrice}
                                            onChange={(e) => setPendingPricing((p) => ({ ...p, offPeakPrice: e.target.value }))}
                                            className={`h-11 text-base font-medium ${!isClub ? 'pl-7' : ''}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">Peak rate</Label>
                                    <div className="relative">
                                        {!isClub && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>}
                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            value={pendingPricing.peakPrice}
                                            onChange={(e) => setPendingPricing((p) => ({ ...p, peakPrice: e.target.value }))}
                                            className={`h-11 text-base font-medium ${!isClub ? 'pl-7' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                            <div>
                                <p className="text-sm font-medium text-foreground">Enable peak pricing</p>
                                <p className="text-xs text-muted-foreground">Charge more during high-demand windows</p>
                            </div>
                            <Switch
                                checked={pendingPricing.peakEnabled}
                                onCheckedChange={(v) => setPendingPricing((p) => {
                                    const off = parseFloat(p.offPeakPrice) || 0;
                                    return {
                                        ...p,
                                        peakEnabled: v,
                                        peakPrice: v && !p.peakPrice && off > 0 ? String(Math.round(off * 1.25)) : p.peakPrice,
                                    };
                                })}
                            />
                        </div>

                        {pendingPricing.peakEnabled && (
                            <div className="space-y-2">
                                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Peak window</Label>
                                <div className="flex items-center gap-1.5">
                                    <Input type="time" value={pendingPricing.startTime} onChange={(e) => setPendingPricing((p) => ({ ...p, startTime: e.target.value }))} className="h-9 text-xs" />
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <Input type="time" value={pendingPricing.endTime} onChange={(e) => setPendingPricing((p) => ({ ...p, endTime: e.target.value }))} className="h-9 text-xs" />
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => {
                                        const active = pendingPricing.days.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setPendingPricing((p) => ({
                                                    ...p,
                                                    days: active ? p.days.filter((d) => d !== day) : [...p.days, day],
                                                }))}
                                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setPricingDialogOpen(false); setPendingCourt(null); }}>
                            Cancel
                        </Button>
                        <Button onClick={confirmPricingAndAddCourt}>
                            <Save className="mr-1.5 h-4 w-4" /> Save & add court
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Settings;
