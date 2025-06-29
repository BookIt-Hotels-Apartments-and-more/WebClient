import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../api/userApi";
import { getAllEstablishments, deleteEstablishment } from "../../api/establishmentsApi";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [establishments, setEstablishments] = useState([]);

  const loadData = async () => {
    try {
      const u = await getAllUsers();
      setUsers(u);

      const e = await getAllEstablishments();
      setEstablishments(e);
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
      {establishments.length === 0 ? (
        <p className="text-muted">There are no hotels</p>
      ) : (
        <ul className="list-group">
          {establishments.map((e) => (
            <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                🏨 {e.name} — {e.location}
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEstablishment(e.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;
