import React from "react";
import { toast } from 'react-toastify';

const AppBanner = () => {
    return (
    <section className="my-5">
  <div
    style={{
      maxWidth: 1950,
      margin: "0 auto",
      marginTop: 80,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 300,
      cursor: "pointer",
    }}
    onClick={() =>
              toast.info(
                "The software is still under development. You will be able to download it a little later)",
                { autoClose: 4000 }
              )
            }
  >
    <img
      src="/images/appstore2.png"
      alt=""
      style={{
        maxWidth: "2000px",
        width: "100%",
        height: "auto",
        display: "block",
      }}
    />
  </div>
</section>


  );
}

export default AppBanner;