import React, { useState } from 'react'
import { CalendarAppointment } from '../../services/calendarService'
import { CheckCircle, Clock, User, Phone, Trash2, X, LogOut } from 'lucide-react'

interface AppointmentPopoverProps {
  appointment: CalendarAppointment
  position: { x: number; y: number }
  onCheckIn: (appointmentId: number) => Promise<void>
  onReschedule: (appointmentId: number) => void
  onCancel: (appointmentId: number) => Promise<void>
  onCheckout: (appointmentId: number) => void
  onClose: () => void
}

const AppointmentPopover: React.FC<AppointmentPopoverProps> = ({
  appointment,
  position,
  onCheckIn,
  onReschedule,
  onCancel,
  onCheckout,
  onClose
}) => {
  const [loading, setLoading] = useState(false)

  const handleCheckIn = async () => {
    try {
      setLoading(true)
      await onCheckIn(appointment.appointment_id)
      onClose()
    } catch (error) {
      alert('Error checking in appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      setLoading(true)
      await onCancel(appointment.appointment_id)
      onClose()
    } catch (error) {
      alert('Error cancelling appointment')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'checked-in':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(0, 10px)'
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Appointment Info */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs text-gray-600">Service</p>
            <p className="font-semibold text-gray-900">{appointment.bs_services?.service_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Date & Time</p>
              <p className="text-sm font-medium text-gray-900 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDateTime(appointment.appointment_datetime)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Duration</p>
              <p className="text-sm font-medium text-gray-900">
                {appointment.bs_services?.duration_minutes} mins
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600">Client</p>
            <p className="font-semibold text-gray-900">
              {appointment.bs_clients.first_name} {appointment.bs_clients.last_name}
            </p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Phone className="h-3 w-3 mr-1" />
              {appointment.bs_clients.phone_number}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Staff Member</p>
            <p className="text-sm font-medium text-gray-900 flex items-center">
              <User className="h-3 w-3 mr-1" />
              {appointment.bs_staff.first_name} {appointment.bs_staff.last_name}
            </p>
          </div>

          {appointment.notes && (
            <div>
              <p className="text-xs text-gray-600">Notes</p>
              <p className="text-sm text-gray-900">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          {appointment.status.toLowerCase() === 'scheduled' && (
            <>
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Check-In
              </button>

              <button
                onClick={() => {
                  onReschedule(appointment.appointment_id)
                  onClose()
                }}
                className="w-full px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
              >
                <Clock className="h-4 w-4 mr-2 inline" />
                Reschedule
              </button>
            </>
          )}

          {appointment.status.toLowerCase() === 'checked-in' && (
            <button
              onClick={() => {
                onCheckout(appointment.appointment_id)
                onClose()
              }}
              className="w-full px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Go to Checkout
            </button>
          )}

          {appointment.status.toLowerCase() !== 'cancelled' && appointment.status.toLowerCase() !== 'completed' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentPopover
