import React from 'react'
import { Calendar, UserPlus, DollarSign, Clock } from 'lucide-react'

interface ActivityFeedItemProps {
  activity_time: string
  activity_type: string
  description: string
}

const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ activity_time, activity_type, description }) => {
  const getIcon = () => {
    switch (activity_type.toLowerCase()) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />
      case 'client':
        return <UserPlus className="h-4 w-4" />
      case 'sale':
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getColor = () => {
    switch (activity_type.toLowerCase()) {
      case 'appointment':
        return 'bg-blue-500'
      case 'client':
        return 'bg-green-500'
      case 'sale':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <div className="flex items-start space-x-3 py-3 hover:bg-gray-50 px-2 rounded transition-colors">
      <div className={`flex-shrink-0 h-8 w-8 ${getColor()} rounded-full flex items-center justify-center text-white`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{formatTime(activity_time)}</p>
      </div>
    </div>
  )
}

export default ActivityFeedItem
