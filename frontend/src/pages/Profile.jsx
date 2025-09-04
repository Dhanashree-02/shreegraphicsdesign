import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserIcon, ShoppingBagIcon, CogIcon, HeartIcon, PaintBrushIcon, SwatchIcon, PhotoIcon, MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')
  const [loading, setLoading] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || ''
    }
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [ordersFilters, setOrdersFilters] = useState({ status: '', search: '', sortBy: 'createdAt', sortOrder: 'desc' })
  const [logoRequests, setLogoRequests] = useState([])
  const [logoRequestsLoading, setLogoRequestsLoading] = useState(false)
  const [embroideryRequests, setEmbroideryRequests] = useState([])
  const [embroideryRequestsLoading, setEmbroideryRequestsLoading] = useState(false)
  const [customDesignOrders, setCustomDesignOrders] = useState([])
  const [customDesignOrdersLoading, setCustomDesignOrdersLoading] = useState(false)

  // User favorites - should be fetched from backend
  const [favorites, setFavorites] = useState([])

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'logo-requests', name: 'Logo Requests', icon: PaintBrushIcon },
    { id: 'embroidery-requests', name: 'Embroidery Requests', icon: SwatchIcon },
    { id: 'custom-design-orders', name: 'Custom Design Orders', icon: PhotoIcon },
    { id: 'favorites', name: 'Favorites', icon: HeartIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ]

  // Fetch data when tabs are active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    } else if (activeTab === 'logo-requests') {
      fetchLogoRequests()
    } else if (activeTab === 'embroidery-requests') {
      fetchEmbroideryRequests()
    } else if (activeTab === 'custom-design-orders') {
      fetchCustomDesignOrders()
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

  const fetchOrders = async (page = 1) => {
    setOrdersLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        ...(ordersFilters.status && { status: ordersFilters.status }),
        ...(ordersFilters.search && { search: ordersFilters.search }),
        sortBy: ordersFilters.sortBy,
        sortOrder: ordersFilters.sortOrder
      })
      
      const response = await axios.get(`http://localhost:5003/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      setOrders(response.data.orders || [])
      setOrdersPagination({
        page: response.data.page || 1,
        pages: response.data.pages || 1,
        total: response.data.total || 0
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
      const response = await axios.get('http://localhost:5003/api/custom-logo-requests/my-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const response = await axios.get('http://localhost:5003/api/custom-embroidery-requests/my-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const response = await axios.get('http://localhost:5003/api/custom-design-orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setCustomDesignOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching custom design orders:', error)
      toast.error('Failed to fetch custom design orders')
    } finally {
      setCustomDesignOrdersLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await updateProfile(profileData)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    try {
      await axios.put('http://localhost:5003/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'shipped':
        return 'text-purple-600 bg-purple-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="input-field bg-gray-100"
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <textarea
                      value={profileData.address.street}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                      className="input-field"
                      rows={3}
                      placeholder="Enter your street address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={profileData.address.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                        className="input-field"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={profileData.address.state}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                        className="input-field"
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={profileData.address.pincode}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))}
                        className="input-field"
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                  <div className="text-sm text-gray-500">
                    {ordersPagination.total > 0 && `${ordersPagination.total} total orders`}
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                      value={ordersFilters.status}
                      onChange={(e) => handleOrdersFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="createdAt">Date</option>
                      <option value="totalAmount">Amount</option>
                      <option value="status">Status</option>
                    </select>
                    
                    {/* Sort Order */}
                    <select
                      value={ordersFilters.sortOrder}
                      onChange={(e) => handleOrdersFilterChange('sortOrder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
                
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {ordersFilters.search || ordersFilters.status ? 'Try adjusting your filters.' : 'Start shopping to see your orders here.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Order #{order.orderNumber}</h3>
                            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-1">₹{order.totalAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <img
                                src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'}
                                alt={item.product?.name || 'Product'}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.product?.name || 'Product'}</h4>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                <p className="text-sm text-gray-500 capitalize">Tier: {item.tier}</p>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex space-x-3">
                          <button className="btn-secondary text-sm">
                            View Details
                          </button>
                          {order.status === 'delivered' && (
                            <button className="btn-secondary text-sm">
                              Reorder
                            </button>
                          )}
                        </div>
                        </div>
                      ))}
                    </div>
                    
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
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                page === ordersPagination.currentPage
                                  ? 'bg-primary-600 text-white'
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

            {/* Logo Requests Tab */}
            {activeTab === 'logo-requests' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Logo Requests</h2>
                {logoRequestsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading logo requests...</p>
                  </div>
                ) : logoRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <PaintBrushIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No logo requests yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Submit a custom logo request to see it here.</p>
                    <div className="mt-6">
                      <a href="/custom-logo-request" className="btn-primary">
                        Create Logo Request
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {logoRequests.map((request) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{request.businessName}</h3>
                            <p className="text-sm text-gray-500">Submitted on {new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.status === 'completed' ? 'text-green-600 bg-green-100' :
                              request.status === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                              request.status === 'under-review' ? 'text-yellow-600 bg-yellow-100' :
                              'text-gray-600 bg-gray-100'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-1">₹{request.estimatedPrice?.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Business Details</h4>
                            <p className="text-sm text-gray-600">Industry: {request.industry}</p>
                            <p className="text-sm text-gray-600">Package: {request.packageType}</p>
                            {request.website && <p className="text-sm text-gray-600">Website: {request.website}</p>}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Design Preferences</h4>
                            <p className="text-sm text-gray-600">Style: {request.designStyle}</p>
                            <p className="text-sm text-gray-600">Colors: {request.colorPreferences}</p>
                            {request.targetAudience && <p className="text-sm text-gray-600">Target: {request.targetAudience}</p>}
                          </div>
                        </div>
                        
                        {request.description && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                        )}
                        
                        {request.referenceImages && request.referenceImages.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Reference Images</h4>
                            <div className="flex space-x-2">
                              {request.referenceImages.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={`http://localhost:5003${image}`}
                                  alt={`Reference ${index + 1}`}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              ))}
                              {request.referenceImages.length > 3 && (
                                <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">+{request.referenceImages.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <button className="btn-secondary text-sm">
                            View Details
                          </button>
                          {request.status === 'completed' && request.finalDesigns && (
                            <button className="btn-primary text-sm">
                              Download Designs
                            </button>
                          )}
                          {request.status === 'in-progress' && (
                            <button className="btn-secondary text-sm">
                              Add Revision
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Embroidery Requests Tab */}
    {activeTab === 'embroidery-requests' && (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Embroidery Requests</h2>
        {embroideryRequestsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading embroidery requests...</p>
          </div>
        ) : embroideryRequests.length === 0 ? (
          <div className="text-center py-12">
            <SwatchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No embroidery requests yet</h3>
            <p className="mt-1 text-sm text-gray-500">Submit your first custom embroidery request to see it here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {embroideryRequests.map((request) => (
              <div key={request._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{request.businessName}</h3>
                    <p className="text-sm text-gray-500">Submitted on {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600"><span className="font-medium">Embroidery Type:</span> {request.embroideryType}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Garment:</span> {request.garmentType}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Placement:</span> {request.placement}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><span className="font-medium">Quantity:</span> {request.quantity}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Package:</span> {request.packageType}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Price:</span> ₹{request.totalPrice}</p>
                  </div>
                </div>
                
                {request.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Description:</span></p>
                    <p className="text-sm text-gray-700 mt-1">{request.description}</p>
                  </div>
                )}
                
                {request.referenceImages && request.referenceImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Reference Images:</p>
                    <div className="flex space-x-2">
                      {request.referenceImages.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5003${image}`}
                          alt={`Reference ${index + 1}`}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ))}
                      {request.referenceImages.length > 3 && (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{request.referenceImages.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button className="btn-secondary text-sm">
                    View Details
                  </button>
                  {request.status === 'completed' && request.finalDesigns && (
                    <button className="btn-primary text-sm">
                      Download Designs
                    </button>
                  )}
                  {request.status === 'in-progress' && (
                    <button className="btn-secondary text-sm">
                      Add Revision
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Custom Design Orders Tab */}
    {activeTab === 'custom-design-orders' && (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Design Orders</h2>
        {customDesignOrdersLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Loading custom design orders...</p>
          </div>
        ) : customDesignOrders.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No custom design orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your designs to create custom orders.</p>
            <div className="mt-6">
              <a href="/embroidery" className="btn-primary">
                Create Custom Order
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {customDesignOrders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {order.product?.name || 'Custom Design Order'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'completed' ? 'text-green-600 bg-green-100' :
                      order.status === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                      order.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                      'text-gray-600 bg-gray-100'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-1">₹{order.totalCost?.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Order Details</h4>
                    <p className="text-sm text-gray-600">Design Type: {order.designType}</p>
                    <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                    {order.deliveryType && <p className="text-sm text-gray-600">Delivery: {order.deliveryType}</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Design Placements</h4>
                    {order.designPlacements && order.designPlacements.length > 0 ? (
                      order.designPlacements.map((placement, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {placement.position}: {placement.width}x{placement.height}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">No placements specified</p>
                    )}
                  </div>
                </div>
                
                {order.specialInstructions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Special Instructions</h4>
                    <p className="text-sm text-gray-600">{order.specialInstructions}</p>
                  </div>
                )}
                
                {order.uploadedDesign && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Design</h4>
                    <div className="flex items-center space-x-4">
                      <img
                        src={`http://localhost:5003${order.uploadedDesign.url}`}
                        alt="Uploaded Design"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.uploadedDesign.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {order.uploadedDesign.fileType} • {(order.uploadedDesign.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button className="btn-secondary text-sm">
                    View Details
                  </button>
                  {order.status === 'completed' && order.finalDesigns && (
                    <button className="btn-primary text-sm">
                      Download Final Design
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button className="btn-secondary text-sm">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Favorite Items</h2>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Save items you love to see them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((item) => (
                      <div key={item.id} className="card group">
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mb-2">{item.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                          <button className="btn-primary text-sm">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                
                {/* Change Password */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="input-field"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
                
                {/* Account Actions */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={logout}
                      className="w-full btn-secondary text-left"
                    >
                      Sign Out
                    </button>
                    <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile