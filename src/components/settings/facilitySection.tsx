import { useState } from 'react';
import { Loader2, LocateFixed, Map, MapPin, Save } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { AMENITY_GROUPS } from '../../utils/settings';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { cn } from '../../utils/twMerge';

// Fix Leaflet default marker icons broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function DraggableMarker({
    position,
    onMove,
}: {
    position: [number, number];
    onMove: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onMove(e.latlng.lat, e.latlng.lng);
        },
    });
    return (
        <Marker
            position={position}
            draggable
            eventHandlers={{
                dragend(e) {
                    const m = e.target as L.Marker;
                    const latlng = m.getLatLng();
                    onMove(latlng.lat, latlng.lng);
                },
            }}
        />
    );
}

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
    const [locating, setLocating] = useState(false);
    const [locateError, setLocateError] = useState('');
    const [showMap, setShowMap] = useState(false);

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setLocateError('Geolocation is not supported by your browser.');
            return;
        }
        setLocating(true);
        setLocateError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onFieldChange('latitude', String(pos.coords.latitude));
                onFieldChange('longitude', String(pos.coords.longitude));
                setLocating(false);
            },
            () => {
                setLocateError('Could not get your location. Please enter manually.');
                setLocating(false);
            },
            { timeout: 10000 },
        );
    };

    const mapsUrl =
        facility.latitude && facility.longitude
            ? `https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`
            : null;

    const lat = parseFloat(facility.latitude);
    const lng = parseFloat(facility.longitude);
    const hasValidCoords = !isNaN(lat) && !isNaN(lng);
    // Map center: use saved coords, fall back to India centre
    const mapCenter: [number, number] = hasValidCoords ? [lat, lng] : [20.5937, 78.9629];

    const handleMapMove = (newLat: number, newLng: number) => {
        onFieldChange('latitude', newLat.toFixed(6));
        onFieldChange('longitude', newLng.toFixed(6));
    };

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
                        <div className="flex items-center justify-between">
                            <Label>Location Pin</Label>
                            {mapsUrl && (
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    <MapPin className="h-3 w-3" />
                                    View on map
                                </a>
                            )}
                        </div>

                        {!readOnly && (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={useMyLocation}
                                    disabled={locating}
                                    className="flex-1"
                                >
                                    {locating ? (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <LocateFixed className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    {locating ? 'Getting location…' : 'Use My Location'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMap((v) => !v)}
                                    className="flex-1"
                                >
                                    <Map className="mr-2 h-3.5 w-3.5" />
                                    {showMap ? 'Hide Map' : 'Pick on Map'}
                                </Button>
                            </div>
                        )}

                        {showMap && (
                            <div className="rounded-xl overflow-hidden border border-border">
                                <MapContainer
                                    center={mapCenter}
                                    zoom={hasValidCoords ? 15 : 5}
                                    style={{ height: '280px', width: '100%' }}
                                    key={`${mapCenter[0]}-${mapCenter[1]}`}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <DraggableMarker
                                        position={mapCenter}
                                        onMove={handleMapMove}
                                    />
                                </MapContainer>
                                <p className="px-3 py-2 text-xs text-muted-foreground bg-muted/50">
                                    Click anywhere on the map or drag the pin to set your venue location.
                                </p>
                            </div>
                        )}

                        {locateError && (
                            <p className="text-xs text-destructive">{locateError}</p>
                        )}

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
                                        onFieldChange('latitude', e.target.value)
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
                                        onFieldChange('longitude', e.target.value)
                                    }
                                    placeholder="e.g. 77.2090"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Use the button to auto-fill, or paste coordinates from Google Maps.
                        </p>
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
