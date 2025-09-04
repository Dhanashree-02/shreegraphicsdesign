import { Link } from 'react-router-dom'
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid'
import { CheckCircleIcon, TruckIcon, ShieldCheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import ClientsCarousel from '../components/ClientsCarousel'


const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [displayedProducts, setDisplayedProducts] = useState(32)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedSubcategory, setSelectedSubcategory] = useState('All Products')
  const [sortBy, setSortBy] = useState('name-asc')

  // Dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false)

  // Refs for dropdown management
  const categoryDropdownRef = useRef(null)
  const subcategoryDropdownRef = useRef(null)
  const sortDropdownRef = useRef(null)
  const priceDropdownRef = useRef(null)

  // Categories with their subcategories
  const categoryData = {
    'All Categories': ['All Products'],
    'Apparels': ['T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Polo Shirts', 'Tank Tops'],
    'Travels': ['Backpacks', 'Travel Bags', 'Luggage', 'Duffel Bags', 'Laptop Bags'],
    'Leather': ['Wallets', 'Belts', 'Handbags', 'Briefcases', 'Leather Jackets'],
    'Uniforms': ['School Uniforms', 'Corporate Uniforms', 'Medical Uniforms', 'Security Uniforms'],
    'Design Services': ['Logo Design', 'Brand Identity', 'Business Cards', 'Brochures', 'Website Design'],
    'Embroidery': ['Logo Embroidery', 'Text Embroidery', 'Patches', 'Custom Embroidery', 'Monogramming'],
    'Others': ['Accessories', 'Promotional Items', 'Custom Products', 'Miscellaneous']
  }

  // Sort options
  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'newest', label: 'Newest First' },
    { value: 'featured', label: 'Featured First' }
  ]

  // Price range presets
  const priceRangePresets = [
    { label: 'Under ₹500', min: '', max: '500' },
    { label: '₹500 - ₹1000', min: '500', max: '1000' },
    { label: '₹1000 - ₹2000', min: '1000', max: '2000' },
    { label: '₹2000 - ₹5000', min: '2000', max: '5000' },
    { label: 'Above ₹5000', min: '5000', max: '' },
    { label: 'Custom Range', min: 'custom', max: 'custom' }
  ]


  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false)
      }
      if (subcategoryDropdownRef.current && !subcategoryDropdownRef.current.contains(event.target)) {
        setIsSubcategoryDropdownOpen(false)
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false)
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setIsPriceDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products?limit=1000')
        setProducts(response.data.products || response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Failed to fetch products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory('All Products')
  }, [selectedCategory])

  // Filter and sort products
  const filteredAndSortedProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'All Categories') {
      const categoryMatch = product.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
      if (!categoryMatch) return false
    }

    // Subcategory filter
    if (selectedSubcategory !== 'All Products') {
      const subcategoryMatch = product.subcategory?.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
        product.name?.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(selectedSubcategory.toLowerCase()))
      if (!subcategoryMatch) return false
    }

    // Search filter
    if (searchTerm) {
      const searchMatch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      if (!searchMatch) return false
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      const price = product.price?.base || 0
      if (priceRange.min && price < parseInt(priceRange.min)) return false
      if (priceRange.max && price > parseInt(priceRange.max)) return false
    }

    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '')
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '')
      case 'price-asc':
        return (a.price?.base || 0) - (b.price?.base || 0)
      case 'price-desc':
        return (b.price?.base || 0) - (a.price?.base || 0)
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case 'featured':
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      default:
        return 0
    }
  })

  const loadMoreProducts = () => {
    setDisplayedProducts(prev => prev + 12)
  }

  const clearFilters = () => {
    setSelectedCategory('All Categories')
    setSelectedSubcategory('All Products')
    setSearchTerm('')
    setPriceRange({ min: '', max: '' })
    setSortBy('name-asc')
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setIsSortDropdownOpen(false)
  }

  const handlePriceRangeSelect = (preset) => {
    if (preset.min === 'custom') {
      // Keep current custom values
      setIsPriceDropdownOpen(false)
      return
    }
    setPriceRange({ min: preset.min, max: preset.max })
    setIsPriceDropdownOpen(false)
  }

  const features = [
    {
      icon: CheckCircleIcon,
      title: 'Custom Designs',
      description: 'Unique logo designs tailored to your brand identity and vision.'
    },
    {
      icon: TruckIcon,
      title: 'Fast Delivery',
      description: 'Quick turnaround times without compromising on quality.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee with unlimited revisions.'
    }
  ]

  const categories = [
    {
      name: 'Logo Design',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Professional logo designs for your business',
      href: '/custom-logo-design'
    },
    {
      name: 'Embroidery',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Custom embroidery for apparel and accessories',
      href: '/embroidery'
    },
    {
      name: 'Leather Products',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Premium leather bags, wallets and accessories',
      href: '/products?category=leather'
    },
    {
      name: 'Uniforms',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'School and corporate uniform solutions',
      href: '/products?category=uniforms'
    },
    {
      name: 'Design Services',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Complete brand identity and design packages',
      href: '/products?category=design-services'
    }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      rating: 5,
      comment: 'Excellent work! The logo design exceeded my expectations. Highly recommended!'
    },
    {
      name: 'Priya Sharma',
      rating: 5,
      comment: 'Professional service and quick delivery. Very satisfied with the embroidery work.'
    },
    {
      name: 'Amit Patel',
      rating: 5,
      comment: 'Great attention to detail and creative designs. Will definitely use their services again.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Custom Embroidory Logo Designs That Make Your Brand Stand Out
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Professional logo design, embroidery, and branding services to elevate your business identity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Browse Designs
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/contact"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
                >
                  Get Custom Quote
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Logo Design Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Products
            </h2>
            <p className="text-lg text-gray-600">
              Discover our complete range of products and services
            </p>
          </div>

          {/* Enhanced Filter Section with Dropdowns */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Category Dropdown */}
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center justify-between w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <span className="block truncate">{selectedCategory}</span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {Object.keys(categoryData).map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category)
                          setIsCategoryDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedCategory === category ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subcategory Dropdown */}
              {selectedCategory !== 'All Categories' && (
                <div className="relative" ref={subcategoryDropdownRef}>
                  <button
                    onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                    className="flex items-center justify-between w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <span className="block truncate">{selectedSubcategory}</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isSubcategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSubcategoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <button
                        onClick={() => {
                          setSelectedSubcategory('All Products')
                          setIsSubcategoryDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedSubcategory === 'All Products' ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}`}
                      >
                        All Products
                      </button>
                      {categoryData[selectedCategory].slice(1).map((subcategory) => (
                        <button
                          key={subcategory}
                          onClick={() => {
                            setSelectedSubcategory(subcategory)
                            setIsSubcategoryDropdownOpen(false)
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedSubcategory === subcategory ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}`}
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center justify-between w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <span className="block truncate">
                    {sortOptions.find(option => option.value === sortBy)?.label || 'Sort by'}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${sortBy === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Dropdown */}
              <div className="relative" ref={priceDropdownRef}>
                <button
                  onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                  className="flex items-center justify-between w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <span className="block truncate">
                    {priceRange.min || priceRange.max ?
                      `₹${priceRange.min || '0'} - ₹${priceRange.max || '∞'}` :
                      'Price Range'
                    }
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isPriceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPriceDropdownOpen && (
                  <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {priceRangePresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handlePriceRangeSelect(preset)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-900"
                      >
                        {preset.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 p-4">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min ₹"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                        <span className="flex items-center text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Max ₹"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Results Count */}
            <div className="text-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{Math.min(displayedProducts, filteredAndSortedProducts.length)}</span> of <span className="font-semibold">{filteredAndSortedProducts.length}</span> products
                {selectedCategory !== 'All Categories' && (
                  <span> in <span className="font-semibold">{selectedCategory}</span></span>
                )}
                {selectedSubcategory !== 'All Products' && (
                  <span> → <span className="font-semibold">{selectedSubcategory}</span></span>
                )}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAndSortedProducts.slice(0, displayedProducts).map((product) => (
                  <div key={product._id} className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
                        alt={product.images?.[0]?.alt || product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.isFeatured && (
                        <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-primary-600">
                          ₹{product.price?.base || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.deliveryTime?.base || 5} days
                        </div>
                      </div>
                      <Link
                        to={`/products/${product._id}`}
                        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center block text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAndSortedProducts.length > displayedProducts && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreProducts}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors inline-flex items-center"
                  >
                    Load More Products
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              View All Products
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600">
              Explore our range of design and customization services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Link
                    to={category.href}
                    className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                  >
                    Explore
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ClientsCarousel Section*/}
      <ClientsCarousel />



      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Shree Graphics Design?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine creativity with professionalism to deliver exceptional design solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>





      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Perfect Logo?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Get started today and bring your brand vision to life
          </p>
          <Link
            to="/custom-logo-design/#reference-images-upload"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Designing
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home