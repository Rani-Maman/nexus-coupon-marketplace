import type { PurchaseResponse } from "../api/client";

interface Props {
  result: PurchaseResponse;
  onClose: () => void;
}

export function PurchaseModal({ result, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Purchase Successful!</h3>
        <p>Price paid: <strong>${result.final_price.toFixed(2)}</strong></p>
        <div className="coupon-value">
          <label>Your coupon {result.value_type === "IMAGE" ? "image" : "code"}:</label>
          {result.value_type === "IMAGE" ? (
            <img src={result.value} alt="Coupon" className="coupon-image" />
          ) : (
            <code className="coupon-code">{result.value}</code>
          )}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
