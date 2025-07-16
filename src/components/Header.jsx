import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa"; 
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import UserPanel from "../pages/tenant/UserPanel";
import { useState } from 'react';
import "../styles/HeaderStyle.css";


const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch(setUser(null));
  navigate("/");
};

return (
  <nav className="navbar header-absolute navbar-expand-lg" style={{ width: '100%', maxWidth: 1955, margin: '0 auto', left: 0 }}>
      <div className="d-flex justify-content-between align-items-center" style={{ width: '100%', padding: '0 40px', minHeight: 88 }}>

        <Link to="/" className="navbar-brand fw-bold fs-3">
          <img src="/images/logobookit.png" alt="Logo"/>
        </Link>

        <div className="d-flex align-items-center gap-4">    
          <Link to="/" className="btn main-btn">Main</Link>        
          <Link to="/admin-auth" className="btn main-btn">Apartments</Link> 
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
              <Link to="/userpanel" style={{ color: "#02457A" }}>
                <FaUserCircle size={24} style={{ cursor: "pointer" }} />
              </Link>
              <span>Hello, {user?.username}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>

          )}
        </div>
      </div>

      {user && showPanel && (
        <UserPanel user={user} onClose={() => setShowPanel(false)} />
      )}
  </nav>
);


//  ПОВЕРНУТИ, КОЛИ БУДУТЬ ПРАЦЮВАТИ РОЛІ
//   return (
//   <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//     <div className="container d-flex justify-content-between align-items-center">

//       <Link to="/" className="navbar-brand fw-bold fs-3">🏠 BookIt.com 🚙</Link>

//       {/* Кнопка для власника */}
//       <Link to="/partner-auth" className="btn btn-outline-dark">
//         For Partners
//       </Link>
      
//       {/* Кнопка для адміна */}
//       <Link to="/admin-auth" className="btn btn-outline-dark">
//         For Employees
//       </Link>      

//       <div className="d-flex align-items-center gap-2">
//         {!user && (
//           <>
//             <Link to="/login" className="btn btn-outline-dark">"Login"</Link>
//             <Link to="/register" className="btn btn-dark">"Register"</Link>
//           </>
//         )}

//         {user && (!user.role || user.role === "Tenant") && (
//           <div className="d-flex align-items-center gap-3">
//             <FaUserCircle
//               size={24}
//               style={{ cursor: "pointer" }}
//               onClick={() => setShowPanel(true)}
//             />
//             <span>{user?.username}</span>
//             <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
//               Logout
//             </button>
//           </div>
//         )}

//         {user && (user.role === "Admin" || user.role === "Landlord") && (
//           <div className="d-flex align-items-center gap-3">
//             <span>{user?.username}</span>
//             <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
//               Logout
//             </button>
//           </div>
//         )}
//       </div>

//     </div>

//     {/* Модалка тільки для Tenant */}
//     {user && showPanel && (!user.role || user.role === "Tenant") && (
//       <UserPanel user={user} onClose={() => setShowPanel(false)} />
//     )}

//   </nav>
// );

};

export default Header;
