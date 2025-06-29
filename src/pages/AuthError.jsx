import { useLocation } from "react-router-dom";

const AuthError = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const error = params.get("error");

  return (
    <div style={{ padding: "20px", color: "red" }}>
      <h2>Authorization error</h2>
      <p>{error || "Something went wrong. Please try again."}</p>
    </div>
  );
};

export default AuthError;
