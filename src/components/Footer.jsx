

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkBaseClasses = "text-decoration-none text-dark transition";
  const hoverStyle = {
    transition: "transform 0.2s ease, color 0.2s ease",
  };

  return (
    <footer className="bg-light text-dark py-4 mt-auto border-top">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <p className="mb-2 mb-md-0">
          © {currentYear} BookIt. All rights reserved.
        </p>
        <div className="d-flex gap-3">
          <a
            href="#"
            className={linkBaseClasses}
            style={hoverStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.color = "#1877F2"; 
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.color = "#212529";
            }}
          >
            Facebook
          </a>

          <a
            href="#"
            className={linkBaseClasses}
            style={hoverStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.color = "#C13584"; 
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.color = "#212529";
            }}
          >
            Instagram
          </a>

          <a
            href="#"
            className={linkBaseClasses}
            style={hoverStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.color = "#0088cc";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.color = "#212529";
            }}
          >
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
