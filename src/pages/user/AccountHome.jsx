import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../../store/slices/userSlice";
import { getCurrentUser } from "../../api/authApi";
import LandEstablishmentCard from "../landlord/LandEstablishmentCard";
import { getEstablishmentsByOwnerFiltered } from "../../api/establishmentsApi";
import { toast } from "react-toastify";

const TOKENS = {
  bgCard: "#FFFFFF",
  bgSoft: "#FCFCFC",
  text: "#001B48",
  textSoft: "#6E7C87",
  iris: "#02457A",
  accent: "#03ADB3",
  sky: "#D6E7EE",
  border: "#E6EEF4",
  radius: 14,
  shadow: "0 4px 28px rgba(31,38,135,.11)",
};

const Card = ({ children, className = "", style = {} }) => (
  <div
    className={className}
    style={{
      background: TOKENS.bgCard,
      borderRadius: TOKENS.radius,
      padding: 18,
      border: `1px solid ${TOKENS.border}`,
      boxShadow: "0 3px 10px rgba(2,69,122,0.08)",
      ...style,
    }}
  >
    {children}
  </div>
);

const MAX_LVL = 10;
let CURRENT_LVL = 0;
let pct = 0;
const safePctFlag  = Math.min(97, Math.max(3, pct));
const safePctLabel = Math.min(94, Math.max(6, pct));

export default function AccountHome() {
  const user = useSelector((s) => s.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const roles = user?.roles || [];
  const whoLS = (localStorage.getItem("whoareyou") || "").toLowerCase();
  const isLandlord = roles.includes("Landlord") || whoLS === "landlord" || whoLS === "partner";
  const isTenant   = roles.includes("Tenant")   || whoLS === "user"     || whoLS === "traveller";

  const [establishments, setEstablishments] = useState([]);
  const [showMyProperty, setShowMyProperty] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user?.id || !isTenant) return;
      try {
        const full = await getCurrentUser();
        dispatch(setUser(full));
      } catch (e) {
        console.warn("getCurrentUser failed:", e);
      }
    })();
  }, [user?.id, isTenant, dispatch]);

  const bookingCount = Array.isArray(user?.bookings) ? user.bookings.length : 0;
    if (isTenant && bookingCount > 0) {
      CURRENT_LVL = Math.min(MAX_LVL, Math.max(1, bookingCount));
      pct = (CURRENT_LVL / MAX_LVL) * 100;
    }
  const nextLevel = Math.min(MAX_LVL, (CURRENT_LVL || 1) + 1);
  const bookingsToNext = CURRENT_LVL >= MAX_LVL ? 0 : Math.max(0, nextLevel - bookingCount);

  useEffect(() => {
    if (isLandlord && user?.id) {
      getEstablishmentsByOwnerFiltered(user.id)
        .then(setEstablishments)
        .catch(console.error);
    }
  }, [isLandlord, user?.id]);

  const reload = useCallback(() => {
    if (isLandlord && user?.id) {
      getEstablishmentsByOwnerFiltered(user.id)
        .then(setEstablishments)
        .catch(console.error);
    }
  }, [isLandlord, user?.id]);

  const handleTripsClick = (e) => {
    e.preventDefault();
    if (user?.role === "Tenant" || user?.role === 2) {
      navigate("/userpanel");
    } else {
      toast.info("This is a section for travellers");
    }
  };

  const handleManagePropertyClick = (e) => {
    e.preventDefault();
    if (user?.role === "Landlord" || user?.role === 1) {
      navigate("/registerlanding");
    } else {
      toast.info("This is a section for partners");
    }
  };

  const handleShowPropertyClick = (e) => {
    e.preventDefault();
    if (user?.role === "Landlord" || user?.role === 1) {
      setShowMyProperty(true);
    } else {
      toast.info("This is a section for partners");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", paddingBottom: 40, marginTop: -120, }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",          
          paddingTop: 32,
          paddingBottom: 20,
          background:
            "linear-gradient(180deg, rgba(3,173,179,0.18) 0%, rgba(214,231,238,1) 72%, rgba(214,231,238,0) 100%)",
        }}
        >
        <div className="container" style={{ width: 2200 }}>
          <div className="row align-items-center" style={{ marginTop: 110 }}>
            <div className="col-12 col-md-7">
              <div className="d-flex align-items-center" style={{ gap: 14 }}>
                {user?.photos?.length > 0 && user.photos[0]?.blobUrl ? (
                  <img
                    src={user.photos[0].blobUrl}
                    alt="User avatar"
                    width={190}
                    height={190}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e0eaf6",
                      background: "#f3f3f3",
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 190,
                      height: 190,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${TOKENS.accent}, ${TOKENS.sky})`,
                      boxShadow: TOKENS.shadow,
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 64,
                    }}
                    title={user?.username}
                  >
                    {(user?.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: "#FE7C2C", marginBottom: 4 }}>
                    Hello{user?.username ? `, ${user.username}!` : "!"}
                  </div>
                  {isTenant && (
                    <div style={{ color: "#FE7C2C", fontSize: 18 }}>
                      {CURRENT_LVL || 1} level traveller
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-5 d-flex flex-column align-items-md-end align-items-start mt-3 mt-md-0">
              <div style={{ fontSize: 22, fontWeight: 600, color: TOKENS.text }}>
                Your next journey awaits you!
              </div>              
            </div>
          </div>

            <div className="row g-3 align-items-stretch mt-3">
            <div className="col-12 col-lg-8 d-flex">
                <Card
                    className="w-100 h-100"
                    style={{
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                    >
                    <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 300, color: "#FA7E1E", fontSize: 28 }}>
                        Your travel experience
                        </div>
                        {isTenant && (
                          <div style={{ fontSize: 13, color: "#22614D" }}>
                            {CURRENT_LVL < MAX_LVL
                              ? `A few more reservations (${bookingsToNext}) and you’re at level ${nextLevel}`
                              : "Maximum level reached"}
                          </div>
                        )}
                    </div>

                    <div style={{ position: "relative", height: 110, marginTop: 6, marginBottom: 6 }}>
                        <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 16,
                            right: 16,
                            height: 2,
                            background: "#000",
                            borderRadius: 2,
                            transform: "translateY(-50%)",
                        }}
                        />
                        <img
                        src="/images/icon/flag.png"
                        alt="level marker"
                        width={32}
                        height={32}
                        style={{
                            position: "absolute",
                            top: "calc(50% - 38px)",
                            left: `calc(${safePctFlag}% - 14px)`,
                        }}
                        />
                        <div
                        style={{
                            position: "absolute",
                            top: "calc(50% + 10px)",
                            left: `calc(${safePctLabel}% - 30px)`,
                            color: "#22614D",
                            fontWeight: 400,
                            fontSize: 28,
                        }}
                        >
                        {CURRENT_LVL || 1} lvl
                        </div>
                    </div>

                    <div className="d-flex justify-content-between small text-muted">
                        <span />
                        <Link
                          to={user?.role === "Tenant" || user?.role === 2 ? "/userpanel" : "/landlordpanel"}
                          className="text-decoration-none" style={{color: "#000000"}}
                        >
                          Show level reward bonuses
                        </Link>
                    </div>
                    </Card>

            </div>

            <div className="col-12 col-lg-4 d-flex flex-column gap-2">
                <Card style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, color: "#000", fontSize: 28, marginBottom: 10 }}>
                    Bonuses
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div style={{ paddingLeft: 10, fontSize: 18 }}>Bonuses</div>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>0</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={{ paddingLeft: 10, fontSize: 18 }}>Vouchers</div>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>0</div>
                </div>

                <div className="d-flex justify-content-end">
                    <button
                    className="btn btn-sm"
                    style={{
                        background: "#97CADB",
                        color: "#02457A",
                        border: "none",
                        borderRadius: 10,
                        padding: "6px 14px",
                        fontWeight: 600,
                    }}                    
                    >
                    Show More
                    </button>
                </div>
                </Card>

                <Card style={{ padding: 10 }}>
                    <Link
                        to={user?.role === "Tenant" || user?.role === 2 ? "/userpanel" : "/landlordpanel"}
                        className="d-flex align-items-center justify-content-between text-decoration-none"
                        style={{ padding: "12px 16px" }}
                    >
                        <span className="d-flex align-items-center gap-2">
                            <img
                                src="/images/icon/bell.png"
                                alt="bell"
                                width={16}
                                height={16}
                                style={{
                                    position: "absolute",
                                    marginLeft: 5
                                }}
                                />
                            <span style={{ fontWeight: 600, color: "#02457A", marginLeft: 70 }}>Fill out your profile</span>
                        </span>                        
                    </Link>
                </Card>
            </div>
            </div>

        </div>
      </div>

        <div className="container" style={{ marginTop: 16, width: 2200 }}>
            <div className="row g-4 align-items-stretch">
                  <div className="col-12 col-md-4 d-flex">
                    <Card className="h-100 flex-fill d-flex flex-column" style={{ padding: 22 }}>
                        <div style={{ fontWeight: 700, fontSize: 24, color: "#FA7E1E", marginBottom: 10 }}>
                        My travels
                        </div>

                        <ul className="list-unstyled d-flex flex-column gap-3 m-0">
                        <li className="d-flex align-items-center">
                            <span
                            onClick={handleTripsClick}
                            role="button"
                            className="text-decoration-none d-inline-flex align-items-baseline gap-2 flex-grow-1"
                            style={{ color: "#000", fontSize: 18, lineHeight: 1.1, marginBlockEnd: 15 }}
                            >
                            <img src="/images/icon/trips.png" alt="" width={16} height={22} style={{ alignSelf: "baseline" }} />
                            <span>Trips and bookings</span>
                            </span>

                            <span
                            className="d-inline-flex justify-content-center align-items-center flex-shrink-0">
                            <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                            </span>
                        </li>

                        <li className="d-flex align-items-center">
                            <span
                            onClick={handleTripsClick}
                            role="button"
                            className="text-decoration-none d-inline-flex align-items-baseline gap-2 flex-grow-1"
                            style={{ color: "#000", fontSize: 18, lineHeight: 1.1, marginBlockEnd: 15 }}
                            >
                            <img src="/images/icon/favor.png" alt="" width={18} height={20} style={{ alignSelf: "baseline" }} />
                            <span>Favorites</span>
                            </span>
                            <span
                            className="d-inline-flex justify-content-center align-items-center flex-shrink-0">
                            <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                            </span>
                        </li>

                        <li className="d-flex align-items-center">
                            <span
                            onClick={handleTripsClick}
                            role="button"
                            className="text-decoration-none d-inline-flex align-items-baseline gap-2 flex-grow-1"
                            style={{ color: "#000", fontSize: 18, lineHeight: 1.1, marginBlockEnd: 15 }}
                            >
                            <img src="/images/icon/revievs.png" alt="" width={20} height={19} style={{ alignSelf: "baseline" }} />
                            <span>My reviews</span>
                            </span>
                            <span
                            className="d-inline-flex justify-content-center align-items-center flex-shrink-0">
                            <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                            </span>
                        </li>
                        </ul>
                    </Card>
                  </div>

                <div className="col-12 col-md-4 d-flex">
                <Card className="h-100 flex-fill d-flex flex-column" style={{ padding: 22 }}>
                    <div style={{ fontWeight: 700, fontSize: 24, color: "#FA7E1E", marginBottom: 8 }}>
                    Account management
                    </div>
                    <ul className="list-unstyled d-flex flex-column gap-3 m-0">
                        <li className="d-flex align-items-center">
                            <Link
                              to={user?.role === "Tenant" || user?.role === 2 ? "/userpanel" : "/landlordpanel"}
                              className="text-decoration-none d-inline-flex align-items-baseline gap-2 flex-grow-1"
                              style={{ color: "#000", fontSize: 18, lineHeight: 1.1, marginBlockEnd: 15 }}
                            >
                            <img src="/images/icon/personal.png" alt="" width={20} height={19} style={{ alignSelf: "baseline" }} />
                            <span>Personal information</span>
                            </Link>
                            <span
                            className="d-inline-flex justify-content-center align-items-center flex-shrink-0">
                            <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                            </span>
                        </li>
                        <li className="d-flex align-items-center">
                            <Link
                            to={user?.role === "Tenant" || user?.role === 2 ? "/userpanel" : "/landlordpanel"}
                            className="text-decoration-none d-inline-flex align-items-baseline gap-2 flex-grow-1"
                            style={{ color: "#000", fontSize: 18, lineHeight: 1.1, marginBlockEnd: 15 }}
                            >
                            <img src="/images/icon/security.png" alt="" width={19} height={20} style={{ alignSelf: "baseline" }} />
                            <span>Security Settings</span>
                            </Link>
                            <span
                            className="d-inline-flex justify-content-center align-items-center flex-shrink-0">
                            <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                            </span>
                        </li>
                    </ul>
                </Card>
                </div>

                <div className="col-12 col-md-4 d-flex">
                <Card className="h-100 flex-fill d-flex flex-column" style={{ padding: 22 }}>
                    <div style={{ fontWeight: 700, fontSize: 24, color: "#FA7E1E", marginBottom: 8 }}>
                    Help
                    </div>
                    <ul className="list-unstyled d-flex flex-column gap-3 m-0">
                        <li className="d-flex align-items-center">
                            <Link
                            to="/suport"
                            className="text-decoration-none d-inline-flex align-items-baseline gap-2 flex-grow-1"
                            style={{ color: "#000", fontSize: 18, lineHeight: 1.1, marginBlockEnd: 15 }}
                            >
                            <img src="/images/icon/contact.png" alt="" width={19} height={19} style={{ alignSelf: "baseline" }} />
                            <span>Contact suport</span>
                            </Link>
                            <span
                            className="d-inline-flex justify-content-center align-items-center flex-shrink-0">
                            <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                            </span>
                        </li>
                        <li className="d-flex align-items-center">
                            <Link
                            to="/resolution"
                            className="text-decoration-none d-inline-flex align-items-baseline gap-2 flex-grow-1"
                            style={{ color: "#000", fontSize: 18, lineHeight: 1.1, marginBlockEnd: 15 }}
                            >
                            <img src="/images/icon/resolution.png" alt="" width={20} height={20} style={{ alignSelf: "baseline" }} />
                            <span>Dispute resolution</span>
                            </Link>
                            <span
                            className="d-inline-flex justify-content-center align-items-center flex-shrink-0">
                            <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                            </span>
                        </li>
                    </ul>
                </Card>
                </div>
            </div>

            <div className="row g-3 mt-3">
                <div className="col-12 d-flex">
                    <Card
                    className="w-100"
                    style={{
                        padding: "14px 16px",
                        minHeight: 100,
                        display: "flex",
                        alignItems: "center",
                    }}
                    >
                    <div className="d-flex w-100 align-items-center justify-content-between">
                        <div style={{ fontWeight: 700, color: "#FA7E1E", fontSize: 24 }}>
                        Manage your property
                        </div>

                        <span
                        onClick={handleManagePropertyClick}
                        role="button"
                        className="text-decoration-none d-inline-flex align-items-baseline gap-2"
                        style={{ color: "#02457A", fontSize: 18, lineHeight: 1.1 }}
                        >
                        <img
                            src="/images/icon/property.png"
                            alt=""
                            width={19}
                            height={19}
                            style={{ alignSelf: "baseline" }}
                        />
                        <span>Register your property</span>

                        <img
                            src="/images/icon/go.png"
                            alt="go"
                            width={20}
                            height={20}
                            className="ms-1"
                            style={{ alignSelf: "baseline" }}
                        />
                        </span>
                    </div>
                    </Card>
                </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-12 d-flex">
                <Card
                  className="w-100"
                  style={{ padding: "14px 16px", display: "flex", flexDirection: "column" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{ marginBottom: 6 }}
                  >
                    <div style={{ fontWeight: 700, color: "#FA7E1E", fontSize: 24 }}>
                      Your property
                    </div>

                    {establishments.length > 0 && !showMyProperty && (
                      <button
                        type="button"
                        className="btn btn-link p-0 d-inline-flex align-items-center gap-2"
                        onClick={handleShowPropertyClick}
                        style={{ textDecoration: "none", color: "#02457A", fontWeight: 600 }}
                      >
                        Show my property
                        <img src="/images/icon/go.png" alt="go" width={20} height={20} />
                      </button>
                    )}
                  </div>

                  {establishments.length === 0 ? (
                    <div className="text-muted mt-1">
                      You have not registered your property.
                    </div>
                  ) : (
                    showMyProperty && (
                      <div className="d-flex flex-column gap-3 mt-2">
                        {establishments.map((est) => (
                          <LandEstablishmentCard key={est.id} est={est} reloadStats={reload} />
                        ))}
                      </div>
                    )
                  )}
                </Card>
              </div>
            </div>

        </div>
    </div>
  );
}
