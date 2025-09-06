import {createContext, useContext, useMemo, useState, useEffect} from "react";

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
  
  const [photoData, setPhotoData] = useState([]);  // Array of {id, name, size, type, base64, preview}
  
  const [ownerId, setOwnerId] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null")?.id ?? null; } catch { return null; }
  });

  const addPhotos = (files) => {
    return Promise.all(
      files.map(file => 
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const photoItem = {
              id,
              name: file.name,
              size: file.size,
              type: file.type,
              base64: reader.result,
              preview: URL.createObjectURL(file),
              timestamp: Date.now()
            };
            resolve(photoItem);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      )
    ).then(newPhotos => {
      setPhotoData(prev => [...prev, ...newPhotos]);
      savePhotosToStorage([...photoData, ...newPhotos]);
      return newPhotos;
    });
  };

  const removePhoto = (photoId) => {
    setPhotoData(prev => {
      const photoToRemove = prev.find(p => p.id === photoId);
      if (photoToRemove?.preview) {
        try {
          URL.revokeObjectURL(photoToRemove.preview);
        } catch (e) {
          console.warn("Could not revoke URL:", e);
        }
      }
      const updated = prev.filter(p => p.id !== photoId);
      savePhotosToStorage(updated);
      return updated;
    });
  };

  const clearAllPhotos = () => {
    photoData.forEach(photo => {
      if (photo.preview) {
        try {
          URL.revokeObjectURL(photo.preview);
        } catch (e) {
          console.warn("Could not revoke URL:", e);
        }
      }
    });
    setPhotoData([]);
    sessionStorage.removeItem("estWizard_photos");
  };

  const savePhotosToStorage = (photos) => {
    try {
      const photosForStorage = photos.map(({ preview, ...photo }) => photo);
      sessionStorage.setItem("estWizard_photos", JSON.stringify(photosForStorage));
    } catch (error) {
      console.warn("Could not save photos to sessionStorage:", error);
      try {
        sessionStorage.removeItem("estWizard_photos");
        const photosForStorage = photos.map(({ preview, ...photo }) => photo);
        sessionStorage.setItem("estWizard_photos", JSON.stringify(photosForStorage));
      } catch (retryError) {
        console.error("Could not save photos even after clearing:", retryError);
      }
    }
  };

  const loadPhotosFromStorage = () => {
    try {
      const saved = sessionStorage.getItem("estWizard_photos");
      if (saved) {
        const photosData = JSON.parse(saved);
        const photosWithPreviews = photosData.map(photo => {
          try {
            const blob = dataURLToBlob(photo.base64);
            const preview = URL.createObjectURL(blob);
            return { ...photo, preview };
          } catch (e) {
            console.warn("Could not recreate preview for photo:", photo.name);
            return photo;
          }
        });
        setPhotoData(photosWithPreviews);
      }
    } catch (error) {
      console.warn("Could not load photos from sessionStorage:", error);
    }
  };

  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

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
        setDescription(data.description ?? "");
        setCheckIn(data.checkIn ?? { hour: 15, minute: 0 });
        setCheckOut(data.checkOut ?? { hour: 11, minute: 0 });
      } catch (error) {
        console.warn("Could not restore wizard data:", error);
      }
    }
    
    loadPhotosFromStorage();
  }, []);
  
  useEffect(() => {
    const toSave = { step, propertyType, name, geolocation, features, description, checkIn, checkOut, ownerId };
    try {
      sessionStorage.setItem("estWizard", JSON.stringify(toSave));
    } catch (error) {
      console.warn("Could not save wizard data:", error);
    }
  }, [step, propertyType, name, geolocation, features, description, checkIn, checkOut, ownerId]);

  useEffect(() => {
    return () => {
      photoData.forEach(photo => {
        if (photo.preview) {
          try {
            URL.revokeObjectURL(photo.preview);
          } catch (e) {
            console.warn("Could not revoke URL on cleanup:", e);
          }
        }
      });
    };
  }, []);

  const photoFiles = useMemo(() => {
    return photoData.map(photo => {
      try {
        const blob = dataURLToBlob(photo.base64);
        const file = new File([blob], photo.name, { type: photo.type });
        return file;
      } catch (e) {
        console.warn("Could not convert photo to file:", photo.name);
        return null;
      }
    }).filter(Boolean);
  }, [photoData]);

  const photoPreviews = useMemo(() => {
    return photoData.map(photo => photo.preview).filter(Boolean);
  }, [photoData]);

  const value = useMemo(() => ({
    step, setStep,
    propertyType, setPropertyType,
    name, setName,
    geolocation, setGeolocation,
    features, setFeatures,
    description, setDescription,
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    
    photoData,
    addPhotos,
    removePhoto,
    clearAllPhotos,
    
    photoFiles,
    photoPreviews,
    setPhotoFiles: (files) => {
      if (Array.isArray(files)) {
        addPhotos(files);
      }
    },
    setPhotoPreviews: () => {
      console.warn("setPhotoPreviews is deprecated. Use addPhotos/removePhoto instead.");
    },
    
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
      clearAllPhotos();
      sessionStorage.removeItem("estWizard");
      sessionStorage.removeItem("estWizard_photos");
    }
  }), [step, propertyType, name, geolocation, features, description, checkIn, checkOut, photoData, photoFiles, photoPreviews, ownerId]);

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useEstWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useEstWizard must be used inside <WizardProvider>");
  return ctx;
}