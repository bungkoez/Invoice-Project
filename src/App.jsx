import { Routes, Route, Navigate } from "react-router-dom";
import Landingpage from "./Frontend/Landingpage";
import MainLayout from "./Frontend/MainLayout";
import Dashboard from "./Frontend/Dashboard";
import Order from "./Frontend/Order";
import Customer from "./Frontend/Customer";
import History from "./Frontend/History";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />

      <Route path="/app" element={<MainLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="order" element={<Order />} />
        <Route path="customer" element={<Customer />} />
        <Route path="order-history" element={<History />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}