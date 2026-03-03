import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { weekdays } from '../../utils/settings';

const PeakSection = ({
    peakConfigs,
    addSlot,
    updateSlot,
    removeSlot,
    toggleDay,
    updatePrice,
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
                                    Off-Peak (AED/hr)
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
                                <Label className="text-xs">Peak (AED/hr)</Label>
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
                                {config.slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="space-y-2 rounded-lg border border-border p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-1 items-center gap-1.5">
                                                <Input
                                                    type="time"
                                                    value={slot.startTime}
                                                    onChange={(e) =>
                                                        updateSlot(
                                                            config.sport,
                                                            slot.id,
                                                            {
                                                                startTime:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    to
                                                </span>
                                                <Input
                                                    type="time"
                                                    value={slot.endTime}
                                                    onChange={(e) =>
                                                        updateSlot(
                                                            config.sport,
                                                            slot.id,
                                                            {
                                                                endTime:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeSlot(
                                                        config.sport,
                                                        slot.id,
                                                    )
                                                }
                                                className="rounded p-1.5 hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {weekdays.map((day) => (
                                                <button
                                                    key={day}
                                                    onClick={() =>
                                                        toggleDay(
                                                            config.sport,
                                                            slot.id,
                                                            day,
                                                        )
                                                    }
                                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                                        slot.days.includes(day)
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground hover:bg-accent'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button
                className="w-full"
                onClick={() => toast.success('Peak hours & pricing saved')}
            >
                <Save className="mr-1.5 h-4 w-4" /> Save Changes
            </Button>
        </div>
    );
};

export default PeakSection;
