import { useNavigate } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

function WizardProgress({ current, labels }) {
  const pct = Math.round((current / labels.length) * 100);
  return (
    <div className="mb-4" style={{ marginTop: 100 }}>
      <div className="d-flex justify-content-between mb-2">
        {labels.map((l, i) => (
          <div key={l} className="text-muted"
               style={{ fontSize: 13, width: `${100/labels.length}%`,
                        textAlign: i===0 ? "left" : i===labels.length-1 ? "right" : "center" }}>
            {l}
          </div>
        ))}
      </div>
      <div className="progress" style={{ height: 8 }}>
        <div className="progress-bar" style={{ width: `${pct}%` }}/>
      </div>
    </div>
  );
}

export default function Step5Photos() {
  const navigate = useNavigate();
  const {
    photoFiles = [],
    setPhotoFiles,
    photoPreviews = [],
    setPhotoPreviews,
    setStep,
  } = useEstWizard();

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setPhotoFiles(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...urls]);

    try {
      const meta = files.map(f => ({ name: f.name, size: f.size, type: f.type }));
      localStorage.setItem("estWizard_photos_meta", JSON.stringify(meta));
    } catch {}
  }, [setPhotoFiles, setPhotoPreviews]);

  const onInputChange = (e) => handleFiles(e.target.files);

  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e) => e.preventDefault();

  const removeAt = (idx) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => {
      const toRevoke = prev[idx];
      if (toRevoke) URL.revokeObjectURL(toRevoke);
      return prev.filter((_, i) => i !== idx);
    });
  };

  useEffect(() => {
    return () => {
      (photoPreviews || []).forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
    };
  }, [photoPreviews]);


  const onBack = () => { setStep(4); navigate("/add-establishment/step-4"); };

  const onNext = () => {
    if ((photoFiles?.length ?? 0) < 5) {
      toast.error("Upload at least 5 photos.");
      return;
    }
    setStep(6);
    navigate("/add-establishment/step-6");
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
            current={5}
            labels={["Name property","Location","Features","Description","Photos","Publication"]}
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
                <h3 className="mb-3" style={{ color: "#FA7E1E" }}>
                  How does your property look?
                </h3>
              {/* Ліва колОНКА — завантаження */}
              <div className="col-12 col-md-7">     

                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="d-flex flex-column align-items-center justify-content-center mb-3"
                  style={{
                    border: "2px dashed #cfe3ef",
                    borderRadius: 12,
                    minHeight: 220,
                    padding: 20,
                    background: "#f8fbfd",
                  }}
                >
                  <div className="mb-2">Drag the photo here or</div>
                  <label className="btn btn-outline-primary">
                    Upload photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={onInputChange}
                    />
                  </label>
                  <div className="text-muted small mt-2">
                    Acceptable formats: jpg, jpeg, png. Each file size is up to 4–7 MB.
                  </div>
                </div>

                {/* Прев'ю */}
                {(photoPreviews?.length ?? 0) > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {photoPreviews.map((src, idx) => (
                      <div key={idx} className="position-relative" style={{ width: 110, height: 110 }}>
                        <img src={src} alt={`photo-${idx}`} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:8, border:"1px solid #e6eef4" }} />
                        <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" onClick={() => removeAt(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ПРАВА КОЛОНКА — підказки */}
              <div className="col-12 col-md-5">
                <div className="card mb-3" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                  <div className="card-body">
                    <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                      What if I don't have professional photos?
                    </div>
                    <div className="small text-muted">
                      Take a few bright photos on your phone. Shoot in daylight, without people, from different angles.
                    </div>
                  </div>
                </div>
                <div className="card" style={{ borderRadius: 12, border: "1px solid #E6EEF4" }}>
                  <div className="card-body">
                    <div className="fw-bold mb-2" style={{ color: "#002B5B" }}>
                      Tips
                    </div>
                    <ul className="mb-0 small" style={{ color: "#22614D" }}>
                      <li>At least 5 photos</li>
                      <li>One photo per room + facade</li>
                      <li>Vertical and horizontal frames</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* КНОПКИ */}
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
