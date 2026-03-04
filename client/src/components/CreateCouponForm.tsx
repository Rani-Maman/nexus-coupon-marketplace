import { useState } from "react";
import { adminApi } from "../api/client";
import type { CreateProductInput } from "../api/client";

interface Props {
  onCreated: () => void;
}

export function CreateCouponForm({ onCreated }: Props) {
  const [form, setForm] = useState<CreateProductInput>({
    name: "",
    description: "",
    image_url: "",
    cost_price: 0,
    margin_percentage: 0,
    value_type: "STRING",
    value: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminApi.createProduct(form);
      setForm({
        name: "",
        description: "",
        image_url: "",
        cost_price: 0,
        margin_percentage: 0,
        value_type: "STRING",
        value: "",
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-form">
      <h3>Create Coupon</h3>
      {error && <div className="error">{error}</div>}
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <input
        placeholder="Image URL"
        value={form.image_url}
        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        required
      />
      <div className="form-row">
        <input
          type="number"
          placeholder="Cost Price"
          value={form.cost_price || ""}
          onChange={(e) =>
            setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })
          }
          min="0"
          step="0.01"
          required
        />
        <input
          type="number"
          placeholder="Margin %"
          value={form.margin_percentage || ""}
          onChange={(e) =>
            setForm({
              ...form,
              margin_percentage: parseFloat(e.target.value) || 0,
            })
          }
          min="0"
          step="0.01"
          required
        />
      </div>
      <select
        value={form.value_type}
        onChange={(e) =>
          setForm({
            ...form,
            value_type: e.target.value as "STRING" | "IMAGE",
          })
        }
      >
        <option value="STRING">String (Code)</option>
        <option value="IMAGE">Image (URL)</option>
      </select>
      <input
        placeholder="Coupon Value (code or image URL)"
        value={form.value}
        onChange={(e) => setForm({ ...form, value: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Coupon"}
      </button>
    </form>
  );
}
