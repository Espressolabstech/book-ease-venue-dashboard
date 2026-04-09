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
    const padelCount = courts.filter((c) => c.sport === 'Padel').length;
    const pickleCount = courts.filter((c) => c.sport === 'Pickleball').length;
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
                        subtitle={peakConfigs
                            .map(
                                (c) =>
                                    `${c.sport}: ₹${c.offPeakPrice}–₹${c.peakPrice}/slot`,
                            )
                            .join(' · ')}
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

            {/* ── Sports ── */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Courts
                </p>
                <div className="space-y-2">
                    <HubCard
                        icon={<LayoutGrid className="h-5 w-5 text-primary" />}
                        title="Padel Courts"
                        subtitle={`${padelCount} court${padelCount !== 1 ? 's' : ''}`}
                        onClick={() => onNavigate('courts', 'Padel')}
                    />
                    <HubCard
                        icon={<LayoutGrid className="h-5 w-5 text-primary" />}
                        title="Pickleball Courts"
                        subtitle={`${pickleCount} court${pickleCount !== 1 ? 's' : ''}`}
                        onClick={() => onNavigate('courts', 'Pickleball')}
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
