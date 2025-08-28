import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ОТРИМУЄМО search і setSearch ЧЕРЕЗ ПРОПСИ
const BookingBannerForm = ({ search, setSearch }) => {
  // Локальний стан для інпуту пошуку (щоб не впливати одразу на фільтр)
  const [searchLocal, setSearchLocal] = useState(search || "");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [people, setPeople] = useState(() => localStorage.getItem("people") || "");

  // Синхронізуємо локальний інпут якщо search в пропсах зміниться
  useEffect(() => {
    setSearchLocal(search || "");
  }, [search]);

  // Збереження у localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookingForm") || "{}");
    if (stored.checkIn) setCheckIn(new Date(stored.checkIn));
    if (stored.checkOut) setCheckOut(new Date(stored.checkOut));
    if (stored.people) setPeople(stored.people);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "bookingForm",
      JSON.stringify({
        checkIn: checkIn ? checkIn.toLocaleDateString('en-CA') : null,
        checkOut: checkOut ? checkOut.toLocaleDateString('en-CA') : null,
        people,
        search: searchLocal,
      })
    );
  }, [checkIn, checkOut, people, searchLocal]);

  // useEffect(() => {
  //   localStorage.removeItem("bookingForm");
  //   setCheckIn(null);
  //   setCheckOut(null);
  //   setPeople(""); 
  //   localStorage.removeItem("bookingForm");
  // }, []);


  return (
    <div
      style={{
        background: "#EAF6FB",
        borderRadius: 22,
        boxShadow: "0 6px 36px 0 #d6e7ee",
        padding: "32px 35px 26px 35px",
        maxWidth: 850,
        minWidth: 200,
        margin: "0 auto",
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      {/* Верхній рядок: пошук */}
      <div
        style={{
          display: "flex",
          gap: 16,
          width: "100%",
          minWidth: 180,
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <>
          <style>
            {`
              .search-input:focus {
                box-shadow: 0 0 0 0.5px #97cadb !important;
                border-color: #97cadb !important;
                outline: none !important;
              }
            `}
          </style>          
        </>
        <input
          type="text"
          className="form-control search-input"
          placeholder="Enter direction, or name..."
          style={{
            maxWidth: '100%',
            minWidth: 150,
            height: 44,
            fontSize: 17,
            borderRadius: 11,
            background: "#fff",
            outline: "none",
          }}
          value={searchLocal}
          onChange={e => setSearchLocal(e.target.value)}
        />
        <button
          className="btn"
          style={{
            maxWidth: 100,
            minWidth: 100,
            height: 44,
            background: "#97cadb",
            borderRadius: 11,
            fontWeight: 600,
            color: "#fff",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            boxShadow: "0 2px 8px #d6e7ee",
            marginLeft: -100,
          }}
          onClick={() => setSearch(searchLocal)}
        >
          <i className="bi bi-search" style={{ fontSize: 20 }} />
        </button>
      </div>

      {/* Нижній рядок: дати та люди */}
      <div className="fields-row d-flex flex-md-row flex-column align-items-stretch justify-content-center gap-2" style={{ width: "100%" }}>
        <div style={{ minWidth: 180, flex: 1 }}>
          <DatePicker
            selected={checkIn}
            onChange={(date) => {
              setCheckIn(date);
              if (checkOut && date && date >= checkOut) setCheckOut(null);
            }}
            selectsStart
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date()}
            dateFormat="dd.MM.yyyy"
            placeholderText="Arrival date"
            className="form-control"
            style={{
              borderRadius: 11,
              border: "1.5px solid #cce2ec",
              fontSize: 16,
              height: 44,
              paddingLeft: 18,
              background: "#fff",
            }}
          />
        </div>
        <div style={{ minWidth: 180, flex: 1 }}>
          <DatePicker
            selected={checkOut}
            onChange={setCheckOut}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={checkIn || new Date()}
            dateFormat="dd.MM.yyyy"
            placeholderText="Departure date"
            className="form-control"
            style={{
              borderRadius: 11,
              border: "1.5px solid #cce2ec",
              fontSize: 16,
              height: 44,
              paddingLeft: 18,
              background: "#fff",
            }}
          />
        </div>
        <input
          type="number"
          className="form-control"
          placeholder="Peoples"
          style={{
            maxWidth: 180,
            height: 35,
            fontSize: 16,
            borderRadius: '0.375rem',
            border: "1.5px solid #cce2ec",
            background: "#fff",
            paddingLeft: 18,
            flex: 1,
            minWidth: 0,
          }}
          value={people}
          min={1}
          onChange={e => {
            const val = e.target.value;
            if (val === "" || Number(val) >= 1) setPeople(val);
          }}
        />
      </div>
    </div>
  );
};

export default BookingBannerForm;
