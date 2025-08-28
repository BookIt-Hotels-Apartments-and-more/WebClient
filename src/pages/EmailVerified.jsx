import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
      alignContent: "center",
      padding: "20px",
      color: "green",
      height: "40dvh"
    }}>
      <h2 style={{ textAlign: "center" }}>Your email was successfully verified</h2>
      <p style={{ textAlign: "center" }}>{"Please, sign in to use your account."}</p>
      <button
        className="btn btn-success btn-sm"
        style={{ width: "150px", margin: "0 auto" }}
        onClick={() => { navigate("/login"); }}>
        Go to sign in
      </button>
    </div>
  );
};

export default EmailVerified;
