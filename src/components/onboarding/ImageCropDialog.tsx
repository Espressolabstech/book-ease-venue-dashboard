import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { DialogFooter, DialogHeader } from '../ui/dialog';
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
    image.src = imageSrc;
    await new Promise((resolve) => {
        image.onload = resolve;
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

    return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9),
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

    const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(blob);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-muted">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropDone}
                    />
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
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] hover:bg-[hsl(var(--admin-lime))]/90"
                    >
                        Apply Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
