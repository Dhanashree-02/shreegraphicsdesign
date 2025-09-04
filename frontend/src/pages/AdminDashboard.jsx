import { useState, useEffect } from 'react'
import {
  UsersIcon,
  ShoppingBagIcon,
  PhotoIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  UserGroupIcon,
  SparklesIcon,
  SwatchIcon,
  Bars3Icon,
  HomeIcon,
  CogIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import DashboardCharts from '../components/charts/DashboardCharts'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);


  // Real data from API
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalLogoRequests: 0,
    totalEmbroideryRequests: 0,
    totalCustomDesignOrders: 0,
    totalReviews: 0
  })

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)

  // Product management states
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [productFilterCategory, setProductFilterCategory] = useState('')
  const [productFilterStatus, setProductFilterStatus] = useState('') // '' = all, 'active' = active only, 'inactive' = inactive only
  const [productSortBy, setProductSortBy] = useState('name')
  const [productSortOrder, setProductSortOrder] = useState('asc')
  const [productPriceRange, setProductPriceRange] = useState({ min: '', max: '' })

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orderSearchTerm, setOrderSearchTerm] = useState('')

  // Orders pagination and filtering
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  })
  const [ordersFilters, setOrdersFilters] = useState({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [logoRequests, setLogoRequests] = useState([])
  const [logoRequestsLoading, setLogoRequestsLoading] = useState(false)

  const [embroideryRequests, setEmbroideryRequests] = useState([])
  const [embroideryRequestsLoading, setEmbroideryRequestsLoading] = useState(false)

  const [customDesignOrders, setCustomDesignOrders] = useState([])
  const [customDesignOrdersLoading, setCustomDesignOrdersLoading] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewStats, setReviewStats] = useState({})

  // Chart data states
  const [chartData, setChartData] = useState({
    ordersData: null,
    revenueData: null,
    usersData: null
  })
  const [chartsLoading, setChartsLoading] = useState(true)

  // Categories and subcategories data
  const categories = {
    'apparels': {
      label: 'Apparels',
      subcategories: [
        { value: 'cap', label: 'Cap' },
        { value: 'jackets', label: 'Jackets' },
        { value: 'sweatshirt', label: 'Sweatshirt' },
        { value: 'denim-shirt', label: 'Denim Shirt' },
        { value: 'windcheaters', label: 'Windcheaters' }
      ]
    },
    'travels': {
      label: 'Travels',
      subcategories: [
        { value: 'hand-bag', label: 'Hand Bag' },
        { value: 'strolley-bags', label: 'Strolley Bags' },
        { value: 'travel-bags', label: 'Travel Bags' },
        { value: 'back-packs', label: 'Back Packs' },
        { value: 'laptop-bags', label: 'Laptop Bags' }
      ]
    },
    'leather': {
      label: 'Leather',
      subcategories: [
        { value: 'office-bags', label: 'Office Bags' },
        { value: 'wallets', label: 'Wallets' }
      ]
    },
    'uniforms': {
      label: 'Uniforms',
      subcategories: [
        { value: 'school-uniforms', label: 'School Uniforms' },
        { value: 'corporate', label: 'Corporate' }
      ]
    },
    'design-services': {
      label: 'Design Services',
      subcategories: [
        { value: 'logo-design', label: 'Logo Design' },
        { value: 'business-card', label: 'Business Card' },
        { value: 'brochure', label: 'Brochure' },
        { value: 'banner', label: 'Banner' },
        { value: 'poster', label: 'Poster' },
        { value: 'flyer', label: 'Flyer' },
        { value: 'website-design', label: 'Website Design' }
      ]
    },
    'embroidery': {
      label: 'Embroidery',
      subcategories: [
        { value: 'logo-embroidery', label: 'Logo Embroidery' },
        { value: 'text-embroidery', label: 'Text Embroidery' },
        { value: 'custom-patches', label: 'Custom Patches' },
        { value: 'monogramming', label: 'Monogramming' },
        { value: 'applique', label: 'Applique' },
        { value: 'thread-work', label: 'Thread Work' },
        { value: 'beadwork', label: 'Beadwork' },
        { value: 'sequin-work', label: 'Sequin Work' },
        { value: 'machine-embroidery', label: 'Machine Embroidery' },
        { value: 'hand-embroidery', label: 'Hand Embroidery' }
      ]
    },
    'other': {
      label: 'Other',
      subcategories: [
        { value: 'other', label: 'Other' }
      ]
    }
  }

  // Profile management state
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Modal states for CRUD operations
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const [imagePreview, setImagePreview] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Set selected file and create preview immediately
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIsUploading(true);

    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await axios.post('/api/uploads/product', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response.data); // Debug log

      // Backend returns an array of files, get the first one
      if (response.data.success && response.data.files && response.data.files[0]) {
        const imageUrl = response.data.files[0].url;
        console.log('Setting imageUrl:', imageUrl); // Debug log

        setProductFormData(prev => ({
          ...prev,
          imageUrl: imageUrl
        }));

        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.message || 'Image upload failed');
      // Clear preview on error
      setImagePreview('');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setSelectedFile(null);
    setProductFormData({ ...productFormData, imageUrl: '' });
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };



  // Form data states
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: 'user' })
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: {
      base: 0,
      premium: 0,
      enterprise: 0
    },
    images: [],
    imageUrl: '',
    deliveryTime: {
      base: 7,
      premium: 5,
      enterprise: 3
    }
  })

  // Define tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: HomeIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'products', name: 'Products', icon: PhotoIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'reviews', name: 'Reviews', icon: ChatBubbleLeftRightIcon },
    { id: 'logo-requests', name: 'Logo Requests', icon: SparklesIcon },
    { id: 'embroidery-requests', name: 'Embroidery Requests', icon: SwatchIcon },
    { id: 'custom-design-orders', name: 'Custom Design Orders', icon: CogIcon }
  ]

  // Enhanced product filtering
  const filteredProducts = products.filter(product => {
    // Status filter
    if (productFilterStatus === 'active' && product.isActive !== true) return false
    if (productFilterStatus === 'inactive' && product.isActive !== false) return false

    // Search by name filter
    if (productSearchTerm && !product.name.toLowerCase().includes(productSearchTerm.toLowerCase())) {
      return false
    }

    // Category filter
    if (productFilterCategory && product.category !== productFilterCategory) {
      return false
    }

    // Price range filter
    const basePrice = product.price?.base || 0
    if (productPriceRange.min && basePrice < Number(productPriceRange.min)) {
      return false
    }
    if (productPriceRange.max && basePrice > Number(productPriceRange.max)) {
      return false
    }

    return true
  }).sort((a, b) => {
    // Sorting logic
    let aValue, bValue

    switch (productSortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'price':
        aValue = a.price?.base || 0
        bValue = b.price?.base || 0
        break
      case 'category':
        aValue = a.category
        bValue = b.category
        break
      case 'status':
        aValue = a.isActive ? 1 : 0
        bValue = b.isActive ? 1 : 0
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
    }

    if (productSortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Get all available categories from the categories object
  const productCategories = Object.keys(categories)

  // Filtered orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!orderSearchTerm) return true
    const searchLower = orderSearchTerm.toLowerCase()
    return (
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchLower)) ||
      (order.shippingAddress?.fullName && order.shippingAddress.fullName.toLowerCase().includes(searchLower))
    )
  })

  // Product statistics
  const productStats = {
    total: products.length,
    active: products.filter(p => p.isActive === true).length,
    inactive: products.filter(p => p.isActive === false).length,
    filtered: filteredProducts.length,
    byCategory: productCategories.reduce((acc, category) => {
      acc[category] = products.filter(p => p.category === category).length
      return acc
    }, {}),
    averagePrice: products.length > 0 ?
      (products.reduce((sum, p) => sum + (p.price?.base || 0), 0) / products.length).toFixed(2) : 0
  }

  // API Functions
  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const [usersRes, ordersRes, productStatsRes, logoRequestsRes, embroideryRequestsRes, customDesignOrdersRes, reviewsRes] = await Promise.all([
        axios.get('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/products/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/custom-logo-requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/custom-embroidery-requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/custom-design-orders/admin', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/admin/reviews', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      // Calculate total revenue from all order types
      const ordersRevenue = ordersRes.data.orders?.reduce((sum, order) => sum + (order.pricing?.total || 0), 0) || 0
      const logoRequestsRevenue = logoRequestsRes.data.data?.reduce((sum, request) => sum + (request.pricing?.totalPrice || 0), 0) || 0
      const embroideryRequestsRevenue = embroideryRequestsRes.data.data?.reduce((sum, request) => sum + (request.pricing?.totalPrice || 0), 0) || 0
      const customDesignOrdersRevenue = customDesignOrdersRes.data.orders?.reduce((sum, order) => sum + (order.pricing?.totalPrice || 0), 0) || 0
      const totalRevenue = ordersRevenue + logoRequestsRevenue + embroideryRequestsRevenue + customDesignOrdersRevenue

      setStats({
        totalUsers: usersRes.data.total || 0,
        totalOrders: ordersRes.data.total || 0,
        totalProducts: productStatsRes.data.stats?.activeProducts || 0,
        totalRevenue,
        totalLogoRequests: logoRequestsRes.data.total || 0,
        totalEmbroideryRequests: embroideryRequestsRes.data.total || 0,
        totalCustomDesignOrders: customDesignOrdersRes.data.total || 0,
        totalReviews: reviewsRes.data.data?.pagination?.total || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to fetch dashboard statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchChartData = async () => {
    setChartsLoading(true)
    try {
      // Generate sample data for the last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

      // For now, we'll use sample data. In a real app, you'd fetch this from APIs
      const ordersData = months.map((month, index) => ({
        name: month,
        orders: Math.floor(Math.random() * 50) + 30 + index * 5
      }))

      const revenueData = months.map((month, index) => ({
        name: month,
        revenue: Math.floor(Math.random() * 3000) + 2000 + index * 500
      }))

      const usersData = months.map((month, index) => ({
        name: month,
        users: Math.floor(Math.random() * 30) + 10 + index * 8
      }))

      setChartData({
        ordersData,
        revenueData,
        usersData
      })
    } catch (error) {
      console.error('Error fetching chart data:', error)
      toast.error('Failed to fetch chart data')
    } finally {
      setChartsLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const response = await axios.get('/api/products/admin/all?limit=1000', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchOrders = async (page = 1) => {
    setOrdersLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ordersPagination.limit.toString(),
        ...(ordersFilters.search && { search: ordersFilters.search }),
        ...(ordersFilters.status && { status: ordersFilters.status }),
        sortBy: ordersFilters.sortBy,
        sortOrder: ordersFilters.sortOrder
      })

      const response = await axios.get(`/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setOrders(response.data.orders || [])
      setOrdersPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0,
        limit: response.data.limit || 10
      })
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  const fetchLogoRequests = async () => {
    setLogoRequestsLoading(true)
    try {
      const response = await axios.get('/api/custom-logo-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setLogoRequests(response.data.data || [])
    } catch (error) {
      console.error('Error fetching logo requests:', error)
      toast.error('Failed to fetch logo requests')
    } finally {
      setLogoRequestsLoading(false)
    }
  }

  const fetchEmbroideryRequests = async () => {
    setEmbroideryRequestsLoading(true)
    try {
      const response = await axios.get('/api/custom-embroidery-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setEmbroideryRequests(response.data.data || [])
    } catch (error) {
      console.error('Error fetching embroidery requests:', error)
      toast.error('Failed to fetch embroidery requests')
    } finally {
      setEmbroideryRequestsLoading(false)
    }
  }

  const fetchCustomDesignOrders = async () => {
    setCustomDesignOrdersLoading(true)
    try {
      const response = await axios.get('/api/custom-design-orders/admin', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setCustomDesignOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching custom design orders:', error)
      toast.error('Failed to fetch custom design orders')
    } finally {
      setCustomDesignOrdersLoading(false)
    }
  }

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await axios.get('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setReviews(response.data.data.reviews || [])
      setReviewStats(response.data.data.statusCounts || {})
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleLogoRequestStatusChange = async (requestId, newStatus) => {
    try {
      await axios.put(`/api/custom-logo-requests/${requestId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      toast.success('Logo request status updated successfully')
      fetchLogoRequests()
    } catch (error) {
      console.error('Error updating logo request status:', error)
      toast.error('Failed to update logo request status')
    }
  }

  const handleEmbroideryRequestStatusChange = async (requestId, newStatus) => {
    try {
      await axios.put(`/api/custom-embroidery-requests/${requestId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      toast.success('Embroidery request status updated successfully')
      fetchEmbroideryRequests()
    } catch (error) {
      console.error('Error updating embroidery request status:', error)
      toast.error('Failed to update embroidery request status')
    }
  }

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      // Find the current order to get its current status
      const currentOrder = orders.find(order => order._id === orderId)
      if (!currentOrder) {
        toast.error('Order not found')
        return
      }

      const currentStatus = currentOrder.status

      // Validate status transitions
      const invalidTransitions = {
        'completed': ['pending', 'confirmed', 'in-progress'],
        'cancelled': ['pending', 'confirmed', 'in-progress', 'completed']
      }

      if (invalidTransitions[currentStatus] && invalidTransitions[currentStatus].includes(newStatus)) {
        toast.error(`Cannot change status from ${currentStatus} to ${newStatus}`)
        return
      }

      // Confirm critical status changes
      if ((newStatus === 'cancelled' || newStatus === 'completed') && currentStatus !== newStatus) {
        const confirmMessage = newStatus === 'cancelled'
          ? 'Are you sure you want to cancel this order?'
          : 'Are you sure you want to mark this order as completed?'

        if (!window.confirm(confirmMessage)) {
          return
        }
      }

      await axios.put(`/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      toast.success('Order status updated successfully')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update order status'
      toast.error(errorMessage)
    }
  }

  const handleReviewStatusChange = async (reviewId, newStatus) => {
    try {
      await axios.put(`/api/admin/reviews/${reviewId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      )
      toast.success('Review status updated successfully')
      fetchReviews()
    } catch (error) {
      console.error('Error updating review status:', error)
      toast.error('Failed to update review status')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`/api/admin/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        toast.success('Review deleted successfully')
        fetchReviews()
      } catch (error) {
        console.error('Error deleting review:', error)
        toast.error('Failed to delete review')
      }
    }
  }

  // CRUD Handlers for Users
  const handleAddUser = async () => {
    try {
      const response = await axios.post('/api/users', userFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success('User added successfully')
      setShowAddUserModal(false)
      setUserFormData({ name: '', email: '', role: 'user' })
      fetchUsers()
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error(error.response?.data?.message || 'Failed to add user')
    }
  }

  const handleEditUser = async () => {
    try {
      const response = await axios.put(`/api/users/${selectedUser._id}`, userFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success('User updated successfully')
      setShowEditUserModal(false)
      setSelectedUser(null)
      setUserFormData({ name: '', email: '', role: 'user' })
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        toast.success('User deleted successfully')
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error(error.response?.data?.message || 'Failed to delete user')
      }
    }
  }

  // CRUD Handlers for Products
  const handleAddProduct = async () => {
    try {
      // Validate required fields
      if (!productFormData.name || !productFormData.description || !productFormData.category || !productFormData.subcategory) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!productFormData.price.base || productFormData.price.base <= 0) {
        toast.error('Base price must be greater than 0')
        return
      }

      // Transform the data to match backend expectations
      const transformedData = {
        ...productFormData,
        // Convert imageUrl to images array if imageUrl exists
        images: productFormData.imageUrl ? [
          {
            url: productFormData.imageUrl,
            alt: productFormData.name || '',
            isPrimary: true
          }
        ] : productFormData.images || [],
        // Ensure subcategory is not empty string
        subcategory: productFormData.subcategory || 'other',
        // Ensure deliveryTime is properly set
        deliveryTime: {
          base: Number(productFormData.deliveryTime?.base) || 7,
          premium: Number(productFormData.deliveryTime?.premium) || 5,
          enterprise: Number(productFormData.deliveryTime?.enterprise) || 3
        },
        // Ensure price values are numbers
        price: {
          base: Number(productFormData.price.base),
          premium: Number(productFormData.price.premium) || 0,
          enterprise: Number(productFormData.price.enterprise) || 0
        }
      }

      // Remove imageUrl from the data being sent
      delete transformedData.imageUrl

      console.log('Sending product data:', JSON.stringify(transformedData, null, 2))
      console.log('Auth token exists:', !!localStorage.getItem('token'))

      const response = await axios.post('/api/products', transformedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success('Product added successfully')
      setShowAddProductModal(false)

      // Reset form data and clear image preview states
      setProductFormData({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        price: { base: 0, premium: 0, enterprise: 0 },
        images: [],
        imageUrl: '',
        deliveryTime: { base: 7, premium: 5, enterprise: 3 }
      })

      // Clear image preview states (add these lines)
      setImagePreview('')
      setSelectedFile(null)

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      fetchProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to add product')
    }
  }

  const handleEditProduct = async () => {
    try {
      // Validate required fields
      if (!productFormData.name || !productFormData.description || !productFormData.category || !productFormData.subcategory) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!productFormData.price.base || productFormData.price.base <= 0) {
        toast.error('Base price must be greater than 0')
        return
      }

      // Transform the data to match backend expectations
      const transformedData = {
        ...productFormData,
        // Convert imageUrl to images array if imageUrl exists
        images: productFormData.imageUrl ? [
          {
            url: productFormData.imageUrl,
            alt: productFormData.name || '',
            isPrimary: true
          }
        ] : productFormData.images || [],
        // Ensure subcategory is not empty string
        subcategory: productFormData.subcategory && productFormData.subcategory.trim() !== '' ? productFormData.subcategory.trim() : 'other',
        // Ensure deliveryTime is properly set
        deliveryTime: {
          base: Number(productFormData.deliveryTime?.base) || 7,
          premium: Number(productFormData.deliveryTime?.premium) || 5,
          enterprise: Number(productFormData.deliveryTime?.enterprise) || 3
        },
        // Ensure price values are numbers
        price: {
          base: Number(productFormData.price.base),
          premium: Number(productFormData.price.premium) || 0,
          enterprise: Number(productFormData.price.enterprise) || 0
        }
      }

      // Remove imageUrl from the data being sent
      delete transformedData.imageUrl

      console.log('Updating product data:', JSON.stringify(transformedData, null, 2))

      const response = await axios.put(`/api/products/${selectedProduct._id}`, transformedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success('Product updated successfully')
      setShowEditProductModal(false)
      setSelectedProduct(null)

      // Reset form data and clear image preview states
      setProductFormData({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        price: { base: 0, premium: 0, enterprise: 0 },
        images: [],
        imageUrl: '',
        deliveryTime: { base: 7, premium: 5, enterprise: 3 }
      })

      // Clear image preview states
      setImagePreview('')
      setSelectedFile(null)

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      fetchProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        toast.success('Product deleted successfully')
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error(error.response?.data?.message || 'Failed to delete product')
      }
    }
  }

  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      await axios.patch(`/api/products/${productId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully`)
      fetchProducts()
      fetchStats() // Refresh stats to update active product count
    } catch (error) {
      console.error('Error toggling product status:', error)
      toast.error(error.response?.data?.message || 'Failed to update product status')
    }
  }

  const handleActivateAllProducts = async () => {
    if (window.confirm('Are you sure you want to activate all products?')) {
      try {
        const response = await axios.patch('/api/products/admin/activate-all', {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        toast.success(response.data.message)
        fetchProducts()
        fetchStats() // Refresh stats to update active product count
      } catch (error) {
        console.error('Error activating all products:', error)
        toast.error(error.response?.data?.message || 'Failed to activate all products')
      }
    }
  }

  // Profile and logout handlers
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const handleProfileUpdate = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      toast.success('Profile updated successfully')
      setShowProfileModal(false)
      // Optionally refresh user data
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchStats()
    fetchChartData()
  }, [])

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'users':
        fetchUsers()
        break
      case 'products':
        fetchProducts()
        break
      case 'orders':
        fetchOrders()
        break
      case 'logo-requests':
        fetchLogoRequests()
        break
      case 'embroidery-requests':
        fetchEmbroideryRequests()
        break
      case 'custom-design-orders':
        fetchCustomDesignOrders()
        break
      case 'reviews':
        fetchReviews()
        break
      default:
        break
    }
  }, [activeTab])

  // Refetch orders when filters change
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders(1) // Reset to page 1 when filters change
    }
  }, [ordersFilters])

  const handleOrdersFilterChange = (key, value) => {
    setOrdersFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleOrdersPageChange = (page) => {
    fetchOrders(page)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'delivered': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Export functions
  const handleExportOrders = async () => {
    try {
      const response = await axios.get('/api/orders/export/csv', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Orders exported successfully')
    } catch (error) {
      console.error('Error exporting orders:', error)
      toast.error('Failed to export orders')
    }
  }

  const handleExportUsers = async () => {
    try {
      const response = await axios.get('/api/users/export/csv', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Users exported successfully')
    } catch (error) {
      console.error('Error exporting users:', error)
      toast.error('Failed to export users')
    }
  }

  const handleExportLogoRequests = async () => {
    try {
      const response = await axios.get('/api/custom-logo-requests/export/csv', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `logo_requests_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Logo requests exported successfully')
    } catch (error) {
      console.error('Error exporting logo requests:', error)
      toast.error('Failed to export logo requests')
    }
  }

  const handleExportEmbroideryRequests = async () => {
    try {
      const response = await axios.get('/api/custom-embroidery-requests/export/csv', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `embroidery_requests_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Embroidery requests exported successfully')
    } catch (error) {
      console.error('Error exporting embroidery requests:', error)
      toast.error('Failed to export embroidery requests')
    }
  }

  const handleExportCustomDesignOrders = async () => {
    try {
      const response = await axios.get('/api/custom-design-orders/export/csv', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `custom_design_orders_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Custom design orders exported successfully')
    } catch (error) {
      console.error('Error exporting custom design orders:', error)
      toast.error('Failed to export custom design orders')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-2xl border-r border-gray-200 transition-all duration-300 z-20 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <p className="text-xs text-gray-500 mt-1">Management Dashboard</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                title={sidebarCollapsed ? tab.name : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="ml-3 truncate">{tab.name}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              title={sidebarCollapsed ? 'Profile Settings' : ''}
            >
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </button>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="text-left w-full hover:bg-gray-50 p-1 rounded transition-colors duration-200"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Administrator
                  </p>
                </button>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
        {/* Top Header */}
        <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your e-commerce platform with ease
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md">
                  <span className="text-sm font-medium">Welcome, {user?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    onClick={() => setActiveTab('users')}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : stats.totalUsers}
                        </p>
                        <p className="text-blue-200 text-xs mt-1">+12% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <UsersIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium mb-1">Total Orders</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : stats.totalOrders}
                        </p>
                        <p className="text-emerald-200 text-xs mt-1">+8% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <ShoppingBagIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('products')}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium mb-1">Total Products</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : stats.totalProducts}
                        </p>
                        <p className="text-purple-200 text-xs mt-1">+5% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <PhotoIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-sm font-medium mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : `₹${stats.totalRevenue.toFixed(2)}`}
                        </p>
                        <p className="text-amber-200 text-xs mt-1">+15% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <ChartBarIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('logo-requests')}
                    className="bg-gradient-to-br from-pink-500 to-rose-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm font-medium mb-1">Logo Requests</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : stats.totalLogoRequests}
                        </p>
                        <p className="text-pink-200 text-xs mt-1">+3% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <SparklesIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('embroidery-requests')}
                    className="bg-gradient-to-br from-teal-500 to-cyan-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm font-medium mb-1">Embroidery Requests</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : stats.totalEmbroideryRequests}
                        </p>
                        <p className="text-teal-200 text-xs mt-1">+7% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <SwatchIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('custom-design-orders')}
                    className="bg-gradient-to-br from-emerald-500 to-green-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium mb-1">Custom Design Orders</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : stats.totalCustomDesignOrders}
                        </p>
                        <p className="text-emerald-200 text-xs mt-1">+12% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <CogIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('reviews')}
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm font-medium mb-1">Total Reviews</p>
                        <p className="text-3xl font-bold text-white">
                          {statsLoading ? '...' : stats.totalReviews}
                        </p>
                        <p className="text-indigo-200 text-xs mt-1">+10% from last month</p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Charts Section */}
                <div className="mt-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
                    <p className="text-gray-600 text-sm">Track your business performance with detailed charts and trends</p>
                  </div>
                  <DashboardCharts
                    ordersData={chartData.ordersData}
                    revenueData={chartData.revenueData}
                    usersData={chartData.usersData}
                    loading={chartsLoading}
                  />
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleExportUsers}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5 inline mr-2" />
                      Add User
                    </button>
                  </div>
                </div>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setUserFormData({ name: user.name, email: user.email, role: user.role })
                                  setShowEditUserModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {ordersPagination.totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((ordersPagination.currentPage - 1) * ordersPagination.limit) + 1} to {Math.min(ordersPagination.currentPage * ordersPagination.limit, ordersPagination.total)} of {ordersPagination.total} orders
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOrdersPageChange(ordersPagination.currentPage - 1)}
                            disabled={ordersPagination.currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>

                          {Array.from({ length: ordersPagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handleOrdersPageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${page === ordersPagination.currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => handleOrdersPageChange(ordersPagination.currentPage + 1)}
                            disabled={ordersPagination.currentPage === ordersPagination.totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Product Management</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleActivateAllProducts}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <SparklesIcon className="h-5 w-5 inline mr-2" />
                      Activate All
                    </button>
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5 inline mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Enhanced Product Stats */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-center">
                      <div className="font-semibold">{productStats.total}</div>
                      <div className="text-xs">Total Products</div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-center">
                      <div className="font-semibold">{productStats.active}</div>
                      <div className="text-xs">Active</div>
                    </div>
                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-center">
                      <div className="font-semibold">{productStats.inactive}</div>
                      <div className="text-xs">Inactive</div>
                    </div>
                    <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-center">
                      <div className="font-semibold">{productStats.filtered}</div>
                      <div className="text-xs">Filtered Results</div>
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-center">
                      <div className="font-semibold">₹{productStats.averagePrice}</div>
                      <div className="text-xs">Avg Price</div>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg text-center">
                      <div className="font-semibold">{productCategories.length}</div>
                      <div className="text-xs">Categories</div>
                    </div>
                  </div>

                  {/* Category breakdown when filtered */}
                  {productFilterCategory && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Category: {categories[productFilterCategory]?.label || productFilterCategory}
                      </div>
                      <div className="text-xs text-gray-600">
                        {productStats.byCategory[productFilterCategory] || 0} products in this category
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Product Filters */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          placeholder="Search by name..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={productFilterCategory}
                        onChange={(e) => setProductFilterCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">All Categories</option>
                        {productCategories.map(category => (
                          <option key={category} value={category}>
                            {categories[category]?.label || category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={productFilterStatus}
                        onChange={(e) => setProductFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">All Products</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                      <div className="flex space-x-2">
                        <select
                          value={productSortBy}
                          onChange={(e) => setProductSortBy(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="name">Name</option>
                          <option value="price">Price</option>
                          <option value="category">Category</option>
                          <option value="status">Status</option>
                        </select>
                        <button
                          onClick={() => setProductSortOrder(productSortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          title={`Sort ${productSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                        >
                          {productSortOrder === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  {/* Price Range Filter */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>

                    {/* Predefined Price Range Buttons */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        onClick={() => setProductPriceRange({ min: '', max: '' })}
                        className={`px-3 py-1 text-xs rounded-full border ${!productPriceRange.min && !productPriceRange.max
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                      >
                        All Prices
                      </button>
                      <button
                        onClick={() => setProductPriceRange({ min: '', max: '500' })}
                        className={`px-3 py-1 text-xs rounded-full border ${!productPriceRange.min && productPriceRange.max === '500'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                      >
                        Below ₹500
                      </button>
                      <button
                        onClick={() => setProductPriceRange({ min: '501', max: '1000' })}
                        className={`px-3 py-1 text-xs rounded-full border ${productPriceRange.min === '501' && productPriceRange.max === '1000'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                      >
                        ₹501 - ₹1,000
                      </button>
                      <button
                        onClick={() => setProductPriceRange({ min: '1001', max: '5000' })}
                        className={`px-3 py-1 text-xs rounded-full border ${productPriceRange.min === '1001' && productPriceRange.max === '5000'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                      >
                        ₹1,001 - ₹5,000
                      </button>
                      <button
                        onClick={() => setProductPriceRange({ min: '5000', max: '' })}
                        className={`px-3 py-1 text-xs rounded-full border ${productPriceRange.min === '5000' && !productPriceRange.max
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                      >
                        Above ₹5,000
                      </button>
                    </div>

                    {/* Custom Price Range Inputs */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={productPriceRange.min}
                        onChange={(e) => setProductPriceRange({ ...productPriceRange, min: e.target.value })}
                        placeholder="Min price"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        value={productPriceRange.max}
                        onChange={(e) => setProductPriceRange({ ...productPriceRange, max: e.target.value })}
                        placeholder="Max price"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => setProductPriceRange({ min: '', max: '' })}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Clear All Filters */}
                  {(productSearchTerm || productFilterCategory || productFilterStatus || productPriceRange.min || productPriceRange.max) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setProductSearchTerm('')
                          setProductFilterCategory('')
                          setProductFilterStatus('')
                          setProductPriceRange({ min: '', max: '' })
                          setProductSortBy('name')
                          setProductSortOrder('asc')
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>

                {productsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {productFilterStatus ? `No ${productFilterStatus} products found.` : 'Get started by adding your first product.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product._id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${product.isActive ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'
                        }`}>
                        <div className="relative mb-4">
                          <img
                            src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop'}
                            alt={product.name}
                            className={`w-full h-40 object-cover rounded-lg ${!product.isActive ? 'opacity-50' : ''}`}
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {categories[product.category]?.label || product.category}
                          </div>
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>

                          <div className="flex justify-between items-center">
                            <div className="text-lg font-bold text-blue-600">
                              ₹{product.price?.base || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.reviewsCount || 0} reviews
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleToggleProductStatus(product._id, product.isActive)}
                                className={`p-1 rounded ${product.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                title={product.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setProductFormData({
                                    name: product.name,
                                    description: product.description,
                                    category: product.category,
                                    subcategory: product.subcategory || '',
                                    price: product.price || { base: 0, premium: 0, enterprise: 0 },
                                    images: product.images || [],
                                    imageUrl: product.images && product.images.length > 0 ? product.images[0].url : '',
                                    deliveryTime: product.deliveryTime || { base: 7, premium: 5, enterprise: 3 }
                                  })
                                  setShowEditProductModal(true)
                                }}
                                className="p-1 rounded text-blue-600 hover:bg-blue-50"
                                title="Edit"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-1 rounded text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order Management</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      {ordersPagination.total > 0 && `${ordersPagination.total} total orders`}
                    </div>
                    <button
                      onClick={handleExportOrders}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={ordersFilters.search}
                        onChange={(e) => handleOrdersFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={ordersFilters.status}
                      onChange={(e) => handleOrdersFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Sort By */}
                    <select
                      value={ordersFilters.sortBy}
                      onChange={(e) => handleOrdersFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="createdAt">Date</option>
                      <option value="totalAmount">Amount</option>
                      <option value="status">Status</option>
                      <option value="orderNumber">Order Number</option>
                    </select>

                    {/* Sort Order */}
                    <select
                      value={ordersFilters.sortOrder}
                      onChange={(e) => handleOrdersFilterChange('sortOrder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading orders...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber || `#${order._id.slice(-6)}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.user?.name || order.shippingAddress?.fullName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{(order.pricing?.total || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                className={`text-xs font-semibold rounded px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowOrderDetailsModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Logo Requests Tab */}
            {activeTab === 'logo-requests' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Logo Requests</h3>
                  <button
                    onClick={handleExportLogoRequests}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                    Export CSV
                  </button>
                </div>
                {logoRequestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading logo requests...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {logoRequests.map((request) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.businessName}</h4>
                            <p className="text-sm text-gray-600">{request.industry}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{request.description}</p>
                        {request.referenceImages && request.referenceImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Reference Images:</p>
                            <div className="flex space-x-2">
                              {request.referenceImages.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Reference ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <select
                              value={request.status}
                              onChange={(e) => handleLogoRequestStatusChange(request._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Embroidery Requests Tab */}
            {activeTab === 'embroidery-requests' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Embroidery Requests</h3>
                  <button
                    onClick={handleExportEmbroideryRequests}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                    Export CSV
                  </button>
                </div>
                {embroideryRequestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading embroidery requests...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {embroideryRequests.map((request) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.designName}</h4>
                            <p className="text-sm text-gray-600">{request.embroideryType}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{request.description}</p>
                        {request.designImages && request.designImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Design Images:</p>
                            <div className="flex space-x-2">
                              {request.designImages.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Design ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <select
                              value={request.status}
                              onChange={(e) => handleEmbroideryRequestStatusChange(request._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Design Orders Tab */}
            {activeTab === 'custom-design-orders' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Custom Design Orders</h3>
                  <button
                    onClick={handleExportCustomDesignOrders}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                </div>
                {customDesignOrdersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading custom design orders...</p>
                  </div>
                ) : customDesignOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No custom design orders found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {customDesignOrders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{order.product?.name || 'Unknown Product'}</h4>
                            <p className="text-sm text-gray-600">Order #{order.orderNumber || order._id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">Customer: {order.user?.name || 'Unknown'}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status || 'pending'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-sm"><span className="font-medium">Design Type:</span> {order.designType}</p>
                          <p className="text-sm"><span className="font-medium">Quantity:</span> {order.quantity}</p>
                          {order.pricing && (
                            <p className="text-sm"><span className="font-medium">Total:</span> ₹{order.pricing.total}</p>
                          )}
                        </div>

                        {order.uploadedDesign && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Design:</p>
                            <div className="flex items-center space-x-3">
                              <img
                                src={order.uploadedDesign.url}
                                alt="Uploaded design"
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{order.uploadedDesign.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  {(order.uploadedDesign.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Review Management</h3>
                  <div className="flex space-x-4">
                    {reviewStats && Object.keys(reviewStats).length > 0 && (
                      <div className="flex space-x-2">
                        {Object.entries(reviewStats).map(([status, count]) => (
                          <span key={status} className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${status === 'approved' ? 'bg-green-100 text-green-800' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {status}: {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading reviews...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{review.user?.name || 'Anonymous'}</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {review.status}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Product: {review.product?.name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                              {review.helpfulVotes > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{review.helpfulVotes} helpful votes</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <select
                              value={review.status}
                              onChange={(e) => handleReviewStatusChange(review._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {review.images && review.images.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                            <div className="flex space-x-2">
                              {review.images.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{user?.name}</h4>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 mt-2">
                  {user?.role}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle profile update logic here
                  toast.success('Profile updated successfully')
                  setShowProfileModal(false)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout? You will need to login again to access the admin panel.</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  handleLogout()
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setUserFormData({ name: '', email: '', role: 'user' })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setUserFormData({ name: '', email: '', role: 'user' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditUserModal(false)
                  setSelectedUser(null)
                  setUserFormData({ name: '', email: '', role: 'user' })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditUserModal(false)
                  setSelectedUser(null)
                  setUserFormData({ name: '', email: '', role: 'user' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              <button
                onClick={() => {
                  setShowAddProductModal(false)
                  setProductFormData({
                    name: '',
                    description: '',
                    category: '',
                    subcategory: '',
                    price: { base: 0, premium: 0, enterprise: 0 },
                    images: [],
                    deliveryTime: { base: 7, premium: 5, enterprise: 3 }
                  })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Base Price</label>
                    <input
                      type="number"
                      value={productFormData.price.base}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        price: { ...productFormData.price, base: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Premium Price</label>
                    <input
                      type="number"
                      value={productFormData.price.premium}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        price: { ...productFormData.price, premium: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Enterprise Price</label>
                    <input
                      type="number"
                      value={productFormData.price.enterprise}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        price: { ...productFormData.price, enterprise: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enterprise"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={productFormData.category}
                  onChange={(e) => {
                    setProductFormData({
                      ...productFormData,
                      category: e.target.value,
                      subcategory: '' // Reset subcategory when category changes
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <select
                  value={productFormData.subcategory}
                  onChange={(e) => setProductFormData({ ...productFormData, subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!productFormData.category}
                >
                  <option value="">Select a subcategory</option>
                  {productFormData.category && categories[productFormData.category]?.subcategories.map((subcategory) => (
                    <option key={subcategory.value} value={subcategory.value}>{subcategory.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL or Upload</label>

                {/* URL Input */}
                <div className="mb-3">
                  <input
                    type="url"
                    value={productFormData.imageUrl || ''}
                    onChange={(e) => {
                      setProductFormData({ ...productFormData, imageUrl: e.target.value });
                      // Clear file preview when typing URL
                      if (e.target.value) {
                        setImagePreview('');
                        setSelectedFile(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product image URL"
                  />
                </div>

                {/* File Upload */}
                <div className="mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isUploading}
                    />
                    {(imagePreview || productFormData.imageUrl) && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {isUploading && (
                    <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                  )}
                </div>

                {/* Image Preview */}
                {(imagePreview || productFormData.imageUrl) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={imagePreview || productFormData.imageUrl}
                      alt="Preview"
                      className="rounded-lg border h-32 w-32 object-cover shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        toast.error('Failed to load image preview');
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (Days)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Base</label>
                    <input
                      type="number"
                      min="1"
                      value={productFormData.deliveryTime.base}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        deliveryTime: { ...productFormData.deliveryTime, base: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="7"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Premium</label>
                    <input
                      type="number"
                      min="1"
                      value={productFormData.deliveryTime.premium}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        deliveryTime: { ...productFormData.deliveryTime, premium: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Enterprise</label>
                    <input
                      type="number"
                      min="1"
                      value={productFormData.deliveryTime.enterprise}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        deliveryTime: { ...productFormData.deliveryTime, enterprise: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddProductModal(false)
                  setProductFormData({
                    name: '',
                    description: '',
                    category: '',
                    subcategory: '',
                    price: { base: 0, premium: 0, enterprise: 0 },
                    images: [],
                    deliveryTime: { base: 7, premium: 5, enterprise: 3 }
                  })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {/* Edit Product Modal */}
      {showEditProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button
                onClick={() => {
                  setShowEditProductModal(false)
                  setSelectedProduct(null)
                  setProductFormData({
                    name: '',
                    description: '',
                    category: '',
                    subcategory: '',
                    price: { base: 0, premium: 0, enterprise: 0 },
                    images: [],
                    imageUrl: '',
                    deliveryTime: { base: 7, premium: 5, enterprise: 3 }
                  })
                  // Clear image preview states
                  setImagePreview('')
                  setSelectedFile(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Base Price</label>
                    <input
                      type="number"
                      value={productFormData.price.base}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        price: { ...productFormData.price, base: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Premium Price</label>
                    <input
                      type="number"
                      value={productFormData.price.premium}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        price: { ...productFormData.price, premium: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Enterprise Price</label>
                    <input
                      type="number"
                      value={productFormData.price.enterprise}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        price: { ...productFormData.price, enterprise: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enterprise"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={productFormData.category}
                  onChange={(e) => {
                    setProductFormData({
                      ...productFormData,
                      category: e.target.value,
                      subcategory: '' // Reset subcategory when category changes
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <select
                  value={productFormData.subcategory}
                  onChange={(e) => setProductFormData({ ...productFormData, subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!productFormData.category}
                >
                  <option value="">Select a subcategory</option>
                  {productFormData.category && categories[productFormData.category]?.subcategories.map((subcategory) => (
                    <option key={subcategory.value} value={subcategory.value}>{subcategory.label}</option>
                  ))}
                </select>
              </div>

              {/* Delivery Time Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (Days)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Base</label>
                    <input
                      type="number"
                      value={productFormData.deliveryTime.base}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        deliveryTime: { ...productFormData.deliveryTime, base: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Base"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Premium</label>
                    <input
                      type="number"
                      value={productFormData.deliveryTime.premium}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        deliveryTime: { ...productFormData.deliveryTime, premium: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Premium"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Enterprise</label>
                    <input
                      type="number"
                      value={productFormData.deliveryTime.enterprise}
                      onChange={(e) => setProductFormData({
                        ...productFormData,
                        deliveryTime: { ...productFormData.deliveryTime, enterprise: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enterprise"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {(imagePreview || productFormData.imageUrl) && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Image Preview */}
                  {(imagePreview || productFormData.imageUrl) && (
                    <div className="mt-3">
                      <img
                        src={imagePreview || productFormData.imageUrl}
                        alt="Product preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div className="text-center text-sm text-gray-500">or</div>
                  <div>
                    <input
                      type="url"
                      value={productFormData.imageUrl}
                      onChange={(e) => setProductFormData({ ...productFormData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product image URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditProductModal(false)
                  setSelectedProduct(null)
                  setProductFormData({
                    name: '',
                    description: '',
                    category: '',
                    subcategory: '',
                    price: { base: 0, premium: 0, enterprise: 0 },
                    images: [],
                    imageUrl: '',
                    deliveryTime: { base: 7, premium: 5, enterprise: 3 }
                  })
                  // Clear image preview states
                  setImagePreview('')
                  setSelectedFile(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProduct}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button
                onClick={() => {
                  setShowOrderDetailsModal(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                  <p className="text-gray-900 font-mono">{selectedOrder.orderNumber || selectedOrder._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-gray-900">{selectedOrder.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedOrder.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <p className="text-gray-900 font-semibold">₹{(selectedOrder.pricing?.total || 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowOrderDetailsModal(false)
                  setSelectedOrder(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard