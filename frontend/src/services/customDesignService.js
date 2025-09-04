import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Custom Design Order Service
export const customDesignService = {
  // Create a new custom design order
  createOrder: async (orderData) => {
    try {
      const formData = new FormData();
      
      // Add all order data to FormData
      Object.keys(orderData).forEach(key => {
        if (key === 'designFile') {
          formData.append('designFile', orderData[key]);
        } else if (typeof orderData[key] === 'object') {
          formData.append(key, JSON.stringify(orderData[key]));
        } else {
          formData.append(key, orderData[key]);
        }
      });

      const response = await api.post('/custom-design-orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all custom design orders for the user
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/custom-design-orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a specific custom design order
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/custom-design-orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel a custom design order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/custom-design-orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add a message to an order
  addMessage: async (orderId, message) => {
    try {
      const response = await api.post(`/custom-design-orders/${orderId}/message`, {
        message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload additional design files
  uploadDesignFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/uploads/custom-design', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order status updates
  getOrderStatus: async (orderId) => {
    try {
      const response = await api.get(`/custom-design-orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Calculate order pricing
  calculatePricing: async (orderData) => {
    try {
      const response = await api.post('/custom-design-orders/calculate-pricing', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Helper functions
export const designHelpers = {
  // Validate design file
  validateDesignFile: (file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PNG, JPG, SVG, or PDF files only.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload files smaller than 10MB.');
    }

    return true;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get placement display name
  getPlacementDisplayName: (placement) => {
    const placementNames = {
      'front-center': 'Front Center',
      'front-left-chest': 'Left Chest',
      'front-right-chest': 'Right Chest',
      'back-center': 'Back Center',
      'back-upper': 'Back Upper',
      'sleeve-left': 'Left Sleeve',
      'sleeve-right': 'Right Sleeve',
      'collar': 'Collar',
      'pocket': 'Pocket',
      'custom': 'Custom Position'
    };
    return placementNames[placement] || placement;
  },

  // Get design type display name
  getDesignTypeDisplayName: (designType) => {
    const typeNames = {
      'logo': 'Logo Design',
      'embroidery': 'Embroidery',
      'text': 'Text Design',
      'custom-design': 'Custom Design'
    };
    return typeNames[designType] || designType;
  },

  // Get order status display info
  getOrderStatusInfo: (status) => {
    const statusInfo = {
      'pending': { label: 'Pending Review', color: 'yellow', description: 'Your order is being reviewed' },
      'design-review': { label: 'Design Review', color: 'blue', description: 'Design is being reviewed by our team' },
      'approved': { label: 'Approved', color: 'green', description: 'Design approved, ready for production' },
      'in-production': { label: 'In Production', color: 'purple', description: 'Your order is being manufactured' },
      'quality-check': { label: 'Quality Check', color: 'indigo', description: 'Final quality inspection in progress' },
      'shipped': { label: 'Shipped', color: 'blue', description: 'Your order has been shipped' },
      'delivered': { label: 'Delivered', color: 'green', description: 'Order successfully delivered' },
      'cancelled': { label: 'Cancelled', color: 'red', description: 'Order has been cancelled' }
    };
    return statusInfo[status] || { label: status, color: 'gray', description: '' };
  },

  // Calculate estimated delivery date
  calculateDeliveryDate: (orderDate, estimatedDays) => {
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
    return deliveryDate;
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
};

export default customDesignService;