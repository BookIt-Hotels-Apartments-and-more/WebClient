import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../api/userApi";
import { getAllEstablishments, deleteEstablishment } from "../../api/establishmentsApi";
import {getAllBookings, deleteBooking} from "../../api/bookingApi";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showHotels, setShowHotels] = useState(true);
  const [showBookings, setShowBookings] = useState(true);


  const loadData = async () => {
    try {
      // const u = await getAllUsers();
      // setUsers(u);

      const e = await getAllEstablishments();
      setEstablishments(e);
      const b = await getAllBookings();
      setBookings(b);
    } catch (err) {
      console.error("❌ Помилка завантаження:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (confirm("Delete user?")) {
      await deleteUser(id);
      loadData();
    }
  };

  const handleDeleteEstablishment = async (id) => {
    if (confirm("Delete hotel?")) {
      await deleteEstablishment(id);
      loadData();
    }
  };

  return (
    <div className="container mt-4">
      <h2>🛠️ Admin panel</h2>

      <hr />
      <h4>👥 Users</h4>
      {users.length === 0 ? (
        <p className="text-muted">There are no users</p>
      ) : (
        <ul className="list-group mb-4">
          {users.map((u) => (
            <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                🧑 {u.username} ({u.email}) — <strong>{u.role}</strong>
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />
        <h4>🏨 Hotels</h4>
          <button
            className="btn btn-sm btn-outline-secondary mb-2"
            onClick={() => setShowHotels((v) => !v)}
          >
            {showHotels ? "Hide all hotels" : "Show all hotels"}
          </button>
          {showHotels && (
            establishments.length === 0 ? (
              <p className="text-muted">There are no hotels</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Description</th>
                      <th>Owner Name</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {establishments.map((e) => (
                      <tr key={e.id}>
                        <td>{e.name}</td>
                        <td>{e.address}</td>
                        <td className="small">{e.description}</td>
                        <td>{e.owner?.username || <span className="text-muted">—</span>}</td>
                        <td>{e.rating ?? <span className="text-muted">—</span>}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => window.open(`/hotels/${e.id}`, "_blank")}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteEstablishment(e.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

        <hr />
          <h4>📅 Bookings</h4>
            <button
              className="btn btn-sm btn-outline-secondary mb-2"
              onClick={() => setShowBookings((v) => !v)}
            >
              {showBookings ? "Hide all bookings" : "Show all bookings"}
            </button>
            {showBookings && (
              bookings.length === 0 ? (
                <p className="text-muted">There are no bookings</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Apartment</th>
                        <th>Date From</th>
                        <th>Date To</th>
                        <th>Checked In</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td>{b.id}</td>
                          <td>{b.customer?.username || <span className="text-muted">—</span>}</td>
                          <td>{b.apartment?.name || <span className="text-muted">—</span>}</td>
                          <td>{b.dateFrom?.split("T")[0]}</td>
                          <td>{b.dateTo?.split("T")[0]}</td>
                          <td>
                            {b.isCheckedIn ? (
                              <span className="badge bg-success">Yes</span>
                            ) : (
                              <span className="badge bg-secondary">No</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteBooking(b.id).then(loadData)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
    </div>
  );
};

export default AdminPanel;
