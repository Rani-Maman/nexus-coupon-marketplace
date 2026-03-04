const API_BASE = "/api/v1";

export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

export interface PurchaseResponse {
  product_id: string;
  final_price: number;
  value_type: "STRING" | "IMAGE";
  value: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  is_sold: boolean;
  value_type: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value_type: "STRING" | "IMAGE";
  value: string;
}

export interface ApiError {
  error_code: string;
  message: string;
}

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "admin-dev-token";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err: ApiError = await res.json();
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const customerApi = {
  listProducts: (): Promise<PublicProduct[]> =>
    fetch(`${API_BASE}/customer/products`).then((r) =>
      handleResponse<PublicProduct[]>(r)
    ),

  purchase: (id: string): Promise<PurchaseResponse> =>
    fetch(`${API_BASE}/customer/products/${id}/purchase`, {
      method: "POST",
    }).then((r) => handleResponse<PurchaseResponse>(r)),
};

export const adminApi = {
  listProducts: (): Promise<AdminProduct[]> =>
    fetch(`${API_BASE}/admin/products`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    }).then((r) => handleResponse<AdminProduct[]>(r)),

  createProduct: (data: CreateProductInput): Promise<AdminProduct> =>
    fetch(`${API_BASE}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<AdminProduct>(r)),

  deleteProduct: (id: string): Promise<void> =>
    fetch(`${API_BASE}/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    }),
};
