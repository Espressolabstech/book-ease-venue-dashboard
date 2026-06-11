import { useState } from 'react';
import { ChevronRight, LayoutGrid, Pencil, Plus, Save, Trash2, Wrench, X, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import CourtForm from './courtForm';
import { Badge } from '../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import { ALL_SPORTS } from '../../utils/settings';

const CourtsSection = ({
    sport,
    allCourts,
    courts,
    downtimes,
    editingCourtId,
    editForm,
    showAddForm,
    newCourt,
    onSelectSport,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onAddCourt,
    onSetShowAdd,
    onSetDeleteId,
    onNewCourtChange,
    onEditFormChange,
    onNavigate,
}: {
    sport: string;
    allCourts: CourtData[];
    courts: CourtData[];
    downtimes: ScheduledDowntime[];
    editingCourtId: string | null;
    editForm: CourtData | null;
    showAddForm: boolean;
    newCourt: Omit<CourtData, 'id'>;
    onSelectSport: (s: string) => void;
    onStartEdit: (c: CourtData) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onAddCourt: () => void;
    onSetShowAdd: (v: boolean) => void;
    onSetDeleteId: (id: string) => void;
    onNewCourtChange: (u: Partial<CourtData>) => void;
    onEditFormChange: (u: Partial<CourtData>) => void;
    onNavigate: (section: Section) => void;
}) => {
    const [addSportOpen, setAddSportOpen] = useState(false);

    if (!sport) {
        const sportsWithCourts = ALL_SPORTS.filter((s) =>
            allCourts.some((c) => c.sport === s.label),
        );
        const otherSports = ALL_SPORTS.filter(
            (s) => !sportsWithCourts.some((sw) => sw.value === s.value),
        );

        return (
            <div className="space-y-6">
                <div className="space-y-1 px-1">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Your sports
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {sportsWithCourts.length === 0
                            ? 'Add your first sport to get started.'
                            : `${sportsWithCourts.length} sport${sportsWithCourts.length !== 1 ? 's' : ''} · ${allCourts.length} court${allCourts.length !== 1 ? 's' : ''} total`}
                    </p>
                </div>

                {sportsWithCourts.length > 0 && (
                    <div className="space-y-2">
                        {sportsWithCourts.map((s) => {
                            const n = allCourts.filter(
                                (c) => c.sport === s.label,
                            ).length;
                            return (
                                <button
                                    key={s.value}
                                    onClick={() => onSelectSport(s.label)}
                                    className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/30"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <LayoutGrid className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground">
                                                {s.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {n} court{n !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                </button>
                            );
                        })}
                    </div>
                )}

                {otherSports.length > 0 && (
                    <Button
                        variant="outline"
                        className="w-full border-dashed h-12 text-primary hover:text-primary"
                        onClick={() => setAddSportOpen(true)}
                    >
                        <Plus className="mr-1.5 h-4 w-4" /> Add a sport
                    </Button>
                )}

                <Dialog open={addSportOpen} onOpenChange={setAddSportOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add a sport</DialogTitle>
                            <DialogDescription>
                                Pick a sport to start configuring its courts.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            {otherSports.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => {
                                        setAddSportOpen(false);
                                        onSelectSport(s.label);
                                        onSetShowAdd(true);
                                    }}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-accent/30"
                                >
                                    <LayoutGrid className="h-4 w-4 text-primary shrink-0" />
                                    <span className="font-medium text-foreground text-sm">
                                        {s.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-2xl font-semibold text-foreground">{sport}</h2>
                <span className="text-sm text-muted-foreground">
                    {courts.length} court{courts.length !== 1 ? 's' : ''}
                </span>
            </div>

            {showAddForm && (
                <Card className="border-primary/30">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">
                                New {newCourt.sport || sport} Court
                            </h4>
                            <button onClick={() => onSetShowAdd(false)}>
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                        <CourtForm
                            data={newCourt}
                            onChange={onNewCourtChange}
                            allowSportChange
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
                                            {court.environment}
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

            <div className="pt-2 space-y-2">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onSetShowAdd(true)}
                >
                    <Plus className="mr-1.5 h-4 w-4" /> Add Court
                </Button>
                <button
                    onClick={() => onNavigate('peak')}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-primary hover:bg-accent/50 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Manage {sport} pricing
                    </span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default CourtsSection;
