import { useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import Step1Name from "./Step1Name";
import Step2Location from "./Step2Location";
import Step3Feature from "./Step3Feature";
import Step4Description from "./Step4Description";
import Step5Photos from "./Step5Photos";
import Step6Publication from "./Step6Publication";
import WizardProgress from "./WizardProgress";

const EstablishmentWizard = () => {
    const { step } = useParams();
    const navigate = useNavigate();
    const { name, setStep, setName, clearAllPhotos } = useEstWizard();
    
    const stepNumber = parseInt(step);

    useEffect(() => {
        if (setStep) { setStep(stepNumber); }
    }, [stepNumber, setStep]);

    useEffect(() => {
        if (setName && !name) {
            setStep(1);
            clearAllPhotos();
            navigate("/add-establishment/step/1");
        }
    }, [setName, name, setStep, navigate]);

    const renderStep = () => {
        switch (stepNumber) {
            case 1: return <Step1Name />;
            case 2: return <Step2Location />;
            case 3: return <Step3Feature />;
            case 4: return <Step4Description />;
            case 5: return <Step5Photos />;
            case 6: return <Step6Publication />;
            default: return <Navigate to="/add-establishment/step/1" replace />;
        }
    };

    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 7) {
        return <Navigate to="/add-establishment/step/1" replace />;
    }

    return (
        <div style={{
            position: "relative",
            minHeight: "100vh",
            zIndex: 2,
            paddingBottom: 40,
            marginTop: -110
        }}>
            <div
                style={{
                    position: "relative",
                    overflow: "hidden",
                    paddingTop: 32,
                    paddingBottom: 20,
                    background:
                        "linear-gradient(180deg, rgba(3,173,179,0.18) 0%, rgba(214,231,238,1) 30%, rgba(214,231,238,0) 50%)",
                }}
            >
                <div className="container" style={{ width: 2200, marginTop: 130 }}>
                    <WizardProgress current={stepNumber} />
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default EstablishmentWizard;