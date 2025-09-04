import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, FunnelIcon, StarIcon, EyeIcon, ShoppingCartIcon, CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const CustomLogoDesign = () => {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showReferenceUpload, setShowReferenceUpload] = useState(false)
  const [referenceImages, setReferenceImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const { addToCart } = useCart()

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'modern', label: 'Modern' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'creative', label: 'Creative' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'bold', label: 'Bold' },
    { value: 'playful', label: 'Playful' },
    { value: 'professional', label: 'Professional' },
    { value: 'artistic', label: 'Artistic' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'typography', label: 'Typography' },
    { value: 'mascot', label: 'Mascot' },
    { value: 'emblem', label: 'Emblem' },
    { value: 'wordmark', label: 'Wordmark' },
    { value: 'combination', label: 'Combination' },
    { value: 'other', label: 'Other' }
  ]

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'food-beverage', label: 'Food & Beverage' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'non-profit', label: 'Non-Profit' },
    { value: 'government', label: 'Government' },
    { value: 'startup', label: 'Startup' },
    { value: 'other', label: 'Other' }
  ]

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-1000', label: '₹0 - ₹1,000' },
    { value: '1000-2500', label: '₹1,000 - ₹2,500' },
    { value: '2500-5000', label: '₹2,500 - ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000+', label: '₹10,000+' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ]

  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        if (selectedIndustry !== 'all') params.append('industry', selectedIndustry)
        if (sortBy) params.append('sortBy', sortBy)

        if (priceRange !== 'all') {
          const [min, max] = priceRange.split('-').map(p => p.replace('+', ''))
          if (min) params.append('minPrice', min)
          if (max) params.append('maxPrice', max)
        }

        const response = await axios.get(`http://localhost:5003/api/custom-logo-designs?${params.toString()}`)
        setDesigns(response.data.data || [])
      } catch (error) {
        console.error('Error fetching custom logo designs:', error)
        toast.error('Failed to fetch custom logo designs')
        setDesigns([])
      } finally {
        setLoading(false)
      }
    }

    fetchDesigns()
  }, [searchTerm, selectedCategory, selectedIndustry, priceRange, sortBy])

  // Since filtering is done on backend, filteredDesigns equals designs
  const filteredDesigns = designs

  const handleAddToCart = (design) => {
    const cartItem = {
      id: design._id,
      name: design.title,
      price: design.pricing.basePrice,
      image: design.images[0]?.url || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      category: 'custom-logo-design',
      deliveryTime: design.pricing.deliveryTime
    }
    addToCart(cartItem)
    toast.success('Added to cart!')
  }

  // Reference image upload handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }
      return true
    })

    if (referenceImages.length + validFiles.length > 3) {
      toast.error('Maximum 3 reference images allowed')
      return
    }

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          name: file.name
        }
        setReferenceImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeReferenceImage = (imageId) => {
    setReferenceImages(prev => prev.filter(img => img.id !== imageId))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

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
        {/* Main Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedIndustry('all')
                    setPriceRange('all')
                    setSortBy('name')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Search</h4>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search designs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Industry</h4>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {industries.map(industry => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedCategory !== 'all' || selectedIndustry !== 'all' || priceRange !== 'all') && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
                  <div className="space-y-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Search: {searchTerm}
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categories.find(cat => cat.value === selectedCategory)?.label}
                      </span>
                    )}
                    {selectedIndustry !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {industries.find(ind => ind.value === selectedIndustry)?.label}
                      </span>
                    )}
                    {priceRange !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {priceRanges.find(range => range.value === priceRange)?.label}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">{filteredDesigns.length}</span>
                  <span className="ml-1">logo designs found</span>
                </div>
                <div className="text-sm text-gray-500">
                  Showing results for custom logo designs
                </div>
              </div>
            </div>

            {/* Reference Images Upload Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900" id='reference-images-upload'>Upload Reference Images</h3>
                    <p className="text-sm text-gray-500 mt-1">Share your inspiration to help us understand your style preferences</p>
                  </div>
                  <button
                    onClick={() => setShowReferenceUpload(!showReferenceUpload)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    {showReferenceUpload ? 'Hide Upload' : 'Upload References'}
                  </button>
                </div>
              </div>

              {showReferenceUpload && (
                <div className="p-6">
                  {/* Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleReferenceUpload}
                      className="hidden"
                    />

                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />

                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">
                        {dragActive ? 'Drop images here' : 'Drag & drop reference images'}
                      </p>
                      <p className="text-sm text-gray-500">or</p>
                      <button
                        type="button"
                        onClick={openFileDialog}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Browse Images
                      </button>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      <p>Supported formats: JPG, PNG, GIF, SVG, WebP</p>
                      <p>Maximum file size: 10MB | Maximum files: 3</p>
                    </div>
                  </div>

                  {/* Reference Images Preview */}
                  {referenceImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Reference Images ({referenceImages.length}/3)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {referenceImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={image.preview}
                                alt={image.name}
                                className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
                              />
                            </div>
                            <button
                              onClick={() => removeReferenceImage(image.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                            <p className="mt-2 text-xs text-gray-500 truncate">{image.name}</p>
                          </div>
                        ))}
                      </div>

                      {referenceImages.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-start">
                            <PhotoIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                            <div>
                              <h5 className="text-sm font-medium text-blue-900">Great! Your references will help us</h5>
                              <p className="text-sm text-blue-700 mt-1">
                                Our designers will use these images to understand your style preferences and create designs that match your vision.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Designs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDesigns.map(design => (
                <div
                  key={design._id}
                  className="card overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={design.images[0]?.url || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'}
                      alt={design.images[0]?.alt || design.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-semibold text-primary-600">
                      ₹{design.pricing.basePrice.toLocaleString()}
                    </div>
                    <div className="absolute top-2 left-2 flex space-x-1">
                      {design.isFeatured && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                      {design.isPopular && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 flex space-x-1">
                      <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                        <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500" />
                      </button>
                      <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {design.title}
                      </h3>
                      <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                        {design.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {design.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {design.rating?.average || 0} ({design.rating?.count || 0})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {design.pricing.deliveryTime} days
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {design.colors?.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        ></div>
                      ))}
                      {design.colors?.length > 4 && (
                        <span className="text-xs text-gray-500">+{design.colors.length - 4}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/custom-logo-designs/${design._id}`}
                        className="flex-1 btn-secondary text-center text-sm py-2"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(design)}
                        className="btn-primary px-3 py-2"
                        title="Add to Cart"
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {designs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FunnelIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No designs found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Need a Custom Logo Design?</h2>
              <p className="text-lg mb-6 opacity-90">
                Can't find what you're looking for? Let our expert designers create a unique logo just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/custom-logo-request"
                  className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Submit Custom Request
                </Link>
                <Link
                  to="/contact"
                  className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomLogoDesign