import { Link } from "react-router-dom";

const PartnerAuth = () => {
  return (
    <div className="container text-center py-5">
      <h2>Партнерський вхід / реєстрація</h2>
      <p>Увійдіть або зареєструйтесь як партнер платформи</p>
      <Link to="/login" state={{ role: "Landlord" }} className="btn btn-outline-dark mx-2">
        Увійти
      </Link>
      <Link to="/register" state={{ role: "Landlord" }} className="btn btn-dark mx-2">
        Зареєструватись
      </Link>
    </div>
  );
};

export default PartnerAuth;
