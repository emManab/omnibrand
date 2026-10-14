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
import { HelpPage } from "@/pages/Help";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminGuard } from "@/pages/admin/AdminGuard";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { ProductsPage } from "@/pages/admin/ProductsPage";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { InventoryPage } from "@/pages/admin/InventoryPage";
import { BannersPage } from "@/pages/admin/BannersPage";
import { OrdersPage } from "@/pages/admin/OrdersPage";
import { CustomersPage } from "@/pages/admin/CustomersPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { ProfilePage } from "@/pages/admin/ProfilePage";
import { useAuth } from "@/store/auth";
import { useRealtimeContentSync } from "@/lib/queries";

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useRealtimeContentSync();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <Routes>
        {/* Storefront routes with public Header and Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/editor/:slug" element={<EditorPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin routes with AdminGuard and AdminLayout */}
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
