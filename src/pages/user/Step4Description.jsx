// src/pages/establishment/Step4Description.jsx
import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
                i === 0
                  ? "left"
                  : i === labels.length - 1
                  ? "right"
                  : "center",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div className="progress" style={{ height: 8 }}>
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Step4Description() {
  const navigate = useNavigate();
  const {
    setStep,
    description,
    setDescription,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    name,
    setName,
  } = useEstWizard();

  // локальні стейти
  const [checkInHour, setCheckInHour] = useState(checkIn?.hour ?? 15);
  const [checkInMinute, setCheckInMinute] = useState(checkIn?.minute ?? 0);
  const [checkOutHour, setCheckOutHour] = useState(checkOut?.hour ?? 11);
  const [checkOutMinute, setCheckOutMinute] = useState(checkOut?.minute ?? 0);

  useEffect(() => {
    if (!checkIn)  setCheckIn({ hour: 15, minute: 0 });
    if (!checkOut) setCheckOut({ hour: 11, minute: 0 });
    setCheckIn({ hour: checkInHour, minute: checkInMinute });
    setCheckOut({ hour: checkOutHour, minute: checkOutMinute });
  }, [checkInHour, checkInMinute, checkOutHour, checkOutMinute]);

    useEffect(() => {
        if (setName && !name) {
            setStep(1);
            navigate("/add-establishment/step-1");
        }
    }, [setName, name, setStep, navigate]);

  const onBack = () => {
    setStep(3);
    navigate("/add-establishment/step-3");
  };

  const onNext = () => {
    if (!description || description.trim().length < 10) {
      toast.error("Please provide a description (min 10 characters).");
      return;
    }
    setStep(5);
    navigate("/add-establishment/step-5");
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
          <WizardProgress
            current={4}
            labels={[
              "Name property",
              "Location",
              "Features",
              "Description",
              "Publication",
            ]}
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
            <h3 className="mb-4" style={{ color: "#FA7E1E" }}>
              Hotel description & rules
            </h3>

            {/* Опис */}
            <div className="mb-3">
              <label className="form-label">Hotel description</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Describe your property..."
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Час заїзду */}
            <div className="mb-3">
              <label className="form-label">Check-in time</label>
              <div className="d-flex gap-2" style={{ maxWidth: 260 }}>
                <select
                  className="form-select"
                  value={checkInHour}
                  onChange={(e) => setCheckInHour(Number(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select"
                  value={checkInMinute}
                  onChange={(e) => setCheckInMinute(Number(e.target.value))}
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Час виїзду */}
            <div className="mb-3">
              <label className="form-label">Check-out time</label>
              <div className="d-flex gap-2" style={{ maxWidth: 260 }}>
                <select
                  className="form-select"
                  value={checkOutHour}
                  onChange={(e) => setCheckOutHour(Number(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select"
                  value={checkOutMinute}
                  onChange={(e) => setCheckOutMinute(Number(e.target.value))}
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Кнопки */}
            <div className="d-flex justify-flex-start mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onBack}
              >
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
