import React from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';

const DashboardCharts = ({ 
  ordersData, 
  revenueData, 
  usersData,
  loading = false 
}) => {
  // Sample data for demonstration - this will be replaced with real API data
  const sampleOrdersData = [
    { name: 'Jan', orders: 65 },
    { name: 'Feb', orders: 59 },
    { name: 'Mar', orders: 80 },
    { name: 'Apr', orders: 81 },
    { name: 'May', orders: 56 },
    { name: 'Jun', orders: 95 },
  ];

  const sampleRevenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 7500 },
  ];

  const sampleUsersData = [
    { name: 'Jan', users: 20 },
    { name: 'Feb', users: 35 },
    { name: 'Mar', users: 45 },
    { name: 'Apr', users: 50 },
    { name: 'May', users: 65 },
    { name: 'Jun', users: 80 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <BarChart
        data={ordersData || sampleOrdersData}
        title="Monthly Orders"
        dataKey="orders"
        color="#3B82F6"
        height={280}
      />
      
      <LineChart
        data={revenueData || sampleRevenueData}
        title="Revenue Trend"
        dataKey="revenue"
        color="#10B981"
        height={280}
      />
      
      <BarChart
        data={usersData || sampleUsersData}
        title="New Users"
        dataKey="users"
        color="#8B5CF6"
        height={280}
      />
    </div>
  );
};

export default DashboardCharts;