import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [searchParams] = useSearchParams()
  const { addToCart } = useCart()

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'apparels', label: 'Apparels' },
    { value: 'travels', label: 'Travels' },
    { value: 'leather', label: 'Leather' },
    { value: 'uniforms', label: 'Uniforms' },
    { value: 'embroidery', label: 'Embroidery' },
    { value: 'design-services', label: 'Design Services' }
  ]

  const subcategories = {
    apparels: [
      { value: 'all', label: 'All Apparels' },
      { value: 'cap', label: 'Cap' },
      { value: 'jackets', label: 'Jackets' },
      { value: 'sweatshirt', label: 'Sweatshirt' },
      { value: 'denim-shirt', label: 'Denim Shirt' },
      { value: 'windcheaters', label: 'Windcheaters' }
    ],
    travels: [
      { value: 'all', label: 'All Travel Items' },
      { value: 'hand-bag', label: 'Hand Bag' },
      { value: 'strolley-bags', label: 'Strolley Bags' },
      { value: 'travel-bags', label: 'Travel Bags' },
      { value: 'back-packs', label: 'Back Packs' },
      { value: 'laptop-bags', label: 'Laptop Bags' }
    ],
    leather: [
      { value: 'all', label: 'All Leather Items' },
      { value: 'office-bags', label: 'Office Bags' },
      { value: 'wallets', label: 'Wallets' }
    ],
    uniforms: [
      { value: 'all', label: 'All Uniforms' },
      { value: 'school-uniforms', label: 'School Uniforms' },
      { value: 'corporate', label: 'Corporate' }
    ],
    embroidery: [
      { value: 'all', label: 'All Embroidery' },
      { value: 'logo-embroidery', label: 'Logo Embroidery' },
      { value: 'text-embroidery', label: 'Text Embroidery' },
      { value: 'custom-patches', label: 'Custom Patches' },
      { value: 'monogramming', label: 'Monogramming' },
      { value: 'applique', label: 'Appliqué Work' },
      { value: 'thread-work', label: 'Thread Work' },
      { value: 'beadwork', label: 'Beadwork' },
      { value: 'sequin-work', label: 'Sequin Work' },
      { value: 'machine-embroidery', label: 'Machine Embroidery' },
      { value: 'hand-embroidery', label: 'Hand Embroidery' }
    ],
    'design-services': [
      { value: 'all', label: 'All Design Services' },
      { value: 'logo-design', label: 'Logo Design' },
      { value: 'business-card', label: 'Business Card' },
      { value: 'brochure', label: 'Brochure' },
      { value: 'custom-design', label: 'Custom Design' }
    ]
  }

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: '₹0 - ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000+', label: '₹2000+' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ]

  // Read URL parameters on component mount
  useEffect(() => {
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    
    if (category) {
      setSelectedCategory(category)
    }
    if (subcategory) {
      setSelectedSubcategory(subcategory)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory
    
    let matchesPrice = true
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''))
      const productPrice = product.price?.base || product.price || 0
      if (max) {
        matchesPrice = productPrice >= parseInt(min) && productPrice <= parseInt(max)
      } else {
        matchesPrice = productPrice >= parseInt(min)
      }
    }
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        const priceA = a.price?.base || a.price || 0
        const priceB = b.price?.base || b.price || 0
        return priceA - priceB
      case 'price-high':
        const priceA2 = a.price?.base || a.price || 0
        const priceB2 = b.price?.base || b.price || 0
        return priceB2 - priceA2
      case 'popular':
        return (b.rating?.average || b.rating || 0) - (a.rating?.average || a.rating || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600">
            Discover our collection of custom logo designs, embroidery, and branding solutions
          </p>
        </div>

        {/* Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden lg:sticky lg:top-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-primary-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FunnelIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold text-primary-900">Filters</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                      setSelectedSubcategory('all')
                      setPriceRange('all')
                      setSortBy('name')
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1 rounded-full hover:bg-primary-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    🔍 Search Products
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    🏷️ Categories
                  </label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.value}
                        onClick={() => {
                          setSelectedCategory(category.value)
                          setSelectedSubcategory('all')
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.value
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategories */}
                {selectedCategory !== 'all' && subcategories[selectedCategory] && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📂 Subcategories
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {subcategories[selectedCategory].map(subcategory => (
                        <button
                          key={subcategory.value}
                          onClick={() => setSelectedSubcategory(subcategory.value)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedSubcategory === subcategory.value
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md transform scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                          }`}
                        >
                          {subcategory.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                 {/* Price Range */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-800 mb-3">
                     💰 Price Range
                   </label>
                   <div className="space-y-2">
                     {priceRanges.map(range => (
                       <label key={range.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                         <input
                           type="radio"
                           name="priceRange"
                           value={range.value}
                           checked={priceRange === range.value}
                           onChange={(e) => setPriceRange(e.target.value)}
                           className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                         />
                         <span className="ml-3 text-sm font-medium text-gray-700">{range.label}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* Sort Options */}
                 <div>
                   <label className="block text-sm font-semibold text-gray-800 mb-3">
                     🔄 Sort By
                   </label>
                   <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                   >
                     {sortOptions.map(option => (
                       <option key={option.value} value={option.value}>
                         {option.label}
                       </option>
                     ))}
                   </select>
                 </div>

                 {/* Active Filters */}
                 {(searchTerm || selectedCategory !== 'all' || selectedSubcategory !== 'all' || priceRange !== 'all') && (
                   <div className="pt-6 border-t border-gray-200">
                     <label className="block text-sm font-semibold text-gray-800 mb-3">
                       🏃‍♂️ Active Filters
                     </label>
                     <div className="flex flex-wrap gap-2">
                       {searchTerm && (
                         <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                           🔍 Search: {searchTerm}
                           <button
                             onClick={() => setSearchTerm('')}
                             className="ml-2 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                           >
                             <XMarkIcon className="h-3 w-3" />
                           </button>
                         </span>
                       )}
                       {selectedCategory !== 'all' && (
                         <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                           🏷️ {categories.find(cat => cat.value === selectedCategory)?.label}
                           <button
                             onClick={() => {
                               setSelectedCategory('all')
                               setSelectedSubcategory('all')
                             }}
                             className="ml-2 hover:bg-green-300 rounded-full p-0.5 transition-colors"
                           >
                             <XMarkIcon className="h-3 w-3" />
                           </button>
                         </span>
                       )}
                       {selectedSubcategory !== 'all' && subcategories[selectedCategory] && (
                         <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                           📂 {subcategories[selectedCategory].find(sub => sub.value === selectedSubcategory)?.label}
                           <button
                             onClick={() => setSelectedSubcategory('all')}
                             className="ml-2 hover:bg-purple-300 rounded-full p-0.5 transition-colors"
                           >
                             <XMarkIcon className="h-3 w-3" />
                           </button>
                         </span>
                       )}
                       {priceRange !== 'all' && (
                         <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                           💰 {priceRanges.find(range => range.value === priceRange)?.label}
                           <button
                             onClick={() => setPriceRange('all')}
                             className="ml-2 hover:bg-yellow-300 rounded-full p-0.5 transition-colors"
                           >
                             <XMarkIcon className="h-3 w-3" />
                           </button>
                         </span>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Results Count */}
                 <div className="pt-6 border-t border-gray-200">
                   <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                     <div className="flex items-center justify-center text-primary-800">
                       <FunnelIcon className="h-5 w-5 mr-2" />
                       <span className="font-bold text-lg">{sortedProducts.length}</span>
                       <span className="ml-2 text-sm font-medium">
                         {sortedProducts.length === 1 ? 'product found' : 'products found'}
                       </span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="card overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.images[0]?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'}
                  alt={product.images[0]?.alt || product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-semibold text-primary-600">
                  ₹{product.price?.base || product.price || 0}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {product.rating?.average || 0} ({product.rating?.count || 0})
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {product.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products