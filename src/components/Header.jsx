import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa"; 
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import UserPanel from "../pages/tenant/UserPanel";
import React, { useState } from 'react';


const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
  if (showPanel) {
    document.body.classList.add("user-panel-open");
  } else {
    document.body.classList.remove("user-panel-open");
  }
  }, [showPanel]);


  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch(setUser(null));
  navigate("/");
};

return (
  <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div className="container d-flex justify-content-between align-items-center">

      <Link to="/" className="navbar-brand fw-bold fs-3">🏠 BookIt.com 🚙</Link>

      <Link to="/partner-auth" className="btn btn-outline-dark">
        For Partners
      </Link>

      <Link to="/admin-auth" className="btn btn-outline-dark">
        For Employees
      </Link>      

      <div className="d-flex align-items-center gap-2">
        {!user && (
          <>
            <Link to="/login" className="btn btn-outline-dark">Login</Link>
            <Link to="/register" className="btn btn-dark">Register</Link>
          </>
        )}

        {user && (
          <div className="d-flex align-items-center gap-3">
            <FaUserCircle
              size={24}
              style={{ cursor: "pointer" }}
              onClick={() => setShowPanel(true)}
            />
            <span>{user?.username}</span>
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
