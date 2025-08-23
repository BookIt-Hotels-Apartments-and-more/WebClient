import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { ESTABLISHMENT_FEATURE_LABELS } from "../../utils/enums";

export default function Step3Feature() {
  const navigate = useNavigate();

  const { features, setFeatures, setStep } = useEstWizard();

  // Масив опцій з бітовими значеннями
  const FEATURE_OPTIONS = Object.entries(ESTABLISHMENT_FEATURE_LABELS).map(
    ([label, idx]) => ({
      label,
      value: 1 << idx,
    })
  );

  const onBack = () => {
    setStep(2);
    navigate("/add-establishment/step-2");
  };

  const onNext = () => {
    setStep(4);
    navigate("/add-establishment/step-4");
  };

  function WizardProgress({ current, labels }) {
    const pct = Math.round((current / labels.length) * 100);
    return (
      <div className="mb-4" style={{ marginTop: 100 }}>
        <div className="d-flex justify-content-between mb-2">
          {labels.map((l, i) => (
            <div
              key={l}
              className="text-muted"
              style={{
                fontSize: 13,
                width: `${100 / labels.length}%`,
                textAlign:
                  i === 0 ? "left" : i === labels.length - 1 ? "right" : "center",
              }}
            >
              {l}
            </div>
          ))}
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin="0"
          aria-valuemax="100"
          style={{ height: 8 }}
        >
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  const toggle = (bit, checked) => {
    setFeatures(prev => checked ? (prev | bit) : (prev & ~bit));
    };


  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        zIndex: 2,
        paddingBottom: 40,
        marginTop: -110,
      }}
    >
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
          {/* Той самий прогрес, що й на Step1/Step2 */}
          <WizardProgress
            current={4}
            labels={["Name property", "Location", "Details", "Features", "Publication"]}
          />

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
              What amenities does your property have?
            </h3>

            {/* Чекбокси зручностей */}
            <div className="row">
              <div className="col-12 col-md-8">
                <div className="d-flex flex-wrap gap-3">
                  {FEATURE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="d-flex align-items-center"
                      style={{ minWidth: 220 }}
                    >
                      <input
                        type="checkbox"
                        checked={(features & opt.value) !== 0}
                        onChange={(e) => toggle(opt.value, e.target.checked)}
                      />
                      <span className="ms-2">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Підказки праворуч */}
              <div className="col-12 col-md-4 mt-4 mt-md-0">
                <div
                  className="card"
                  style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}
                >
                  <div className="card-body">
                    <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                      Tips
                    </div>
                    <div className="small text-muted">
                      Choose only those options that are actually available in your facility.
                      This will help avoid negative reviews and increase booking conversion.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="d-flex justify-flex-start mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={onBack}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginLeft: 10, minWidth: 500 }}
                onClick={onNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
