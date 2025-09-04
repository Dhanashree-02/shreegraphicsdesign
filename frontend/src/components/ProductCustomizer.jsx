import React, { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { customDesignService, designHelpers } from '../services/customDesignService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCustomizer = ({ product, onCustomizationChange }) => {
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [designPlacements, setDesignPlacements] = useState([]);
  const [activeDesign, setActiveDesign] = useState(null);
  const [designType, setDesignType] = useState('logo');
  const [productView, setProductView] = useState('front');
  const canvasRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Available placement positions based on product type
  const getPlacementOptions = () => {
    const baseOptions = [
      { id: 'front-center', label: 'Front Center', icon: '🎯' },
      { id: 'front-left-chest', label: 'Left Chest', icon: '📍' },
      { id: 'front-right-chest', label: 'Right Chest', icon: '📍' },
      { id: 'back-center', label: 'Back Center', icon: '🎯' },
      { id: 'back-upper', label: 'Back Upper', icon: '⬆️' }
    ];

    if (product?.subcategory === 'cap') {
      return [
        { id: 'front-center', label: 'Front Panel', icon: '🧢' },
        { id: 'back-center', label: 'Back Panel', icon: '🔙' },
        { id: 'side-left', label: 'Left Side', icon: '⬅️' },
        { id: 'side-right', label: 'Right Side', icon: '➡️' }
      ];
    }

    if (['sweatshirt', 'jackets', 'denim-shirt'].includes(product?.subcategory)) {
      return [
        ...baseOptions,
        { id: 'sleeve-left', label: 'Left Sleeve', icon: '💪' },
        { id: 'sleeve-right', label: 'Right Sleeve', icon: '💪' }
      ];
    }

    return baseOptions;
  };

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      designHelpers.validateDesignFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const designData = {
          id: Date.now(),
          file: file,
          preview: e.target.result,
          name: file.name,
          type: file.type,
          size: file.size
        };
        
        setSelectedDesign(designData);
        calculatePrice();
        toast.success('Design uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // Calculate estimated price
  const calculatePrice = async () => {
    if (!selectedDesign || !product) return;
    
    try {
      const orderData = {
        productId: product._id,
        designType,
        designPlacements,
        quantity
      };
      
      const pricing = await customDesignService.calculatePricing(orderData);
      setEstimatedPrice(pricing.totalPrice);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  // Handle design submission
  const handleSubmitDesign = async () => {
    if (!user) {
      toast.error('Please login to submit your design');
      navigate('/login');
      return;
    }

    if (!selectedDesign || designPlacements.length === 0) {
      toast.error('Please upload a design and add it to the product first');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const orderData = {
        productId: product._id,
        productName: product.name,
        productCategory: product.category,
        productSubcategory: product.subcategory,
        designType,
        designFile: selectedDesign.file,
        designPlacements,
        quantity,
        specialInstructions,
        basePrice: product.price?.base || product.price || 0
      };

      const result = await customDesignService.createOrder(orderData);
      
      toast.success('Design submitted successfully! You will receive updates on your order status.');
      setSubmitMessage('Design submitted successfully! You will receive updates on your order status.');
      
      // Reset form
      setSelectedDesign(null);
      setDesignPlacements([]);
      setActiveDesign(null);
      setSpecialInstructions('');
      setEstimatedPrice(null);
      
      // Redirect to orders page after a delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting design:', error);
      toast.error('Error submitting design. Please try again.');
      setSubmitMessage('Error submitting design. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update price when parameters change
  React.useEffect(() => {
    if (selectedDesign && designPlacements.length > 0) {
      calculatePrice();
    }
  }, [designPlacements, quantity]);

  // Add design to product
  const addDesignToProduct = (position) => {
    if (!selectedDesign) {
      toast.error('Please upload a design first');
      return;
    }

    const newPlacement = {
      id: Date.now(),
      designId: selectedDesign.id,
      position: position,
      coordinates: { x: 50, y: 50 }, // Center position in percentage
      dimensions: { width: 8, height: 8, unit: 'cm' }, // Default size
      rotation: 0,
      designUrl: selectedDesign.preview
    };

    setDesignPlacements(prev => [...prev, newPlacement]);
    setActiveDesign(newPlacement.id);
    
    // Notify parent component
    onCustomizationChange && onCustomizationChange({
      design: selectedDesign,
      placements: [...designPlacements, newPlacement],
      designType
    });

    toast.success(`Design added to ${position.replace('-', ' ')}`);
  };

  // Remove design placement
  const removePlacement = (placementId) => {
    const updatedPlacements = designPlacements.filter(p => p.id !== placementId);
    setDesignPlacements(updatedPlacements);
    setActiveDesign(null);
    
    onCustomizationChange && onCustomizationChange({
      design: selectedDesign,
      placements: updatedPlacements,
      designType
    });
  };

  // Update design properties
  const updateDesignProperty = (placementId, property, value) => {
    const updatedPlacements = designPlacements.map(placement => {
      if (placement.id === placementId) {
        if (property.includes('.')) {
          const [parent, child] = property.split('.');
          return {
            ...placement,
            [parent]: {
              ...placement[parent],
              [child]: value
            }
          };
        }
        return { ...placement, [property]: value };
      }
      return placement;
    });
    
    setDesignPlacements(updatedPlacements);
    onCustomizationChange && onCustomizationChange({
      design: selectedDesign,
      placements: updatedPlacements,
      designType
    });
  };

  // Get product preview image based on view
  const getProductImage = () => {
    if (product?.images && product.images.length > 0) {
      return product.images[0].url || product.images[0];
    }
    
    // Default product images based on subcategory
    const defaultImages = {
      'cap': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
      'sweatshirt': 'https://images.unsplash.com/photo-1556821840-3a9c6dcb0e78?w=400&h=500&fit=crop',
      'jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
      'denim-shirt': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop'
    };
    
    return defaultImages[product?.subcategory] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Product</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Design Upload Section */}
        <div className="space-y-6">
          {/* Design Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Design Type
            </label>
            <select
              value={designType}
              onChange={(e) => setDesignType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="logo">Logo</option>
              <option value="embroidery">Embroidery</option>
              <option value="text">Text</option>
              <option value="custom-design">Custom Design</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Your Design
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                  ? 'Drop your design here...'
                  : 'Drag & drop your design, or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PNG, JPG, SVG (Max 10MB)
              </p>
            </div>
          </div>

          {/* Uploaded Design Preview */}
          {selectedDesign && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Uploaded Design</h4>
                <button
                  onClick={() => setSelectedDesign(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <img
                  src={selectedDesign.preview}
                  alt={selectedDesign.name}
                  className="h-16 w-16 object-cover rounded border"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{selectedDesign.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedDesign.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Placement Options */}
          {selectedDesign && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Placement Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {getPlacementOptions().map((option) => (
                  <button
                    key={option.id}
                    onClick={() => addDesignToProduct(option.id)}
                    className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Design Controls */}
          {activeDesign && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Design Controls</h4>
              {designPlacements
                .filter(p => p.id === activeDesign)
                .map((placement) => (
                  <div key={placement.id} className="space-y-3">
                    {/* Size Controls */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Width (cm)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          step="0.5"
                          value={placement.dimensions.width}
                          onChange={(e) => updateDesignProperty(placement.id, 'dimensions.width', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          step="0.5"
                          value={placement.dimensions.height}
                          onChange={(e) => updateDesignProperty(placement.id, 'dimensions.height', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Rotation Control */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Rotation (degrees)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={placement.rotation}
                        onChange={(e) => updateDesignProperty(placement.id, 'rotation', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0°</span>
                        <span>{placement.rotation}°</span>
                        <span>360°</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removePlacement(placement.id)}
                      className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Remove Design
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Product Preview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Product Preview</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setProductView('front')}
                className={`px-3 py-1 text-sm rounded ${
                  productView === 'front'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setProductView('back')}
                className={`px-3 py-1 text-sm rounded ${
                  productView === 'back'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Back
              </button>
            </div>
          </div>

          {/* Product Canvas */}
          <div className="relative bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            <div className="relative">
              <img
                src={getProductImage()}
                alt={product?.name || 'Product'}
                className="max-w-full max-h-96 object-contain"
              />
              
              {/* Design Overlays */}
              {designPlacements
                .filter(placement => {
                  const isViewMatch = productView === 'front' 
                    ? placement.position.includes('front') || placement.position.includes('chest')
                    : placement.position.includes('back');
                  return isViewMatch;
                })
                .map((placement) => (
                  <div
                    key={placement.id}
                    className={`absolute cursor-pointer border-2 ${
                      activeDesign === placement.id ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{
                      left: `${placement.coordinates.x}%`,
                      top: `${placement.coordinates.y}%`,
                      transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
                      width: `${placement.dimensions.width * 3}px`, // Scale for preview
                      height: `${placement.dimensions.height * 3}px`
                    }}
                    onClick={() => setActiveDesign(placement.id)}
                  >
                    <img
                      src={placement.designUrl}
                      alt="Design"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Design Summary */}
          {designPlacements.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Design Summary</h5>
              <div className="space-y-2">
                {designPlacements.map((placement, index) => (
                  <div key={placement.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Design {index + 1}: {placement.position.replace('-', ' ')}
                    </span>
                    <span className="text-gray-900">
                      {placement.dimensions.width} × {placement.dimensions.height} cm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Details */}
          {selectedDesign && (
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requirements or notes for your design..."
                />
              </div>

              {/* Estimated Price */}
              {estimatedPrice && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Estimated Total:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Final price may vary based on design complexity
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitDesign}
                disabled={isSubmitting || designPlacements.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Design Order'}
              </button>

              {/* Submit Message */}
              {submitMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  submitMessage.includes('Error') 
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {submitMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizer;