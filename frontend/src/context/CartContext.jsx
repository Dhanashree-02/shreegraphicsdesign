import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, customization = {}) => {
    // Extract the base price from the price object or use the price directly if it's a number
    const price = typeof product.price === 'object' ? product.price.base : product.price
    
    // Get product image with fallback for placeholder URLs
    const firstImage = product.images && product.images[0]
    const imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage?.url || '')
    const productImage = imageUrl && imageUrl.startsWith('http') 
      ? imageUrl 
      : 'https://via.placeholder.com/150x150/e5e7eb/6b7280?text=Product'
    
    const cartItem = {
      id: `${product._id}-${Date.now()}`,
      productId: product._id,
      name: product.name,
      price: price,
      image: productImage,
      customization,
      quantity: 1
    }

    setCartItems(prev => [...prev, cartItem])
    toast.success('Added to cart!')
  }

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
    toast.success('Removed from cart')
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    toast.success('Cart cleared')
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const toggleCart = () => {
    setIsOpen(!isOpen)
  }

  const getCartSubtotal = () => {
    return getCartTotal()
  }

  const getTax = () => {
    return getCartSubtotal() * 0.1 // 10% tax
  }

  const getShipping = () => {
    return getCartSubtotal() > 500 ? 0 : 50 // Free shipping over ₹500
  }

  const getFinalTotal = () => {
    return getCartSubtotal() + getTax() + getShipping()
  }

  const setCartOpen = (open) => {
    setIsOpen(open)
  }

  const value = {
    items: cartItems,
    cartItems,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartSubtotal,
    getTax,
    getShipping,
    getFinalTotal,
    toggleCart,
    setCartOpen
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}