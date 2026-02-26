import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AMENITY_GROUPS } from '../../utils/amenities';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Info, X } from 'lucide-react';
import { cn } from '../../utils/twMerge';

const StepAmenities = ({
    venueId,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
}: StepAmenitiesProps) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [customAmenities, setCustomAmenities] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');
    const [loaded, setLoaded] = useState(false);

    // Load existing amenities
    useEffect(() => {
        (async () => {
            // const { data } = await supabase
            //     .from('venue_amenities')
            //     .select('*')
            //     .eq('venue_id', venueId);

            // if (data) {
            //     const sel = new Set<string>();
            //     const custom: string[] = [];
            //     data.forEach((a: any) => {
            //         if (a.is_custom) {
            //             custom.push(a.name);
            //         } else {
            //             sel.add(a.name);
            //         }
            //     });
            //     setSelected(sel);
            //     setCustomAmenities(custom);
            // }
            setLoaded(true);
        })();
    }, [venueId]);

    const toggleAmenity = (name: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const addCustom = () => {
        const val = customInput.trim();
        if (!val) return;
        if (customAmenities.includes(val)) {
            toast.error('Already added');
            return;
        }
        setCustomAmenities((prev) => [...prev, val]);
        setCustomInput('');
    };

    const removeCustom = (name: string) => {
        setCustomAmenities((prev) => prev.filter((a) => a !== name));
    };

    const saveAmenities = async () => {
        onSaving(true);

        const amenities: { name: string; is_custom: boolean }[] = [];
        selected.forEach((name) => amenities.push({ name, is_custom: false }));
        customAmenities.forEach((name) => amenities.push({ name, is_custom: true }));

        sessionStorage.setItem('onboarding_step4', JSON.stringify(amenities));
        onSaving(false);
        onSaved();
        return true;
    };

    // Save & Continue
    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            const saved = await saveAmenities();
            if (saved === false) {
                onSaveComplete(false);
                return;
            }

            // await supabase
            //     .from('onboarding_progress')
            //     .update({ current_step: 4 })
            //     .eq('venue_id', venueId);

            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    // Save & Exit
    useEffect(() => {
        if (!triggerExit) return;
        (async () => {
            await saveAmenities();
            onExitComplete();
        })();
    }, [triggerExit]); // eslint-disable-line

    if (!loaded) return null;

    const totalSelected = selected.size + customAmenities.length;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    What facilities does your venue offer?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Select everything available at your venue. Players will see
                    these when browsing.
                </p>
            </div>

            {/* Amenity groups */}
            {AMENITY_GROUPS.map((group) => (
                <div key={group.label} className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        {group.label}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => {
                            const isSelected = selected.has(item);
                            return (
                                <button
                                    key={item}
                                    onClick={() => toggleAmenity(item)}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                                        isSelected
                                            ? 'border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))] scale-105'
                                            : 'border-border text-foreground hover:border-muted-foreground',
                                    )}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Custom amenities */}
            <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Anything else?
                </Label>

                {customAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {customAmenities.map((a) => (
                            <span
                                key={a}
                                className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))] px-3 py-1 text-sm font-medium text-[hsl(var(--admin-navy-foreground))]"
                            >
                                {a}
                                <button
                                    onClick={() => removeCustom(a)}
                                    className="ml-0.5 hover:opacity-70"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        placeholder="Type an amenity and press Enter to add it"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustom();
                            }
                        }}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Hint */}
            {totalSelected === 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--admin-status-amber))]/10 p-3">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-[hsl(var(--admin-status-amber))]" />
                    <p className="text-xs text-[hsl(var(--admin-status-amber))]">
                        Consider adding at least a few — venues with listed
                        facilities get more bookings.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StepAmenities;
