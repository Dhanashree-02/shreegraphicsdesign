import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudArrowUpIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const CustomDesignOrder = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    product: '',
    productName: '',
    productCategory: '',
    productSubcategory: '',
    quantity: 1,
    designType: 'custom-design',
    productOptions: {
      color: '',
      size: '',
      material: '',
      style: ''
    },
    designPlacements: [{
      position: 'front-center',
      dimensions: {
        width: 10,
        height: 10,
        unit: 'cm'
      },
      rotation: 0
    }],
    specialInstructions: '',
    designNotes: '',
    deliveryOptions: {
      type: 'standard',
      estimatedDays: 7,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }
    }
  })
  const [designFile, setDesignFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProducts()
  }, [user, navigate])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/products')
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setDesignFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleProductSelect = (e) => {
    const productId = e.target.value
    const selectedProduct = products.find(p => p._id === productId)
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        product: productId,
        productName: selectedProduct.name,
        productCategory: selectedProduct.category,
        productSubcategory: selectedProduct.subcategory
      }))
    }
  }

  const addPlacement = () => {
    setFormData(prev => ({
      ...prev,
      designPlacements: [...prev.designPlacements, {
        position: 'front-center',
        dimensions: {
          width: 10,
          height: 10,
          unit: 'cm'
        },
        rotation: 0
      }]
    }))
  }

  const removePlacement = (index) => {
    setFormData(prev => ({
      ...prev,
      designPlacements: prev.designPlacements.filter((_, i) => i !== index)
    }))
  }

  const updatePlacement = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      designPlacements: prev.designPlacements.map((placement, i) => 
        i === index ? { ...placement, [field]: value } : placement
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!designFile) {
      toast.error('Please upload a design file')
      return
    }

    if (!formData.product) {
      toast.error('Please select a product')
      return
    }

    setLoading(true)
    
    try {
      const submitData = new FormData()
      
      // Add design file
      submitData.append('designFile', designFile)
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else {
          submitData.append(key, formData[key])
        }
      })

      const response = await axios.post(
        'http://localhost:5003/api/custom-design-orders',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Custom design order submitted successfully!')
        navigate('/profile')
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error(error.response?.data?.message || 'Failed to submit order')
    } finally {
      setLoading(false)
    }
  }

  const placementOptions = [
    { value: 'front-center', label: 'Front Center' },
    { value: 'front-left-chest', label: 'Left Chest' },
    { value: 'front-right-chest', label: 'Right Chest' },
    { value: 'back-center', label: 'Back Center' },
    { value: 'back-upper', label: 'Back Upper' },
    { value: 'sleeve-left', label: 'Left Sleeve' },
    { value: 'sleeve-right', label: 'Right Sleeve' },
    { value: 'collar', label: 'Collar' },
    { value: 'pocket', label: 'Pocket' },
    { value: 'custom', label: 'Custom Position' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Custom Design Order</h1>
            <p className="text-blue-100 mt-2">Upload your design and customize your product</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Design Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Design File *
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                {previewUrl ? (
                  <div className="space-y-4">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                    <p className="text-sm text-gray-600">{designFile?.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setDesignFile(null)
                        setPreviewUrl('')
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600">Drop your design file here or click to browse</p>
                    <p className="text-sm text-gray-500">PNG, JPG, SVG, PDF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product *
              </label>
              <select
                name="product"
                value={formData.product}
                onChange={handleProductSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name} - {product.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="productOptions.color"
                  value={formData.productOptions.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Black, White, Navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <input
                  type="text"
                  name="productOptions.size"
                  value={formData.productOptions.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., S, M, L, XL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <input
                  type="text"
                  name="productOptions.material"
                  value={formData.productOptions.material}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cotton, Polyester"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Design Placements */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Design Placements
                </label>
                <button
                  type="button"
                  onClick={addPlacement}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Placement
                </button>
              </div>
              
              {formData.designPlacements.map((placement, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Placement {index + 1}</h4>
                    {formData.designPlacements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlacement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <select
                        value={placement.position}
                        onChange={(e) => updatePlacement(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {placementOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                      <input
                        type="number"
                        value={placement.dimensions.width}
                        onChange={(e) => updatePlacement(index, 'dimensions', {
                          ...placement.dimensions,
                          width: parseFloat(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={placement.dimensions.height}
                        onChange={(e) => updatePlacement(index, 'dimensions', {
                          ...placement.dimensions,
                          height: parseFloat(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requirements or instructions for your design..."
              />
            </div>

            {/* Delivery Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Type
              </label>
              <select
                name="deliveryOptions.type"
                value={formData.deliveryOptions.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (7-10 days)</option>
                <option value="express">Express (3-5 days)</option>
                <option value="rush">Rush (1-2 days)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomDesignOrder