import React, { useState, useEffect } from 'react'
import { calendarService, CalendarAppointment } from '../services/calendarService'
import { staffService, Staff } from '../services/staffService'
import CalendarGrid from '../components/calendar/CalendarGrid'
import AppointmentModal from '../components/calendar/AppointmentModal'
import AppointmentPopover from '../components/calendar/AppointmentPopover'
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, LogOut } from 'lucide-react'

type ViewType = 'day' | 'week'

const CalendarPage: React.FC = () => {
  const [viewDate, setViewDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('day')
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [visibleStaffIds, setVisibleStaffIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<number>()
  const [selectedTimeForBooking, setSelectedTimeForBooking] = useState<Date>()
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (staff.length > 0 && visibleStaffIds.length === 0) {
      setVisibleStaffIds(staff.map(s => s.staff_id))
    }
  }, [staff])

  useEffect(() => {
    loadAppointments()
  }, [viewDate, viewType])

  const loadData = async () => {
    try {
      setLoading(true)
      const staffData = await staffService.getAllStaff()
      setStaff(staffData)
      setVisibleStaffIds(staffData.map(s => s.staff_id))
    } catch (error) {
      console.error('Error loading staff:', error)
    }
  }

  const loadAppointments = async () => {
    try {
      let appointmentsData: CalendarAppointment[]

      if (viewType === 'day') {
        appointmentsData = await calendarService.getAppointmentsByDate(viewDate)
      } else {
        const weekStart = new Date(viewDate)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        appointmentsData = await calendarService.getAppointmentsByDateRange(weekStart, weekEnd)
      }

      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousPeriod = () => {
    const newDate = new Date(viewDate)
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    setViewDate(newDate)
  }

  const handleNextPeriod = () => {
    const newDate = new Date(viewDate)
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setViewDate(newDate)
  }

  const handleToday = () => {
    setViewDate(new Date())
  }

  const handleTimeSlotClick = (staffId: number, time: Date) => {
    setSelectedStaffForBooking(staffId)
    setSelectedTimeForBooking(time)
    setShowBookingModal(true)
  }

  const handleAppointmentClick = (appointment: CalendarAppointment, event: React.MouseEvent) => {
    setSelectedAppointment(appointment)
    setPopoverPosition({
      x: event.clientX,
      y: event.clientY
    })
  }

  const handleBookAppointment = async (data: {
    client_id: number
    staff_id: number
    service_id: number
    appointment_datetime: string
    notes: string
  }) => {
    try {
      await calendarService.bookAppointment(data)
      await loadAppointments()
    } catch (error) {
      alert('Error booking appointment')
    }
  }

  const handleCheckIn = async (appointmentId: number) => {
    try {
      await calendarService.updateAppointmentStatus(appointmentId, 'Checked-in')
      await loadAppointments()
    } catch (error) {
      alert('Error checking in appointment')
    }
  }

  const handleReschedule = (appointmentId: number) => {
    const appointment = appointments.find(a => a.appointment_id === appointmentId)
    if (appointment) {
      setSelectedTimeForBooking(new Date(appointment.appointment_datetime))
      setSelectedStaffForBooking(appointment.staff_id)
      setShowBookingModal(true)
      setSelectedAppointment(null)
    }
  }

  const handleCancel = async (appointmentId: number) => {
    try {
      await calendarService.cancelAppointment(appointmentId)
      await loadAppointments()
    } catch (error) {
      alert('Error cancelling appointment')
    }
  }

  const handleCheckout = (appointmentId: number) => {
    alert(`Checkout flow for appointment ${appointmentId} - integrate with POS`)
  }

  const toggleStaffVisibility = (staffId: number) => {
    setVisibleStaffIds(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    )
  }

  const formatDateDisplay = () => {
    if (viewType === 'day') {
      return viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    } else {
      const weekStart = new Date(viewDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-600 mt-1">Manage all appointments across your salon</p>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPeriod}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={handleToday}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
            >
              Today
            </button>

            <button
              onClick={handleNextPeriod}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <span className="ml-4 text-sm font-semibold text-gray-900">
              {formatDateDisplay()}
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewType === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Day
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewType === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Week
            </button>
          </div>
        </div>

        {/* Staff Filter */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Show Staff
          </p>
          <div className="flex flex-wrap gap-2">
            {staff.map(member => (
              <label
                key={member.staff_id}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleStaffIds.includes(member.staff_id)}
                  onChange={() => toggleStaffVisibility(member.staff_id)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  {member.first_name} {member.last_name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        {visibleStaffIds.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
            Select at least one staff member to view the calendar
          </div>
        ) : (
          <CalendarGrid
            appointments={appointments}
            staff={staff}
            visibleStaffIds={visibleStaffIds}
            viewDate={viewDate}
            viewType={viewType}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>

      {/* Modals */}
      {showBookingModal && (
        <AppointmentModal
          staffMembers={staff}
          selectedStaffId={selectedStaffForBooking}
          selectedDateTime={selectedTimeForBooking}
          onBook={handleBookAppointment}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedStaffForBooking(undefined)
            setSelectedTimeForBooking(undefined)
          }}
        />
      )}

      {selectedAppointment && (
        <AppointmentPopover
          appointment={selectedAppointment}
          position={popoverPosition}
          onCheckIn={handleCheckIn}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          onCheckout={handleCheckout}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  )
}

export default CalendarPage
