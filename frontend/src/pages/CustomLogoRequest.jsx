import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CustomLogoRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'technology',
    description: '',
    logoStyle: 'modern',
    colorPreferences: [],
    inspirationText: '',
    selectedPackage: 'basic',
    rushDelivery: false,
    contactEmail: user?.email || '',
    contactPhone: ''
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to submit a custom logo request');
      navigate('/login');
      return;
    }
    fetchPackagePricing();
  }, [user, navigate]);

  const fetchPackagePricing = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/custom-logo-requests/pricing/packages');
      const data = await response.json();
      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error('Error fetching package pricing:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'colorPreferences') {
      const currentColors = formData.colorPreferences;
      if (checked) {
        setFormData(prev => ({
          ...prev,
          colorPreferences: [...currentColors, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          colorPreferences: currentColors.filter(color => color !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'application/pdf', 'image/webp'];
    const maxSize = 15 * 1024 * 1024; // 15MB
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(`${file.name}: Unsupported file type. Please upload images, PDFs, or design files.`);
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error(`${file.name}: File too large. Maximum size is 15MB.`);
      return false;
    }
    
    return true;
  };

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    
    if (uploadedImages.length + fileArray.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    fileArray.forEach(file => {
      if (!validateFile(file)) return;
      
      const fileId = Date.now() + Math.random();
      
      // Set initial upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 90) + 10;
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }
      };
      
      reader.onload = (e) => {
        const newImage = {
          file,
          preview: e.target.result,
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type
        };
        
        setUploadedImages(prev => [...prev, newImage]);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1000);
      };
      
      reader.onerror = () => {
        toast.error(`Error reading ${file.name}`);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e) => {
    processFiles(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    setImageDescriptions(prev => {
      const newDescriptions = { ...prev };
      delete newDescriptions[imageId];
      return newDescriptions;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[imageId];
      return newProgress;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const handleImageDescriptionChange = (imageId, description) => {
    setImageDescriptions(prev => ({
      ...prev,
      [imageId]: description
    }));
  };

  const calculateTotalPrice = () => {
    if (!packages) return 0;
    const packagePrice = packages.packages[formData.selectedPackage]?.price || 0;
    const rushCost = formData.rushDelivery ? packages.rushDeliveryCost : 0;
    return packagePrice + rushCost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'colorPreferences') {
          submitFormData.append(key, JSON.stringify(formData[key]));
        } else {
          submitFormData.append(key, formData[key]);
        }
      });

      // Add images
      uploadedImages.forEach((image, index) => {
        submitFormData.append('images', image.file);
        submitFormData.append(`imageDescription${index}`, imageDescriptions[image.id] || '');
      });

      const response = await fetch('http://localhost:5003/api/custom-logo-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitFormData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Custom logo request submitted successfully!');
        navigate('/profile');
      } else {
        toast.error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing',
    'real-estate', 'hospitality', 'automotive', 'food-beverage', 'fashion',
    'sports', 'entertainment', 'non-profit', 'government', 'startup', 'other'
  ];

  const logoStyles = [
    'minimalist', 'modern', 'vintage', 'corporate', 'creative', 'elegant',
    'bold', 'playful', 'professional', 'artistic', 'geometric', 'abstract',
    'typography', 'mascot', 'emblem', 'wordmark', 'combination', 'other'
  ];

  const colorOptions = [
    'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown',
    'Black', 'White', 'Gray', 'Gold', 'Silver', 'Teal', 'Navy', 'Maroon'
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to submit a custom logo request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Custom Logo Design Request</h1>
            <p className="text-blue-100 mt-2">Tell us about your vision and we'll create the perfect logo for your business</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Business Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {industries.map(industry => (
                      <option key={industry} value={industry}>
                        {industry.charAt(0).toUpperCase() + industry.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your business, what you do, your target audience, and what makes you unique..."
                />
              </div>
            </div>

            {/* Design Preferences */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Design Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Style *
                </label>
                <select
                  name="logoStyle"
                  value={formData.logoStyle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {logoStyles.map(style => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Preferences
                </label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {colorOptions.map(color => (
                    <label key={color} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="colorPreferences"
                        value={color.toLowerCase()}
                        checked={formData.colorPreferences.includes(color.toLowerCase())}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspiration & Additional Notes
                </label>
                <textarea
                  name="inspirationText"
                  value={formData.inspirationText}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share any inspiration, specific requirements, or additional details..."
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Reference Images & Design Files</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Reference Images & Design Files (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload reference images, existing logos, inspiration, or design files. Supports images, PDFs, AI, PSD, SVG files. Maximum 5 files, 15MB each.
                </p>
                
                {/* Enhanced Drag & Drop Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
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
                    accept="image/*,.pdf,.ai,.psd,.svg,.webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </p>
                    <p className="text-sm text-gray-500">or</p>
                    <button
                      type="button"
                      onClick={openFileDialog}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Browse Files
                    </button>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Supported formats: JPG, PNG, GIF, SVG, WebP, PDF, AI, PSD</p>
                    <p>Maximum file size: 15MB | Maximum files: 5</p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <div key={fileId} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Uploading...</span>
                        <span className="text-sm text-gray-500">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Uploaded Files Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Uploaded Files ({uploadedImages.length}/5)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-start space-x-3">
                          {/* File Preview */}
                          <div className="flex-shrink-0">
                            {image.type.startsWith('image/') ? (
                              <img
                                src={image.preview}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                                {getFileIcon(image.type)}
                              </div>
                            )}
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(image.size)}
                            </p>
                            
                            {/* Description Input */}
                            <input
                              type="text"
                              placeholder="Add description (optional)"
                              value={imageDescriptions[image.id] || ''}
                              onChange={(e) => handleImageDescriptionChange(image.id, e.target.value)}
                              className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Package Selection */}
            {packages && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Package Selection</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(packages.packages).map(([packageName, packageInfo]) => (
                    <div
                      key={packageName}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        formData.selectedPackage === packageName
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, selectedPackage: packageName }))}
                    >
                      <input
                        type="radio"
                        name="selectedPackage"
                        value={packageName}
                        checked={formData.selectedPackage === packageName}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {packageName.charAt(0).toUpperCase() + packageName.slice(1)}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600 mb-2">₹{packageInfo.price}</p>
                      <p className="text-sm text-gray-600">
                        Delivery: {packageInfo.deliveryDays} days
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="rushDelivery"
                    checked={formData.rushDelivery}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">
                    Rush Delivery (+₹{packages.rushDeliveryCost}) - 50% faster delivery
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Price:</span>
                    <span className="text-blue-600">₹{calculateTotalPrice()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-md font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Submitting Request...' : 'Submit Custom Logo Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomLogoRequest;