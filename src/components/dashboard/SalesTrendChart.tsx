import React from 'react'
import { SalesTrendData } from '../../services/dashboardService'

interface SalesTrendChartProps {
  data: SalesTrendData[]
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No sales data available
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const chartHeight = 200

  return (
    <div className="space-y-4">
      <div className="relative h-64 flex items-end justify-between px-4 pb-8 pt-4">
        <div className="absolute inset-0 flex flex-col justify-between py-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <span className="text-xs text-gray-500 w-16 text-right pr-2">
                ${((maxRevenue * (4 - i)) / 4).toFixed(0)}
              </span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
          ))}
        </div>

        <div className="relative flex items-end justify-between w-full h-full pl-20 pr-2">
          {data.map((point, index) => {
            const height = (point.revenue / maxRevenue) * chartHeight
            const isVisible = index % Math.ceil(data.length / 15) === 0

            return (
              <div key={point.date} className="flex flex-col items-center flex-1 group">
                <div className="relative w-full flex justify-center">
                  <div
                    className="w-2 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative group"
                    style={{ height: `${height}px`, minHeight: '2px' }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {new Date(point.date).toLocaleDateString()}: ${point.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
                {isVisible && (
                  <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left whitespace-nowrap">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SalesTrendChart
