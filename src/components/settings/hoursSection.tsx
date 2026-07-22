import { Loader2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

const isOvernight = (openTime: string, closeTime: string) => {
    const [oh, om] = openTime.split(':').map(Number);
    const [ch, cm] = closeTime.split(':').map(Number);
    return ch * 60 + cm <= oh * 60 + om;
};

const HoursSection = ({
    hours,
    toggleDay,
    updateTime,
    onSave,
    saving,
}: {
    hours: OperatingHours[];
    toggleDay: (i: number) => void;
    updateTime: (i: number, f: 'openTime' | 'closeTime', v: string) => void;
    onSave: () => void;
    saving?: boolean;
}) => {
    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                    Set when your facility is open each day.
                </p>
                {hours.map((h, i) => (
                    <div key={h.day} className="flex items-center gap-3">
                        <div className="w-12">
                            <span className="text-sm font-medium text-foreground">
                                {h.day.slice(0, 3)}
                            </span>
                        </div>
                        <Switch
                            checked={h.isOpen}
                            onCheckedChange={() => toggleDay(i)}
                        />
                        {h.isOpen ? (
                            <div className="flex flex-1 items-center gap-1.5">
                                <Input
                                    type="time"
                                    value={h.openTime}
                                    onChange={(e) =>
                                        updateTime(
                                            i,
                                            'openTime',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-xs"
                                />
                                <span className="text-xs text-muted-foreground">
                                    to
                                </span>
                                <Input
                                    type="time"
                                    value={h.closeTime}
                                    onChange={(e) =>
                                        updateTime(
                                            i,
                                            'closeTime',
                                            e.target.value,
                                        )
                                    }
                                    className="h-8 text-xs"
                                />
                                {isOvernight(h.openTime, h.closeTime) && (
                                    <span className="whitespace-nowrap rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                                        +1 day
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                Closed
                            </span>
                        )}
                    </div>
                ))}
                <Button className="w-full" onClick={onSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-1.5 h-4 w-4" />
                    )}
                    Save Hours
                </Button>
            </CardContent>
        </Card>
    );
};

export default HoursSection;
