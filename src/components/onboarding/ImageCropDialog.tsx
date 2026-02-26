import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Slider } from '@radix-ui/react-slider';

interface ImageCropDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string;
    aspect: number;
    onCropComplete: (blob: Blob) => void;
}

async function getCroppedImg(imageSrc: string, cropArea: Area): Promise<Blob> {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height,
    );

    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to create blob'));
            },
            'image/jpeg',
            0.9,
        ),
    );
}

export default function ImageCropDialog({
    open,
    onOpenChange,
    imageSrc,
    aspect,
    onCropComplete,
}: ImageCropDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null,
    );
    const [saving, setSaving] = useState(false);

    const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const onMediaLoaded = useCallback(
        (mediaSize: { naturalWidth: number; naturalHeight: number }) => {
            const { naturalWidth: w, naturalHeight: h } = mediaSize;
            let x = 0,
                y = 0,
                width = w,
                height = h;
            if (aspect > w / h) {
                height = w / aspect;
                y = (h - height) / 2;
            } else {
                width = h * aspect;
                x = (w - width) / 2;
            }
            setCroppedAreaPixels({ x, y, width, height });
        },
        [aspect],
    );

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setSaving(true);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(blob);
            onOpenChange(false);
            // reset state for next use
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        } catch (err) {
            console.error('Crop failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>

                <div
                    className="relative w-full overflow-hidden rounded-lg bg-muted"
                    style={{ height: 300 }}
                >
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropDone}
                            onMediaLoaded={onMediaLoaded}
                        />
                    )}
                </div>

                <div className="flex items-center gap-3 px-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                        Zoom
                    </span>
                    <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={[zoom]}
                        onValueChange={([v]) => setZoom(v)}
                        className="flex-1"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !croppedAreaPixels}
                        className="bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] hover:bg-[hsl(var(--admin-lime))]/90"
                    >
                        {saving ? 'Applying...' : 'Apply Crop'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
