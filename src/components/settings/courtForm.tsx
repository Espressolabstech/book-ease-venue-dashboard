import { lightingOptions, surfaceOptions } from '../../utils/settings';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';

const CourtForm = ({
    data,
    onChange,
}: {
    data: Omit<CourtData, 'id'> | CourtData;
    onChange: (u: Partial<CourtData>) => void;
}) => {
    const surfaces = surfaceOptions[data.sport] || surfaceOptions.Padel;
    return (
        <div className="space-y-3">
            <div>
                <Label className="text-xs">Court Name</Label>
                <Input
                    value={data.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="e.g. Court 4"
                />
            </div>
            <div>
                <Label className="text-xs">Surface / Turf Material</Label>
                <Select
                    value={data.surfaceMaterial}
                    onValueChange={(v) => onChange({ surfaceMaterial: v })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select surface" />
                    </SelectTrigger>
                    <SelectContent>
                        {surfaces.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs">Lighting</Label>
                    <Select
                        value={data.lighting}
                        onValueChange={(v) => onChange({ lighting: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {lightingOptions.map((l) => (
                                <SelectItem key={l} value={l}>
                                    {l}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-2 h-9">
                        <Switch
                            checked={data.roofed}
                            onCheckedChange={(v) => onChange({ roofed: v })}
                        />
                        <Label className="text-sm">Covered</Label>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Switch
                    checked={data.isActive}
                    onCheckedChange={(v) => onChange({ isActive: v })}
                />
                <Label className="text-sm">Active</Label>
            </div>
        </div>
    );
};

export default CourtForm;
