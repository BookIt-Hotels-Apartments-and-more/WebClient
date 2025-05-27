import { useLocation } from "react-router-dom";

const AuthError = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const error = params.get("error");

  return (
    <div style={{ padding: "20px", color: "red" }}>
      <h2>Помилка авторизації</h2>
      <p>{error || "Щось пішло не так. Спробуйте ще раз."}</p>
    </div>
  );
};

export default AuthError;
