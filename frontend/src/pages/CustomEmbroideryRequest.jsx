import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CustomEmbroideryRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    embroideryType: '',
    garmentType: '',
    quantity: '',
    threadColors: '',
    placement: '',
    size: '',
    designDescription: '',
    specialRequirements: '',
    budget: '',
    deadline: '',
    rushDelivery: false
  });

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Package pricing state
  const [packages, setPackages] = useState({
    basic: { price: 299, deliveryDays: 7 },
    premium: { price: 599, deliveryDays: 5 },
    enterprise: { price: 999, deliveryDays: 3 }
  });
  const [selectedPackage, setSelectedPackage] = useState('basic');

  // Predefined options
  const embroideryTypes = [
    'Logo Embroidery',
    'Text Embroidery',
    'Custom Patches',
    'Monogramming',
    'Appliqué Work',
    'Thread Work',
    'Beadwork',
    'Sequin Work',
    'Machine Embroidery',
    'Hand Embroidery'
  ];

  const garmentTypes = [
    'T-Shirts',
    'Polo Shirts',
    'Hoodies',
    'Jackets',
    'Caps/Hats',
    'Bags',
    'Towels',
    'Uniforms',
    'Aprons',
    'Other'
  ];

  const placementOptions = [
    'Left Chest',
    'Right Chest',
    'Center Chest',
    'Back',
    'Sleeve',
    'Collar',
    'Pocket',
    'Custom Placement'
  ];

  const budgetRanges = [
    'Under ₹5,000',
    '₹5,000 - ₹10,000',
    '₹10,000 - ₹25,000',
    '₹25,000 - ₹50,000',
    'Above ₹50,000'
  ];

  useEffect(() => {
    if (!user) {
      toast.error('Please login to submit a custom embroidery request');
      navigate('/login');
      return;
    }

    // Pre-fill user data
    setFormData(prev => ({
      ...prev,
      email: user.email || '',
      contactPerson: user.name || ''
    }));
  }, [user, navigate]);

  // File validation
  const validateFile = (file) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
      'application/pdf', 'application/illustrator', 'application/postscript'
    ];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`File size must be less than 15MB`);
      return false;
    }

    return true;
  };

  // Process files with upload progress simulation
  const processFiles = (files) => {
    if (uploadedImages.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!validateFile(file)) return;

      const fileId = Date.now() + Math.random();
      const fileObj = {
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      };

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileId] || 0;
          if (currentProgress >= 100) {
            clearInterval(interval);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
            setUploadedImages(prev => [...prev, fileObj]);
            return prev;
          }
          return { ...prev, [fileId]: currentProgress + 10 };
        });
      }, 100);
    });
  };

  // Drag and drop handlers
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

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
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
  };

  const handleImageDescriptionChange = (imageId, description) => {
    setImageDescriptions(prev => ({
      ...prev,
      [imageId]: description
    }));
  };

  // Utility functions
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
    } else if (fileType === 'application/pdf') {
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    } else {
      return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add form fields with correct field names for backend
      Object.keys(formData).forEach(key => {
        if (key === 'email') {
          submitData.append('contactEmail', formData[key]);
        } else if (key === 'phone') {
          submitData.append('contactPhone', formData[key]);
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add package selection
      submitData.append('selectedPackage', selectedPackage);
      
      // Add uploaded images
      uploadedImages.forEach((image, index) => {
        submitData.append('images', image.file);
        submitData.append(`imageDescription_${index}`, imageDescriptions[image.id] || '');
      });

      const response = await fetch('http://localhost:5003/api/custom-embroidery-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        toast.success('Custom embroidery request submitted successfully!');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Custom Embroidery Request</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your custom embroidery needs and we'll create a personalized solution for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Business Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business/Organization Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Embroidery Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Embroidery Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embroidery Type *
                  </label>
                  <select
                    name="embroideryType"
                    value={formData.embroideryType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select embroidery type</option>
                    {embroideryTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Garment Type *
                  </label>
                  <select
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select garment type</option>
                    {garmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placement *
                  </label>
                  <select
                    name="placement"
                    value={formData.placement}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select placement</option>
                    {placementOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size (in inches)
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 3x3, 4x2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thread Colors
                  </label>
                  <input
                    type="text"
                    name="threadColors"
                    value={formData.threadColors}
                    onChange={handleInputChange}
                    placeholder="e.g., Navy Blue, Gold, White"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Description *
                </label>
                <textarea
                  name="designDescription"
                  value={formData.designDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your embroidery design in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any special requirements or instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reference Images & Design Files */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Reference Images & Design Files</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Reference Images & Design Files (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload reference images, existing designs, inspiration, or design files. Supports images, PDFs, AI, PSD, SVG files. Maximum 5 files, 15MB each.
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

            {/* Project Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Project Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rushDelivery"
                  checked={formData.rushDelivery}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Rush delivery required (additional charges may apply)
                </label>
              </div>
            </div>

            {/* Package Selection */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Select Package</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(packages).map(([packageType, details]) => (
                  <div
                    key={packageType}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPackage === packageType
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPackage(packageType)}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                        {packageType}
                      </h3>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ₹{details.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {details.deliveryDays} days delivery
                      </div>
                      <div className="flex items-center justify-center">
                        <input
                          type="radio"
                          name="package"
                          value={packageType}
                          checked={selectedPackage === packageType}
                          onChange={() => setSelectedPackage(packageType)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.rushDelivery && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-yellow-600 mr-2">⚡</div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Rush Delivery Selected
                      </p>
                      <p className="text-sm text-yellow-700">
                        Additional charges may apply for expedited delivery. We'll contact you with the final pricing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-md font-medium text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Submit Request
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomEmbroideryRequest;