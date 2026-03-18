import { Plus, X } from 'lucide-react';
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
    evening_open_time?: string;
    evening_close_time?: string;
}

interface ScheduleBuilderProps {
    value: DaySchedule[];
    onChange: (value: DaySchedule[]) => void;
    showShortcuts?: boolean;
}

const TimeSelect = ({
    value,
    options,
    onChange,
    error,
    placeholder,
}: {
    value: string;
    options: string[];
    onChange: (v: string) => void;
    error?: boolean;
    placeholder: string;
}) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger
            className={cn('w-[100px]', error && 'border-destructive')}
        >
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map((t) => (
                <SelectItem key={t} value={t}>
                    {t}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

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

    const addEveningSession = (dayIndex: number) => {
        updateDay(dayIndex, {
            evening_open_time: '17:00',
            evening_close_time: '22:00',
        });
    };

    const removeEveningSession = (dayIndex: number) => {
        updateDay(dayIndex, {
            evening_open_time: undefined,
            evening_close_time: undefined,
        });
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
                evening_open_time: monday.evening_open_time,
                evening_close_time: monday.evening_close_time,
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
                          evening_open_time: monday.evening_open_time,
                          evening_close_time: monday.evening_close_time,
                      }
                    : d,
            ),
        );
    };

    return (
        <div className="space-y-4">
            {showShortcuts && (
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={applyToAll}
                    >
                        Apply to All Days
                    </Button>
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
                    const hasEvening =
                        !!schedule.evening_open_time &&
                        !!schedule.evening_close_time;

                    const session1Error =
                        isOpen &&
                        schedule.opening_time &&
                        schedule.closing_time &&
                        schedule.closing_time !== '00:00' &&
                        schedule.closing_time <= schedule.opening_time;

                    const eveningStartError =
                        isOpen &&
                        hasEvening &&
                        schedule.evening_open_time! <= schedule.closing_time;

                    const eveningEndError =
                        isOpen &&
                        hasEvening &&
                        schedule.evening_close_time! <=
                            schedule.evening_open_time!;

                    return (
                        <div
                            key={i}
                            className={cn(
                                'rounded-lg border p-3 space-y-2',
                                !isOpen && 'bg-muted/30',
                            )}
                        >
                            {/* Row 1: day name + open toggle + session 1 times */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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
                                        <TimeSelect
                                            value={schedule.opening_time}
                                            options={OPENING_TIMES}
                                            onChange={(v) =>
                                                updateDay(i, {
                                                    opening_time: v,
                                                })
                                            }
                                            placeholder="Open"
                                        />
                                        <span className="text-muted-foreground text-sm">
                                            to
                                        </span>
                                        <TimeSelect
                                            value={schedule.closing_time}
                                            options={CLOSING_TIMES}
                                            onChange={(v) =>
                                                updateDay(i, {
                                                    closing_time: v,
                                                })
                                            }
                                            error={!!session1Error}
                                            placeholder="Close"
                                        />

                                        {!hasEvening && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addEveningSession(i)
                                                }
                                                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Add session
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Session 1 error */}
                            {session1Error && (
                                <p className="text-xs text-destructive pl-0 sm:pl-28">
                                    Closing must be after opening
                                </p>
                            )}

                            {/* Row 2: evening session */}
                            {isOpen && hasEvening && (
                                <>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                        <span className="w-24 text-xs text-muted-foreground shrink-0 sm:text-right">
                                            Evening
                                        </span>

                                        <div className="flex items-center gap-2 flex-1">
                                            <TimeSelect
                                                value={
                                                    schedule.evening_open_time!
                                                }
                                                options={OPENING_TIMES}
                                                onChange={(v) =>
                                                    updateDay(i, {
                                                        evening_open_time: v,
                                                    })
                                                }
                                                error={!!eveningStartError}
                                                placeholder="Open"
                                            />
                                            <span className="text-muted-foreground text-sm">
                                                to
                                            </span>
                                            <TimeSelect
                                                value={
                                                    schedule.evening_close_time!
                                                }
                                                options={CLOSING_TIMES}
                                                onChange={(v) =>
                                                    updateDay(i, {
                                                        evening_close_time: v,
                                                    })
                                                }
                                                error={!!eveningEndError}
                                                placeholder="Close"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeEveningSession(i)
                                                }
                                                className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {eveningStartError && (
                                        <p className="text-xs text-destructive pl-0 sm:pl-28">
                                            Evening must start after session 1
                                            ends
                                        </p>
                                    )}
                                    {eveningEndError && (
                                        <p className="text-xs text-destructive pl-0 sm:pl-28">
                                            Evening closing must be after
                                            opening
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
