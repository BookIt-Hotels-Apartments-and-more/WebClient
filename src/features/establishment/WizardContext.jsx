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
  const [photos, setPhotos] = useState([]);


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
        setCheckIn(data.setCheckIn ?? {hour: 15, minute: 0});
        setCheckOut(data.setCheckOut ?? {hour: 11, minute: 0});
        setPhotos(data.photos ?? []);
      } catch {}
    }
  }, []);
  
  useEffect(() => {
    sessionStorage.setItem(
      "estWizard",
      JSON.stringify({ step, propertyType, name, geolocation, features, description, checkIn, checkOut, photos  })
    );
  }, [step, propertyType, name, geolocation, features, description, checkIn, checkOut, photos]);

  const value = useMemo(() => ({
    step, setStep,
    propertyType, setPropertyType,
    name, setName,
    geolocation, setGeolocation,
    features, setFeatures,
    description, setDescription,
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    photos, setPhotos,
    reset: () => { setStep(1); setPropertyType(null); setName(""); 
      setGeolocation(null); setFeatures(0); setDescription(""), 
      setCheckIn(null), setCheckOut(null), setPhotos([]) }
  }), [step, propertyType, name, geolocation, features, description, checkIn, checkOut, photos]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useEstWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useEstWizard must be used inside <WizardProvider>");
  return ctx;
}
