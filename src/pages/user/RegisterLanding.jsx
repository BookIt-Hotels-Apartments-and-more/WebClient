import { useNavigate, Link } from "react-router-dom";

const TOKENS = {
  bgCard: "#FFFFFF",
  border: "#E6EEF4",
  radius: 14,
  shadow: "0 3px 10px rgba(2,69,122,0.08)",
  accentBtn: "#97CADB",
  accentText: "#02457A",
};

const Card = ({ children, className = "", style = {} }) => (
  <div
    className={className}
    style={{
      background: TOKENS.bgCard,
      borderRadius: TOKENS.radius,
      padding: 18,
      border: `1px solid ${TOKENS.border}`,
      boxShadow: TOKENS.shadow,
      ...style,
    }}
  >
    {children}
  </div>
);


const FeatureCard = ({ title, part1, part2 }) => (
  <div className="col-12 col-md-4 d-flex">
    <div
      className="position-relative flex-fill p-3 p-md-4"
      style={{
        borderRadius: 12,
        background: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(2,69,122,0.08)",
      }}
    >
      <img
        src="/images/icon/starorange.png"
        alt=""
        width={30}
        height={30}
        loading="lazy"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          pointerEvents: "none",
          userSelect: "none",
          filter: "drop-shadow(0 3px 6px rgba(2,69,122,0.12))",
        }}
      />
      <div className="fw-semibold mb-2" style={{ color: "#002B5B", fontSize: 15, fontWeight: 700}}>
        {title}
      </div>

      <div style={{ color: "#22614D", fontSize: 14, marginBottom: 6, marginTop: 30 }}>
        {part1}
      </div>

      <div style={{ color: "#22614D", fontSize: 14, marginTop: 20 }}>
        {part2}
      </div>
    </div>
  </div>
);

const FinansItem = ({ title, text }) => (
  <div
    className="mb-4"
    style={{
      display: "grid",
      gridTemplateColumns: "28px 1fr",
      columnGap: 8,
      alignItems: "start",
    }}
  >
    <img
      src="/images/icon/checkmark.png"
      alt=""
      width={28}
      height={18}
      style={{ marginTop: 2 }}
    />
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#002B5B" }}>
        {title}
      </div>
      <div className="text-muted" style={{ fontSize: 14 }}>
        {text}
      </div>
    </div>
  </div>
);

const FinansCard = ({ title1, part1, title2, part2 }) => (
  <div className="col-12 col-md-4 d-flex">
    <div
      className="flex-fill p-3 p-md-4"
      style={{ borderRadius: 12, background: "#FFFFFF" }}
    >
      <FinansItem title={title1} text={part1} />
      <FinansItem title={title2} text={part2} />
    </div>
  </div>
);



export default function RegisterLanding() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", paddingBottom: 40, marginTop: -110, marginBlockEnd: -100 }}>
        <div
            style={{
                position: "relative",
                overflow: "hidden",            
                paddingTop: 32,
                paddingBottom: 20,
                background:
                "linear-gradient(180deg, rgba(3,173,179,0.18) 0%, rgba(214,231,238,1) 30%, rgba(214,231,238,0) 50%)",
            }}
            >
            <div className="container" style={{ width: 2200, marginTop: 130 }}>

                <p className="h3" style={{ color: "#FA7E1E", fontSize: 46 }}>
                Register anything on <span className="fw-bold">bookit.pp.ua</span>
                </p>

                <p className="mb-4" style={{ fontSize: 14, marginTop: 30}}>
                Register your property in one of the most popular applications in the world to earn more and faster, and conquer new markets.
                </p>

                {/* Breadcrumbs */}
                <nav className="small mb-2" style={{ marginTop: 80 }} aria-label="breadcrumb">
                  <span className="me-1">
                    <Link to="/" className="text-muted text-decoration-none">Main page</Link>
                  </span>
                  <span aria-hidden="true">›</span>

                  <span className="mx-1">
                    <Link to="/accounthome" className="text-muted text-decoration-none">Account</Link>
                  </span>
                  <span aria-hidden="true">›</span>

                  <span className="mx-1 text-dark">Register your property</span>
                </nav>


                {/* TOP FEATURES */}
                <Card
                className="mb-4 p-4 p-md-5"
                style={{
                    border: "none",
                    borderRadius: 10,
                    boxShadow: "0 12px 28px rgba(2,69,122,0.08)",
                    background: "#FFFFFF",
                    marginTop: 30
                }}
                >
                <div
                    className="text-center fw-semibold mb-4"
                    style={{ fontSize: 28, color: "#FA7E1E" }}
                >
                    Receive guests without unnecessary hassle. We will help!
                </div>

                <div className="row g-4">
                    <div className="row g-4">
                        <FeatureCard
                            title="Your object, your rules"
                            part1="Accept or decline bookings with the “Request a booking” feature."
                            part2="Manage guest expectations by setting clear house rules."
                        />
                        <FeatureCard
                            title="Learn more about your guests"
                            part1="Take advantage of insights based on booking history."
                            part2="Take advantage of insights based on booking history."
                        />
                        <FeatureCard
                            title="Protection gives confidence"
                            part1="Protection against insurance claims from guests and neighbours."
                            part2="Choose from several options for damage protection."
                        />
                        </div>
                </div>
                </Card>

                {/* PAYMENT SYSTEM */}
                <Card
                className="mb-4 p-4 p-md-5"
                style={{
                    border: "none",
                    borderRadius: 10,
                    background: "#FFFFFF",
                    boxShadow: "none",      // <— прибираємо тінь блоку
                    marginTop: 30,
                }}
                >
                <div className="text-center fw-semibold mb-4"
                    style={{ fontSize: 28, color: "#FA7E1E" }}>
                    Control your finances with the Payment System via
                </div>

                <div className="row g-4">
                    <div className="row g-4">
                    <FinansCard
                        title1="Convenience of receiving payment"
                        part1="We handle the entire payment processing process ourselves, freeing up your time to develop your business."
                        title2="More control over your funds"
                        part2="Choose your payment method and schedule from the options available in your region."
                    />
                    <FinansCard
                        title1="More Guaranteed Revenue"
                        part1="We guarantee that you will receive all funds owed to you for completed prepaid reservations where guests pay online."
                        title2="Daily Payouts in Select Countries"
                        part2="Get paid faster! We'll send you your payouts 24 hours after your guests check out"
                    />
                    <FinansCard
                        title1="Lower risks"
                        part1="We communicate regulatory changes and help you comply with applicable laws and protect against fraud and chargebacks."
                        title2="You can manage several objects at once"
                        part2="You will save time, as you will be able to view and reconcile invoices for a group of objects at once."
                    />
                    </div>
                </div>
                </Card>                

                {/* CTA */}
                <div className="text-center " >
                    <button
                        className="btn btn-lg"
                        onClick={() => navigate("/addproperty")}
                        style={{
                        background: TOKENS.accentBtn,
                        borderRadius: TOKENS.radius,
                        paddingInline: 28,
                        fontWeight: 700,
                        fontSize: 28,
                        height: 150,
                        width: 600,
                        }}
                    >
                        Let’s start registering your property!
                    </button>
                </div>
            </div>
        </div>

    </div>
    
  );
}
