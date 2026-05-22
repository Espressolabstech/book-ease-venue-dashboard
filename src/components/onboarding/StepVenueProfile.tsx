import { Label } from '@radix-ui/react-label';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../ui/input';
import { cn } from '../../utils/twMerge';
import { Textarea } from '../ui/textarea';
import { Loader2, Upload, X, MapPin, Images } from 'lucide-react';
import ImageCropDialog from './ImageCropDialog';
import { toast } from 'sonner';
import {
    getVenueImageUploadUrls,
    uploadToPresignedUrl,
    getOnBoardedVenueDetails,
} from '../../api/adapters/onBoard';

const MapLocationPicker = ({
    latitude,
    longitude,
    onChange,
}: {
    latitude?: number;
    longitude?: number;
    onChange: (lat: number, lng: number) => void;
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href =
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(link);
        }

        const initMap = (L: any) => {
            if (!mapRef.current || leafletMapRef.current) return;

            const defaultLat = latitude ?? 20.5937;
            const defaultLng = longitude ?? 78.9629;

            const map = L.map(mapRef.current, { zoomControl: true }).setView(
                [defaultLat, defaultLng],
                latitude ? 14 : 5,
            );

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            const markerIcon = L.icon({
                iconUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });

            if (latitude && longitude) {
                markerRef.current = L.marker([latitude, longitude], {
                    icon: markerIcon,
                    draggable: true,
                }).addTo(map);
                markerRef.current.on('dragend', (e: any) => {
                    const { lat, lng } = e.target.getLatLng();
                    onChange(
                        parseFloat(lat.toFixed(6)),
                        parseFloat(lng.toFixed(6)),
                    );
                });
            }

            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                const roundedLat = parseFloat(lat.toFixed(6));
                const roundedLng = parseFloat(lng.toFixed(6));

                if (markerRef.current) {
                    markerRef.current.setLatLng([roundedLat, roundedLng]);
                } else {
                    markerRef.current = L.marker([roundedLat, roundedLng], {
                        icon: markerIcon,
                        draggable: true,
                    }).addTo(map);
                    markerRef.current.on('dragend', (ev: any) => {
                        const pos = ev.target.getLatLng();
                        onChange(
                            parseFloat(pos.lat.toFixed(6)),
                            parseFloat(pos.lng.toFixed(6)),
                        );
                    });
                }
                onChange(roundedLat, roundedLng);
            });

            leafletMapRef.current = map;
        };

        if ((window as any).L) {
            initMap((window as any).L);
            return;
        }

        const script = document.createElement('script');
        script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = () => initMap((window as any).L);
        document.head.appendChild(script);

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []); // eslint-disable-line

    useEffect(() => {
        if (!leafletMapRef.current || !latitude || !longitude) return;
        if (markerRef.current)
            markerRef.current.setLatLng([latitude, longitude]);
        leafletMapRef.current.setView([latitude, longitude], 14);
    }, [latitude, longitude]);

    return (
        <div
            ref={mapRef}
            className="h-64 w-full rounded-xl border border-border overflow-hidden"
            style={{ zIndex: 0 }}
        />
    );
};

const GalleryUpload = ({
    images,
    onAdd,
    onRemove,
    uploading,
}: {
    images: string[];
    onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (url: string) => void;
    uploading: boolean;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {images.map((url) => (
                    <div key={url} className="relative group aspect-video">
                        <img
                            src={url}
                            alt=""
                            className="h-full w-full rounded-lg object-cover border border-border"
                        />
                        <button
                            onClick={() => onRemove(url)}
                            className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {images.length < 10 && (
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="flex aspect-video flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors"
                    >
                        {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Images className="h-5 w-5 text-muted-foreground" />
                                <span className="mt-1 text-xs text-muted-foreground">
                                    Add photo
                                </span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onAdd}
            />
            <p className="text-xs text-muted-foreground">
                Up to 10 photos · JPG, PNG, or WEBP · Max 5MB each
            </p>
        </div>
    );
};

const StepVenueProfile = ({
    venueId,
    // onNext,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    // onExitComplete,
    triggerBack,
    onBackComplete,
}: StepVenueProfileProps) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [pincode, setPincode] = useState('');
    const [description, setDescription] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [latitude, setLatitude] = useState<number | undefined>();
    const [longitude, setLongitude] = useState<number | undefined>();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [logoUploading, setLogoUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);

    const [cropImage, setCropImage] = useState('');
    const [cropAspect, setCropAspect] = useState(1);
    const [cropOpen, setCropOpen] = useState(false);
    const [cropTarget, setCropTarget] = useState<'logo' | 'cover'>('logo');

    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: venueDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['onboardedVenueDetails'],
        queryFn: getOnBoardedVenueDetails,
        retry: false,
    });

    useEffect(() => {
        const d = venueDetails?.data?.venue;
        if (!d) return;
        setName((prev) => prev || d.name || '');
        setCity((prev) => prev || d.city || '');
        setState((prev) => prev || d.state || '');
        setCountry((prev) => prev || d.country || '');
        setPincode((prev) => prev || d.pincode || '');
        setContactEmail((prev) => prev || d.email || '');
        setWhatsapp((prev) => prev || (d.phone?.replace(/^\+91/, '') ?? ''));
    }, [venueDetails]);

    useEffect(() => {
        const saved = sessionStorage.getItem('onboarding_step1');
        if (!saved) return;
        try {
            const d = JSON.parse(saved);
            setName(d.venueName || '');
            setAddress(d.venueAddress || '');
            setCity(d.city || '');
            setState(d.state || '');
            setCountry(d.country || '');
            setPincode(d.pincode || '');
            setDescription(d.description || '');
            setContactEmail(d.venuemail || '');
            setWhatsapp(d.venuePhone || '');
            setLogoUrl(d.logoUrl || '');
            setCoverUrl(d.coverUrl || '');
            setGalleryUrls(d.galleryUrls || []);
            setLatitude(d.latitude);
            setLongitude(d.longitude);
        } catch {}
    }, []);

    const autoSave = useCallback(
        async (_field: string, _value: any) => {},
        [venueId, onSaving, onSaved],
    );

    const debouncedSave = useCallback(
        (field: string, value: any) => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(
                () => autoSave(field, value),
                2000,
            );
        },
        [autoSave],
    );

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Venue name is required';
        if (!address.trim()) errs.address = 'Address is required';
        if (!city.trim()) errs.city = 'City is required';
        if (!description.trim()) errs.description = 'Description is required';
        if (!coverUrl) errs.cover = 'Cover photo is required';
        if (!contactEmail.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
            errs.email = 'Invalid email format';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            if (!validate()) {
                onSaveComplete(false);
                const firstErr = document.querySelector("[data-error='true']");
                firstErr?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
                return;
            }
            onSaving(true);
            sessionStorage.setItem(
                'onboarding_step1',
                JSON.stringify({
                    venueName: name,
                    venueAddress: address,
                    city,
                    state,
                    country,
                    pincode,
                    description,
                    venuemail: contactEmail,
                    venuePhone: whatsapp,
                    latitude,
                    longitude,
                    logoUrl,
                    coverUrl,
                    galleryUrls,
                }),
            );
            onSaving(false);
            onSaved();
            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    useEffect(() => {
        if (!triggerExit) return;
        (async () => {})();
    }, [triggerExit]); // eslint-disable-line

    useEffect(() => {
        if (!triggerBack) return;
        sessionStorage.setItem(
            'onboarding_step1',
            JSON.stringify({
                venueName: name,
                venueAddress: address,
                city,
                state,
                country,
                pincode,
                description,
                venuemail: contactEmail,
                venuePhone: whatsapp,
                latitude,
                longitude,
                logoUrl,
                coverUrl,
                galleryUrls,
            }),
        );
        onBackComplete();
    }, [triggerBack]); // eslint-disable-line

    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        target: 'logo' | 'cover',
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const maxSize = target === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(
                `File too large. Maximum ${target === 'logo' ? '2MB' : '5MB'}.`,
            );
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setCropImage(reader.result as string);
            setCropAspect(target === 'logo' ? 1 : 16 / 9);
            setCropTarget(target);
            setCropOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = async (blob: Blob) => {
        const isLogo = cropTarget === 'logo';
        const setUploading = isLogo ? setLogoUploading : setCoverUploading;

        setUploading(true);
        try {
            const res = await getVenueImageUploadUrls({
                venueId,
                images: [
                    { type: isLogo ? 'LOGO' : 'COVER', mimetype: 'image/jpeg' },
                ],
            });
            const images = Array.isArray(res.data) ? res.data : res.data.images;
            const { uploadUrl, publicUrl } = images[0];
            await uploadToPresignedUrl(uploadUrl, blob, 'image/jpeg');
            if (isLogo) {
                setLogoUrl(publicUrl);
                setErrors((e) => ({ ...e, logo: '' }));
            } else {
                setCoverUrl(publicUrl);
                setErrors((e) => ({ ...e, cover: '' }));
            }
        } catch (err: any) {
            toast.error(err?.message || 'Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleGallerySelect = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const toProcess = files.slice(0, 10 - galleryUrls.length);

        setGalleryUploading(true);
        for (const file of toProcess) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`"${file.name}" exceeds 5MB limit.`);
                continue;
            }
            try {
                const res = await getVenueImageUploadUrls({
                    venueId,
                    images: [
                        {
                            type: 'GALLERY',
                            mimetype: file.type || 'image/jpeg',
                        },
                    ],
                });
                const images = Array.isArray(res.data)
                    ? res.data
                    : res.data.images;
                const { uploadUrl, publicUrl } = images[0];
                await uploadToPresignedUrl(
                    uploadUrl,
                    file,
                    file.type || 'image/jpeg',
                );
                setGalleryUrls((prev) => [...prev, publicUrl]);
            } catch (err: any) {
                toast.error(`Failed to upload "${file.name}"`);
            }
        }
        setGalleryUploading(false);
        e.target.value = '';
    };

    const handleGalleryRemove = (url: string) => {
        const updated = galleryUrls.filter((u) => u !== url);
        setGalleryUrls(updated);
        autoSave('gallery_urls', updated);
    };

    const handleMapChange = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
        autoSave('latitude', lat);
        autoSave('longitude', lng);
    };

    const clearError = (field: string) =>
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });

    if (isLoadingDetails) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Tell us about your venue
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    This information will be shown to players when they browse
                    and book courts.
                </p>
            </div>

            {/* Venue Name */}
            <div className="space-y-1.5" data-error={!!errors.name}>
                <Label>Venue Name *</Label>
                <Input
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        clearError('name');
                    }}
                    onBlur={() => {
                        if (name) autoSave('name', name);
                    }}
                    className={cn(errors.name && 'border-destructive')}
                />
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                )}
            </div>

            {/* Address */}
            <div className="space-y-1.5" data-error={!!errors.address}>
                <Label>Full Address *</Label>
                <Input
                    placeholder="Start typing your address..."
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                        clearError('address');
                    }}
                    onBlur={() => {
                        if (address) autoSave('address', address);
                    }}
                    className={cn(errors.address && 'border-destructive')}
                />
                {errors.address && (
                    <p className="text-xs text-destructive">{errors.address}</p>
                )}
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5" data-error={!!errors.city}>
                    <Label>City *</Label>
                    <Input
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            clearError('city');
                        }}
                        onBlur={() => {
                            if (city) autoSave('city', city);
                        }}
                        className={cn(errors.city && 'border-destructive')}
                    />
                    {errors.city && (
                        <p className="text-xs text-destructive">
                            {errors.city}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        onBlur={() => {
                            if (state) autoSave('state', state);
                        }}
                    />
                </div>
            </div>

            {/* Country + Pincode */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Country</Label>
                    <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        onBlur={() => {
                            if (country) autoSave('country', country);
                        }}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label>Pincode</Label>
                    <Input
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        onBlur={() => {
                            if (pincode) autoSave('pincode', pincode);
                        }}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5" data-error={!!errors.description}>
                <Label>Short Description *</Label>
                <Textarea
                    placeholder="Describe your venue — facilities, vibe, what makes it special."
                    value={description}
                    onChange={(e) => {
                        const val = e.target.value.slice(0, 300);
                        setDescription(val);
                        clearError('description');
                        debouncedSave('description', val);
                    }}
                    onBlur={() => {
                        if (description) autoSave('description', description);
                    }}
                    className={cn(
                        'min-h-[100px]',
                        errors.description && 'border-destructive',
                    )}
                />
                <p
                    className={cn(
                        'text-xs',
                        description.length >= 290
                            ? 'text-destructive'
                            : description.length >= 250
                              ? 'text-[hsl(var(--admin-status-amber))]'
                              : 'text-muted-foreground',
                    )}
                >
                    {description.length} / 300
                </p>
                {errors.description && (
                    <p className="text-xs text-destructive">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Logo Upload */}
            <div className="space-y-1.5">
                <Label>Venue Logo (optional)</Label>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WEBP. Max 2MB. Square crop.
                </p>
                <div className="flex items-center gap-4">
                    {logoUrl ? (
                        <div className="relative">
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="h-16 w-16 rounded-full object-cover border-2 border-border"
                            />
                            <button
                                onClick={() => {
                                    setLogoUrl('');
                                    autoSave('logo_url', null);
                                }}
                                className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => logoInputRef.current?.click()}
                            disabled={logoUploading}
                            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors"
                        >
                            {logoUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                                <Upload className="h-5 w-5 text-muted-foreground" />
                            )}
                        </button>
                    )}
                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'logo')}
                    />
                </div>
            </div>

            {/* Cover Photo */}
            <div className="space-y-1.5" data-error={!!errors.cover}>
                <Label>Cover Photo *</Label>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WEBP. Max 5MB. 16:9 ratio.
                </p>
                {coverUrl ? (
                    <div className="relative">
                        <img
                            src={coverUrl}
                            alt="Cover"
                            className="h-40 w-full rounded-xl object-cover border border-border"
                        />
                        <button
                            onClick={() => {
                                setCoverUrl('');
                                autoSave('cover_photo_url', null);
                            }}
                            className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => coverInputRef.current?.click()}
                        disabled={coverUploading}
                        className={cn(
                            'flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed transition-colors',
                            errors.cover
                                ? 'border-destructive bg-destructive/5'
                                : 'border-border hover:border-muted-foreground/50',
                        )}
                    >
                        {coverUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Click to upload
                                </p>
                            </div>
                        )}
                    </button>
                )}
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'cover')}
                />
                {errors.cover && (
                    <p className="text-xs text-destructive">{errors.cover}</p>
                )}
            </div>

            {/* Gallery Upload */}
            <div className="space-y-1.5">
                <Label>Venue Gallery (optional)</Label>
                <p className="text-xs text-muted-foreground">
                    Showcase your courts, amenities, and facilities. Up to 10
                    photos.
                </p>
                <GalleryUpload
                    images={galleryUrls}
                    onAdd={handleGallerySelect}
                    onRemove={handleGalleryRemove}
                    uploading={galleryUploading}
                />
            </div>

            {/* Map Location Picker */}
            <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Venue Location on Map (optional)
                </Label>
                <p className="text-xs text-muted-foreground">
                    Click on the map or drag the marker to pin your exact
                    location.
                </p>
                <MapLocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={handleMapChange}
                />
                {latitude && longitude && (
                    <p className="text-xs text-muted-foreground">
                        📍 Location pinned successfully
                    </p>
                )}
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5" data-error={!!errors.email}>
                <Label>Booking Contact Email *</Label>
                <Input
                    type="email"
                    placeholder="bookings@yourvenue.com"
                    value={contactEmail}
                    onChange={(e) => {
                        setContactEmail(e.target.value);
                        clearError('email');
                    }}
                    onBlur={() => {
                        if (
                            contactEmail &&
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
                        ) {
                            autoSave('contact_email', contactEmail);
                        } else if (contactEmail) {
                            setErrors((e) => ({
                                ...e,
                                email: 'Invalid email format',
                            }));
                        }
                    }}
                    className={cn(errors.email && 'border-destructive')}
                />
                <p className="text-xs text-muted-foreground">
                    Booking confirmations and platform communications will be
                    sent here.
                </p>
                {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
                <Label>WhatsApp Number for Support (optional)</Label>
                <div className="flex gap-2">
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                        +91
                    </div>
                    <Input
                        placeholder="98765 43210"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        onBlur={() => {
                            if (whatsapp) autoSave('whatsapp_number', whatsapp);
                        }}
                        className="flex-1"
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Players can contact your venue here for support.
                </p>
            </div>

            <ImageCropDialog
                open={cropOpen}
                onOpenChange={setCropOpen}
                imageSrc={cropImage}
                aspect={cropAspect}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default StepVenueProfile;
