import { Loader2, Save } from 'lucide-react';
import { AMENITY_GROUPS } from '../../utils/settings';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { cn } from '../../utils/twMerge';

const FacilitySection = ({
    facility,
    onBioChange,
    onToggleAmenity,
    onFieldChange,
    onSave,
    saving,
    readOnly = false,
}: {
    facility: FacilityInfo;
    onBioChange: (bio: string) => void;
    onToggleAmenity: (a: string) => void;
    onFieldChange: (field: keyof FacilityInfo, value: string) => void;
    onSave: () => void;
    saving?: boolean;
    readOnly?: boolean;
}) => {
    return (
        <div className="space-y-4">
            {/* Contact & Location */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-foreground">
                        Facility Information
                    </h3>

                    <div className="space-y-2">
                        <Label htmlFor="facility-phone">Phone Number</Label>
                        <Input
                            id="facility-phone"
                            type="tel"
                            value={facility.phone}
                            onChange={(e) =>
                                onFieldChange('phone', e.target.value)
                            }
                            placeholder="+91 98765 43210"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="facility-address">Address</Label>
                        <Textarea
                            id="facility-address"
                            value={facility.address}
                            onChange={(e) =>
                                onFieldChange('address', e.target.value)
                            }
                            placeholder="Street, area, city…"
                            rows={2}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Location Pin</Label>
                        <p className="text-xs text-muted-foreground">
                            Enter the latitude and longitude for your venue pin.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="facility-lat"
                                    className="text-xs text-muted-foreground"
                                >
                                    Latitude
                                </Label>
                                <Input
                                    id="facility-lat"
                                    type="number"
                                    step="any"
                                    value={facility.latitude}
                                    onChange={(e) =>
                                        onFieldChange(
                                            'latitude',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. 28.6139"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label
                                    htmlFor="facility-lng"
                                    className="text-xs text-muted-foreground"
                                >
                                    Longitude
                                </Label>
                                <Input
                                    id="facility-lng"
                                    type="number"
                                    step="any"
                                    value={facility.longitude}
                                    onChange={(e) =>
                                        onFieldChange(
                                            'longitude',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. 77.2090"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                        disabled={readOnly}
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
                                                !readOnly && onToggleAmenity(amenity)
                                            }
                                            disabled={readOnly}
                                            className={cn(
                                                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                                                active
                                                    ? 'border-[hsl(var(--admin-navy))] bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))] scale-105'
                                                    : 'border-border text-foreground hover:border-muted-foreground',
                                                readOnly && 'opacity-60 cursor-not-allowed',
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

            {!readOnly && (
                <Button className="w-full" onClick={onSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-1.5 h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            )}
        </div>
    );
};

export default FacilitySection;
