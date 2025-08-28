// src/pages/establishment/Step6Publication.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { createEstablishment } from "../../api/establishmentsApi";
import { ESTABLISHMENT_TYPE_LABELS, ESTABLISHMENT_FEATURE_LABELS } from "../../utils/enums";
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
              textAlign: i === 0 ? "left" : i === labels.length - 1 ? "right" : "center",
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


export default function Step6Publication() {
  const navigate = useNavigate();
  const {
    setStep,
    propertyType,
    name,
    setName,
    geolocation,
    features,
    description,
    checkIn,
    checkOut,
    photoFiles,
    photoPreviews,
    ownerId,
    reset,
  } = useEstWizard();

  const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (setName && !name) {
            setStep(1);
            navigate("/add-establishment/step-1");
        }
    }, [setName, name, setStep, navigate]);

  const typeName = useMemo(() => {
    const entry = Object.entries(ESTABLISHMENT_TYPE_LABELS).find(([, v]) => v === propertyType);
    return entry ? entry[0] : "—";
  }, [propertyType]);

  const featureList = useMemo(() => {
    const list = [];
    for (const [key, bitIndex] of Object.entries(ESTABLISHMENT_FEATURE_LABELS)) {
      const bit = 1 << bitIndex;
      if ((features & bit) !== 0) list.push(key);
    }
    return list;
  }, [features]);

  const hhmm = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

  const onBack = () => {
    setStep(5);
    navigate("/add-establishment/step-5");
  };

  const validate = () => {
    if (!Number.isInteger(propertyType)) return "Select property type on Step 1.";
    if (!name || name.trim().length < 2) return "Enter property name on Step 1.";
    if (!Array.isArray(geolocation) || geolocation.length !== 2) return "Pick location on Step 2.";
    if (!description || description.trim().length < 10) return "Add a description on Step 4 (min 10 chars).";
    if (!Array.isArray(photoFiles) || photoFiles.length < 1) return "Upload at least 1 photo on Step 5.";
    return null;
  };

  const filesToBase64 = (files) =>
    Promise.all(
      (files || []).map(file => 
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      )
    );

  const onSubmit = async (redirectTo) => {
    const err = validate();
    if (err) { toast.error(err); return; }
    try {
      setSubmitting(true);    

      const newPhotosBase64 = await filesToBase64(photoFiles);
      const payload = {
        name,
        description,
        type: propertyType,
        features,
        checkInTime: hhmm(checkIn?.hour ?? 15, checkIn?.minute ?? 0),
        checkOutTime: hhmm(checkOut?.hour ?? 11, checkOut?.minute ?? 0),
        latitude: geolocation[0],
        longitude: geolocation[1],
        ownerId,
        existingPhotosIds: [],
        newPhotosBase64
      };
      const res = await createEstablishment(payload);
      const id = res?.id;

      if (redirectTo === "add-apartments" && id) {
        reset();
        navigate(`/add-establishment/step-7/${id}`);
      } else {
        reset();
        navigate("/accounthome");
      }

    } catch(e) {
      console.error(e);
      toast.error("Failed to register property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", zIndex: 2, paddingBottom: 40, marginTop: -110 }}>
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
            current={6}
            labels={["Name property", "Location", "Features", "Description", "Photos", "Publication"]}
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
            <div className="row g-4">
              {/* Ліва колонка — зведення */}
              <div className="col-12 col-md-7">
                <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                  Review & publish
                </h3>

                <div className="mb-3">
                  <div className="fw-semibold">Type</div>
                  <div className="text-muted">{typeName}</div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold">Name</div>
                  <div className="text-muted">{name || "—"}</div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold">Location</div>
                  <div className="text-muted">
                    {Array.isArray(geolocation) ? `Lat: ${geolocation[0].toFixed(5)}, Lng: ${geolocation[1].toFixed(5)}` : "—"}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold">Features</div>
                  <div className="text-muted">{featureList.length ? featureList.join(", ") : "—"}</div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold">Description</div>
                  <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
                    {description || "—"}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold">Check-in / Check-out</div>
                  <div className="text-muted">
                    {hhmm(checkIn?.hour ?? 15, checkIn?.minute ?? 0)} — {hhmm(checkOut?.hour ?? 11, checkOut?.minute ?? 0)}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold">Photos</div>
                  {Array.isArray(photoPreviews) && photoPreviews.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {photoPreviews.map((src, i) => (
                        <img key={i} src={src} alt={`photo-${i}`}
                              style={{ width:96, height:96, objectFit:"cover", borderRadius:8, border:"1px solid #e6eef4" }}/>
                      ))}
                    </div>
                  ) : (<div className="text-muted">—</div>)}
                </div>
              </div>

              {/* Права колонка — підказка */}
              <div className="col-12 col-md-5">
                <div className="card" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                  <div className="card-body">
                    <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                      Before publishing
                    </div>
                    <ul className="mb-0 small" style={{ color: "#22614D" }}>
                      <li>Check the correctness of the name, type of establishment and address (location).</li>
                      <li>Make sure the check-in/check-out times are correct.</li>
                      <li>Add enough photos — this increases conversion.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="d-flex justify-flex-start mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={onBack} disabled={submitting}>
                ← Back
              </button>
              <button type="button" className="btn btn-primary" style={{ marginLeft: 10, minWidth: 400 }} 
                onClick={() => onSubmit("add-apartments")} disabled={submitting}>
                {submitting ? "Publishing..." : "Publish and proceed to adding apartments"}
              </button>
              <button type="button" className="btn btn-primary" style={{ marginLeft: 10, minWidth: 400 }} 
                onClick={() => onSubmit("accounthome")} disabled={submitting}>
                {submitting ? "Publishing..." : "Publish and go to personal page"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
