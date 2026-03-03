import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

const DowntimeSection = ({
    courts,
    downtimes,
    showAdd,
    newDowntime,
    onShowAdd,
    onCancelAdd,
    onNewChange,
    onAdd,
    onRemove,
}: {
    courts: CourtData[];
    downtimes: ScheduledDowntime[];
    showAdd: boolean;
    newDowntime: {
        courtId: string;
        startDate: string;
        endDate: string;
        reason: string;
    };
    onShowAdd: () => void;
    onCancelAdd: () => void;
    onNewChange: (u: Partial<typeof newDowntime>) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
}) => {
    const upcoming = downtimes.filter((d) => new Date(d.endDate) >= new Date());
    const past = downtimes.filter((d) => new Date(d.endDate) < new Date());
    const getCourtName = (courtId: string) =>
        courts.find((c) => c.id === courtId)?.name || 'Unknown';
    const getCourtSport = (courtId: string) =>
        courts.find((c) => c.id === courtId)?.sport || '';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {upcoming.length} upcoming, {past.length} past
                </p>
                <Button size="sm" variant="outline" onClick={onShowAdd}>
                    <Plus className="mr-1 h-4 w-4" /> Schedule
                </Button>
            </div>

            {showAdd && (
                <Card className="border-primary/30">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">
                                New Downtime
                            </h4>
                            <button onClick={onCancelAdd}>
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                        <div>
                            <Label className="text-xs">Court</Label>
                            <Select
                                value={newDowntime.courtId}
                                onValueChange={(v) =>
                                    onNewChange({ courtId: v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select court" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courts.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name} ({c.sport})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Start Date</Label>
                                <Input
                                    type="date"
                                    value={newDowntime.startDate}
                                    onChange={(e) =>
                                        onNewChange({
                                            startDate: e.target.value,
                                        })
                                    }
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">End Date</Label>
                                <Input
                                    type="date"
                                    value={newDowntime.endDate}
                                    onChange={(e) =>
                                        onNewChange({ endDate: e.target.value })
                                    }
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">Reason</Label>
                            <Input
                                value={newDowntime.reason}
                                onChange={(e) =>
                                    onNewChange({ reason: e.target.value })
                                }
                                placeholder="e.g. Turf replacement"
                                className="h-8 text-xs"
                            />
                        </div>
                        <Button className="w-full" onClick={onAdd}>
                            Schedule Downtime
                        </Button>
                    </CardContent>
                </Card>
            )}

            {upcoming.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                        Upcoming
                    </p>
                    {upcoming.map((dt) => (
                        <Card key={dt.id}>
                            <CardContent className="flex items-center justify-between p-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground">
                                            {dt.reason}
                                        </p>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs shrink-0"
                                        >
                                            {getCourtName(dt.courtId)}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {getCourtSport(dt.courtId)} ·{' '}
                                        {format(
                                            new Date(dt.startDate),
                                            'MMM d, yyyy',
                                        )}
                                        {dt.endDate !== dt.startDate &&
                                            ` – ${format(new Date(dt.endDate), 'MMM d, yyyy')}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onRemove(dt.id)}
                                    className="rounded p-1.5 hover:bg-destructive/10 shrink-0"
                                >
                                    <X className="h-4 w-4 text-destructive" />
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {past.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                        Past
                    </p>
                    {past.map((dt) => (
                        <Card key={dt.id} className="opacity-50">
                            <CardContent className="p-3">
                                <p className="text-sm font-medium text-foreground">
                                    {dt.reason}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {getCourtName(dt.courtId)} ·{' '}
                                    {format(new Date(dt.startDate), 'MMM d')}
                                    {dt.endDate !== dt.startDate &&
                                        ` – ${format(new Date(dt.endDate), 'MMM d')}`}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {downtimes.length === 0 && !showAdd && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                    No downtime scheduled
                </div>
            )}
        </div>
    );
};

export default DowntimeSection;
