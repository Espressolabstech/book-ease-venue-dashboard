import { Loader2, Save } from 'lucide-react';
import { AMENITY_GROUPS } from '../../utils/settings';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { cn } from '../../utils/twMerge';

const FacilitySection = ({
    facility,
    onBioChange,
    onToggleAmenity,
    onSave,
    saving,
}: {
    facility: FacilityInfo;
    onBioChange: (bio: string) => void;
    onToggleAmenity: (a: string) => void;
    onSave: () => void;
    saving?: boolean;
}) => {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-foreground">
                        About Your Facility
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Write a short description visible to players browsing
                        your venue.
                    </p>
                    <Textarea
                        value={facility.bio}
                        onChange={(e) =>
                            onBioChange(e.target.value.slice(0, 300))
                        }
                        placeholder="Tell players about your facility..."
                        rows={4}
                    />
                    <p
                        className={cn(
                            'text-xs text-right',
                            facility.bio.length >= 290
                                ? 'text-destructive'
                                : 'text-muted-foreground',
                        )}
                    >
                        {facility.bio.length} / 300
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-foreground">Amenities</h3>
                    <p className="text-sm text-muted-foreground">
                        Select what's available at your venue.
                    </p>
                    {AMENITY_GROUPS.map((group) => (
                        <div key={group.label} className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                                {group.label}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {group.items.map((amenity) => {
                                    const active =
                                        facility.amenities.includes(amenity);
                                    return (
                                        <button
                                            key={amenity}
                                            onClick={() =>
                                                onToggleAmenity(amenity)
                                            }
                                            className={cn(
                                                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                                                active
                                                    ? 'border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))] scale-105'
                                                    : 'border-border text-foreground hover:border-muted-foreground',
                                            )}
                                        >
                                            {amenity}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

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

export default FacilitySection;
