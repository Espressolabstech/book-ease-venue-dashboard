import { AlertTriangle, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { weekdays } from '../../utils/settings';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

const isTempId = (id: string) => /^p\d+$/.test(id);

/**
 * Group slots by time window.
 * - Persisted slots (real DB IDs) with the same start/end are one visual window.
 * - Temp (unsaved) slots always get their own window so they're never merged.
 */
function groupSlotsByTime(slots: PeakHourSlot[]): PeakHourSlot[][] {
    const map = new Map<string, PeakHourSlot[]>();
    for (const slot of slots) {
        const key = isTempId(slot.id) ? slot.id : `${slot.startTime}-${slot.endTime}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(slot);
    }
    return Array.from(map.values());
}

interface GroupMeta {
    key: string;
    startTime: string;
    endTime: string;
    activeDays: Set<string>;
}

/** Returns the set of group keys that overlap with at least one other group. */
function findConflictingKeys(groups: GroupMeta[]): Set<string> {
    const out = new Set<string>();
    for (let i = 0; i < groups.length; i++) {
        for (let j = i + 1; j < groups.length; j++) {
            const a = groups[i];
            const b = groups[j];
            if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) continue;

            // A window with no days selected is incomplete — skip it from
            // conflict detection (it will be caught by the no-days validator).
            if (a.activeDays.size === 0 || b.activeDays.size === 0) continue;

            // Day overlap
            const sharedDay = [...a.activeDays].some((d) => b.activeDays.has(d));
            if (!sharedDay) continue;

            // Time overlap
            const aS = toMinutes(a.startTime);
            const aE = toMinutes(a.endTime);
            const bS = toMinutes(b.startTime);
            const bE = toMinutes(b.endTime);
            if (aS < bE && bS < aE) {
                out.add(a.key);
                out.add(b.key);
            }
        }
    }
    return out;
}

// ── Component ─────────────────────────────────────────────────────────────────

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
    updateSlot: (sport: string, slotId: string, u: Partial<PeakHourSlot>) => void;
    removeSlot: (sport: string, slotId: string) => void;
    toggleDay: (sport: string, slotId: string, day: string) => void;
    updatePrice: (sport: string, field: 'peakPrice' | 'offPeakPrice', value: number) => void;
    onSave: () => void;
    saving?: boolean;
}) => {
    // Compute all conflicts across all sport configs
    const allConflictKeys = new Set<string>();
    const sportConflictKeys: Record<string, Set<string>> = {};

    for (const config of peakConfigs) {
        const groups = groupSlotsByTime(config.slots).map((group) => {
            const rep = group[0];
            return {
                key: isTempId(rep.id) ? rep.id : `${rep.startTime}-${rep.endTime}`,
                startTime: rep.startTime,
                endTime: rep.endTime,
                activeDays: new Set(group.flatMap((s) => s.days)),
            } satisfies GroupMeta;
        });
        const keys = findConflictingKeys(groups);
        sportConflictKeys[config.sport] = keys;
        keys.forEach((k) => allConflictKeys.add(k));
    }

    // Flag windows where start >= end
    const invalidTimeKeys = new Set<string>();
    for (const config of peakConfigs) {
        for (const group of groupSlotsByTime(config.slots)) {
            const rep = group[0];
            if (rep.startTime && rep.endTime && toMinutes(rep.startTime) >= toMinutes(rep.endTime)) {
                const key = isTempId(rep.id) ? rep.id : `${rep.startTime}-${rep.endTime}`;
                invalidTimeKeys.add(key);
            }
        }
    }

    // Flag windows where no days are selected (incomplete, can't save)
    const noDaysKeys = new Set<string>();
    for (const config of peakConfigs) {
        for (const group of groupSlotsByTime(config.slots)) {
            const rep = group[0];
            const activeDays = new Set(group.flatMap((s) => s.days));
            if (activeDays.size === 0 && rep.startTime && rep.endTime) {
                const key = isTempId(rep.id) ? rep.id : `${rep.startTime}-${rep.endTime}`;
                noDaysKeys.add(key);
            }
        }
    }

    const hasErrors =
        allConflictKeys.size > 0 || invalidTimeKeys.size > 0 || noDaysKeys.size > 0;

    const handleSave = () => {
        if (hasErrors) return;
        onSave();
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Set pricing and define which hours are peak for each sport. All
                courts of a sport share the same rates.
            </p>

            {peakConfigs.map((config) => {
                const conflictKeys = sportConflictKeys[config.sport] ?? new Set();
                const groups = groupSlotsByTime(config.slots);
                const sportHasConflicts = conflictKeys.size > 0;

                return (
                    <Card key={config.sport}>
                        <CardContent className="p-4 space-y-4">
                            <h3 className="font-semibold text-foreground text-lg">
                                {config.sport}
                            </h3>

                            {/* Pricing */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs">Off-Peak (₹/slot)</Label>
                                    <Input
                                        type="number"
                                        value={config.offPeakPrice}
                                        onChange={(e) =>
                                            updatePrice(config.sport, 'offPeakPrice', parseFloat(e.target.value) || 0)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Peak (₹/slot)</Label>
                                    <Input
                                        type="number"
                                        value={config.peakPrice}
                                        onChange={(e) =>
                                            updatePrice(config.sport, 'peakPrice', parseFloat(e.target.value) || 0)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Conflict banner */}
                            {sportHasConflicts && (
                                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>
                                        Some windows overlap on the same day. Fix the
                                        conflicts highlighted below before saving.
                                    </span>
                                </div>
                            )}

                            {/* Peak time windows */}
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
                                        No peak windows — all hours use off-peak rate.
                                    </p>
                                )}

                                <div className="space-y-2">
                                    {groups.map((group) => {
                                        const rep = group[0];
                                        const activeDays = new Set(group.flatMap((s) => s.days));
                                        const groupKey = isTempId(rep.id)
                                            ? rep.id
                                            : `${rep.startTime}-${rep.endTime}`;
                                        const isConflict = conflictKeys.has(groupKey);
                                        const isInvalidTime =
                                            rep.startTime &&
                                            rep.endTime &&
                                            toMinutes(rep.startTime) >= toMinutes(rep.endTime);
                                        const isNoDays = noDaysKeys.has(groupKey);

                                        return (
                                            <div
                                                key={groupKey}
                                                className={`space-y-2 rounded-lg border p-3 ${
                                                    isConflict || isInvalidTime || isNoDays
                                                        ? 'border-destructive/60 bg-destructive/5'
                                                        : 'border-border'
                                                }`}
                                            >
                                                {/* Error labels */}
                                                {isInvalidTime && (
                                                    <p className="flex items-center gap-1 text-[11px] text-destructive font-medium">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        End time must be after start time
                                                    </p>
                                                )}
                                                {isConflict && !isInvalidTime && (
                                                    <p className="flex items-center gap-1 text-[11px] text-destructive font-medium">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Overlaps with another window on a shared day
                                                    </p>
                                                )}
                                                {isNoDays && !isInvalidTime && !isConflict && (
                                                    <p className="flex items-center gap-1 text-[11px] text-destructive font-medium">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Select at least one day
                                                    </p>
                                                )}

                                                {/* Time inputs + delete */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-1 items-center gap-1.5">
                                                        <Input
                                                            type="time"
                                                            value={rep.startTime}
                                                            onChange={(e) =>
                                                                group.forEach((s) =>
                                                                    updateSlot(config.sport, s.id, {
                                                                        startTime: e.target.value,
                                                                    })
                                                                )
                                                            }
                                                            className="h-8 text-xs"
                                                        />
                                                        <span className="text-xs text-muted-foreground shrink-0">
                                                            to
                                                        </span>
                                                        <Input
                                                            type="time"
                                                            value={rep.endTime}
                                                            onChange={(e) =>
                                                                group.forEach((s) =>
                                                                    updateSlot(config.sport, s.id, {
                                                                        endTime: e.target.value,
                                                                    })
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

                                                {/* Day toggles */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {weekdays.map((day) => {
                                                        const isActive = activeDays.has(day);
                                                        return (
                                                            <button
                                                                key={day}
                                                                onClick={() => {
                                                                    if (isActive) {
                                                                        const owner = group.find((s) =>
                                                                            s.days.includes(day),
                                                                        );
                                                                        if (owner)
                                                                            toggleDay(config.sport, owner.id, day);
                                                                    } else {
                                                                        toggleDay(config.sport, rep.id, day);
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
                );
            })}

            {hasErrors && (
                <p className="text-center text-xs text-destructive font-medium">
                    Fix all conflicts, invalid times, and missing days before saving.
                </p>
            )}

            <Button className="w-full" onClick={handleSave} disabled={saving || hasErrors}>
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
