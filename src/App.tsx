import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { Catalog } from "@/pages/Catalog";
import { ProductPage } from "@/pages/Product";
import { EditorPage } from "@/pages/Editor";
import { CartPage } from "@/pages/Cart";
import { CheckoutPage } from "@/pages/Checkout";
import { LoginPage } from "@/pages/Login";
import { AccountPage } from "@/pages/Account";
import { AdminPage } from "@/pages/Admin";
import { HelpPage } from "@/pages/Help";
import { useAuth } from "@/store/auth";

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/editor/:slug" element={<EditorPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
