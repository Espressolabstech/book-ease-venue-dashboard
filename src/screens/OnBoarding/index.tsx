import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StepVenueProfile from '../../components/onboarding/StepVenueProfile';
import OnBoardingLayout from '../../layouts/onBoarding';
import StepOperatingHours from '../../components/onboarding/StepOperatingHours';
import StepCourtSetup from '../../components/onboarding/StepCourtSetup';
import StepAmenities from '../../components/onboarding/StepAmenities';
import StepPricing from '../../components/onboarding/StepPricing';
import StepBookingRules from '../../components/onboarding/StepBookingRules';
import StepPayoutDetails from '../../components/onboarding/StepPayoutDetails';
import StepReview from '../../components/onboarding/StepReview';

const OnBoarding = () => {
    const { venueId, token, step } = useParams<{
        venueId: string;
        token: string;
        step: string;
    }>();
    const navigate = useNavigate();
    const currentStep = parseInt(step || '1');

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [triggerSave, setTriggerSave] = useState(false);
    const [triggerExit, setTriggerExit] = useState(false);
    const [triggerBack, setTriggerBack] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);

    const venue = null;
    const progress = { venue_id: venueId!, current_step: currentStep };

    const handleSaving = useCallback((v: boolean) => {
        setSaving(v);
        if (v) setSaved(false);
    }, []);
    const handleSaved = useCallback(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, []);

    const handleSaveAndContinue = () => {
        setIsContinuing(true);
        setTriggerSave(true);
    };

    const handleSaveComplete = (success: boolean) => {
        setTriggerSave(false);
        setIsContinuing(false);
        if (success && currentStep < 8) {
            navigate(`/onboarding/${venueId}/${token}/step/${currentStep + 1}`);
        }
    };

    const handleSaveAndExit = () => setTriggerExit(true);

    const handleExitComplete = () => {
        setTriggerExit(false);
    };

    const handleBack = () => {
        if (currentStep > 1) setTriggerBack(true);
    };

    const handleBackComplete = () => {
        setTriggerBack(false);
        if (currentStep > 1) {
            navigate(`/onboarding/${venueId}/${token}/step/${currentStep - 1}`);
        }
    };

    const stepProps = {
        venueId: venueId!,
        venue,
        onNext: () => {},
        onSaving: handleSaving,
        onSaved: handleSaved,
        triggerSave,
        onSaveComplete: handleSaveComplete,
        triggerExit,
        onExitComplete: handleExitComplete,
        triggerBack,
        onBackComplete: handleBackComplete,
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepVenueProfile {...stepProps} />;
            case 2:
                return <StepOperatingHours {...stepProps} />;
            case 3:
                return <StepCourtSetup {...stepProps} />;
            case 4:
                return <StepAmenities {...stepProps} />;
            case 5:
                return <StepPricing {...stepProps} />;
            case 6:
                return <StepBookingRules {...stepProps} />;
            case 7:
                return <StepPayoutDetails {...stepProps} />;
            case 8:
                return <StepReview {...stepProps} />;
            default:
                return <StepVenueProfile {...stepProps} />;
        }
    };

    return (
        <OnBoardingLayout
            venueId={venueId!}
            token={token!}
            venue={venue}
            progress={progress}
            currentStep={currentStep}
            saving={saving}
            saved={saved}
            onSaveAndContinue={handleSaveAndContinue}
            onSaveAndExit={handleSaveAndExit}
            onBack={handleBack}
            isContinuing={isContinuing}
        >
            {renderStep()}
        </OnBoardingLayout>
    );
};

export default OnBoarding;
