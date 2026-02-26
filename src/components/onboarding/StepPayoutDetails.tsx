import { Shield } from "lucide-react";
import { IFSC_REGEX, PAYOUT_SCHEDULES } from "../../utils/payOutDetails";
import { cn } from "../../utils/twMerge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const StepPayoutDetails = ({
    venueId,
    onSaving,
    onSaved,
    triggerSave,
    onSaveComplete,
    triggerExit,
    onExitComplete,
}: StepPayoutDetailsProps) => {
    const [bankName, setBankName] = useState('');
    const [holderName, setHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccount, setConfirmAccount] = useState('');
    const [iban, setIban] = useState(''); // using iban field for IFSC
    const [schedule, setSchedule] = useState('weekly');
    const [loaded, setLoaded] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        (async () => {
            // const { data } = await supabase
            //     .from('venue_payout_details')
            //     .select('*')
            //     .eq('venue_id', venueId)
            //     .maybeSingle();

            // if (data) {
            //     setBankName(data.bank_name || '');
            //     setHolderName(data.account_holder_name || '');
            //     setIban(data.iban || '');
            //     setSchedule(data.payout_schedule || 'weekly');
            // }
            setLoaded(true);
        })();
    }, [venueId]);

    const autoSave = useCallback(async () => {
        onSaving(true);
        sessionStorage.setItem(
            'onboarding_step7',
            JSON.stringify({
                bankName,
                holderName,
                accountNumber,
                ifscCode: iban,
                schedule,
            }),
        );
        onSaving(false);
        onSaved();
    }, [venueId, bankName, holderName, accountNumber, iban, schedule, onSaving, onSaved]); // eslint-disable-line

    const clearError = (field: string) =>
        setErrors((prev) => {
            const n = { ...prev };
            delete n[field];
            return n;
        });

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!bankName.trim()) errs.bank = 'Bank name is required';
        if (!holderName.trim()) errs.holder = 'Account holder name is required';
        if (!accountNumber.trim()) errs.account = 'Account number is required';
        if (accountNumber !== confirmAccount)
            errs.confirm = 'Account numbers do not match';
        if (!iban.trim()) errs.ifsc = 'IFSC code is required';
        else if (!IFSC_REGEX.test(iban.toUpperCase()))
            errs.ifsc = 'Please enter a valid IFSC code (e.g. HDFC0001234)';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Save & Continue
    useEffect(() => {
        if (!triggerSave) return;
        (async () => {
            if (!validate()) {
                toast.error('Please fix errors before continuing.');
                onSaveComplete(false);
                return;
            }
            await autoSave();
            // await supabase
            //     .from('onboarding_progress')
            //     .update({ current_step: 7 })
            //     .eq('venue_id', venueId);
            onSaveComplete(true);
        })();
    }, [triggerSave]); // eslint-disable-line

    // Save & Exit
    useEffect(() => {
        if (!triggerExit) return;
        (async () => {
            await autoSave();
            onExitComplete();
        })();
    }, [triggerExit]); // eslint-disable-line

    if (!loaded) return null;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Where should we send your earnings?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Your payout details are encrypted and stored securely.
                </p>
            </div>

            {/* Security banner */}
            <div className="flex items-start gap-3 rounded-xl bg-[hsl(var(--admin-status-amber))]/10 border border-[hsl(var(--admin-status-amber))]/20 p-4">
                <Shield className="h-5 w-5 shrink-0 text-[hsl(var(--admin-status-amber))]" />
                <p className="text-sm text-[hsl(var(--admin-status-amber))]">
                    Your bank details are protected with bank-level encryption.
                    Payouts will begin once your first booking is completed and
                    cleared.
                </p>
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
                <Label>Bank Name *</Label>
                <Input
                    placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                    value={bankName}
                    onChange={(e) => {
                        setBankName(e.target.value);
                        clearError('bank');
                    }}
                    onBlur={autoSave}
                    className={cn(errors.bank && 'border-destructive')}
                />
                {errors.bank && (
                    <p className="text-xs text-destructive">{errors.bank}</p>
                )}
            </div>

            {/* Account Holder */}
            <div className="space-y-1.5">
                <Label>Account Holder Name *</Label>
                <Input
                    value={holderName}
                    onChange={(e) => {
                        setHolderName(e.target.value);
                        clearError('holder');
                    }}
                    onBlur={autoSave}
                    className={cn(errors.holder && 'border-destructive')}
                />
                <p className="text-xs text-muted-foreground">
                    Must match the name on your bank account exactly.
                </p>
                {errors.holder && (
                    <p className="text-xs text-destructive">{errors.holder}</p>
                )}
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
                <Label>Account Number *</Label>
                <Input
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setAccountNumber(val);
                        clearError('account');
                    }}
                    className={cn(errors.account && 'border-destructive')}
                />
                {errors.account && (
                    <p className="text-xs text-destructive">{errors.account}</p>
                )}
            </div>

            {/* Confirm Account Number */}
            <div className="space-y-1.5">
                <Label>Confirm Account Number *</Label>
                <Input
                    type="text"
                    inputMode="numeric"
                    value={confirmAccount}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setConfirmAccount(val);
                        clearError('confirm');
                    }}
                    onBlur={() => {
                        if (
                            confirmAccount &&
                            confirmAccount !== accountNumber
                        ) {
                            setErrors((e) => ({
                                ...e,
                                confirm: 'Account numbers do not match',
                            }));
                        }
                    }}
                    className={cn(errors.confirm && 'border-destructive')}
                />
                {errors.confirm && (
                    <p className="text-xs text-destructive">{errors.confirm}</p>
                )}
            </div>

            {/* IFSC Code */}
            <div className="space-y-1.5">
                <Label>IFSC Code *</Label>
                <Input
                    value={iban}
                    onChange={(e) => {
                        setIban(e.target.value.toUpperCase());
                        clearError('ifsc');
                    }}
                    onBlur={() => {
                        if (iban && !IFSC_REGEX.test(iban)) {
                            setErrors((e) => ({
                                ...e,
                                ifsc: 'Please enter a valid IFSC code (e.g. HDFC0001234)',
                            }));
                        } else {
                            autoSave();
                        }
                    }}
                    placeholder="e.g. HDFC0001234"
                    className={cn(errors.ifsc && 'border-destructive')}
                />
                {errors.ifsc && (
                    <p className="text-xs text-destructive">{errors.ifsc}</p>
                )}
            </div>

            {/* Payout Schedule */}
            <div className="space-y-3">
                <Label>Preferred Payout Schedule</Label>
                <div className="space-y-2">
                    {PAYOUT_SCHEDULES.map((s) => (
                        <label
                            key={s.value}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <input
                                type="radio"
                                checked={schedule === s.value}
                                onChange={() => {
                                    setSchedule(s.value);
                                    setTimeout(autoSave, 100);
                                }}
                                className="h-4 w-4 text-[hsl(var(--admin-navy))]"
                            />
                            <span className="text-sm">{s.label}</span>
                        </label>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    This is your preference — the platform team will confirm
                    your schedule after your venue goes live.
                </p>
            </div>
        </div>
    );
};

export default StepPayoutDetails;
