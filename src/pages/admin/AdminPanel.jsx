import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../../api/userApi";
import { getAllEstablishments } from "../../api/establishmentsApi";
import { fetchApartments } from "../../api/apartmentApi";
import { getAllBookings, deleteBooking } from "../../api/bookingApi";
import { getAllPayments } from "../../api/paymentApi";
import { getAllReviews } from "../../api/reviewApi";
import { PAYMENT_STATUS } from "../../utils/enums";
import { setUser } from "../../store/slices/userSlice";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {axiosInstance} from "../../api/axios";

const badgeByStatus = (status) => {
  switch (status) {
    case PAYMENT_STATUS.Completed: return <span className="badge bg-success">paid</span>;
    case PAYMENT_STATUS.Pending:   return <span className="badge bg-warning text-dark">pending</span>;
    case PAYMENT_STATUS.Failed:    return <span className="badge bg-danger">failed</span>;
    case PAYMENT_STATUS.Cancelled: return <span className="badge bg-secondary">cancelled</span>;
    default:                       return <span className="badge bg-light text-dark">—</span>;
  }
};

const paymentTypeLabel = (t) => t===0 ? "Cash" : t===1 ? "Mono" : t===2 ? "BankTransfer" : "—";

export default function AdminPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [active, setActive] = useState("payments");
  const [sortDesc, setSortDesc] = useState(true);

  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [apartments, setApts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);

  

  
  useEffect(() => { loadAll(); }, []);

  const sortedPayments = useMemo(() => {
    const copy = [...payments];
    copy.sort((a,b) => sortDesc ? (b.id - a.id) : (a.id - b.id));
    return copy;
  }, [payments, sortDesc]);

  const handleLogout = () => {
    dispatch(setUser(null));

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (axiosInstance?.defaults?.headers?.Authorization) {
      delete axiosInstance.defaults.headers.Authorization;
    }

    toast.success("You have been logged out", { autoClose: 2000 });
    navigate("/");
  };

  const toArr = (x) => Array.isArray(x) ? x : (x?.items ?? x ?? []);

  const loadAll = async () => {
    const [u, e, a, b, p] = await Promise.all([
      getAllUsers().catch((err) => { console.error("users:", err); return []; }),
      getAllEstablishments().catch((err) => { console.error("est:", err); return []; }),
      fetchApartments().catch((err) => { console.error("apts:", err); return []; }),
      getAllBookings().catch((err) => { console.error("bookings:", err); return []; }),
      getAllPayments().catch(err => { console.error("payments:", err); return []; }),
      getAllReviews().catch((err) => { console.error("reviews:", err); return []; }),
    ]);

    let r = [];
    try {
      r = await getAllReviews();
    } catch (err) {
      console.error("reviews:", err);
      r = [];
    }

    setUsers(toArr(u));
    setHotels(toArr(e));
    setApts(toArr(a));
    setBookings(toArr(b));
    setPayments(toArr(p));
    setReviews(toArr(r));
  };

  const bookingById = useMemo(() => {
    const m = new Map();
    bookings.forEach(b => m.set(b.id, b));
    return m;
  }, [bookings]);


  return (
    <div
        style={{
          minHeight: "100vh",
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(255,255,255,0.97) 0%,
              rgba(255,255,255,0.14) 40%,
              rgba(255,255,255,0) 80%
            ),
            url('/images/signin.png')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "60px 0 40px 0",
          marginTop: "-110px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: "32px 36px",
            width: "100%",
            maxWidth: "1800px",
            margin: "0 auto",
            marginTop: 100,
            boxShadow: "0 4px 28px 0 rgba(31, 38, 135, 0.11)",
          }}
        >

        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Admin Panel</h3>
            <button
              className="btn btn-danger btn-sm"
              style={{ borderRadius: 12, fontWeight: 600, minWidth: 120 }}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>


          {/* Tabs */}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item"><button className={`nav-link ${active==="users"?"active":""}`} onClick={()=>setActive("users")}>Users</button></li>            
            <li className="nav-item"><button className={`nav-link ${active==="hotels"?"active":""}`} onClick={()=>setActive("hotels")}>Establishment</button></li>
            <li className="nav-item"><button className={`nav-link ${active==="apartments"?"active":""}`} onClick={()=>setActive("apartments")}>Apartments</button></li>
            <li className="nav-item"><button className={`nav-link ${active==="bookings"?"active":""}`} onClick={()=>setActive("bookings")}>Bookings</button></li>
            <li className="nav-item"><button className={`nav-link ${active==="payments"?"active":""}`} onClick={()=>setActive("payments")}>Payments</button></li>
            <li className="nav-item"><button className={`nav-link ${active==="reviews"?"active":""}`} onClick={()=>setActive("reviews")}>Reviews</button></li>
          </ul>
          

          {/* Pane: Users */}
          {active==="users" && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                    </tr>
                  ))}
                  {users.length===0 && <tr><td colSpan={4} className="text-muted">There are no users</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Pane: Hotels */}
          {active==="hotels" && (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Address</th><th>Landlord</th><th>Rating</th></tr>
                </thead>
                  <tbody>
                    {(hotels ?? []).map(h => (
                      <tr key={h.id}>
                        <td>{h.id}</td>
                        <td>{h.name}</td>
                        <td>{h.geolocation?.address || "—"}</td>
                        <td>{h.owner?.username || "—"}</td>
                        <td>{h.rating?.generalRating != null ? Number(h.rating.generalRating).toFixed(1) : "—"}</td>
                      </tr>
                    ))}
                    {(!hotels || hotels.length===0) && (
                      <tr><td colSpan={5} className="text-muted">There are no hotels</td></tr>
                    )}
                  </tbody>
            </table>
          </div>
          )}

          {/* Pane: Apartments */}
          {active==="apartments" && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead><tr><th>ID</th><th>Name</th><th>Apartments</th><th>Price</th></tr></thead>
                <tbody>
                  {apartments.map(a=>(
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.name}</td>
                      <td>{a.establishment?.name || "—"}</td>
                      <td>{a.price != null ? `${a.price} UAH` : "—"}</td>
                    </tr>
                  ))}
                  {apartments.length===0 && <tr><td colSpan={4} className="text-muted">There are no numbers</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Pane: Bookings */}
          {active==="bookings" && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead><tr><th>ID</th><th>Tenant</th><th>Apartment</th><th>To</th><th>Out</th><th>Check-in</th><th></th></tr></thead>
                <tbody>
                  {bookings.map(b=>(
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.customer?.username || "—"}</td>
                      <td>{b.apartment?.name || "—"}</td>
                      <td>{b.dateFrom?.split("T")[0]}</td>
                      <td>{b.dateTo?.split("T")[0]}</td>
                      <td>{b.isCheckedIn ? <span className="badge bg-success">Yes</span> : <span className="badge bg-secondary">ні</span>}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteBooking(b.id).then(loadAll)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length===0 && <tr><td colSpan={7} className="text-muted">No reservations</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Pane: Payments */}
          {active==="payments" && (
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <label className="form-label mb-0 me-2">Sorted ID</label>
                  <div className="btn-group">
                    <button className={`btn btn-sm ${sortDesc? "btn-primary":"btn-outline-primary"}`} onClick={()=>setSortDesc(true)}>За спаданням (9 → 1)</button>
                    <button className={`btn btn-sm ${!sortDesc? "btn-primary":"btn-outline-primary"}`} onClick={()=>setSortDesc(false)}>За зростанням (1 → 9)</button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tenant</th>
                        <th>Apartment</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>PaidAt</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPayments.map(p => {
                        const b = bookingById.get(p.bookingId);
                        return (
                          <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{b?.customer?.username || "—"}</td>
                            <td>{b?.apartment?.name || "—"}</td>
                            <td>{paymentTypeLabel(p.type)}</td>
                            <td>{p.amount != null ? p.amount : "—"}</td>
                            <td>{badgeByStatus(p.status)}</td>
                            <td>{p.paidAt?.replace("T", " ").slice(0,19) || "—"}</td>
                            <td>
                              {p.invoiceUrl
                                ? <a href={p.invoiceUrl} target="_blank" rel="noreferrer">open</a>
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                      {sortedPayments.length===0 && (
                        <tr><td colSpan={8} className="text-muted">There are no payments</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-end">
                  <button className="btn btn-outline-primary" onClick={loadAll}>Update</button>
                </div>
              </div>
            </div>
          )}


          {/* Pane: Reviews */}
          {active==="reviews" && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr><th>ID</th><th>Tenant</th><th>Apartment</th><th>Rating</th><th>Created</th></tr>
                </thead>
                <tbody>
                  {(reviews ?? []).map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.booking?.customer?.username || r.author?.username || "—"}</td>
                      <td>{r.booking?.apartment?.name || "—"}</td>
                      <td>{typeof r.rating === "number" ? r.rating.toFixed(1) : "—"}</td>
                      <td>{r.createdAt?.replace("T", " ").slice(0,19) || "—"}</td>
                    </tr>
                  ))}
                  {(!reviews || reviews.length === 0) && (
                    <tr><td colSpan={5} className="text-muted">There are no reviews</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>   
    </div>    
  );
}
