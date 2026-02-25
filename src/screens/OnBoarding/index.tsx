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

// TODO: Replace with real API data
const DUMMY_VENUE = {
    id: 'venue-001',
    name: 'Greenfield Sports Complex',
    status: 'draft',
    description: 'A premier multi-sport facility in the heart of the city.',
    address: '123 Court Lane, Melbourne VIC 3000',
    phone: '+61 3 9999 0000',
    email: 'info@greenfieldsports.com.au',
    website: 'https://greenfieldsports.com.au',
    logo_url: null,
    cover_url: null,
};

const DUMMY_PROGRESS = {
    venue_id: 'venue-001',
    current_step: 2,
};

const OnBoarding = () => {
    const { venueId, step } = useParams<{ venueId: string; step: string }>();
    const navigate = useNavigate();
    const currentStep = parseInt(step || '1');

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [triggerSave, setTriggerSave] = useState(false);
    const [triggerExit, setTriggerExit] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);

    const venue = DUMMY_VENUE;
    const progress = DUMMY_PROGRESS;

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
            navigate(`/onboarding/${venueId}/step/${currentStep + 1}`);
        }
    };

    const handleSaveAndExit = () => setTriggerExit(true);

    const handleExitComplete = () => {
        setTriggerExit(false);
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
            venue={venue}
            progress={progress}
            currentStep={currentStep}
            saving={saving}
            saved={saved}
            onSaveAndContinue={handleSaveAndContinue}
            onSaveAndExit={handleSaveAndExit}
            isContinuing={isContinuing}
        >
            {renderStep()}
        </OnBoardingLayout>
    );
};

export default OnBoarding;
