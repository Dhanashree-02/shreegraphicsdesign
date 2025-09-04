import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StarIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ReviewSection from '../components/reviews/ReviewSection'
import ProductCustomizer from '../components/ProductCustomizer'
import axios from 'axios'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [customization, setCustomization] = useState({
    color: '',
    size: '',
    text: '',
    font: ''
  })
  const [customDesign, setCustomDesign] = useState(null)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)



  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`)
      const productData = response.data.product || response.data
      
      if (!productData) {
        toast.error('Product not found')
        navigate('/products')
        return
      }
      
      setProduct(productData)
      setLoading(false)
    } catch (error) {
      console.error('Product fetch error:', error)
      toast.error('Failed to load product. Please try again.')
      navigate('/products')
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }

    const cartItem = {
      ...customization,
      customDesign: customDesign,
      quantity: quantity
    }
    
    addToCart(product, cartItem)
    toast.success('Product added to cart!')
  }

  const handleCustomizationChange = (designData) => {
    setCustomDesign(designData)
  }

  // Check if product supports custom design
  const supportsCustomDesign = () => {
    return product?.category === 'apparels' || 
           ['cap', 'sweatshirt', 'jackets', 'denim-shirt'].includes(product?.subcategory)
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed')
      navigate('/login')
      return
    }

    addToCart(product, customization)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]?.url || product.images[selectedImage]}
                alt={product.images[selectedImage]?.alt || product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image?.url || image}
                    alt={image?.alt || `${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating?.average || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating?.average || 0} ({product.rating?.count || product.reviews || 0} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500 capitalize">{product.category}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price?.base || product.price}
              </span>
              {product.price?.premium && (
                <div className="text-sm text-gray-600">
                  <span className="block">Premium: ₹{product.price.premium}</span>
                  {product.price?.enterprise && (
                    <span className="block">Enterprise: ₹{product.price.enterprise}</span>
                  )}
                </div>
              )}
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Customization Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customization Options</h3>
              
              {product.customizationOptions && product.customizationOptions.length > 0 ? (
                product.customizationOptions.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {option.name}
                    </label>
                    {option.type === 'text' ? (
                      <input
                        type="text"
                        value={customization[option.name] || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, [option.name]: e.target.value }))}
                        placeholder={`Enter ${option.name.toLowerCase()}`}
                        className="input-field"
                      />
                    ) : (
                      <select
                        value={customization[option.name] || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, [option.name]: e.target.value }))}
                        className="input-field"
                      >
                        <option value="">Select {option.name}</option>
                        {option.options?.map((opt, optIndex) => (
                          <option key={optIndex} value={opt.value || opt.label}>
                            {opt.label} {opt.additionalCost > 0 && `(+₹${opt.additionalCost})`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))
              ) : (
                // Fallback for products without customization options
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <select
                      value={customization.color}
                      onChange={(e) => setCustomization(prev => ({ ...prev, color: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select Color</option>
                      {(product.customizationOptions?.colors || ['Blue', 'Red', 'Green', 'Black', 'Purple']).map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <select
                      value={customization.size}
                      onChange={(e) => setCustomization(prev => ({ ...prev, size: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select Size</option>
                      {(product.customizationOptions?.sizes || ['Small', 'Medium', 'Large', 'Extra Large']).map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Text</label>
                    <input
                      type="text"
                      value={customization.text}
                      onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter custom text (optional)"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                    <select
                      value={customization.font}
                      onChange={(e) => setCustomization(prev => ({ ...prev, font: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select Font</option>
                      {(product.customizationOptions?.fonts || ['Modern', 'Classic', 'Bold', 'Elegant']).map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Custom Design Toggle */}
            {supportsCustomDesign() && (
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">
                    {showCustomizer ? 'Hide Custom Design' : 'Add Custom Design'}
                  </span>
                </button>
                {customDesign && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        Custom design added ({customDesign.placements?.length || 0} placement{customDesign.placements?.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-secondary"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 btn-primary"
              >
                Buy Now
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isFavorite ? (
                  <HeartIconSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ShareIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
              <ul className="space-y-2">
                {(product.features?.base || product.features || []).map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Delivery Information</h4>
              <p className="text-blue-700 text-sm">
                Expected delivery: {product.deliveryTime?.base ? `${product.deliveryTime.base} days` : product.deliveryTime}
              </p>
            </div>
          </div>
        </div>

        {/* Product Customizer */}
        {supportsCustomDesign() && showCustomizer && (
          <div className="mt-8">
            <ProductCustomizer 
              product={product} 
              onCustomizationChange={handleCustomizationChange}
            />
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection productId={product._id} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetail