import { Routes, Route } from "react-router-dom";
import Login from "./src/components/Login";
import Dashboard from "./src/components/Dashboard";
import "./App.css";
import { useDispatch } from "react-redux";
import AdminGuard from "./src/components/AdminGuard";
import { useEffect } from "react";
import Layout from "./src/components/Layout";
import { checkAuth } from "./src/store/authSlice";
import AddProduct from "./src/components/AddProduct";
import Product from "./src/components/Product";
import Test from "./src/components/Test";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Protected */}
      <Route element={<AdminGuard />}>
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <div className="App dark-mode-theme">
                <Test />
              </div>
            }
          />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/products" element={<Product />} />
        </Route>
      </Route>
    </Routes>
  );
}
