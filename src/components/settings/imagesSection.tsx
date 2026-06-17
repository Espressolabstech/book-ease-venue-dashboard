import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../utils/twMerge';
import {
    getVenueImageUploadUrls,
    uploadToPresignedUrl,
} from '../../api/adapters/onBoard';
import {
    createVenueImage,
    deleteVenueImage,
    updateVenueImage,
} from '../../api/adapters/venueImages';

type Props = {
    venueId: string;
    images: VenueImageModel[];
    onRefresh: () => void;
    readOnly?: boolean;
};

function UploadButton({
    onFile,
    uploading,
    label,
}: {
    onFile: (file: File) => void;
    uploading: boolean;
    label: string;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <>
            <button
                onClick={() => ref.current?.click()}
                disabled={uploading}
                className="flex aspect-video flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors disabled:opacity-50"
            >
                {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                    <>
                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{label}</span>
                    </>
                )}
            </button>
            <input
                ref={ref}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFile(file);
                    e.target.value = '';
                }}
            />
        </>
    );
}

const ImagesSection = ({ venueId, images, onRefresh, readOnly = false }: Props) => {
    const [uploading, setUploading] = useState<VenueImageType | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const cover = images.find((i) => i.type === 'COVER');
    const logo = images.find((i) => i.type === 'LOGO');
    const gallery = images.filter((i) => i.type === 'GALLERY');

    const upload = async (file: File, type: VenueImageType) => {
        setUploading(type);
        try {
            const res = await getVenueImageUploadUrls({
                venueId,
                images: [{ type, mimetype: file.type, order: gallery.length }],
            });
            const [slot] = res.data as any[];
            await uploadToPresignedUrl(slot.uploadUrl, file, file.type);
            await createVenueImage({ url: slot.publicUrl, type, order: gallery.length });
            toast.success(`${type === 'GALLERY' ? 'Photo' : type.charAt(0) + type.slice(1).toLowerCase()} uploaded`);
            onRefresh();
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploading(null);
        }
    };

    const remove = async (id: string) => {
        setDeleting(id);
        try {
            await deleteVenueImage(id);
            toast.success('Image removed');
            onRefresh();
        } catch {
            toast.error('Failed to remove image');
        } finally {
            setDeleting(null);
        }
    };

    const setCover = async (id: string) => {
        try {
            if (cover && cover.id !== id) {
                await updateVenueImage(cover.id, { type: 'GALLERY' });
            }
            await updateVenueImage(id, { type: 'COVER' });
            toast.success('Cover photo updated');
            onRefresh();
        } catch {
            toast.error('Failed to set cover');
        }
    };

    return (
        <div className="space-y-5">
            {/* Cover */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold text-foreground">Cover Photo</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            The main photo shown on your venue listing.
                        </p>
                    </div>
                    {cover ? (
                        <div className="relative group aspect-video w-full overflow-hidden rounded-xl border border-border">
                            <img
                                src={cover.url}
                                alt="Cover"
                                className="h-full w-full object-cover"
                            />
                            {!readOnly && (
                                <button
                                    onClick={() => remove(cover.id)}
                                    disabled={deleting === cover.id}
                                    className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-60"
                                >
                                    {deleting === cover.id
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Trash2 className="h-3.5 w-3.5" />
                                    }
                                </button>
                            )}
                        </div>
                    ) : (
                        !readOnly && (
                            <UploadButton
                                onFile={(f) => upload(f, 'COVER')}
                                uploading={uploading === 'COVER'}
                                label="Upload cover"
                            />
                        )
                    )}
                    {cover && !readOnly && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/jpeg,image/png,image/webp';
                                input.onchange = async (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (!file) return;
                                    await remove(cover.id);
                                    await upload(file, 'COVER');
                                };
                                input.click();
                            }}
                            disabled={!!uploading}
                        >
                            {uploading === 'COVER' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="mr-1.5 h-3.5 w-3.5" />}
                            Replace Cover
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Logo */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold text-foreground">Logo</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Your venue logo or brand mark.
                        </p>
                    </div>
                    {logo ? (
                        <div className="flex items-center gap-4">
                            <div className="relative group h-20 w-20 overflow-hidden rounded-xl border border-border shrink-0">
                                <img src={logo.url} alt="Logo" className="h-full w-full object-cover" />
                                {!readOnly && (
                                    <button
                                        onClick={() => remove(logo.id)}
                                        disabled={deleting === logo.id}
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                    >
                                        {deleting === logo.id
                                            ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                                            : <Trash2 className="h-4 w-4 text-white" />
                                        }
                                    </button>
                                )}
                            </div>
                            {!readOnly && (
                                <Button variant="outline" size="sm" onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/jpeg,image/png,image/webp';
                                    input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (!file) return;
                                        await remove(logo.id);
                                        await upload(file, 'LOGO');
                                    };
                                    input.click();
                                }} disabled={!!uploading}>
                                    Replace Logo
                                </Button>
                            )}
                        </div>
                    ) : (
                        !readOnly && (
                            <div className="w-32">
                                <UploadButton
                                    onFile={(f) => upload(f, 'LOGO')}
                                    uploading={uploading === 'LOGO'}
                                    label="Upload logo"
                                />
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            {/* Gallery */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">Gallery</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Additional photos · {gallery.length}/10
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {gallery.map((img) => (
                            <div key={img.id} className="relative group aspect-video overflow-hidden rounded-xl border border-border">
                                <img
                                    src={img.url}
                                    alt={img.altText ?? ''}
                                    className="h-full w-full object-cover"
                                />
                                {!readOnly && (
                                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                        <button
                                            onClick={() => setCover(img.id)}
                                            title="Set as cover"
                                            className={cn(
                                                'rounded-full p-1.5 transition-colors',
                                                cover?.id === img.id
                                                    ? 'bg-yellow-400 text-yellow-900'
                                                    : 'bg-white/20 text-white hover:bg-white/40',
                                            )}
                                        >
                                            <Star className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => remove(img.id)}
                                            disabled={deleting === img.id}
                                            className="rounded-full bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/80 disabled:opacity-60"
                                        >
                                            {deleting === img.id
                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                : <Trash2 className="h-3.5 w-3.5" />
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {!readOnly && gallery.length < 10 && (
                            <UploadButton
                                onFile={(f) => upload(f, 'GALLERY')}
                                uploading={uploading === 'GALLERY'}
                                label="Add photo"
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ImagesSection;
