import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEstWizard } from "../../features/establishment/WizardContext"; 
import { ESTABLISHMENT_TYPE_LABELS } from "../../utils/enums";


const TOKENS = {
  bgCard: "#FFFFFF",
  border: "#E6EEF4",
  radius: 14,
  shadow: "0 3px 10px rgba(2,69,122,0.08)",
  accentBtn: "#97CADB",
  accentText: "#02457A",
};

const Card = ({ children, className = "", style = {}, onClick }) => (
  <div
    onClick={onClick}
    className={className}
    style={{
      background: TOKENS.bgCard,
      borderRadius: TOKENS.radius,
      padding: 18,      
      border: `1px solid ${TOKENS.border}`,
      boxShadow: TOKENS.shadow,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
  >
    {children}
  </div>
);


const ApartnentType = ({ title, description, onClick }) => (
  <div className="col-12 col-md-6 col-xl-3">
    <Card
      onClick={onClick}
      className="h-100"
      style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, minHeight: 220, minWidth: 250, textAlign: "center", }}
    >
      <div style={{ color: "#FA7E1E", fontSize: 28, fontWeight: 700 }}>{title}</div>
      <div style={{ lineHeight: 1.35, fontSize: 18, marginTop: 20 }}>
        {description}
      </div>
    </Card>
  </div>
);


export default function AddProperty() {
  const navigate = useNavigate();
  const { setPropertyType, setStep, reset } = useEstWizard();

  useEffect(() => reset(), []);

  const startWizard = (type) => {
    setPropertyType(type);          // "Apartments" | "Villa" | "Hotel" | "Alternative"
    setStep(1);
    navigate("/add-establishment/step-1");
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh",  zIndex: 2, paddingBottom: 40, marginTop: -110, marginBottom: -150 }}>
        <div style={{ position: "relative", overflow: "hidden", paddingTop: 32, paddingBottom: 20,
                background:
                "linear-gradient(180deg, rgba(3,173,179,0.18) 0%, rgba(214,231,238,1) 30%, rgba(214,231,238,0) 50%)",
            }}
            >
            <div className="container" style={{ width: 2200, marginTop: 130 }}>

                <p className="h3" style={{ color: "#FA7E1E", fontSize: 30 }}>
                Add your property to <span className="fw-bold">bookit.pp.ua</span> and get ready to welcome guests!
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

                <span className="mx-1">
                    <Link to="/registerlanding" className="text-muted text-decoration-none">Register your property</Link>
                </span>
                <span aria-hidden="true">›</span>

                <span className="mx-1 text-dark">Choice</span>
                </nav>

                <p className="mb-4" style={{ marginTop: 30, fontSize: 28, fontWeight: 300, textAlign: "center"}}>
                To get started, select the type of property you want to list on bookit.pp.ua
                </p>

                {/* Вибір типу об’єкта - ApartnentType */}
                <div className="row g-3 g-md-4">
                    <div className="row g-3 g-md-4">
                        <ApartnentType
                          title="Apartments"
                          description="A furnished accommodation option with a kitchen that guests book in its entirety."
                          onClick={() => startWizard(ESTABLISHMENT_TYPE_LABELS.Apartment)}
                        />
                        <ApartnentType
                          title="Homes"
                          description="Apartments, holiday homes, villas and more."
                          onClick={() => startWizard(ESTABLISHMENT_TYPE_LABELS.Villa)}
                        />
                        <ApartnentType
                          title="Hotel"
                          description="Hotels, guest houses, hostels, B&Bs, aparthotels, etc."
                          onClick={() => startWizard(ESTABLISHMENT_TYPE_LABELS.Hotel)}
                        />
                        <ApartnentType
                          title="Alternative"
                          description="Alternative accommodation: hostel, cottage, camping, luxury tents and more."
                          onClick={() => startWizard(null)}
                        />
                        </div>
                    </div>
                </div>
            </div>

            {/* Додатковий контент */}
            <div className="container" style={{ marginTop: 36 }}>
                <div className="row g-4">
                <div className="col-12">
                    <h5 className="fw-semibold" style={{ fontSize: 28 }}>
                    When will my property be listed?
                    </h5>                    
                    <p className="mb-0 text-muted" style={{ maxWidth: 1100, marginTop: 30 }}>
                        Once you have completed your registration, you will be able to make your property
                        available for booking on our site. We may require verification of your property
                        before you start accepting bookings. While we are checking the information, you can
                        familiarize yourself with the Extranet and prepare to welcome your first guests.
                    </p>                    
                </div>

                <div className="col-12">
                    <h5 className="fw-semibold" style={{ fontSize: 28 }}>
                    What should I do if a guest damages my property?
                    </h5>                   
                    <p className="mb-0 text-muted" style={{ maxWidth: 1100, marginTop: 30 }}>
                        Property owners may charge guests a damage deposit to cover the cost of repairs if
                        necessary. This helps ensure that guests treat your property with care. If something
                        goes wrong, you can report it to our team using the “Report Guest Abuse” feature.
                    </p>                   
                </div>                    
            </div>
        </div>

    </div>
    
  );
}
