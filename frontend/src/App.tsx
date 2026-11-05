import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

// Auth Pages
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Customer Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/dashboard/Orders';
import OrderDetail from './pages/dashboard/OrderDetail';
import Wishlist from './pages/dashboard/Wishlist';
import Profile from './pages/dashboard/Profile';
import Addresses from './pages/dashboard/Addresses';

// Admin Dashboard
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminBrands from './pages/admin/Brands';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';
import AdminTeam from './pages/admin/AdminTeam';
import AdminSettings from './pages/admin/Settings';

// Other Pages
import Compare from './pages/Compare';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import Contact from './pages/Contact';
import LaptopFinder from './pages/LaptopFinder';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Returns from './pages/Returns';
import NotFound from './pages/NotFound';

// Error Pages
import Forbidden from './pages/error/Forbidden';
import Unauthorized from './pages/error/Unauthorized';
import ServerError from './pages/error/ServerError';
import ServiceUnavailable from './pages/error/ServiceUnavailable';
import NetworkError from './pages/error/NetworkError';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const { isDarkMode, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/finder" element={<LaptopFinder />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Dedicated Error Pages */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/401" element={<Unauthorized />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="/503" element={<ServiceUnavailable />} />
        <Route path="/service-unavailable" element={<ServiceUnavailable />} />
        <Route path="/offline" element={<NetworkError />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      <Route path="/order-success/:orderId" element={<OrderSuccess />} />

      {/* Customer Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="profile" element={<Profile />} />
        <Route path="addresses" element={<Addresses />} />
      </Route>

      {/* Direct Orders alias */}
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OrderDetail />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

export default App;
