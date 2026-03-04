import { useState, useEffect } from "react";
import { customerApi } from "../api/client";
import type { PublicProduct, PurchaseResponse } from "../api/client";
import { CouponCard } from "../components/CouponCard";
import { PurchaseModal } from "../components/PurchaseModal";

export function CustomerPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] =
    useState<PurchaseResponse | null>(null);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      const data = await customerApi.listProducts();
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

  const handlePurchase = async (id: string) => {
    setPurchasingId(id);
    setError("");
    try {
      const result = await customerApi.purchase(id);
      setPurchaseResult(result);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div>
      <h2>Available Coupons</h2>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading coupons...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h3>No coupons available</h3>
          <p>Check back later for new deals!</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <CouponCard
              key={p.id}
              product={p}
              onPurchase={handlePurchase}
              purchasing={purchasingId === p.id}
            />
          ))}
        </div>
      )}
      {purchaseResult && (
        <PurchaseModal
          result={purchaseResult}
          onClose={() => setPurchaseResult(null)}
        />
      )}
    </div>
  );
}
