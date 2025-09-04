import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Embroidery from './pages/Embroidery'
import Clients from './pages/Clients'
import CustomLogoDesign from './pages/CustomLogoDesign'
import CustomLogoRequest from './pages/CustomLogoRequest'
import CustomEmbroideryRequest from './pages/CustomEmbroideryRequest'
import CustomDesignOrder from './pages/CustomDesignOrder'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import CartSidebar from './components/CartSidebar'




// Layout component to conditionally render navbar and footer
function Layout({ children }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <div className="min-h-screen">
        {children}
        <Toaster position="top-right" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/embroidery" element={<Embroidery />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/custom-logo-design" element={<CustomLogoDesign />} />
              <Route path="/custom-logo-request" element={<CustomLogoRequest />} />
              <Route path="/custom-embroidery-request" element={<CustomEmbroideryRequest />} />
              <Route path="/custom-design-order" element={<CustomDesignOrder />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
