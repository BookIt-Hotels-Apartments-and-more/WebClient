import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store/slices/userSlice";
import { useLocation, useNavigate  } from "react-router-dom";
import { toast } from "react-toastify";
import { createBooking, checkApartmentAvailability, updateBooking } from "../api/bookingApi";
import { getApartmentById } from "../api/apartmentApi";
import { updateUserDetails } from "../api/userApi";
import { createUniversalPayment } from "../api/paymentApi";

import {
  decodeFlagsUser,
  ESTABLISHMENT_FEATURE_LABELS,
  getEstablishmentTypeName,
} from "../utils/enums";

const fmt1 = v => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(1) : "—");

export default function Booking() {
  const dispatch = useDispatch();
  const user = useSelector(s => s.user.user);
  const { search } = useLocation();
  const navigate = useNavigate();
  const focusBookingId = new URLSearchParams(search).get("focus");

  const [booking, setBooking] = useState(null);
  const [apartmentMap, setApartmentMap] = useState({});
  const [isPreview, setIsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const KNOWN_CODES = ["+380", "+49", "+48", "+1"];

  const splitPhone = (raw) => {
    const def = { phoneCode: "+380", phoneNumber: "" };
    if (!raw) return def;
    let s = String(raw).replace(/[^\d+]/g, "");
    if (!s) return def;
    if (!s.startsWith("+")) s = "+" + s;
    for (const code of KNOWN_CODES) {
        if (s.startsWith(code)) {
        return { phoneCode: code, phoneNumber: s.slice(code.length) };
        }
    }
    return { ...def, phoneNumber: s.replace(/^\+/, "") };
    };

  const [details, setDetails] = useState(() => {
    const full = (user?.username || "").trim();
    const first = full.split(" ")[0] || "";
    const last  = full.split(" ").slice(1).join(" ") || "";
    const { phoneCode, phoneNumber } = splitPhone(user?.phoneNumber || user?.phonenumber || "");
    return {
      firstName: first,
      lastName: last,
      email: user?.email || "",
      phoneCode,
      phoneNumber,
      sendEmail: true,
      saveToAccount: false,
      specialRequests: "",
    };
  });
  // блок “Add to your booking”
  const [extras, setExtras] = useState({
    airfare: false,
    carHire: false,
    airportTaxi: false,
  });

  // edit booking modal
  const [editModal, setEditModal] = useState({ show: false, booking: null, dateFrom: "", dateTo: "" });
  const [paymentType, setPaymentType] = useState("Cash");
  const rowRefs = useRef({});  

  useEffect(() => {
    const pend = JSON.parse(localStorage.getItem("pendingBooking") || "null");
    if (!pend) return;

    if (apartmentMap[pend.apartmentId]) {
        setBooking(prev => prev ?? {
        id: null,
        dateFrom: pend.dateFrom,
        dateTo: pend.dateTo,
        apartmentId: pend.apartmentId,
        apartment: apartmentMap[pend.apartmentId],
        currency: "$",
        adults: 2,
        });
        setIsPreview(true);
        return;
    }
    (async () => {
        try {
          const apt = await getApartmentById(pend.apartmentId);
          setApartmentMap(m => ({ ...m, [pend.apartmentId]: apt }));
          setBooking({
            id: null,
            dateFrom: pend.dateFrom,
            dateTo: pend.dateTo,
            apartmentId: pend.apartmentId,
            apartment: apt,
            currency: "$",
            adults: 2
          });
          setIsPreview(true);
        } catch (e) {
          console.error(e);
          toast.error("Failed to load preview apartment.");
        }
    })();
    }, [apartmentMap]);

  useEffect(() => {
   if (!focusBookingId) return;
   const el = rowRefs.current["selectedRow"];
   if (el) {
     el.scrollIntoView({ behavior: "smooth", block: "start" });
     el.style.outline = "2px solid #29b56f";
     setTimeout(() => (el.style.outline = "none"), 3000);
   }
 }, [focusBookingId, booking]);

  const formatDate = (s) => (s ? new Date(s).toLocaleDateString() : "");

  const getNights = (fromStr, toStr) => {
    if (!fromStr || !toStr) return 0;
    const from = new Date(fromStr), to = new Date(toStr);
    return Math.max(1, Math.ceil((to - from) / 86400000));
  };

  const computeAmount = (bOrPend) => {
    const apt = apartmentMap[bOrPend.apartmentId] || booking?.apartment;
    const price = apt?.price || 0;
    const n = getNights(bOrPend.dateFrom, bOrPend.dateTo);
    return price && n ? price * n : 0;
  };

  const openEditModal = (b) => setEditModal({
    show: true,
    booking: b,
    dateFrom: (b.dateFrom || "").slice(0,10),
    dateTo: (b.dateTo || "").slice(0,10),
  });  

  const closeEditModal = () => setEditModal({ show: false, booking: null, dateFrom: "", dateTo: "" });

  const handleEditBooking = async () => {
    const b = editModal.booking;
    if (!b) return;
    if (!b.id) {
        const checkIn  = b?.apartment?.establishment?.checkInTime  || "15:00:00";
        const checkOut = b?.apartment?.establishment?.checkOutTime || "11:00:00";
        const isoFrom = `${editModal.dateFrom}T${checkIn}`;
        const isoTo   = `${editModal.dateTo}T${checkOut}`;

        setBooking(prev => prev ? { ...prev, dateFrom: isoFrom, dateTo: isoTo } : prev);

        const pend = JSON.parse(localStorage.getItem("pendingBooking") || "{}");
        localStorage.setItem("pendingBooking", JSON.stringify({ ...pend, dateFrom: isoFrom, dateTo: isoTo }));
        toast.success("Dates updated.");
        closeEditModal();
        return;
    }
    try {
      await updateBooking(b.id, {
        dateFrom: `${editModal.dateFrom}T00:00:00`,
        dateTo: `${editModal.dateTo}T00:00:00`,
        customerId: user.id,
        apartmentId: b.apartmentId || b.apartment?.id,
        additionalRequests: b.additionalRequests || "",
        paymentType: b.paymentType ?? undefined
      });
      setBooking(prev => prev && prev.id === b.id ? { ...prev, dateFrom: editModal.dateFrom, dateTo: editModal.dateTo } : prev);
      toast.success("Booking updated!");
      closeEditModal();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update booking");
    }
  };    

  const handlePayAndFinalise = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (details.saveToAccount) {
        await updateUserDetails({
          username: `${details.firstName} ${details.lastName}`.trim(),
          email: details.email,
          phoneNumber: `${details.phoneCode}${details.phoneNumber}`.trim(),
          bio: ""
        });
      }
      const pend = JSON.parse(localStorage.getItem("pendingBooking") || "null");
      if (!pend) { toast.error("Nothing to finalise."); return; }
    
      await checkApartmentAvailability(pend.apartmentId, pend.dateFrom, pend.dateTo);

      const created = await createBooking({
        dateFrom: pend.dateFrom,
        dateTo: pend.dateTo,
        customerId: user.id,
        apartmentId: pend.apartmentId,
        paymentType
      });
      const bookingId = created?.id ?? created?.data?.id;
      if (bookingId) {
        const nextIds = [...(user.bookings || []), bookingId];
        dispatch(updateUser({ bookings: nextIds }));
      }
      const amount = computeAmount(pend);
        if (paymentType === "Mono") {
          const payRes = await createUniversalPayment({ type: 1, amount, bookingId });
          const url = payRes?.data?.invoiceUrl || payRes?.data?.url;
          if (url) window.open(url, "_blank");
          toast.success("Payment created! Complete it in the opened tab.");
        } else if (paymentType === "Cash") {
          await createUniversalPayment({ type: 0, amount, bookingId });
          toast.info("You have chosen to pay upon check-in at the hotel.");
        } else if (paymentType === "BankTransfer") {
          const payRes = await createUniversalPayment({ type: 2, amount, bookingId });
          const url = payRes?.data?.invoiceUrl || payRes?.data?.url;
          if (url) window.open(url, "_blank");
          toast.success("Bank transfer invoice created.");
        } else {
          toast.success("Booking created!");
        }
      localStorage.removeItem("pendingBooking");
      navigate("/");

      } catch (e) {
        console.error(e);
        const m = e?.response?.data?.message || e?.message;
        const details = e?.response?.data?.details;
        if (e?.response?.status === 409 && details?.Rule === "BOOKING_CONFLICT") {
          toast.error(
            `Ці дати вже зайняті: ${details.DateFrom.slice(0,10)}–${details.DateTo.slice(0,10)}. ` +
            `Конфлікт: ${details.ConflictingBookings?.join(", ")}`
          );
        } else {
          toast.error(m || "Failed to finalise booking");
        }
      } finally {
          setSubmitting(false);
        }
    };



  if (!user) return null;
  if (!booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">No booking to show yet.</div>
      </div>
    );
  }


  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(255,255,255,0.97) 0%,
            rgba(255,255,255,0.14) 40%,
            rgba(255,255,255,0) 80%
          ),
          url('/images/signin.png')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "60px 0 40px 0",
        marginTop: "-110px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "32px 36px",
          width: "100%",
          maxWidth: "98vw",
          boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
          marginTop: "60px",
        }}
      >
        {/* === LEFT: Enter your details + Add to your booking === */}
        <div className="row mt-2">
          <div className="col-12 col-md-6 mb-4">
            {/* Your details */}
            <div style={{ background:"#fcfcfc", borderRadius:18, padding:24, boxShadow:"1px 1px 3px 3px rgba(20,155,245,.2)" }}>
              <div style={{ fontWeight:800, fontSize:28, marginBottom:12 }}>Enter your details</div>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label" style={{color: "#22614D", fontSize:22}}>First name</label>
                  <input className="form-control" value={details.firstName}
                    onChange={e=>setDetails(s=>({...s, firstName:e.target.value}))}/>
                </div>
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label" style={{color: "#22614D", fontSize:22}}>Last name</label>
                  <input className="form-control" value={details.lastName}
                    onChange={e=>setDetails(s=>({...s, lastName:e.target.value}))}/>
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label" style={{color: "#22614D", fontSize:22}}>Email</label>
                  <input className="form-control" type="email" value={details.email}
                         onChange={e=>setDetails(s=>({...s, email:e.target.value}))}/>
                  <div className="text-muted" style={{fontSize:13}}>
                    A booking confirmation will be sent to this address
                  </div>
                </div>
              </div>

              {/* Telephone */}
              <div className="row">
                <div className="col-12 col-md-6 mb-2">
                  <label className="form-label" style={{color: "#22614D", fontSize:22}}>Telephone number</label>
                  <div className="row g-2">
                    <div className="col-5 col-sm-4" >
                      <select
                        className="form-select"
                        value={details.phoneCode}
                        style={{fontSize: 14}}
                        onChange={e=>setDetails(s=>({...s, phoneCode: e.target.value}))}
                      >
                        <option value="+380">+380</option>
                        <option value="+48">+48</option>
                        <option value="+49">+49</option>
                        <option value="+1">+1</option>
                      </select>
                    </div>
                    <div className="col-7 col-sm-8">
                      <input
                        className="form-control"
                        inputMode="numeric"
                        style={{fontSize: 14}}
                        value={details.phoneNumber}
                        onChange={e=>setDetails(s=>({...s, phoneNumber: e.target.value.replace(/[^0-9]/g, "")}))}
                      />
                    </div>
                  </div>
                  <div className="text-muted" style={{fontSize:13}}>
                    To confirm your level and be able to contact you if necessary
                  </div>
                </div>
              </div>
              <div className="form-check mt-2">
                <input className="form-check-input" type="checkbox" id="sendEmail"
                  checked={details.sendEmail}
                  onChange={e=>setDetails(s=>({...s, sendEmail:e.target.checked}))}/>
                <label className="form-check-label" htmlFor="sendEmail">
                  Yes, send me a free email confirmation (recommended)
                </label>
              </div>
              <div className="form-check mt-2">
                <input className="form-check-input" type="checkbox" id="saveToAccount"
                  checked={details.saveToAccount}
                  onChange={e=>setDetails(s=>({...s, saveToAccount:e.target.checked}))}/>
                <label className="form-check-label" htmlFor="saveToAccount">
                  Save new data to account
                </label>
              </div>
              <div className="mt-3">
                <label className="form-label" style={{color: "#22614D", fontSize:22}}>Tell us about your special requests</label>
                <textarea className="form-control" rows={4} placeholder="Please write your requests"
                  value={details.specialRequests}
                  onChange={e=>setDetails(s=>({...s, specialRequests:e.target.value}))}/>
              </div>
            </div>

            {/* Add to your booking */}
            <div
                className="mt-3"
                style={{
                    background: "#fcfcfc",
                    borderRadius: 18,
                    padding: 20,
                    boxShadow: "1px 1px 3px 3px rgba(20,155,245,.2)",
                    border: "2px solid #0f62fe33",
                }}
                >
                <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Add to your booking </div>

                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="form-check d-flex align-items-start gap-2 flex-grow-1 mb-0">
                    <input
                        className="form-check-input mt-1"
                        type="checkbox"
                        id="extraAirfare"
                        checked={extras.airfare}
                        onChange={(e) => setExtras((s) => ({ ...s, airfare: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="extraAirfare">
                        <div className="fw-semibold" style={{ color: "#22614D" }}>I need airfares for this trip</div>
                        <div className="text-muted" style={{ fontSize: 13 }}>
                        We’ll add ticket options to your confirmation.
                        </div>
                    </label>
                    </div>
                    <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
                    <img
                        src="/images/icon/air.png"
                        alt="Airfare"
                        style={{ width: 39, height: 29 }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="form-check d-flex align-items-start gap-2 flex-grow-1 mb-0">
                    <input
                        className="form-check-input mt-1"
                        type="checkbox"
                        id="extraCarHire"
                        checked={extras.carHire}
                        onChange={(e) => setExtras((s) => ({ ...s, carHire: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="extraCarHire">
                        <div className="fw-semibold" style={{ color: "#22614D" }}>
                        I want to save up to 10% on car hire
                        </div>
                        <div className="text-muted" style={{ fontSize: 13 }}>
                        We’ll add car hire offers to your confirmation.
                        </div>
                    </label>
                    </div>
                    <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
                    <img
                        src="/images/icon/car.png"
                        alt="Car hire"
                        style={{ width: 37, height: 25 }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-start">
                    <div className="form-check d-flex align-items-start gap-2 flex-grow-1 mb-0">
                    <input
                        className="form-check-input mt-1"
                        type="checkbox"
                        id="extraTaxi"
                        checked={extras.airportTaxi}
                        onChange={(e) => setExtras((s) => ({ ...s, airportTaxi: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="extraTaxi">
                        <div className="fw-semibold" style={{ color: "#22614D" }}>
                        I want to save 10% on airport taxis
                        </div>
                        <div className="text-muted" style={{ fontSize: 13 }}>
                        We’ll add taxi booking options to your confirmation.
                        </div>
                    </label>
                    </div>
                    <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
                    <img
                        src="/images/icon/taxi.png"
                        alt="Airport taxi"
                        style={{ width: 33, height: 21 }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    </div>
                </div>
                </div>
        
          </div>

          {/* === RIGHT: only the just-created booking === */}
        <div className="col-12 col-md-6">
        {(() => {
            const b = booking;
            const apt = b?.apartment || apartmentMap[b?.apartmentId];
            const hotel = apt?.establishment;

            // загальна сума 
            const totalRaw = computeAmount(b);         

            // коротка адреса 
            const fullAddr = hotel?.geolocation?.address || "";
            const shortAddr = fullAddr
            .split(",")
            .map(s => s.trim())
            .filter((_, i) => [0, 1, 3, 6].includes(i))
            .join(", ");

            // оцінка/відгуки
            const gen = apt?.rating?.generalRating;
            const reviews = hotel?.rating?.reviewCount ?? "-";
            const loc = hotel?.rating?.locationRating ?? gen;

            return (
            <div ref={el => (rowRefs.current["selectedRow"] = el)}>
                {/* Card 1: Hotel summary */}
                <div
                style={{
                    background: "#fcfcfc",
                    borderRadius: 18,
                    padding: 24,
                    boxShadow: "1px 1px 3px 3px rgba(20,155,245,.2)",
                    marginBottom: 18
                }}
                >
                <div className="d-flex justify-content-between align-items-center">
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#001B48" }}>
                    {hotel?.name || "Hotel"}
                    </div>
                    <div style={{ fontSize: 16, color: "#FE7C2C" }}>
                    <img
                        src="/images/reitingstar-orange.png"
                        alt="★"
                        style={{ width: 16, height: 16, marginRight: 4 }}
                    />
                    {fmt1(gen)}
                    </div>
                </div>

                <div className="text-muted" style={{ fontSize: 13 }}>
                    {getEstablishmentTypeName(hotel?.type)}
                </div>

                {/* Адреса з лінком на Google Maps */}
                <div className="mt-2">
                    <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        hotel?.geolocation?.address || ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: 14,
                        color: "#02457A",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                    }}
                    >
                    <img
                        src="/images/geoikon.png"
                        alt="Location"
                        style={{ width: 16, height: 16, objectFit: "contain" }}
                        onError={e => (e.currentTarget.style.display = "none")}
                    />
                    <span className="fw-bold" style={{ color: "#22614D" }}>
                        {shortAddr || hotel?.geolocation?.address || "—"}
                    </span>
                    </a>
                </div>

                {/* “Great location – X.X” + рейтинг з відгуками (як у UserPanel) */}
                <div className="mt-2" style={{ fontSize: 14, color: "#001B48" }}>
                    Great location - {fmt1(loc)}
                </div>
                <div className="mt-1" style={{ fontSize: 14 }}>
                    <span style={{ fontSize: 16, color: "#FE7C2C" }}>
                    <img
                        src="/images/reitingstar-orange.png"
                        alt="Star"
                        style={{ width: 16, height: 16, marginRight: 4, verticalAlign: "middle", objectFit: "contain" }}
                    />
                    {fmt1(gen)}
                    </span>
                    <span style={{ marginLeft: 6, marginRight: 6, color: "#001B48" }}>Rating excellent /</span>
                    <span style={{ color: "#737373" }}>{reviews} reviews</span>
                </div>

                {/* Зручності готелю */}
                <div className="d-flex flex-wrap gap-2 mt-2" style={{ fontSize: 12, color: "#001B48" }}>
                    {(() => {
                    let featureNames = [];
                    if (typeof hotel?.features === "number") {
                        featureNames = decodeFlagsUser(hotel.features, ESTABLISHMENT_FEATURE_LABELS);
                    } else if (hotel?.features && typeof hotel.features === "object") {
                        featureNames = Object.keys(ESTABLISHMENT_FEATURE_LABELS).filter(k =>
                        hotel.features[k.charAt(0).toLowerCase() + k.slice(1)]
                        );
                    }
                    return featureNames.map(name => (
                        <span key={name} className="d-inline-flex align-items-center">
                        <img
                            src={`/images/features/${name}.png`}
                            alt={name}
                            style={{ width: 18, height: 18, marginRight: 6 }}
                            onError={e => {
                            e.currentTarget.style.display = "none";
                            }}
                        />
                        {name.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                    ));
                    })()}
                </div>
                </div>

                {/* Card 2: Your booking details (дати) */}
                <div
                style={{
                    background: "#fcfcfc",
                    borderRadius: 18,
                    padding: 24,
                    boxShadow: "1px 1px 3px 3px rgba(20,155,245,.2)",
                    marginBottom: 18
                }}
                >
                <div style={{ fontWeight: 700, fontSize: 20, color: "#001B48" }}>Your booking details</div>
                <div className="row mt-2">
                    <div className="col-6">
                    <div style={{ color: "#22614D", fontWeight: 800 }}>Check-in</div>
                    <div>{formatDate(b.dateFrom)}</div>
                    <div>Check-in Time: {b.dateFrom?.slice(11, 16)}</div>
                    </div>
                    <div className="col-6">
                    <div style={{ color: "#22614D", fontWeight: 800 }}>Check-out</div>
                    <div>{formatDate(b.dateTo)}</div>
                    <div>Check-out Time: {b.dateTo?.slice(11, 16)}</div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-6" style={{ color: "#22614D", fontWeight: 600 }}>
                    Total length of stay:
                    </div>
                    <div className="col-6">
                    {getNights(b.dateFrom, b.dateTo)} {getNights(b.dateFrom, b.dateTo) === 1 ? "night" : "nights"}
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-6" style={{ color: "#22614D", fontWeight: 600 }}>
                    You have selected:
                    </div>
                    <div className="col-6">1 room for {b?.adults || 2} adults</div>
                </div>
                <div className="mt-3 d-flex justify-content-center">
                    <button
                        onClick={() => openEditModal(b)}
                        className="btn"
                        style={{
                        background: "#001B48",  
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        height: 40,
                        padding: "0 22px",
                        fontWeight: 700,
                        lineHeight: "40px",
                        boxShadow: "0 2px 0 rgba(0,0,0,.15)",
                        cursor: "pointer"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#0D5C9C")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#001B48")}
                    >
                        Change selection
                    </button>
                    </div>

                </div>

                {/* Card 3: Payment details */}
                <div
                style={{
                    background: "#fcfcfc",
                    borderRadius: 18,
                    padding: 24,
                    boxShadow: "1px 1px 3px 3px rgba(20,155,245,.2)"
                }}
                >
                <div style={{ fontWeight: 700, fontSize: 20, color: "#001B48" }}>Your booking details</div>

                <div className="mt-3">
                  <label className="form-label" style={{color:"#22614D"}}>Payment method</label>
                  <select className="form-select" value={paymentType} onChange={e=>setPaymentType(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Mono">Mono</option>
                    <option value="BankTransfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <div>                 
                    <div style={{color: "#22614D"}}>Total price:</div>
                    </div>
                    <div className="text-end">                   
                    <div className="fw-bold" style={{color: "#22614D"}}>
                        {totalRaw}
                        {b.currency ? ` ${b.currency}` : "$"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 d-flex justify-content-center">
                    <button
                        onClick={handlePayAndFinalise}
                        className="btn"
                        style={{
                        background: "#001B48",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        height: 40,
                        padding: "0 28px",
                        fontWeight: 700,         // Bold
                        lineHeight: "40px",
                        boxShadow: "0 2px 0 rgba(0,0,0,.15)",
                        cursor: "pointer"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#0D5C9C")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#001B48")}
                    >
                        Pay and finalise your booking
                    </button>
                    </div>

                </div>
            </div>
            );
        })()}
        </div>

        </div>

        {/* Edit Booking Modal */}
        {editModal.show && (
          <div className="position-fixed top-0 start-0 w-100 h-100"
               style={{ background:"rgba(0,0,0,.35)", zIndex: 9999 }}
               onClick={closeEditModal}>
            <div className="card p-3"
                 style={{ width:420, maxWidth:"92vw", borderRadius:16, margin:"10vh auto" }}
                 onClick={e=>e.stopPropagation()}>
              <h5 className="fw-bold mb-3">Edit booking dates</h5>
              <div className="mb-2">
                <label className="form-label">Date from</label>
                <input type="date" className="form-control"
                       value={editModal.dateFrom}
                       onChange={e=>setEditModal(s=>({...s, dateFrom:e.target.value}))}/>
              </div>
              <div className="mb-3">
                <label className="form-label">Date to</label>
                <input type="date" className="form-control"
                       value={editModal.dateTo}
                       onChange={e=>setEditModal(s=>({...s, dateTo:e.target.value}))}/>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-primary" onClick={handleEditBooking}>Save</button>
                <button className="btn btn-outline-secondary" onClick={closeEditModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
