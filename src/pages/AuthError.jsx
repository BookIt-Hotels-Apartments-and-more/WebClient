import { useLocation, useNavigate } from "react-router-dom";

const AuthError = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const error = params.get("error");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
      alignContent: "center",
      padding: "20px",
      color: "red",
      height: "40dvh"
    }}>
      <h2 style={{ textAlign: "center" }}>Authorization error</h2>
      <p style={{ textAlign: "center" }}>{error || "Something went wrong. Please try again."}</p>
      <button
        className="btn btn-danger btn-sm"
        style={{ width: "150px", margin: "0 auto" }}
        onClick={() => { navigate("/"); }}>
        Home page
      </button>
    </div>
  );
};

export default AuthError;
