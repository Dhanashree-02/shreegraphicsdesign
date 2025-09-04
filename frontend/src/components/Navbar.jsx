import { useState, useCallback, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
// import Logo from '../assets/FooterLogo.png'
import Logo from '../assets/shreegraphics.png'


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const { getCartItemsCount, toggleCart } = useCart()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [logout, navigate])

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const navigation = [
    { name: 'Home', href: '/' },
    {
      name: 'Products',
      href: '/products',
      dropdown: [
        {
          name: 'Apparels',
          href: '/products?category=apparels',
          submenu: [
            { name: 'All Apparels', href: '/products?category=apparels' },
            { name: 'Cap', href: '/products?category=apparels&subcategory=cap' },
            { name: 'Jackets', href: '/products?category=apparels&subcategory=jackets' },
            { name: 'Sweatshirt', href: '/products?category=apparels&subcategory=sweatshirt' },
            { name: 'Denim Shirt', href: '/products?category=apparels&subcategory=denim-shirt' },
            { name: 'Windcheaters', href: '/products?category=apparels&subcategory=windcheaters' }
          ]
        },
        {
          name: 'Embroidery',
          href: '/products?category=embroidery',
          submenu: [
            { name: 'All Embroidery', href: '/products?category=embroidery' },
            { name: 'Logo Embroidery', href: '/products?category=embroidery&subcategory=logo-embroidery' },
            { name: 'Text Embroidery', href: '/products?category=embroidery&subcategory=text-embroidery' },
            { name: 'Patches', href: '/products?category=embroidery&subcategory=patches' },
            { name: 'Custom Embroidery', href: '/products?category=embroidery&subcategory=custom-embroidery' },
            { name: 'Monogramming', href: '/products?category=embroidery&subcategory=monogramming' },
            { name: 'Badge Embroidery', href: '/products?category=embroidery&subcategory=badge-embroidery' }
          ]
        },
        {
          name: 'Travels',
          href: '/products?category=travels',
          submenu: [
            { name: 'All Travel Items', href: '/products?category=travels' },
            { name: 'Hand Bag', href: '/products?category=travels&subcategory=hand-bag' },
            { name: 'Strolley Bags', href: '/products?category=travels&subcategory=strolley-bags' },
            { name: 'Travel Bags', href: '/products?category=travels&subcategory=travel-bags' },
            { name: 'Back Packs', href: '/products?category=travels&subcategory=back-packs' },
            { name: 'Laptop Bags', href: '/products?category=travels&subcategory=laptop-bags' }
          ]
        },
        {
          name: 'Leather',
          href: '/products?category=leather',
          submenu: [
            { name: 'All Leather Items', href: '/products?category=leather' },
            { name: 'Office Bags', href: '/products?category=leather&subcategory=office-bags' },
            { name: 'Wallets', href: '/products?category=leather&subcategory=wallets' }
          ]
        },
        {
          name: 'Uniforms',
          href: '/products?category=uniforms',
          submenu: [
            { name: 'All Uniforms', href: '/products?category=uniforms' },
            { name: 'School Uniforms', href: '/products?category=uniforms&subcategory=school-uniforms' },
            { name: 'Corporate', href: '/products?category=uniforms&subcategory=corporate' }
          ]
        },
        {
          name: 'Design Services',
          href: '/products?category=design-services',
          submenu: [
            { name: 'All Design Services', href: '/products?category=design-services' },
            { name: 'Logo Design', href: '/products?category=design-services&subcategory=logo-design' },
            { name: 'Branding', href: '/products?category=design-services&subcategory=branding' },
            { name: 'Print Design', href: '/products?category=design-services&subcategory=print-design' }
          ]
        }
      ]
    },
    {
      name: 'Services',
      href: '#',
      dropdown: [
        { name: 'Embroidery Services', href: '/embroidery' },
        { name: 'Custom Logo Design', href: '/custom-logo-design' },
        { name: 'Custom Design Orders', href: '/custom-design-order' },
        { name: 'Custom Embroidery Request', href: '/custom-embroidery-request' }
      ]
    },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={Logo}
              alt="Shree Graphics Logo"
              className="h-14 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl pattaya font-bold text-gray-900 ">
                Graphics Design
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                Your Imagination, Our Embroidery Stitches.
              </span>
            </div>
          </Link>



          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              item.dropdown ? (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className="flex items-center text-gray-700 hover:text-primary-600 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-primary-50 group"
                  >
                    {item.name}
                    <ChevronDownIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                  </Link>

                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="py-2">
                      {item.dropdown.map((subItem) => (
                        subItem.submenu ? (
                          <div key={subItem.name} className="relative group/submenu">
                            <Link
                              to={subItem.href}
                              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                            >
                              {subItem.name}
                              <ChevronDownIcon className="ml-2 h-4 w-4 rotate-[-90deg] transition-transform duration-200 group-hover/submenu:rotate-[-180deg]" />
                            </Link>
                            {/* Submenu */}
                            <div className="absolute left-full top-0 ml-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-all duration-300 transform translate-x-2 group-hover/submenu:translate-x-0 z-50">
                              <div className="py-2">
                                {subItem.submenu.map((subSubItem) => (
                                  <Link
                                    key={subSubItem.name}
                                    to={subSubItem.href}
                                    className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                                  >
                                    {subSubItem.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                          >
                            {subItem.name}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-primary-50"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 rounded-xl hover:bg-primary-50 group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={`Shopping cart with ${getCartItemsCount()} items`}
            >
              <ShoppingCartIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold shadow-lg animate-pulse" aria-hidden="true">
                  {getCartItemsCount()}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-all duration-300 p-2 rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-expanded="false"
                  aria-haspopup="true"
                  aria-label={`User menu for ${user?.name}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-md">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold">{user?.name}</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                    >
                      👤 Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                    >
                      📦 Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-100 my-2"></div>
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          ⚙️ Admin Dashboard
                        </Link>
                        <Link
                          to="/clients"
                          className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 rounded-lg mx-2"
                        >
                          👥 Client Management
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 rounded-lg mx-2"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-primary-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={handleMenuToggle}
              className="md:hidden p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 transform rotate-180 transition-transform duration-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 rounded-xl transition-all duration-300"
                  onClick={handleMenuClose}
                >
                  {item.name}
                </Link>
                {item.dropdown && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-primary-100 pl-4">
                    {item.dropdown.map((subItem) => (
                      <div key={subItem.name}>
                        <Link
                          to={subItem.href}
                          className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 rounded-lg transition-all duration-300"
                          onClick={handleMenuClose}
                        >
                          {subItem.name}
                        </Link>
                        {subItem.submenu && (
                          <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                            {subItem.submenu.map((subSubItem) => (
                              <Link
                                key={subSubItem.name}
                                to={subSubItem.href}
                                className="block px-3 py-2 text-xs font-medium text-gray-500 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 rounded-lg transition-all duration-300"
                                onClick={handleMenuClose}
                              >
                                {subSubItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!isAuthenticated && (
              <>
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 rounded-xl transition-all duration-300 mb-2"
                    onClick={handleMenuClose}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 text-base font-semibold text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 rounded-xl transition-all duration-300 shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default memo(Navbar)