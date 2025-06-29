import { Link } from "react-router-dom";

const AdminAuth = () => {
  const handleSignIn = () => sessionStorage.setItem('loginSource', 'employee');

  return (
    <div className="container text-center py-5">
      <h2>Administrator authorization</h2>
      <p>Log in as an administrator</p>
      <Link
        to="/login"
        className="btn btn-outline-dark"
        onClick={handleSignIn}
      >
        Log in
      </Link>
    </div>
  );



  //Відкриємо після застосування ролей
  // return (
  //   <div className="container text-center py-5">
  //     <h2>Administrator authorization</h2>
  //     <p>Log in as an administrator</p>
  //     {/* <Link to="/login" state={{ role: "Admin" }} className="btn btn-outline-dark"> */}
  //     <Link to="/login" className="btn btn-outline-dark">
  //       Log in
  //     </Link>
  //   </div>
  // );
};

export default AdminAuth;
