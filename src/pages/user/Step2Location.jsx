import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import GeoPicker from "../../components/GeoPicker";
import { toast } from "react-toastify";

export default function Step2Location() {
  const navigate = useNavigate();
  const { setStep, geolocation, setGeolocation, name, setName } = useEstWizard();

  const canNext = Array.isArray(geolocation) && geolocation.length === 2;

  const next = () => {
    if (!canNext) {
        toast.error("Please select a geolocation on the map!");
        return;
    }
    setStep(3);
    navigate("/add-establishment/step-3");
    };

    useEffect(() => {
        if (setName && !name) {
            setStep(1);
            navigate("/add-establishment/step-1");
        }
    }, [setName, name, setStep, navigate]);

  const back = () => {
    setStep(1);
    navigate("/add-establishment/step-1");
  };

  function WizardProgress({ current, labels }) {
        // current: 2..labels.length
        const pct = Math.round((current / labels.length) * 100);
        return (
            <div className="mb-4" style={{marginTop: 100}}>
            <div className="d-flex justify-content-between mb-2">
                {labels.map((l, i) => (
                <div key={l} className="text-muted" style={{fontSize: 13, width: `${100/labels.length}%`, textAlign: i===0 ? "left" : i===labels.length-1 ? "right" : "center"}}>
                    {l}
                </div>
                ))}
            </div>
            <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" style={{height: 8}}>
                <div className="progress-bar" style={{width: `${pct}%`}}/>
            </div>
            </div>
        );
    }

  return (
    <div style={{ position: "relative", minHeight: "100vh",  zIndex: 2, paddingBottom: 40, marginTop: -110}}>
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
                    <WizardProgress current={2} labels={["Name property","Location","Details","Photo","Publication"]} />
                     
                     <div
                        style={{
                        background: "rgba(255,255,255,0.95)",
                        borderRadius: 16,
                        padding: 24,
                        width: "100%",
                        maxWidth: 1100,
                        boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
                        }}
                    >
                        <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                        Where is your property located?
                        </h3>

                        {/* Карта з вибором геолокації */}
                        <GeoPicker value={geolocation || [50.45, 30.52]} onChange={setGeolocation} />
                        <div className="small text-muted mt-2">
                        {Array.isArray(geolocation) ? `Lat: ${geolocation[0].toFixed(5)}, Lng: ${geolocation[1].toFixed(5)}` : "Pick a location on the map"}
                        </div>

                        {/* Кнопки */}
                        <div className="d-flex justify-flex-start mt-4">
                            <button className="btn btn-outline-secondary" onClick={back}>← Back</button>
                            <button className="btn btn-primary" style={{ marginLeft: 10, minWidth: 500 }} onClick={next} disabled={!canNext}>Next</button>
                        </div>
                    </div>
                </div>
        </div>
    </div>
  );
}
