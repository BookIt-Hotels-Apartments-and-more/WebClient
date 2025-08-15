import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { setUser } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import UserPanel from "../pages/tenant/UserPanel";
import { useState, useEffect, useRef } from 'react';
import "../styles/HeaderStyle.css";


const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const rolePickerRef = useRef(null);


  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch(setUser(null));
  navigate("/");
};

useEffect(() => {
    if (!showRolePicker) return;
    const onKey = (e) => e.key === "Escape" && setShowRolePicker(false);
    const onClick = (e) => {
      if (rolePickerRef.current && !rolePickerRef.current.contains(e.target)) {
        setShowRolePicker(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showRolePicker]);


return (
  <nav className="navbar header-absolute navbar-expand-lg" style={{ width: '100%', maxWidth: 1955, margin: '0 auto', left: 0 }}>
      <div className="d-flex justify-content-between align-items-center" style={{ width: '100%', padding: '0 40px', minHeight: 88 }}>

        <Link to="/" className="navbar-brand fw-bold fs-3">
          <img src="/images/logobookit.png" alt="Logo"/>
        </Link>

        <div className="d-flex align-items-center gap-4">    
          <Link to="/" className="btn main-btn">Main</Link>        
          <Link to="/apartments" className="btn main-btn">Apartments</Link> 
          <Link to="/countries" className="btn main-btn">Countries</Link>           
          <Link to="/aboutus" className="btn main-btn">About Us</Link>
        </div>              

        <div className="d-flex align-items-center gap-4">
          {!user && (
            <>
              <Link to="/whoareyou" className="btn signin-btn">Sign In</Link>
            </>
          )}

          {user && (
            <div
              className="d-flex align-items-center gap-3"
              style={{
                background: "#E3F2FD",         
                borderRadius: 16,
                padding: "6px 18px",
                boxShadow: "0 2px 8px 0 rgba(2, 69, 122, 0.08)", 
              }}
            >
              <button
                onClick={() => setShowRolePicker(true)}
                aria-haspopup="dialog"
                aria-expanded={showRolePicker ? "true" : "false"}
                style={{ background: "transparent", border: "none", padding: 0, color: "#02457A" }}
              >
                {user?.photos?.length > 0 && user.photos[0]?.blobUrl ? (
                  <img
                    src={user.photos[0].blobUrl}
                    alt="User avatar"
                    width={60}
                    height={60}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e0eaf6",
                      background: "#f3f3f3",
                      boxShadow: "0 2px 5px 0 rgba(2,69,122,0.08)",
                      cursor: "pointer"
                    }}
                  />
                ) : (
                  <FaUserCircle size={36} style={{ cursor: "pointer" }} />
                )}
              </button>

              <span>Hello, {user?.username}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>

          )}
        </div>
        {showRolePicker && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.15)",
              zIndex: 2000
            }}
          >
            <div
              ref={rolePickerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Who are you?"
              style={{
                position: "absolute",
                right: 40,
                top: 90,
                width: 260,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,.18)",
                padding: 16
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6, color: "#1b3966" }}>
                Who are you?
              </div>
              <div className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                Choose where to go
              </div>

              <button
                className="btn btn-primary btn-sm w-100"
                onClick={() => {
                  setShowRolePicker(false);
                  navigate("/landlordpanel");
                }}
              >
                Landlord
              </button>

              <button
                className="btn btn-outline-primary btn-sm w-100 mt-2"
                onClick={() => {
                  setShowRolePicker(false);
                  navigate("/userpanel");
                }}
              >
                Traveler
              </button>
            </div>
          </div>
        )}

      </div>     
  </nav>
);
};

export default Header;
