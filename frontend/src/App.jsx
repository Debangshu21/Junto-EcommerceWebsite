import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage.jsx";
import PurchaseCancelPage from "./pages/PurchaseCancelPage.jsx";

import Navbar from "./components/Navbar.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx"
import { useUserStore } from "./stores/useUserStore.js";
import { useCartStore } from "./stores/useCartStore.js";


function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  // checks authentication of user such that if authenticated then redirects to homepage if trying to visit login page
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // fetches the cart items from the backend right after logged in or signed up
  useEffect(() => {
    // if user is not authenticated then return
    if (!user) {
      return;
    }
    getCartItems()
  }, [getCartItems, user]);

  // replaces the flicker effect of going from login/signup page to homepage with a loading spinner if user is authenticated
  if (checkingAuth) return <LoadingSpinner />;


  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">

      {/* Background gradient (greenish) */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
        </div>
      </div>

      <div className="relative z-50 pt-20">

        <Navbar />

        <Routes>
          {/* Route to home page */}
          <Route path="/" element={<HomePage />} />

          {/* Route to signup page */}
          {/* if user is not authenticated then go to signup page else home page */}
          <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to="/" />} />

          {/* Route to login page */}
          {/* if user is authenticated then go to home page else login page */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

          {/* Route to admin page */}
          {/* if user role is admin then go to admin page else login page */}
          <Route path="/secret-dashboard" element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />} />

          {/* Route to category page */}
          <Route path='/category/:category' element={<CategoryPage />} />

          {/* Route to cart page */}
          {/* if user is authenticated then go to cart page else login page */}
          <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />

          {/* Route to purchase success page after successful checkout */}
          <Route path='/purchase-success' element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />} />

          {/* Route to purchase cancel page after unsuccessful checkout */}
          <Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
        </Routes>

        <Toaster />
      </div>
    </div>
  );
};

export default App;