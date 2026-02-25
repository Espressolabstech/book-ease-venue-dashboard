import { Label } from '@radix-ui/react-label';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { cn } from '../../utils/twMerge';
import { Textarea } from '../ui/textarea';
import { Loader2, Upload, X } from 'lucide-react';
import ImageCropDialog from './ImageCropDialog';
import { toast } from 'sonner';

const StepVenueProfile = ({
    venueId,
    venue,
    onNext,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
}: StepVenueProfileProps) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [description, setDescription] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
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

    // Pre-fill from venue
    useEffect(() => {
        if (!venue) return;
        setName(venue.name || '');
        setAddress(venue.address || '');
        setCity(venue.city || '');
        setDescription(venue.description || '');
        setContactEmail(venue.contact_email || '');
        setWhatsapp(venue.whatsapp_number || '');
        setLogoUrl(venue.logo_url || '');
        setCoverUrl(venue.cover_photo_url || '');
    }, [venue]);

    // Auto-save on blur
    const autoSave = useCallback(
        async (field: string, value: any) => {
            // onSaving(true);
            // const { error } = await supabase
            //     .from('venues')
            //     .update({ [field]: value })
            //     .eq('id', venueId);
            // if (error) console.error('Auto-save error:', error);
            // onSaving(false);
            // onSaved();
        },
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

    // Validate
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

    // Handle Save & Continue trigger
    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            if (!validate()) {
                onSaveComplete(false);
                // Scroll to first error
                const firstErr = document.querySelector("[data-error='true']");
                firstErr?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
                return;
            }
            onSaving(true);

            onSaving(false);
            onSaved();
            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    // Handle Save & Exit trigger
    useEffect(() => {
        if (!triggerExit) return;
        (async () => {})();
    }, [triggerExit]); // eslint-disable-line

    // File selection
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
        const setUrl = isLogo ? setLogoUrl : setCoverUrl;
        const field = isLogo ? 'logo_url' : 'cover_photo_url';

        setUploading(true);
        const ext = 'jpg';
        const path = `${venueId}/${isLogo ? 'logo' : 'cover'}-${Date.now()}.${ext}`;

        // const { error: uploadErr } = await supabase.storage
        //     .from('venue-assets')
        //     .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

        // if (uploadErr) {
        //     toast.error('Upload failed: ' + uploadErr.message);
        //     setUploading(false);
        //     return;
        // }

        // const { data: urlData } = supabase.storage
        //     .from('venue-assets')
        //     .getPublicUrl(path);

        // setUrl(urlData.publicUrl);
        // setUploading(false);
        // autoSave(field, urlData.publicUrl);
        if (isLogo) setErrors((e) => ({ ...e, logo: '' }));
        else setErrors((e) => ({ ...e, cover: '' }));
    };

    const clearError = (field: string) =>
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });

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

            {/* City */}
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
                    <p className="text-xs text-destructive">{errors.city}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-1.5" data-error={!!errors.description}>
                <Label>Short Description *</Label>
                <Textarea
                    placeholder="Describe your venue — facilities, vibe, what makes it special."
                    value={description}
                    onChange={(e) => {
                        if (e.target.value.length <= 300) {
                            setDescription(e.target.value);
                            clearError('description');
                            debouncedSave('description', e.target.value);
                        }
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
