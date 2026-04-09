import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Loader2 } from 'lucide-react';

interface BookingRulesSectionProps {
    policy: BookingPolicyModel | null;
    loading: boolean;
    saving: boolean;
    onChange: (updates: Partial<UpdateBookingPolicyPayload>) => void;
    onSave: () => void;
}

const BookingRulesSection = ({
    policy,
    loading,
    saving,
    onChange,
    onSave,
}: BookingRulesSectionProps) => {
    if (loading || !policy) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Advance Booking */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-medium">Advance Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            How many days ahead can players book?
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={365}
                                value={policy.adavanceBookingDays}
                                onChange={(e) =>
                                    onChange({
                                        advanceBookingDays: Number(e.target.value),
                                    })
                                }
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">days</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Minimum notice before booking (minutes)
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={0}
                                value={policy.minimumNoticeMinutes}
                                onChange={(e) =>
                                    onChange({
                                        minimumNoticeMinutes: Number(e.target.value),
                                    })
                                }
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">min</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Slot Duration */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-medium">Slot Duration</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                        Minimum booking duration
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min={30}
                            step={30}
                            value={policy.minimumSlotMinutes}
                            onChange={(e) =>
                                onChange({
                                    minimumSlotMinutes: Number(e.target.value),
                                })
                            }
                            className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-0.5">
                        Players cannot book fewer than this many minutes at a time.
                    </p>
                </CardContent>
            </Card>

            {/* Cancellation & Confirmation */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-medium">
                        Cancellation & Confirmation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Cancellation policy
                        </Label>
                        <Select
                            value={policy.cancellationPolicy}
                            onValueChange={(v) =>
                                onChange({
                                    cancellationPolicy: v as CancellationPolicy,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FLEXIBLE">
                                    Flexible — full refund anytime
                                </SelectItem>
                                <SelectItem value="MODERATE">
                                    Moderate — refund if cancelled 24 h before
                                </SelectItem>
                                <SelectItem value="STRICT">
                                    Strict — no refunds
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Auto-confirm bookings</p>
                            <p className="text-xs text-muted-foreground">
                                Bookings are confirmed immediately without manual review
                            </p>
                        </div>
                        <Switch
                            checked={policy.autoConfirm}
                            onCheckedChange={(v) => onChange({ autoConfirm: v })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Daily Limit */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-medium">Player Limits</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                        Max bookings per player per day (leave blank for no limit)
                    </Label>
                    <Input
                        type="number"
                        min={1}
                        value={policy.maxBookingsPerPlayerDay ?? ''}
                        placeholder="No limit"
                        onChange={(e) =>
                            onChange({
                                maxBookingsPerPlayerDay: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                            })
                        }
                        className="w-28"
                    />
                </CardContent>
            </Card>

            <Button onClick={onSave} disabled={saving} className="w-full">
                {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                    </>
                ) : (
                    'Save Booking Rules'
                )}
            </Button>
        </div>
    );
};

export default BookingRulesSection;
