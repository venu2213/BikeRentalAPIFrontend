import { useEffect, useState } from "react";
import "./index.css";

const API = "http://localhost:5555/bikerent";

const emptyForm = {
  customerName: "",
  customerPhone: "",
  bikeNumber: "",
  bikeModel: "",
  rentForHour: "",
  noofHours: "",
  amount: "",
  rentalStatus: "BOOKED",
};

function App() {
  const [rentals, setRentals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadRentals() {
    setLoading(true);

    try {
      const response = await fetch(`${API}/detailsall`);

      if (!response.ok) {
        throw new Error("Could not load rental details");
      }

      const data = await response.json();
      setRentals(data);
    } catch (error) {
      setMessage(
        "Unable to connect. Check whether Spring Boot is running on port 8080."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRentals();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = { ...previous, [name]: value };

      if (name === "rentForHour" || name === "noofHours") {
        updated.amount =
          Number(updated.rentForHour || 0) *
          Number(updated.noofHours || 0);
      }

      return updated;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      rentForHour: Number(form.rentForHour),
      noofHours: Number(form.noofHours),
      amount: Number(form.amount),
    };

    const isEditing = editId !== null;
    const url = isEditing
      ? `${API}/update/${editId}`
      : `${API}/add`;

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not save the rental");
      }

      setMessage(
        isEditing
          ? "Rental updated successfully!"
          : "Rental added successfully!"
      );

      setForm({ ...emptyForm });
      setEditId(null);
      await loadRentals();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(bike) {
    setEditId(bike.id);

    setForm({
      customerName: bike.customerName ?? "",
      customerPhone: bike.customerPhone ?? "",
      bikeNumber: bike.bikeNumber ?? "",
      bikeModel: bike.bikeModel ?? "",
      rentForHour: bike.rentForHour ?? "",
      noofHours: bike.noofHours ?? "",
      amount: bike.amount ?? "",
      rentalStatus: bike.rentalStatus ?? "BOOKED",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this rental?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete the rental");
      }

      setMessage("Rental deleted successfully!");
      await loadRentals();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ ...emptyForm });
    setMessage("");
  }

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">BIKE RENTAL MANAGEMENT</p>
          <h1>Rental Dashboard</h1>
          <p>Manage customers, bikes, and rental bookings.</p>
        </div>

        <div className="total-card">
          <span>Total rentals</span>
          <strong>{rentals.length}</strong>
        </div>
      </header>

      {message && (
        <div className="message" role="status">
          {message}
          <button
            className="close-message"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="panel">
        <h2>{editId !== null ? "Edit Rental" : "Add New Rental"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Customer Name
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Customer Phone
              <input
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Bike Number
              <input
                name="bikeNumber"
                value={form.bikeNumber}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Bike Model
              <input
                name="bikeModel"
                value={form.bikeModel}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Rent Per Hour
              <input
                type="number"
                name="rentForHour"
                min="0"
                step="0.01"
                value={form.rentForHour}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Number of Hours
              <input
                type="number"
                name="noofHours"
                min="1"
                step="1"
                value={form.noofHours}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Total Amount
              <input
                type="number"
                name="amount"
                value={form.amount}
                readOnly
              />
            </label>

            <label>
              Rental Status
              <select
                name="rentalStatus"
                value={form.rentalStatus}
                onChange={handleChange}
              >
                <option value="BOOKED">Booked</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              {editId !== null ? "Update Rental" : "Add Rental"}
            </button>

            {editId !== null && (
              <button
                className="secondary-button"
                type="button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-heading">
          <div>
            <h2>All Rentals</h2>
            <p>Customer and bike rental records from Spring Boot.</p>
          </div>

          <button className="secondary-button" onClick={loadRentals}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading rentals...</p>
        ) : rentals.length === 0 ? (
          <p>No rentals found. Add your first rental above.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Bike</th>
                  <th>Hours</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rentals.map((bike) => (
                  <tr key={bike.id}>
                    <td>{bike.id}</td>
                    <td>{bike.customerName}</td>
                    <td>{bike.customerPhone}</td>
                    <td>
                      {bike.bikeModel}
                      <small>{bike.bikeNumber}</small>
                    </td>
                    <td>{bike.noofHours}</td>
                    <td>{Number(bike.amount).toFixed(2)}</td>
                    <td>
                      <span className="status">
                        {bike.rentalStatus}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(bike)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(bike.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;