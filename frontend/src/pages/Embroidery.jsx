import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  XMarkIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Embroidery = () => {
  const [showDesignUpload, setShowDesignUpload] = useState(false)
  const [designImages, setDesignImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [isSubmittingDesign, setIsSubmittingDesign] = useState(false)
  const fileInputRef = useRef(null)
  const { user } = useAuth()

  // Design image upload handlers
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

  const handleDesignUpload = (e) => {
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

    if (designImages.length + validFiles.length > 5) {
      toast.error('Maximum 5 design images allowed')
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
        setDesignImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeDesignImage = (imageId) => {
    setDesignImages(prev => prev.filter(img => img.id !== imageId))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleDesignSubmission = async () => {
    if (!user) {
      toast.error('Please login to submit a design request')
      return
    }

    if (designImages.length === 0) {
      toast.error('Please upload at least one design image')
      return
    }

    setIsSubmittingDesign(true)

    try {
      const formData = new FormData()
      
      designImages.forEach((image, index) => {
        formData.append('images', image.file)
      })

      formData.append('businessName', user?.name || 'Individual Customer')
      formData.append('contactPerson', user?.name || 'Customer')
      formData.append('embroideryType', 'Logo Embroidery')
      formData.append('garmentType', 'T-Shirts')
      formData.append('quantity', '1')
      formData.append('threadColors', 'Standard colors')
      formData.append('placement', 'Left Chest')
      formData.append('size', '3 inches')
      formData.append('designDescription', 'Custom embroidery design uploaded by user')
      formData.append('budget', 'Under ₹5,000')
      
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 14)
      formData.append('deadline', deadline.toISOString())
      
      formData.append('selectedPackage', 'basic')
      formData.append('contactEmail', user?.email || '')
      formData.append('contactPhone', user?.phone || '')

      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5003'
      const response = await axios.post(`${baseURL}/api/custom-embroidery-requests`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        toast.success('Design request submitted successfully! We will contact you with a quote.')
        setDesignImages([])
        setShowDesignUpload(false)
      } else {
        throw new Error(response.data.message || 'Failed to submit design request')
      }
    } catch (error) {
      console.error('Error submitting design request:', error)
      toast.error(error.response?.data?.message || 'Failed to submit design request')
    } finally {
      setIsSubmittingDesign(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6">
              <span className="text-2xl text-white">🧵</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Professional Embroidery Services
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              Transform your apparel and accessories with premium embroidery work. From corporate logos to custom designs, 
              we deliver exceptional quality with precision and style.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Fast Turnaround
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Premium Quality
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Custom Designs
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Competitive Pricing
              </div>
            </div>
          </div>
        </div>

        {/* Embroidery Process Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Embroidery Process</h2>
          <p className="text-lg text-gray-600 text-center mb-6">
            👉 We make your logo ready for embroidery in just a few steps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Convert Your Logo</h3>
              <p className="text-gray-600 text-sm">Professional digitization of your logo for embroidery machines</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧵</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Stitch Styles</h3>
              <p className="text-gray-600 text-sm">Select optimal stitch types for durability and visual appeal</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Match Brand Colors</h3>
              <p className="text-gray-600 text-sm">Precise color matching using premium embroidery threads</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧪</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Sample</h3>
              <p className="text-gray-600 text-sm">Quality testing to ensure perfect results before production</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Final Embroidery</h3>
              <p className="text-gray-600 text-sm">Professional embroidery on your items with perfect precision</p>
            </div>
          </div>
        </div>

        {/* Featured Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Embroidery Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧵</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Logo Embroidery</h3>
              <p className="text-gray-600 text-sm">Professional logo embroidery on apparel and accessories</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✂️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Patches</h3>
              <p className="text-gray-600 text-sm">Custom embroidered patches for uniforms and branding</p>
            </div>
            <Link to="/custom-design-order" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200 block">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Designs</h3>
              <p className="text-gray-600 text-sm">Unique embroidery designs tailored to your needs</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Order Now →
                </span>
              </div>
            </Link>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Turnaround</h3>
              <p className="text-gray-600 text-sm">Fast delivery without compromising on quality</p>
            </div>
          </div>
        </div>

        {/* Design Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upload Your Design</h3>
                <p className="text-sm text-gray-500 mt-1">Share your embroidery design ideas or reference images for custom work</p>
              </div>
              <button
                onClick={() => setShowDesignUpload(!showDesignUpload)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PhotoIcon className="h-4 w-4 mr-2" />
                {showDesignUpload ? 'Hide Upload' : 'Upload Design'}
              </button>
            </div>
          </div>

          {showDesignUpload && (
            <div className="p-6">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
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
                  onChange={handleDesignUpload}
                  className="hidden"
                />
                
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {dragActive ? 'Drop design images here' : 'Drag & drop your design images'}
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Browse Images
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>Supported formats: JPG, PNG, GIF, SVG, WebP</p>
                  <p>Maximum file size: 10MB | Maximum files: 5</p>
                </div>
              </div>

              {/* Design Images Preview */}
              {designImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Design Images ({designImages.length}/5)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {designImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
                          />
                        </div>
                        <button
                          onClick={() => removeDesignImage(image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <p className="mt-2 text-xs text-gray-500 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 p-4 bg-primary-50 rounded-lg">
                      <div className="flex items-start">
                        <PhotoIcon className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                        <div>
                          <h5 className="text-sm font-medium text-primary-900">Ready for Custom Embroidery</h5>
                          <p className="text-sm text-primary-700 mt-1">
                            Your design images will help our team create the perfect embroidery for your needs.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleDesignSubmission}
                        disabled={isSubmittingDesign}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingDesign ? 'Submitting...' : 'Submit Design Request'}
                      </button>
                      <button
                        onClick={() => {
                          setDesignImages([])
                          setShowDesignUpload(false)
                          toast.success('Design images cleared')
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Clear Images
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-primary-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Need Custom Embroidery?</h2>
          <p className="text-lg mb-6">
            Can't find what you're looking for? Submit a custom embroidery request with your specific requirements and get a personalized quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowDesignUpload(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PhotoIcon className="h-5 w-5 mr-2" />
              Upload Design & Request Quote
            </button>
            <Link 
              to="/contact" 
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Embroidery