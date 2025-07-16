import { useEffect } from "react";

const GoogleCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      window.location.href = `https://localhost:7065/google-auth/callback?code=${code}`;
    } else {
      alert("Authorization code not found");
    }
  }, []);

  return <p>Waiting for Google authorization to complete...</p>;
};

export default GoogleCallback;
