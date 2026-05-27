import {
    Building2,
    CalendarOff,
    ChevronRight,
    Clock,
    LayoutGrid,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const HubView = ({
    courts,
    downtimes,
    facility,
    onNavigate,
}: {
    courts: CourtData[];
    downtimes: ScheduledDowntime[];
    peakConfigs: SportPeakConfig[];
    facility: FacilityInfo;
    onNavigate: (section: Section, sport?: string) => void;
}) => {
    const upcomingDowntimes = downtimes.filter(
        (d) => new Date(d.startDate) >= new Date(),
    );

    // Build "3 Padel · 2 Pickleball" subtitle
    const sportGroups: Record<string, number> = {};
    for (const c of courts) {
        sportGroups[c.sport] = (sportGroups[c.sport] ?? 0) + 1;
    }
    const courtSubtitle =
        courts.length === 0
            ? 'No courts yet'
            : Object.entries(sportGroups)
                  .map(([sport, count]) => `${count} ${sport}`)
                  .join(' · ');

    return (
        <div className="space-y-5">
            {/* ── Courts ── */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Courts
                </p>
                <div className="space-y-2">
                    <HubCard
                        icon={<LayoutGrid className="h-5 w-5 text-primary" />}
                        title="Manage Courts"
                        subtitle={courtSubtitle}
                        onClick={() => onNavigate('courts', '')}
                    />
                </div>
            </div>

            {/* ── Pricing ── */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Pricing
                </p>
                <div className="space-y-2">
                    <HubCard
                        icon={<Zap className="h-5 w-5 text-primary" />}
                        title="Pricing & Peak Hours"
                        subtitle="Set rates and peak hour windows per sport"
                        onClick={() => onNavigate('peak')}
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
                        icon={<Clock className="h-5 w-5 text-primary" />}
                        title="Operating Hours"
                        subtitle="Facility open & close times"
                        onClick={() => onNavigate('hours')}
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
