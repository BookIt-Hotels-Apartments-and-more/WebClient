const Footer = () => {
  return (
    <footer
      style={{
        backgroundImage: `
          linear-gradient(
            to bottom,
            rgba(255,255,255,1) 0%,
            rgba(255,255,255,0.96) 6%,
            rgba(255,255,255,0.88) 12%,
            rgba(255,255,255,0.72) 24%,
            rgba(255,255,255,0.48) 45%,
            rgba(255,255,255,0.24) 70%,
            rgba(255,255,255,0.10) 85%,
            rgba(255,255,255,0) 100%
          ),
          url('/images/footerimage.png')
        `,
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundSize: '100% 100%, cover',
        backgroundPosition: '0 0, center',
        width: '100%',
        maxWidth: 1920,
        minHeight: 300,
        height: 450,
        margin: '0 auto',
        padding: 0,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div className="container-fluid py-0">
        <div
          className="row justify-content-center align-items-center"
          style={{
            width: '100%',
            margin: '0 auto 0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '34px 72px 32px 72px',
            background: 'transparent',
            backdropFilter: 'blur(10px)',          
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {/* 1. Лого */}
          <div className="col-12 col-sm-6 col-md-3 mb-4 mb-md-0 d-flex justify-content-center justify-content-md-center align-items-center">
            <img src="/images/logobookit.png" alt="Bookit Logo" style={{ width: 100, maxWidth: "80vw" }} />
          </div>
          {/* 2. Опис */}
          <div className="col-12 col-sm-6 col-md-3 mb-4 mb-md-0" style={{ color: "#111", fontSize: 12, fontWeight: 400, lineHeight: 1.2 }}>
            BookIt is a service for manual search and armored living.<br />
            We also help mandrinks to find reliable options for fixing the work – quickly, safely and without any hassle.<br />
            Your comfort is our priority.
          </div>
          {/* 3. Лінки */}
          <div className="col-12 col-sm-6 col-md-3 mb-4 mb-md-0 d-flex flex-column align-items-center align-items-md-center" style={{ fontSize: 12 }}>
            <a href="/aboutus" style={footerLink}>About the service</a>
            <a href="/support" style={footerLink}>Support</a>
            <a href="/terms" style={footerLink}>Terms of use</a>
            <a href="/privacy" style={footerLink}>Privacy Policy</a>
          </div>
          {/* 4. Контакти */}
          <div className="col-12 col-sm-6 col-md-3 d-flex flex-column align-items-center align-items-md-start" style={{ fontSize: 12, color: "#111" }}>
            <a href="https://bookit.pp.ua" target="_blank" rel="noopener noreferrer" style={{ ...footerLink, fontWeight: 700 }}>bookit.pp.ua</a>
            <a href="mailto:bookit.pp@mail-super.com" style={footerLink}>bookit.pp@mail-super.com</a>
            <a href="tel:+380963244837" style={footerLink}>+380963244837</a>
            <a href="https://goo.gl/maps/L5WECV1VUvB2" target="_blank" rel="noopener noreferrer" style={footerLink}>
              Ukraine, Dnipro Sichslevska 12 A
            </a>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

const footerLink = {
  color: "#111",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 400,
  marginBottom: 4,
};

export default Footer;
