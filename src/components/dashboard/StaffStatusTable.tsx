import React from 'react'
import { StaffStatus } from '../../services/dashboardService'
import { User, CheckCircle, Clock } from 'lucide-react'

interface StaffStatusTableProps {
  staffData: StaffStatus[]
}

const StaffStatusTable: React.FC<StaffStatusTableProps> = ({ staffData }) => {
  if (staffData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No staff data available
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staffData.map((staff) => (
          <div
            key={staff.staff_id}
            className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{staff.staff_name}</h4>
                  {staff.current_appointment ? (
                    <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>With client</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {staff.current_appointment && (
                <div className="bg-blue-50 rounded px-3 py-2">
                  <p className="text-xs text-gray-600">Current Client</p>
                  <p className="text-sm font-medium text-gray-900">{staff.current_appointment}</p>
                </div>
              )}

              <div className="bg-green-50 rounded px-3 py-2">
                <p className="text-xs text-gray-600">Today's Sales</p>
                <p className="text-lg font-semibold text-green-700">
                  ${staff.daily_sales.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StaffStatusTable
