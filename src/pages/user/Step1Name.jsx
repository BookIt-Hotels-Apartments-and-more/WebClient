import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { ESTABLISHMENT_TYPE_LABELS } from "../../utils/enums";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function Step1Name() {
    const navigate = useNavigate();
    const { name, setName, setStep, propertyType, setPropertyType  } = useEstWizard();

    useEffect(() => {
      if (setName && !name) {
        setStep(1);
        navigate("/add-establishment/step-1");
      }
    }, [setName, name, setStep]);

    const onNext = () => {
        if (!Number.isInteger(propertyType)) {
        toast.error("Select property type");
        return;
        }
        if (name.trim().length < 2) {
        toast.error("Enter property name (min 2 chars)");
        return;
    }
        setStep(2);
        navigate("/add-establishment/step-2");
    };

    const onBack = () => {
        navigate(-1);
    };

    const TYPE_OPTIONS = Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([key, value]) => ({
        value,
        label: key,
        }));

    function WizardProgress({ current, labels }) {
        // current: 1..labels.length
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
                    <WizardProgress current={1} labels={["Name property","Location","Details","Photo","Publication"]} /> 
                    <div
                      style={{
                        background: "rgba(255,255,255,0.95)",
                        borderRadius: 16,
                        padding: 24,
                        width: "100%",
                        maxWidth: 1100,
                        boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
                        marginTop: 100,
                      }}
                    >
                      <div className="row g-4">
                        <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                            How is your property called?
                          </h3>
                        {/* ЛІВА КОЛОНКА */}
                        <div className="col-12 col-md-7">
                          

                          <select
                            className="form-select mb-3"
                            value={Number.isInteger(propertyType) ? String(propertyType) : ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPropertyType(v === "" ? null : Number(v));
                            }}
                          >
                            <option value="" disabled>
                              Select property type
                            </option>
                            {TYPE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>

                          <input
                            className="form-control"
                            placeholder="Enter property name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                          <div className="text-muted mt-2" style={{ fontSize: 13 }}>
                            Come up with a short and understandable name - it's easier for guests to remember.
                          </div>
                        </div>

                        {/* ПРАВА КОЛОНКА */}
                        <div className="col-12 col-md-5">
                          <div className="card mb-3" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                            <div className="card-body">
                              <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                What should be considered when choosing a name?
                              </div>
                              <ul className="mb-0 small" style={{ color: "#22614D" }}>
                                <li>A short, easy-to-remember name</li>
                                <li>Avoid abbreviations</li>
                                <li>Be objective.</li>
                              </ul>
                            </div>
                          </div>

                          <div className="card" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                            <div className="card-body">
                              <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                                Why the name at all?
                              </div>
                              <div className="small text-muted">
                                It appears in headlines and helps guests understand what you offer.
                                Do not include the address in the title.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* КНОПКИ */}
                      <div className="d-flex justify-flex-start mt-4">
                        <button className="btn btn-outline-secondary" onClick={onBack}>
                          ← Back
                        </button>
                        <button className="btn btn-primary" style={{ marginLeft: 10, minWidth: 500 }} onClick={onNext}>
                          Next
                        </button>
                      </div>
                    </div>

                </div>                         
        </div>      
    </div>
    
  );
}
