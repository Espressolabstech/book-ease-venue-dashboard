import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { weekdays } from '../../utils/settings';

// Group slots that share the same start/end time into one visual card
function groupSlotsByTime(slots: PeakHourSlot[]): PeakHourSlot[][] {
    const map = new Map<string, PeakHourSlot[]>();
    for (const slot of slots) {
        const key = `${slot.startTime}-${slot.endTime}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(slot);
    }
    return Array.from(map.values());
}

const PeakSection = ({
    peakConfigs,
    addSlot,
    updateSlot,
    removeSlot,
    toggleDay,
    updatePrice,
    onSave,
    saving,
}: {
    peakConfigs: SportPeakConfig[];
    addSlot: (sport: string) => void;
    updateSlot: (
        sport: string,
        slotId: string,
        u: Partial<PeakHourSlot>,
    ) => void;
    removeSlot: (sport: string, slotId: string) => void;
    toggleDay: (sport: string, slotId: string, day: string) => void;
    updatePrice: (
        sport: string,
        field: 'peakPrice' | 'offPeakPrice',
        value: number,
    ) => void;
    onSave: () => void;
    saving?: boolean;
}) => {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Set pricing and define which hours are peak for each sport. All
                courts of a sport share the same rates.
            </p>

            {peakConfigs.map((config) => (
                <Card key={config.sport}>
                    <CardContent className="p-4 space-y-4">
                        <h3 className="font-semibold text-foreground text-lg">
                            {config.sport}
                        </h3>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">
                                    Off-Peak (₹/slot)
                                </Label>
                                <Input
                                    type="number"
                                    value={config.offPeakPrice}
                                    onChange={(e) =>
                                        updatePrice(
                                            config.sport,
                                            'offPeakPrice',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Peak (₹/slot)</Label>
                                <Input
                                    type="number"
                                    value={config.peakPrice}
                                    onChange={(e) =>
                                        updatePrice(
                                            config.sport,
                                            'peakPrice',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* Peak time slots */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    Peak Time Windows
                                </Label>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addSlot(config.sport)}
                                    className="h-7 text-xs"
                                >
                                    <Plus className="mr-1 h-3 w-3" /> Add Window
                                </Button>
                            </div>

                            {config.slots.length === 0 && (
                                <p className="text-sm text-muted-foreground py-2 text-center">
                                    No peak windows — all hours use off-peak
                                    rate.
                                </p>
                            )}

                            <div className="space-y-2">
                                {groupSlotsByTime(config.slots).map((group) => {
                                    const representative = group[0];
                                    const activeDays = new Set(
                                        group.flatMap((s) => s.days),
                                    );
                                    const groupKey = `${representative.startTime}-${representative.endTime}`;
                                    return (
                                        <div
                                            key={groupKey}
                                            className="space-y-2 rounded-lg border border-border p-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-1 items-center gap-1.5">
                                                    <Input
                                                        type="time"
                                                        value={representative.startTime}
                                                        onChange={(e) =>
                                                            group.forEach((s) =>
                                                                updateSlot(
                                                                    config.sport,
                                                                    s.id,
                                                                    { startTime: e.target.value },
                                                                )
                                                            )
                                                        }
                                                        className="h-8 text-xs"
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        to
                                                    </span>
                                                    <Input
                                                        type="time"
                                                        value={representative.endTime}
                                                        onChange={(e) =>
                                                            group.forEach((s) =>
                                                                updateSlot(
                                                                    config.sport,
                                                                    s.id,
                                                                    { endTime: e.target.value },
                                                                )
                                                            )
                                                        }
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        group.forEach((s) =>
                                                            removeSlot(config.sport, s.id)
                                                        )
                                                    }
                                                    className="rounded p-1.5 hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {weekdays.map((day) => {
                                                    const isActive = activeDays.has(day);
                                                    return (
                                                        <button
                                                            key={day}
                                                            onClick={() => {
                                                                if (isActive) {
                                                                    // Find the slot that owns this day and toggle it off
                                                                    const owner = group.find((s) =>
                                                                        s.days.includes(day),
                                                                    );
                                                                    if (owner) toggleDay(config.sport, owner.id, day);
                                                                } else {
                                                                    // Add the day to the first slot in the group
                                                                    toggleDay(config.sport, representative.id, day);
                                                                }
                                                            }}
                                                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                                                isActive
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted text-muted-foreground hover:bg-accent'
                                                            }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button className="w-full" onClick={onSave} disabled={saving}>
                {saving ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-1.5 h-4 w-4" />
                )}
                Save Changes
            </Button>
        </div>
    );
};

export default PeakSection;
