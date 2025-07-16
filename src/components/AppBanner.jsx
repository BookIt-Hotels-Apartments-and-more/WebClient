import React from "react";

const AppBanner = () => {
    return (
    <section className="my-5">
  <div
    style={{
      maxWidth: 1500,
      margin: "0 auto",
      marginTop: 80,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 300,
    }}
  >
    <img
      src="/images/appstore.png"
      alt=""
      style={{
        maxWidth: "1000px",
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