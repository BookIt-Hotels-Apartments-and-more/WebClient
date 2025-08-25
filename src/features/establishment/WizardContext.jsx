import React, {createContext, useContext, useMemo, useState, useEffect} from "react";

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState(null);
  const [name, setName] = useState("");
  const [geolocation, setGeolocation] = useState(null);
  const [features, setFeatures] = useState(0);
  const [description, setDescription] = useState("");
  const [checkIn, setCheckIn] = useState({ hour: 15, minute: 0 });
  const [checkOut, setCheckOut] = useState({ hour: 11, minute: 0 });
  const [photoFiles, setPhotoFiles] = useState([]);         // File[]
  const [photoPreviews, setPhotoPreviews] = useState([]);   // string[] (ObjectURL)
  const [ownerId, setOwnerId] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null")?.id ?? null; } catch { return null; }
  });


  // опційна стійкість між перезавантаженнями
  useEffect(() => {
    const saved = sessionStorage.getItem("estWizard");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStep(data.step ?? 1);
        setPropertyType(data.propertyType ?? null);
        setName(data.name ?? "");
        setGeolocation(data.geolocation ?? null);
        setFeatures(data.features ?? 0);
        setDescription(data.description?? "");
        setCheckIn(data.checkIn ?? { hour: 15, minute: 0 });
        setCheckOut(data.checkOut ?? { hour: 11, minute: 0 });
      } catch {}
    }
  }, []);
  
  useEffect(() => {
    const toSave = { step, propertyType, name, geolocation, features, description, checkIn, checkOut, ownerId };
      sessionStorage.setItem("estWizard", JSON.stringify(toSave));
    }, [step, propertyType, name, geolocation, features, description, checkIn, checkOut, ownerId]);

  const value = useMemo(() => ({
    step, setStep,
    propertyType, setPropertyType,
    name, setName,
    geolocation, setGeolocation,
    features, setFeatures,
    description, setDescription,
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    photoFiles, setPhotoFiles,
    photoPreviews, setPhotoPreviews,
    ownerId, setOwnerId,
    reset: () => {
      setStep(1);
      setPropertyType(null);
      setName("");
      setGeolocation(null);
      setFeatures(0);
      setDescription("");
      setCheckIn({ hour: 15, minute: 0 });
      setCheckOut({ hour: 11, minute: 0 });
      setPhotoFiles([]);
      setPhotoPreviews([]);
    }
  }), [step, propertyType, name, geolocation, features, description, checkIn, checkOut, photoFiles, photoPreviews, ownerId]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useEstWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useEstWizard must be used inside <WizardProvider>");
  return ctx;
}
