import { Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

const HoursSection = ({
    hours,
    toggleDay,
    updateTime,
}: {
    hours: OperatingHours[];
    toggleDay: (i: number) => void;
    updateTime: (i: number, f: 'openTime' | 'closeTime', v: string) => void;
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
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                Closed
                            </span>
                        )}
                    </div>
                ))}
                <Button
                    className="w-full"
                    onClick={() => toast.success('Operating hours saved')}
                >
                    <Save className="mr-1.5 h-4 w-4" /> Save Hours
                </Button>
            </CardContent>
        </Card>
    );
};

export default HoursSection;
