import { Link } from "react-router-dom";

const AdminAuth = () => {
  return (
    <div className="container text-center py-5">
      <h2>Авторизація адміністратора</h2>
      <p>Увійдіть як співробітник адміністрації</p>
      <Link to="/login" state={{ role: "Admin" }} className="btn btn-outline-dark">
        Увійти
      </Link>
    </div>
  );
};

export default AdminAuth;
