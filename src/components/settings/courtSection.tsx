import { Pencil, Plus, Save, Trash2, Wrench, X, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import CourtForm from './courtForm';
import { Badge } from '../ui/badge';

const CourtsSection = ({
    sport,
    courts,
    peakConfig,
    downtimes,
    editingCourtId,
    editForm,
    showAddForm,
    newCourt,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onAddCourt,
    onSetShowAdd,
    onSetDeleteId,
    onNewCourtChange,
    onEditFormChange,
}: {
    sport: string;
    courts: CourtData[];
    peakConfig: SportPeakConfig;
    downtimes: ScheduledDowntime[];
    editingCourtId: string | null;
    editForm: CourtData | null;
    showAddForm: boolean;
    newCourt: Omit<CourtData, 'id'>;
    onStartEdit: (c: CourtData) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onAddCourt: () => void;
    onSetShowAdd: (v: boolean) => void;
    onSetDeleteId: (id: string) => void;
    onNewCourtChange: (u: Partial<CourtData>) => void;
    onEditFormChange: (u: Partial<CourtData>) => void;
}) => {
    return (
        <div className="space-y-4">
            {/* Sport-level pricing summary */}
            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                    <span className="font-medium">
                        ₹{peakConfig.offPeakPrice}
                    </span>
                    <span className="text-muted-foreground"> off-peak · </span>
                    <span className="font-medium">
                        ₹{peakConfig.peakPrice}
                    </span>
                    <span className="text-muted-foreground"> peak</span>
                </p>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {courts.length} court{courts.length !== 1 ? 's' : ''}
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSetShowAdd(true)}
                >
                    <Plus className="mr-1 h-4 w-4" /> Add Court
                </Button>
            </div>

            {showAddForm && (
                <Card className="border-primary/30">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">
                                New {sport} Court
                            </h4>
                            <button onClick={() => onSetShowAdd(false)}>
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                        <CourtForm
                            data={newCourt}
                            onChange={onNewCourtChange}
                        />
                        <Button className="w-full" onClick={onAddCourt}>
                            <Plus className="mr-1.5 h-4 w-4" /> Add Court
                        </Button>
                    </CardContent>
                </Card>
            )}

            {courts.map((court) => {
                const isEditing = editingCourtId === court.id;
                const courtDowntimes = downtimes.filter(
                    (d) => d.courtId === court.id,
                );

                return (
                    <Card
                        key={court.id}
                        className={!court.isActive ? 'opacity-50' : ''}
                    >
                        <CardContent className="p-4">
                            {isEditing && editForm ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-foreground">
                                            Edit Court
                                        </h4>
                                        <button onClick={onCancelEdit}>
                                            <X className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                    <CourtForm
                                        data={editForm}
                                        onChange={onEditFormChange}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={onCancelEdit}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={onSaveEdit}
                                        >
                                            <Save className="mr-1.5 h-4 w-4" />{' '}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {court.name}
                                            </h3>
                                            {!court.isActive && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    Inactive
                                                </Badge>
                                            )}
                                            {courtDowntimes.length > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-amber-500/30 text-amber-600"
                                                >
                                                    <Wrench className="mr-0.5 h-3 w-3" />{' '}
                                                    {courtDowntimes.length}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {court.surfaceMaterial || '—'} ·{' '}
                                            {court.lighting} ·{' '}
                                            {court.roofed ? 'Covered' : 'Open'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => onStartEdit(court)}
                                            className="rounded-lg p-2 hover:bg-muted transition-colors"
                                        >
                                            <Pencil className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                onSetDeleteId(court.id)
                                            }
                                            className="rounded-lg p-2 hover:bg-destructive/10 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {courts.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                    No {sport} courts yet
                </div>
            )}
        </div>
    );
};

export default CourtsSection;
