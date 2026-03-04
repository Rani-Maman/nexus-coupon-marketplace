import type { PublicProduct } from "../api/client";

interface Props {
  product: PublicProduct;
  onPurchase: (id: string) => void;
  purchasing: boolean;
}

export function CouponCard({ product, onPurchase, purchasing }: Props) {
  return (
    <div className="coupon-card">
      <img src={product.image_url} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="price">${product.price.toFixed(2)}</div>
      <button
        onClick={() => onPurchase(product.id)}
        disabled={purchasing}
      >
        {purchasing ? "Purchasing..." : "Buy Now"}
      </button>
    </div>
  );
}
