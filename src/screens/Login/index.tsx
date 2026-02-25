import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { managerLogin } from '../../api/adapters/auth';

const Login = () => {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const loc = useLocation();
    const returnTo = (loc.state as any)?.from || '/';

    const {
        mutate: login,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationFn: (data: ManagerLogin) => managerLogin(data),
        onSuccess: () => {
            navigate(returnTo);
        },
        onError: (err) => {
            console.error('Login failed:', err);
        },
    });

    const handlePhoneSubmit = () => {
        login({ phone });
    };

    const handleOtpSubmit = () => {
        // if (otp.trim()) {
        //     login({ phone, otp });
        // }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Hero */}
            <div className="bg-primary px-6 pt-16 pb-12 text-primary-foreground">
                <div className="mx-auto max-w-sm">
                    <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/60 mb-1">
                        BookEase
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Venue Dashboard
                    </h1>
                    <p className="mt-2 text-primary-foreground/80 text-sm">
                        Manage bookings, courts & availability — all in one
                        place.
                    </p>
                </div>
            </div>

            <main className="flex-1 px-6 pt-8">
                <div className="mx-auto max-w-sm space-y-6">
                    {step === 'phone' ? (
                        <>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Welcome,
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Enter your mobile number to login
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="50 123 4567"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            handlePhoneSubmit()
                                        }
                                        className="pl-10"
                                        autoFocus
                                        type="tel"
                                    />
                                </div>

                                <Button
                                    onClick={handlePhoneSubmit}
                                    className="w-full"
                                    disabled={!phone.trim()}
                                >
                                    Send OTP
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                By continuing, you agree to our Terms of Service
                                and Privacy Policy.
                            </p>
                        </>
                    ) : (
                        <>
                            <div>
                                <button
                                    onClick={() => setStep('phone')}
                                    className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Change number
                                </button>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Verify your number
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    We sent a 6-digit code to{' '}
                                    <span className="font-medium text-foreground">
                                        {phone}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleOtpSubmit()
                                    }
                                    className="text-center tracking-[0.5em] text-lg font-semibold"
                                    maxLength={6}
                                    autoFocus
                                    type="number"
                                />

                                {isError && (
                                    <p className="text-sm text-destructive text-center">
                                        {(error as any)?.message ||
                                            'Verification failed. Please try again.'}
                                    </p>
                                )}

                                <Button
                                    onClick={handleOtpSubmit}
                                    className="w-full"
                                    disabled={!otp.trim() || isPending}
                                >
                                    {isPending
                                        ? 'Verifying...'
                                        : 'Verify & Continue'}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>

                                <button
                                    className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => {}}
                                >
                                    Didn't receive a code?{' '}
                                    <span className="font-medium text-primary">
                                        Resend
                                    </span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Login;
