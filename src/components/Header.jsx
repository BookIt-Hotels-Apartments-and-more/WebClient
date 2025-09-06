import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import { setUser } from "../store/slices/userSlice";
import "../styles/HeaderStyle.css";
import { motion } from "framer-motion";
import { displayableRole } from "../utils/roles";

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const avatarUrl = user?.photoUrl || user?.photos?.[0]?.blobUrl;
  const navigate = useNavigate();
  const [showRolePicker, setShowRolePicker] = useState(false);
  const rolePickerRef = useRef(null);
  const dispatch = useDispatch();

  const handleLogout = () => {
    setShowRolePicker(false);
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

   useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user" && e.newValue) {
        try { dispatch(setUser(JSON.parse(e.newValue))); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);



  return (
    <nav className="navbar header-absolute navbar-expand-lg" style={{ width: '100%', maxWidth: 1955, margin: '0 auto', left: 0 }}>
        <div className="d-flex justify-content-between align-items-center" style={{ width: '100%', padding: '0 40px', minHeight: 88 }}>

          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.06, rotate: -2 }}
            whileTap={{ scale: 0.96, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Link to="/" className="navbar-brand fw-bold fs-3">
              <motion.img
                src="/images/logobookit.png"
                alt="Logo"
                initial={{ filter: "saturate(0.7)", rotate: 0 }}
                whileHover={{
                  rotate: 360,
                  transition: { type: "spring", stiffness: 200, damping: 15 },
                }}
                whileTap={{ rotate: 0 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>

          <div className="d-flex align-items-center gap-4">    
            <Link to="/" className="btn main-btn">Main</Link>        
            <Link to="/apartments" className="btn main-btn">Apartments</Link> 
            <Link to="/countries" className="btn main-btn">Countries</Link>           
            <Link to="/aboutus" className="btn main-btn">About Us</Link>
          </div>              

          <div className="d-flex align-items-center gap-4">
            {!user && (
              <>
                <Link to="/login" className="btn signin-btn">Sign In</Link>
              </>
            )}

            {user && (
              <div
                className="d-flex align-items-center gap-3"
                style={{
                  background: "#E3F2FD",         
                  borderRadius: 16,
                  padding: "6px 18px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px 0 rgba(2, 69, 122, 0.08)",
                }}
                onClick={() => setShowRolePicker(true)}
              >
                <button
                  aria-haspopup="dialog"
                  aria-expanded={showRolePicker ? "true" : "false"}
                  style={{ background: "transparent", border: "none", padding: 0, color: "#02457A" }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User avatar" width={60} height={60} style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid #e0eaf6", background: "#f3f3f3", boxShadow: "0 2px 5px 0 rgba(2,69,122,0.08)", cursor: "pointer" }} />
                      ) : (
                        <FaUserCircle size={36} style={{ cursor: "pointer" }} />
                      )}
                </button>

                <span>Hello, {user?.username}</span>
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
                  You are logged in as {displayableRole(user?.role)}
                </div>
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                  Choose where to go
                </div>
                
                <button
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => {
                    setShowRolePicker(false);
                    navigate(user?.role === 0 ? "/adminpanel" : user?.role === 1 ? "/accounthome" : "/accounthome");
                  }}
                >
                  {user?.role === 0 ? "Admin panel" : user?.role === 1 ? "Landlord panel" : "User panel"}
                </button>

                <button className="btn btn-outline-danger btn-sm w-100 mt-2" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}

        </div>     
    </nav>
  );
};

export default Header;
