import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { DollarSign, Users, TrendingUp, Package } from 'lucide-react'
import { dashboardService, DashboardKPIs, ActivityFeed, SalesTrendData, StaffStatus } from '../services/dashboardService'
import KPICard from '../components/dashboard/KPICard'
import SalesTrendChart from '../components/dashboard/SalesTrendChart'
import ActivityFeedItem from '../components/dashboard/ActivityFeedItem'
import StaffStatusTable from '../components/dashboard/StaffStatusTable'

type DateFilter = 'today' | 'month'

const Dashboard: React.FC = () => {
  const { user, persona } = useAuth()
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([])
  const [salesTrend, setSalesTrend] = useState<SalesTrendData[]>([])
  const [staffStatus, setStaffStatus] = useState<StaffStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [dateFilter])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange(dateFilter)

      const [kpiData, activityData, trendData, staffData] = await Promise.all([
        dashboardService.getDashboardKPIs(startDate, endDate),
        dashboardService.getActivityFeed(20),
        dashboardService.getSalesTrend(30),
        dashboardService.getStaffStatus()
      ])

      setKpis(kpiData)
      setActivityFeed(activityData)
      setSalesTrend(trendData)
      setStaffStatus(staffData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = (filter: DateFilter): { startDate: string; endDate: string } => {
    const today = new Date()
    const endDate = today.toISOString().split('T')[0]

    if (filter === 'today') {
      return { startDate: endDate, endDate }
    } else {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return { startDate: startOfMonth.toISOString().split('T')[0], endDate }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.email?.split('@')[0]}
                {persona && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({persona.type === 'admin' ? 'Administrator' : 'Staff Member'})
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {persona?.type === 'admin'
                  ? "Here's your business overview."
                  : "Here's your daily overview."}
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dateFilter === 'today'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dateFilter === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${kpis?.total_revenue?.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          color="blue"
        />
        <KPICard
          title="Service Revenue"
          value={`$${kpis?.service_revenue?.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
          color="green"
        />
        <KPICard
          title="Product Revenue"
          value={`$${kpis?.product_revenue?.toFixed(2) || '0.00'}`}
          icon={Package}
          color="orange"
        />
        <KPICard
          title="New Clients"
          value={kpis?.new_clients_count?.toString() || '0'}
          subtitle={`${kpis?.staff_occupancy_rate?.toFixed(1) || '0'}% Staff Occupancy`}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sales Over Time</h3>
          <p className="text-sm text-gray-600 mt-1">Daily revenue for the last 30 days</p>
        </div>
        <div className="p-6">
          <SalesTrendChart data={salesTrend} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Today's Activity</h3>
            <p className="text-sm text-gray-600 mt-1">Recent events and updates</p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {activityFeed.length > 0 ? (
              <div className="space-y-1">
                {activityFeed.map((activity, index) => (
                  <ActivityFeedItem
                    key={index}
                    activity_time={activity.activity_time}
                    activity_type={activity.activity_type}
                    description={activity.description}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activity recorded yet
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Staff Status</h3>
            <p className="text-sm text-gray-600 mt-1">Current availability and performance</p>
          </div>
          <div className="p-6">
            <StaffStatusTable staffData={staffStatus} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
