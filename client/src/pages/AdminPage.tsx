import { useState, useEffect } from "react";
import { adminApi } from "../api/client";
import type { AdminProduct } from "../api/client";
import { CreateCouponForm } from "../components/CreateCouponForm";

export function AdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadProducts = async () => {
    try {
      const data = await adminApi.listProducts();
      setProducts(data);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await adminApi.deleteProduct(id);
      showToast("Coupon deleted successfully");
      loadProducts();
    } catch {
      setError("Failed to delete product");
    }
  };

  const handleCreated = () => {
    showToast("Coupon created successfully");
    loadProducts();
  };

  return (
    <div>
      <CreateCouponForm onCreated={handleCreated} />

      <h2>All Coupons ({products.length})</h2>
      {error && <div className="error">{error}</div>}
      {toast && <div className="toast">{toast}</div>}
      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No coupons yet</h3>
          <p>Create your first coupon using the form above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Margin %</th>
                <th>Sell Price</th>
                <th>Status</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.is_sold ? "sold" : ""}>
                  <td>{p.name}</td>
                  <td>${p.cost_price.toFixed(2)}</td>
                  <td>{p.margin_percentage}%</td>
                  <td>${p.minimum_sell_price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.is_sold ? "badge-sold" : "badge-available"}`}>
                      {p.is_sold ? "Sold" : "Available"}
                    </span>
                  </td>
                  <td className="value-cell">{p.value}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
