import {
    Building2,
    CalendarOff,
    ChevronRight,
    Clock,
    LayoutGrid,
    Plus,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const HubView = ({
    courts,
    downtimes,
    peakConfigs,
    facility,
    onNavigate,
}: {
    courts: CourtData[];
    downtimes: ScheduledDowntime[];
    peakConfigs: SportPeakConfig[];
    facility: FacilityInfo;
    onNavigate: (section: Section, sport?: string) => void;
}) => {
    // Group courts by sport
    const sportGroups: Record<string, number> = {};
    for (const c of courts) {
        sportGroups[c.sport] = (sportGroups[c.sport] ?? 0) + 1;
    }
    const sportList = Object.entries(sportGroups);

    const upcomingDowntimes = downtimes.filter(
        (d) => new Date(d.startDate) >= new Date(),
    );

    return (
        <div className="space-y-5">
            {/* ── Timing ── */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Timing
                </p>
                <div className="space-y-2">
                    <HubCard
                        icon={<Clock className="h-5 w-5 text-primary" />}
                        title="Operating Hours"
                        subtitle="Facility open & close times"
                        onClick={() => onNavigate('hours')}
                    />
                    <HubCard
                        icon={<Zap className="h-5 w-5 text-primary" />}
                        title="Peak Hours & Pricing"
                        subtitle={
                            peakConfigs.length > 0
                                ? peakConfigs
                                      .map(
                                          (c) =>
                                              `${c.sport}: ₹${c.offPeakPrice}–₹${c.peakPrice}/slot`,
                                      )
                                      .join(' · ')
                                : 'No sports configured yet'
                        }
                        onClick={() => onNavigate('peak')}
                    />
                    <HubCard
                        icon={<CalendarOff className="h-5 w-5 text-primary" />}
                        title="Scheduled Downtime"
                        subtitle={
                            upcomingDowntimes.length > 0
                                ? `${upcomingDowntimes.length} upcoming maintenance`
                                : 'No upcoming maintenance'
                        }
                        onClick={() => onNavigate('downtime')}
                    />
                </div>
            </div>

            {/* ── Courts / Sports ── */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Courts
                </p>
                <div className="space-y-2">
                    {sportList.map(([sport, count]) => (
                        <HubCard
                            key={sport}
                            icon={<LayoutGrid className="h-5 w-5 text-primary" />}
                            title={`${sport} Courts`}
                            subtitle={`${count} court${count !== 1 ? 's' : ''}`}
                            onClick={() => onNavigate('courts', sport)}
                        />
                    ))}
                    {/* Add Sport / Court card — always visible */}
                    <HubCard
                        icon={<Plus className="h-5 w-5 text-primary" />}
                        title="Add Sport / Court"
                        subtitle="Set up courts for a new sport"
                        onClick={() => onNavigate('courts', '__new__')}
                    />
                </div>
            </div>

            {/* ── Facility ── */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Facility
                </p>
                <div className="space-y-2">
                    <HubCard
                        icon={<Building2 className="h-5 w-5 text-primary" />}
                        title="Facility Info"
                        subtitle={`${facility.amenities.length} amenities · Bio ${facility.bio ? 'set' : 'empty'}`}
                        onClick={() => onNavigate('facility')}
                    />
                    <HubCard
                        icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                        title="Booking Rules"
                        subtitle="Minimum duration, advance booking, cancellation policy"
                        onClick={() => onNavigate('policy')}
                    />
                </div>
            </div>
        </div>
    );
};

function HubCard({
    icon,
    title,
    subtitle,
    onClick,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
}) {
    return (
        <Card
            className="cursor-pointer transition-colors hover:bg-accent/40 active:bg-accent/60"
            onClick={onClick}
        >
            <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                        {subtitle}
                    </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
        </Card>
    );
}

export default HubView;
