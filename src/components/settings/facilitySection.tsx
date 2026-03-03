import { Check, Save } from 'lucide-react';
import { allAmenities } from '../../utils/settings';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const FacilitySection = ({
    facility,
    onBioChange,
    onToggleAmenity,
}: {
    facility: FacilityInfo;
    onBioChange: (bio: string) => void;
    onToggleAmenity: (a: string) => void;
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
                        onChange={(e) => onBioChange(e.target.value)}
                        placeholder="Tell players about your facility..."
                        rows={4}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-foreground">Amenities</h3>
                    <p className="text-sm text-muted-foreground">
                        Select what's available at your venue.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {allAmenities.map((amenity) => {
                            const active = facility.amenities.includes(amenity);
                            return (
                                <button
                                    key={amenity}
                                    onClick={() => onToggleAmenity(amenity)}
                                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors text-left ${
                                        active
                                            ? 'border-primary/40 bg-primary/5 text-foreground'
                                            : 'border-border bg-card text-muted-foreground hover:bg-accent/40'
                                    }`}
                                >
                                    <div
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${active ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                    >
                                        {active && (
                                            <Check className="h-3 w-3" />
                                        )}
                                    </div>
                                    <span className="text-sm">{amenity}</span>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Button
                className="w-full"
                onClick={() => toast.success('Facility info saved')}
            >
                <Save className="mr-1.5 h-4 w-4" /> Save Changes
            </Button>
        </div>
    );
};

export default FacilitySection;
