import React from 'react'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color?: string
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="mt-1">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {subtitle && (
                  <div className="text-sm text-gray-600 mt-1">
                    {subtitle}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KPICard
