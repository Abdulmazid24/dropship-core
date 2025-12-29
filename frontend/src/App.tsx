import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import api from './services/api';

// Pages (will create these next)
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  const { isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    // Check if user is still authenticated on app load
    const verifyAuth = async () => {
      if (isAuthenticated) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.data.user);
        } catch (error) {
          logout();
        }
      }
    };

    verifyAuth();
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
}

export default App;
