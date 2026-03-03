import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
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

const initialCourts: CourtData[] = [
    {
        id: 'c1',
        name: 'Court 1',
        sport: 'Padel',
        surfaceMaterial: 'Artificial Turf',
        lighting: 'LED Floodlights',
        roofed: false,
        isActive: true,
    },
    {
        id: 'c2',
        name: 'Court 2',
        sport: 'Padel',
        surfaceMaterial: 'Panoramic Glass',
        lighting: 'LED Floodlights',
        roofed: true,
        isActive: true,
    },
    {
        id: 'c3',
        name: 'Court 3',
        sport: 'Padel',
        surfaceMaterial: 'Synthetic Grass',
        lighting: 'Indoor Lighting',
        roofed: true,
        isActive: true,
    },
    {
        id: 'c4',
        name: 'Court A',
        sport: 'Pickleball',
        surfaceMaterial: 'Cushioned Acrylic',
        lighting: 'LED Floodlights',
        roofed: false,
        isActive: true,
    },
    {
        id: 'c5',
        name: 'Court B',
        sport: 'Pickleball',
        surfaceMaterial: 'Hard Court',
        lighting: 'Indoor Lighting',
        roofed: true,
        isActive: true,
    },
];

const defaultHours: OperatingHours[] = [
    { day: 'Monday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
    { day: 'Tuesday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
    { day: 'Wednesday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
    { day: 'Thursday', isOpen: true, openTime: '07:00', closeTime: '22:00' },
    { day: 'Friday', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Saturday', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Sunday', isOpen: true, openTime: '08:00', closeTime: '21:00' },
];

const initialFacility: FacilityInfo = {
    bio: 'A premium sports facility offering world-class Padel and Pickleball courts in the heart of the city.',
    amenities: [
        'Washrooms',
        'Changing Rooms',
        'Parking',
        'Café / Lounge',
        'WiFi',
    ],
};

const initialDowntimes: ScheduledDowntime[] = [
    {
        id: 'd1',
        courtId: 'c1',
        startDate: '2026-02-15',
        endDate: '2026-02-16',
        reason: 'Turf replacement',
    },
    {
        id: 'd2',
        courtId: 'c4',
        startDate: '2026-02-20',
        endDate: '2026-02-20',
        reason: 'Net maintenance',
    },
];

const initialPeakConfigs: SportPeakConfig[] = [
    {
        sport: 'Padel',
        peakPrice: 200,
        offPeakPrice: 150,
        slots: [
            {
                id: 'p1',
                startTime: '17:00',
                endTime: '22:00',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            },
            {
                id: 'p2',
                startTime: '08:00',
                endTime: '22:00',
                days: ['Sat', 'Sun'],
            },
        ],
    },
    {
        sport: 'Pickleball',
        peakPrice: 160,
        offPeakPrice: 100,
        slots: [
            {
                id: 'p3',
                startTime: '17:00',
                endTime: '21:00',
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            },
            {
                id: 'p4',
                startTime: '09:00',
                endTime: '21:00',
                days: ['Sat', 'Sun'],
            },
        ],
    },
];

const Settings = () => {
    const navigate = useNavigate();
    const [section, setSection] = useState<Section>('hub');
    const [activeSport, setActiveSport] = useState('Padel');
    const [courts, setCourts] = useState<CourtData[]>(initialCourts);
    const [hours, setHours] = useState<OperatingHours[]>(defaultHours);
    const [downtimes, setDowntimes] =
        useState<ScheduledDowntime[]>(initialDowntimes);
    const [peakConfigs, setPeakConfigs] =
        useState<SportPeakConfig[]>(initialPeakConfigs);
    const [facility, setFacility] = useState<FacilityInfo>(initialFacility);
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
    });

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

    // ── Operating hours ──
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

    // ── Peak hours ──
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

    const removePeakSlot = (sport: string, slotId: string) => {
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

    // ── Court CRUD ──
    const startEdit = (court: CourtData) => {
        setEditingCourtId(court.id);
        setEditForm({ ...court });
    };
    const cancelEdit = () => {
        setEditingCourtId(null);
        setEditForm(null);
    };
    const saveEdit = () => {
        if (!editForm) return;
        setCourts((p) => p.map((c) => (c.id === editForm.id ? editForm : c)));
        cancelEdit();
        toast.success('Court updated');
    };
    const addCourt = () => {
        if (!newCourt.name.trim()) {
            toast.error('Court name is required');
            return;
        }
        setCourts((p) => [...p, { ...newCourt, id: `c${Date.now()}` }]);
        setShowAddForm(false);
        setNewCourt({
            name: '',
            sport: activeSport,
            surfaceMaterial: '',
            lighting: 'LED Floodlights',
            roofed: false,
            isActive: true,
        });
        toast.success('Court added');
    };
    const deleteCourt = () => {
        if (!deleteCourtId) return;
        setCourts((p) => p.filter((c) => c.id !== deleteCourtId));
        setDowntimes((p) => p.filter((d) => d.courtId !== deleteCourtId));
        setDeleteCourtId(null);
        toast.success('Court deleted');
    };

    // ── Downtime CRUD ──
    const addDowntimeEntry = () => {
        if (
            !newDowntime.courtId ||
            !newDowntime.startDate ||
            !newDowntime.reason.trim()
        ) {
            toast.error('Court, date & reason required');
            return;
        }
        setDowntimes((p) => [
            ...p,
            {
                id: `d${Date.now()}`,
                courtId: newDowntime.courtId,
                startDate: newDowntime.startDate,
                endDate: newDowntime.endDate || newDowntime.startDate,
                reason: newDowntime.reason,
            },
        ]);
        setShowAddDowntime(null);
        setNewDowntime({ courtId: '', startDate: '', endDate: '', reason: '' });
        toast.success('Downtime scheduled');
    };
    const removeDowntime = (id: string) => {
        setDowntimes((p) => p.filter((d) => d.id !== id));
        toast.success('Downtime removed');
    };

    // ── Facility ──
    const toggleAmenity = (amenity: string) => {
        setFacility((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
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

export default Settings;
