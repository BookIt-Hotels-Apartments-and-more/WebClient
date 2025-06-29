import { Link } from "react-router-dom";

const PartnerAuth = () => {
  const handleSignIn = () => sessionStorage.setItem('loginSource', 'partner');

  return (
    <div className="container text-center py-5">
      <h2>Partner login / registration</h2>
      <p>Log in or register as a platform partner</p>
      <Link
        to="/login"
        className="btn btn-outline-dark mx-2"
        onClick={handleSignIn}
      >
        Sign in
      </Link>
      <Link to="/register" className="btn btn-dark mx-2">
        Register
      </Link>
    </div>
  );





  // Відкриємо після застосування ролей
  // return (
  //   <div className="container text-center py-5">
  //     <h2>Partner login / registration</h2>
  //     <p>Log in or register as a platform partner</p>
  //     {/* <Link to="/login" state={{ role: "Landlord" }} className="btn btn-outline-dark mx-2"> */}
  //     <Link to="/login" className="btn btn-outline-dark mx-2">
  //       Sign in
  //     </Link>
  //     {/* <Link to="/register" state={{ role: "Landlord" }} className="btn btn-dark mx-2"> */}
  //     <Link to="/register" className="btn btn-dark mx-2">
  //       Register
  //     </Link>
  //   </div>
  // );
};

export default PartnerAuth;
