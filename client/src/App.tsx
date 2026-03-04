import { useState } from "react";
import { CustomerPage } from "./pages/CustomerPage";
import { AdminPage } from "./pages/AdminPage";
import "./App.css";

type Tab = "customer" | "admin";

function App() {
  const [tab, setTab] = useState<Tab>("customer");

  return (
    <div className="app">
      <header>
        <h1>Coupon Marketplace</h1>
        <nav>
          <button
            className={tab === "customer" ? "active" : ""}
            onClick={() => setTab("customer")}
          >
            Customer
          </button>
          <button
            className={tab === "admin" ? "active" : ""}
            onClick={() => setTab("admin")}
          >
            Admin
          </button>
        </nav>
      </header>
      <main>
        {tab === "customer" ? <CustomerPage /> : <AdminPage />}
      </main>
    </div>
  );
}

export default App;
