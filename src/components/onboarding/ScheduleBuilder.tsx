import { Switch } from '@radix-ui/react-switch';
import { cn } from '../../utils/twMerge';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@radix-ui/react-popover';
import { DAYS } from '../../utils/days';

const generateTimeOptions = (start: number, end: number) => {
    const options: string[] = [];
    for (let h = start; h <= end; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (h === end && m > 0) break;
            const hour = h === 24 ? 0 : h;
            options.push(
                `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            );
        }
    }
    return options;
};

const OPENING_TIMES = generateTimeOptions(5, 23);
const CLOSING_TIMES = [...generateTimeOptions(5, 23), '00:00'];

export interface DaySchedule {
    day_of_week: number;
    is_open: boolean;
    opening_time: string;
    closing_time: string;
}

interface ScheduleBuilderProps {
    value: DaySchedule[];
    onChange: (value: DaySchedule[]) => void;
    showShortcuts?: boolean;
}

export default function ScheduleBuilder({
    value,
    onChange,
    showShortcuts = true,
}: ScheduleBuilderProps) {
    const updateDay = (dayIndex: number, updates: Partial<DaySchedule>) => {
        const next = value.map((d) =>
            d.day_of_week === dayIndex ? { ...d, ...updates } : d,
        );
        onChange(next);
    };

    const applyToAll = () => {
        const monday = value.find((d) => d.day_of_week === 0);
        if (!monday) return;
        onChange(
            value.map((d) => ({
                ...d,
                is_open: monday.is_open,
                opening_time: monday.opening_time,
                closing_time: monday.closing_time,
            })),
        );
    };

    const copyWeekdaysToWeekend = () => {
        const monday = value.find((d) => d.day_of_week === 0);
        if (!monday) return;
        onChange(
            value.map((d) =>
                d.day_of_week >= 5
                    ? {
                          ...d,
                          is_open: monday.is_open,
                          opening_time: monday.opening_time,
                          closing_time: monday.closing_time,
                      }
                    : d,
            ),
        );
    };

    return (
        <div className="space-y-4">
            {showShortcuts && (
                <div className="flex flex-wrap gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                Apply to All Days
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3">
                            <p className="text-sm text-muted-foreground mb-2">
                                This will overwrite hours for all days.
                                Continue?
                            </p>
                            <Button size="sm" onClick={applyToAll}>
                                Confirm
                            </Button>
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyWeekdaysToWeekend}
                    >
                        Copy Weekdays to Weekend
                    </Button>
                </div>
            )}

            <div className="space-y-2">
                {DAYS.map((day, i) => {
                    const schedule = value.find((d) => d.day_of_week === i);
                    if (!schedule) return null;
                    const isOpen = schedule.is_open;
                    const timeError =
                        isOpen &&
                        schedule.opening_time &&
                        schedule.closing_time &&
                        schedule.closing_time !== '00:00' &&
                        schedule.closing_time <= schedule.opening_time;

                    return (
                        <div
                            key={i}
                            className={cn(
                                'flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4',
                                !isOpen && 'bg-muted/30',
                            )}
                        >
                            <span className="w-24 text-sm font-semibold shrink-0">
                                {day}
                            </span>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={isOpen}
                                    onCheckedChange={(v) =>
                                        updateDay(i, { is_open: v })
                                    }
                                />
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        isOpen
                                            ? 'text-[hsl(var(--admin-lime))]'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {isOpen ? 'Open' : 'Closed'}
                                </span>
                            </div>

                            {isOpen && (
                                <div className="flex items-center gap-2 flex-1">
                                    <Select
                                        value={schedule.opening_time}
                                        onValueChange={(v) =>
                                            updateDay(i, { opening_time: v })
                                        }
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Open" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {OPENING_TIMES.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-muted-foreground text-sm">
                                        to
                                    </span>
                                    <Select
                                        value={schedule.closing_time}
                                        onValueChange={(v) =>
                                            updateDay(i, { closing_time: v })
                                        }
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                'w-[100px]',
                                                timeError &&
                                                    'border-destructive',
                                            )}
                                        >
                                            <SelectValue placeholder="Close" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CLOSING_TIMES.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {timeError && (
                                <p className="text-xs text-destructive">
                                    Closing must be after opening
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
