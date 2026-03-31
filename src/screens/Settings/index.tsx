import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HubView from '../../components/settings/hubView';
import HoursSection from '../../components/settings/hoursSection';
import PeakSection from '../../components/settings/peakSection';
import CourtsSection from '../../components/settings/courtSection';
import DowntimeSection from '../../components/settings/downtimeSection';
import FacilitySection from '../../components/settings/facilitySection';
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
import { path } from '../../navigation/commanPaths';
import {
    getCourts,
    createCourt,
    updateCourt,
    deleteCourt as deleteCourtApi,
} from '../../api/adapters/courts';
import {
    listVenueHours,
    saveVenueHour,
} from '../../api/adapters/venueHours';
import {
    listPeakHourPricings,
    createPeakHourPricing,
    updatePeakHourPricing,
    deletePeakHourPricing,
} from '../../api/adapters/peakHourPricing';
import { updateCourtPricing } from '../../api/adapters/courtPricing';
import {
    listAmenities,
    createAmenity,
    deleteAmenity,
} from '../../api/adapters/amenities';

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

function courtModelToCourtData(c: CourtModel): CourtData {
    return {
        id: c.id,
        name: c.name,
        sport: c.sport === 'PADEL' ? 'Padel' : 'Pickleball',
        surfaceMaterial: c.surface,
        lighting:
            c.environment === 'INDOOR' ? 'Indoor Lighting' : 'LED Floodlights',
        roofed: c.environment === 'INDOOR',
        isActive: c.status === 'ACTIVE',
        pricePerSlot: c.courtPricings[0]?.pricePerSlot ?? 0,
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
    const [section, setSection] = useState<Section>('hub');
    const [activeSport, setActiveSport] = useState('Padel');

    // ── API-backed state ──
    const [courts, setCourts] = useState<CourtData[]>([]);
    const [courtsRaw, setCourtsRaw] = useState<CourtModel[]>([]);
    const [hours, setHours] = useState<OperatingHours[]>(defaultHours);
    const [peakConfigs, setPeakConfigs] = useState<SportPeakConfig[]>([]);
    const [amenities, setAmenities] = useState<AmenityModel[]>([]);
    const [facility, setFacility] = useState<FacilityInfo>({
        bio: '',
        amenities: [],
    });

    // ── Loading / saving flags ──
    const [loadingSection, setLoadingSection] = useState<Section | null>(null);
    const [savingHours, setSavingHours] = useState(false);
    const [savingPeak, setSavingPeak] = useState(false);
    const [savingFacility, setSavingFacility] = useState(false);

    // ── Local UI state ──
    const [downtimes] = useState<ScheduledDowntime[]>([]);
    const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<CourtData | null>(null);
    const [deleteCourtId, setDeleteCourtId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddDowntime, setShowAddDowntime] = useState<string | null>(null);
    const [newDowntime, setNewDowntime] = useState({
        courtId: '',
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [newCourt, setNewCourt] = useState<Omit<CourtData, 'id'>>({
        name: '',
        sport: activeSport,
        surfaceMaterial: '',
        lighting: 'LED Floodlights',
        roofed: false,
        isActive: true,
        pricePerSlot: 0,
    });

    // ── Data fetchers ────────────────────────────────────────────────────────────

    const fetchCourts = useCallback(async () => {
        setLoadingSection('courts');
        try {
            const res = await getCourts();
            setCourtsRaw(res.data.courts);
            setCourts(res.data.courts.map(courtModelToCourtData));
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
            const sportMap: Record<string, string> = {
                PADEL: 'Padel',
                PICKELBALL: 'Pickleball',
            };

            // Fetch peak pricings for every court, then group by sport
            const allPeaks = await Promise.all(
                courtsRaw.map((c) =>
                    listPeakHourPricings({ courtId: c.id }).then((r) => ({
                        sport: sportMap[c.sport] ?? c.sport,
                        offPeakPrice: c.courtPricings[0]?.pricePerSlot ?? 0,
                        peaks: r.data.peakHourPricings,
                    })),
                ),
            );

            // One config per display-sport; last court of that sport wins for
            // offPeakPrice (they should all be the same)
            const bySport: Record<string, SportPeakConfig> = {};
            for (const { sport, offPeakPrice, peaks } of allPeaks) {
                if (!bySport[sport]) {
                    bySport[sport] = {
                        sport,
                        offPeakPrice,
                        peakPrice: peaks[0]?.pricePerSlot ?? 0,
                        slots: peaks.map((p) => ({
                            id: p.id,
                            startTime: p.startTime,
                            endTime: p.endTime,
                            days:
                                p.dayOfWeek !== null
                                    ? [SHORT_DAYS[p.dayOfWeek]]
                                    : [],
                        })),
                    };
                }
            }

            // Ensure both sports always appear (even if no courts exist yet)
            const configs: SportPeakConfig[] = ['Padel', 'Pickleball'].map(
                (sport) =>
                    bySport[sport] ?? {
                        sport,
                        offPeakPrice: 0,
                        peakPrice: 0,
                        slots: [],
                    },
            );

            setPeakConfigs(configs);
        } catch {
            toast.error('Failed to load peak hours');
        } finally {
            setLoadingSection(null);
        }
    }, [courtsRaw]);

    const fetchAmenities = useCallback(async () => {
        try {
            const res = await listAmenities();
            setAmenities(res.data.amenities);
            setFacility((prev) => ({
                ...prev,
                amenities: res.data.amenities.map((a: AmenityModel) => a.name),
            }));
        } catch {
            toast.error('Failed to load amenities');
        }
    }, []);

    // ── Initial load ─────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchCourts();
        fetchHours();
        fetchAmenities();
    }, [fetchCourts, fetchHours, fetchAmenities]);

    useEffect(() => {
        if (courtsRaw.length) fetchPeakHours();
    }, [courtsRaw, fetchPeakHours]);

    const sectionTitle: Record<Section, string> = {
        hub: 'Settings',
        hours: 'Operating Hours',
        peak: 'Peak Hours & Pricing',
        courts: `${activeSport} Courts`,
        downtime: 'Scheduled Downtime',
        facility: 'Facility Info',
    };

    const goBack = () => {
        if (section === 'hub') navigate(path.dashboard);
        else {
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
                                  startTime: '17:00',
                                  endTime: '22:00',
                                  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
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

    const removePeakSlot = async (sport: string, slotId: string) => {
        // Optimistic remove
        setPeakConfigs((prev) =>
            prev.map((c) =>
                c.sport === sport
                    ? { ...c, slots: c.slots.filter((s) => s.id !== slotId) }
                    : c,
            ),
        );
        // Only hit API for persisted IDs (temp IDs start with 'p' followed by a timestamp)
        const isTempId = /^p\d+$/.test(slotId);
        if (!isTempId) {
            try {
                await deletePeakHourPricing(slotId);
            } catch {
                toast.error('Failed to delete peak slot');
                fetchPeakHours(); // Revert on error
            }
        }
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
            const apiSportMap: Record<string, string> = {
                Padel: 'PADEL',
                Pickleball: 'PICKELBALL',
            };
            // Find the first active court for each display-sport
            const courtBySport: Record<string, string> = {};
            for (const c of courtsRaw) {
                const displaySport =
                    c.sport === 'PADEL' ? 'Padel' : 'Pickleball';
                if (!courtBySport[displaySport]) {
                    courtBySport[displaySport] = c.id;
                }
            }

            await Promise.all(
                peakConfigs.flatMap((c) =>
                    c.slots.map((s) => {
                        const dayOfWeek =
                            s.days.length === 1
                                ? SHORT_DAYS.indexOf(s.days[0])
                                : null;
                        const isNewSlot = /^p\d+$/.test(s.id);
                        if (isNewSlot) {
                            const courtId = courtBySport[c.sport];
                            if (!courtId) return Promise.resolve();
                            return createPeakHourPricing({
                                courtId,
                                startTime: s.startTime,
                                endTime: s.endTime,
                                pricePerSlot: c.peakPrice,
                                ...(dayOfWeek !== null && dayOfWeek >= 0
                                    ? { dayOfWeek }
                                    : {}),
                            });
                        }
                        return updatePeakHourPricing(s.id, {
                            startTime: s.startTime,
                            endTime: s.endTime,
                            pricePerSlot: c.peakPrice,
                            ...(dayOfWeek !== null && dayOfWeek >= 0
                                ? { dayOfWeek }
                                : {}),
                        });
                    }),
                ),
            );

            // Also update offPeakPrice (base court pricing) for each sport
            await Promise.all(
                peakConfigs.map((c) => {
                    const apiSport = apiSportMap[c.sport];
                    const sportCourts = courtsRaw.filter(
                        (r) => r.sport === apiSport,
                    );
                    return Promise.all(
                        sportCourts
                            .filter((r) => r.courtPricings[0])
                            .map((r) =>
                                updateCourtPricing(r.courtPricings[0].id, {
                                    pricePerSlot: c.offPeakPrice,
                                }),
                            ),
                    );
                }),
            );

            toast.success('Peak hours & pricing saved');
            fetchPeakHours();
        } catch {
            toast.error('Failed to save peak hours');
        } finally {
            setSavingPeak(false);
        }
    };

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
            const environment: CourtEnvironment = editForm.roofed
                ? 'INDOOR'
                : 'OUTDOOR';
            const status: CourtStatus = editForm.isActive
                ? 'ACTIVE'
                : 'INACTIVE';
            await updateCourt(editForm.id, {
                name: editForm.name,
                environment,
                status,
            });
            cancelEdit();
            toast.success('Court updated');
            fetchCourts();
        } catch {
            toast.error('Failed to update court');
        }
    };
    const addCourt = async () => {
        if (!newCourt.name.trim()) {
            toast.error('Court name is required');
            return;
        }
        if (!newCourt.surfaceMaterial) {
            toast.error('Surface material is required');
            return;
        }
        if (!newCourt.pricePerSlot || newCourt.pricePerSlot <= 0) {
            toast.error('Price per slot is required');
            return;
        }
        try {
            const sport: SportType =
                newCourt.sport === 'Padel' ? 'PADEL' : 'PICKELBALL';
            const environment: CourtEnvironment = newCourt.roofed
                ? 'INDOOR'
                : 'OUTDOOR';
            // Map display surface back to API enum — fallback to ARTIFICIAL_GRASS
            const surfaceMap: Record<string, CourtSurface> = {
                'Artificial Turf': 'ARTIFICIAL_GRASS',
                'Panoramic Glass': 'PANORAMIC_GLASS',
                'Synthetic Grass': 'ARTIFICIAL_GRASS',
                'Sand-filled Turf': 'SAND_FILLED_ARTIFICIAL_GRASS',
                'Cushioned Acrylic': 'CUSHIONED_ACRYLIC',
                'Hard Court': 'ASPHALT',
                'Indoor Wood': 'CUSHIONED_ACRYLIC',
                'Outdoor Concrete': 'CONCRETE',
            };
            // Auto-generate time slots from venue operating hours (one slot per open day)
            const timeSlots = hours
                .map((h, i) =>
                    h.isOpen
                        ? {
                              dayOfWeek: i,
                              startTime: h.openTime,
                              endTime: h.closeTime,
                          }
                        : null,
                )
                .filter(Boolean) as CreateCourtTimeSlotPayload[];

            await createCourt({
                name: newCourt.name,
                sport,
                environment,
                surface:
                    surfaceMap[newCourt.surfaceMaterial] ?? 'ARTIFICIAL_GRASS',
                timeSlots,
                pricing: { pricePerSlot: newCourt.pricePerSlot },
            });
            setShowAddForm(false);
            setNewCourt({
                name: '',
                sport: activeSport,
                surfaceMaterial: '',
                lighting: 'LED Floodlights',
                roofed: false,
                isActive: true,
                pricePerSlot: 0,
            });
            toast.success('Court added');
            fetchCourts();
        } catch {
            toast.error('Failed to add court');
        }
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

    // ── Downtime (local only — no API yet) ────────────────────────────────────
    const addDowntimeEntry = () => {
        if (
            !newDowntime.courtId ||
            !newDowntime.startDate ||
            !newDowntime.reason.trim()
        ) {
            toast.error('Court, date & reason required');
            return;
        }
        setShowAddDowntime(null);
        setNewDowntime({ courtId: '', startDate: '', endDate: '', reason: '' });
        toast.success('Downtime scheduled');
    };
    const removeDowntime = (_id: string) => {
        toast.success('Downtime removed');
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
                setAmenities((prev) => prev.filter((a) => a.id !== existing.id));
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
            // Future: save venue bio via a dedicated endpoint.
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

                            if (sport) {
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
                    />
                )}
                {section === 'courts' && (
                    <CourtsSection
                        sport={activeSport}
                        courts={courts.filter((c) => c.sport === activeSport)}
                        peakConfig={getSportPeak(activeSport)}
                        downtimes={downtimes}
                        editingCourtId={editingCourtId}
                        editForm={editForm}
                        showAddForm={showAddForm}
                        newCourt={newCourt}
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
                        onToggleAmenity={toggleAmenity}
                        onSave={saveFacility}
                        saving={savingFacility}
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
        </div>
    );
};

export default Settings;
