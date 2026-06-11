import { ALL_SPORTS } from '../../utils/settings';
import type { EnvironmentOption } from '../../utils/sportFields';
import {
    getCourtLabel,
    getCourtSizeOptions,
    getDefaultEnvironment,
    getEnvironmentOptions,
    getFormatOptions,
    getSurfaceOptions,
    isIndoorLocked,
} from '../../utils/sportFields';
import { cn } from '../../utils/twMerge';
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
    allowSportChange = false,
}: {
    data: Omit<CourtData, 'id'> | CourtData;
    onChange: (u: Partial<CourtData>) => void;
    allowSportChange?: boolean;
}) => {
    const locked = isIndoorLocked(data.sport);
    const envOptions = getEnvironmentOptions(data.sport);
    const currentEnv: EnvironmentOption = locked ? 'Indoor' : (data.environment ?? getDefaultEnvironment(data.sport));
    const surfaces = getSurfaceOptions(data.sport, currentEnv);
    const formatOptions = getFormatOptions(data.sport);
    const courtSizeOptions = getCourtSizeOptions(data.sport);
    const courtLabel = getCourtLabel(data.sport);

    const handleSportChange = (sport: string) => {
        onChange({
            sport,
            surfaceMaterial: '',
            environment: getDefaultEnvironment(sport),
            format: undefined,
            courtSize: undefined,
        });
    };

    const handleEnvChange = (env: EnvironmentOption) => {
        const newSurfaces = getSurfaceOptions(data.sport, env);
        onChange({
            environment: env,
            surfaceMaterial: newSurfaces.includes(data.surfaceMaterial) ? data.surfaceMaterial : '',
        });
    };

    return (
        <div className="space-y-4">
            {allowSportChange && (
                <div>
                    <Label className="text-xs">Sport</Label>
                    <Select
                        value={data.sport}
                        onValueChange={handleSportChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                            {ALL_SPORTS.map((s) => (
                                <SelectItem key={s.value} value={s.label}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div>
                <Label className="text-xs">{courtLabel}</Label>
                <Input
                    value={data.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder={
                        courtLabel === 'Pitch name' ? 'e.g. Pitch 1' : 'e.g. Court 4'
                    }
                />
            </div>

            {!locked && (
                <div>
                    <Label className="text-xs">Environment</Label>
                    <div className="flex mt-1.5 rounded-lg border border-border overflow-hidden">
                        {envOptions.map((env) => (
                            <button
                                key={env}
                                type="button"
                                onClick={() => handleEnvChange(env)}
                                className={cn(
                                    'flex-1 py-2 text-xs font-medium transition-colors',
                                    currentEnv === env
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                {env}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {formatOptions && (
                <div>
                    <Label className="text-xs">Format</Label>
                    <Select
                        value={data.format ?? ''}
                        onValueChange={(v) => onChange({ format: v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                            {formatOptions.map((f) => (
                                <SelectItem key={f} value={f}>
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {courtSizeOptions && (
                <div>
                    <Label className="text-xs">Court size</Label>
                    <div className="flex mt-1.5 rounded-lg border border-border overflow-hidden">
                        {courtSizeOptions.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => onChange({ courtSize: size })}
                                className={cn(
                                    'flex-1 py-2 text-xs font-medium transition-colors',
                                    data.courtSize === size
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {surfaces.length > 0 && (
                <div>
                    <Label className="text-xs">Surface</Label>
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
            )}

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
