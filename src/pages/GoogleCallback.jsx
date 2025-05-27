import { useEffect } from "react";

const GoogleCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Правильне перенаправлення на бекенд
      window.location.href = `https://localhost:7065/google-auth/callback?code=${code}`;
    } else {
      alert("Код авторизації не знайдено");
    }
  }, []);

  return <p>Очікуємо завершення авторизації через Google...</p>;
};

export default GoogleCallback;
