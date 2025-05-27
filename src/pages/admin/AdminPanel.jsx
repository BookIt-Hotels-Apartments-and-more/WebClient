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
    if (confirm("Видалити користувача?")) {
      await deleteUser(id);
      loadData();
    }
  };

  const handleDeleteEstablishment = async (id) => {
    if (confirm("Видалити готель?")) {
      await deleteEstablishment(id);
      loadData();
    }
  };

  return (
    <div className="container mt-4">
      <h2>🛠️ Адмін-панель</h2>

      <hr />
      <h4>👥 Користувачі</h4>
      {users.length === 0 ? (
        <p className="text-muted">Немає користувачів</p>
      ) : (
        <ul className="list-group mb-4">
          {users.map((u) => (
            <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                🧑 {u.username} ({u.email}) — <strong>{u.role}</strong>
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u.id)}>
                Видалити
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h4>🏨 Готелі</h4>
      {establishments.length === 0 ? (
        <p className="text-muted">Немає готелів</p>
      ) : (
        <ul className="list-group">
          {establishments.map((e) => (
            <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                🏨 {e.name} — {e.location}
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEstablishment(e.id)}>
                Видалити
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;
