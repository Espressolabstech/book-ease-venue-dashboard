import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Lock, LogOut, Loader2 } from 'lucide-react';
import { STEPS } from '../utils/onBoardingSteps';
import { cn } from '../utils/twMerge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { Button } from '../components/ui/button';

const OnBoardingLayout = ({
    venueId,
    token,
    progress,
    currentStep,
    saving = false,
    saved = false,
    children,
    onSaveAndContinue,
    onSaveAndExit,
    onBack,
    isContinuing = false,
}: OnboardingShellProps) => {
    const navigate = useNavigate();
    const completedStep = progress?.current_step || 0;
    const completedCount = completedStep;

    const goToStep = (step: number) => {
        if (step <= completedStep + 1 && step !== currentStep) {
            navigate(`/onboarding/${venueId}/${token}/step/${step}`);
        }
    };

    const getStepStatus = (stepNum: number) => {
        if (stepNum <= completedStep) return 'completed';
        if (stepNum === currentStep) return 'current';
        return 'locked';
    };

    return (
        <div className="flex min-h-screen bg-[hsl(var(--admin-bg))]">
            <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-card lg:flex">
                <div className="border-b border-border p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--admin-navy))]">
                            <Sparkles className="h-5 w-5 text-[hsl(var(--admin-lime))]" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {'Book Ease'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {completedCount} of 8 steps complete
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {STEPS.map((step) => {
                            const status = getStepStatus(step.number);
                            const isClickable =
                                step.number <= completedStep + 1;
                            const isViewing = step.number === currentStep;

                            return (
                                <li key={step.number}>
                                    <button
                                        onClick={() =>
                                            isClickable && goToStep(step.number)
                                        }
                                        disabled={!isClickable}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                                            isViewing &&
                                                'bg-[hsl(var(--admin-navy))]/5',
                                            isClickable &&
                                                !isViewing &&
                                                'hover:bg-muted/50',
                                            !isClickable &&
                                                'cursor-not-allowed opacity-50',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                                                status === 'completed' &&
                                                    'bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))]',
                                                status === 'current' &&
                                                    'bg-[hsl(var(--admin-navy))] text-[hsl(var(--admin-navy-foreground))]',
                                                status === 'locked' &&
                                                    'border-2 border-muted-foreground/30 text-muted-foreground/50',
                                            )}
                                        >
                                            {status === 'completed' ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                step.number
                                            )}
                                        </div>

                                        {/* Label */}
                                        <span
                                            className={cn(
                                                'text-sm',
                                                isViewing &&
                                                    'font-semibold text-foreground',
                                                status === 'completed' &&
                                                    !isViewing &&
                                                    'text-foreground',
                                                status === 'locked' &&
                                                    'text-muted-foreground/50',
                                            )}
                                        >
                                            {step.label}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-t border-border p-4 space-y-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Open for Bookings
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                                    <div className="h-5 w-9 rounded-full bg-muted-foreground/20" />
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            Complete all 8 steps to unlock.
                        </TooltipContent>
                    </Tooltip>

                    <button
                        onClick={onSaveAndExit}
                        className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Save & Exit
                    </button>
                </div>
            </aside>

            <div className="flex flex-1 flex-col">
                <div className="sticky top-0 z-10 border-b border-border bg-card p-4 lg:hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Step {currentStep} of 8
                        </span>
                        {(saving || saved) && (
                            <span className="text-xs text-muted-foreground">
                                {saving ? 'Saving...' : 'Saved ✓'}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {STEPS.map((step) => (
                            <div
                                key={step.number}
                                className={cn(
                                    'h-1.5 flex-1 rounded-full transition-colors',
                                    step.number <= completedStep
                                        ? 'bg-[hsl(var(--admin-lime))]'
                                        : step.number === currentStep
                                          ? 'bg-[hsl(var(--admin-navy))]'
                                          : 'bg-muted',
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop auto-save indicator */}
                <div className="hidden lg:flex justify-end px-8 pt-4">
                    {(saving || saved) && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {saving ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="h-3 w-3 text-[hsl(var(--admin-lime))]" />
                                    Saved
                                </>
                            )}
                        </span>
                    )}
                </div>

                <div className="flex-1 px-4 py-6 sm:px-8 lg:px-12 lg:py-8 max-w-3xl">
                    {children}
                </div>

                <div className="sticky bottom-0 border-t border-border bg-card px-4 py-3 sm:px-8 lg:px-12">
                    <div className="flex items-center justify-between max-w-3xl">
                        <Button
                            variant="outline"
                            onClick={onSaveAndExit}
                            className="hidden sm:inline-flex"
                        >
                            Save & Exit
                        </Button>
                        <div className="flex items-center gap-3 ml-auto">
                            {currentStep > 1 && (
                                <Button variant="outline" onClick={onBack}>
                                    Back
                                </Button>
                            )}
                            <Button
                                onClick={onSaveAndContinue}
                                disabled={isContinuing}
                                className="bg-[hsl(var(--admin-lime))] text-[hsl(var(--admin-lime-foreground))] hover:bg-[hsl(var(--admin-lime))]/90"
                            >
                                {isContinuing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : currentStep === 8 ? (
                                    'Submit for Review'
                                ) : (
                                    'Save & Continue'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnBoardingLayout;
