import React, { useState, useEffect } from 'react'
import { CalendarAppointment } from '../../services/calendarService'
import { Staff } from '../../services/staffService'
import { Clock, MapPin } from 'lucide-react'

interface CalendarGridProps {
  appointments: CalendarAppointment[]
  staff: Staff[]
  visibleStaffIds: number[]
  viewDate: Date
  viewType: 'day' | 'week'
  onTimeSlotClick: (staffId: number, time: Date) => void
  onAppointmentClick: (appointment: CalendarAppointment) => void
}

const BUSINESS_HOURS = {
  start: 9,
  end: 18
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  appointments,
  staff,
  visibleStaffIds,
  viewDate,
  viewType,
  onTimeSlotClick,
  onAppointmentClick
}) => {
  const visibleStaff = staff.filter(s => visibleStaffIds.includes(s.staff_id))
  const hours = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start }, (_, i) => BUSINESS_HOURS.start + i)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-500 border-blue-600'
      case 'checked-in':
        return 'bg-green-500 border-green-600'
      case 'completed':
        return 'bg-gray-500 border-gray-600'
      case 'cancelled':
        return 'bg-red-500 border-red-600'
      default:
        return 'bg-blue-500 border-blue-600'
    }
  }

  const getAppointmentPosition = (appointment: CalendarAppointment) => {
    const appointmentTime = new Date(appointment.appointment_datetime)
    const hour = appointmentTime.getHours()
    const minutes = appointmentTime.getMinutes()

    const offsetFromBusinessStart = (hour - BUSINESS_HOURS.start) * 60 + minutes
    const topPercent = (offsetFromBusinessStart / (60 * (BUSINESS_HOURS.end - BUSINESS_HOURS.start))) * 100

    const duration = appointment.bs_services?.duration_minutes || 60
    const heightPercent = (duration / (60 * (BUSINESS_HOURS.end - BUSINESS_HOURS.start))) * 100

    return { topPercent, heightPercent }
  }

  const getStaffAppointments = (staffId: number) => {
    let dateFilter: (appt: CalendarAppointment) => boolean

    if (viewType === 'day') {
      dateFilter = (appt) => {
        const apptDate = new Date(appt.appointment_datetime)
        return apptDate.toDateString() === viewDate.toDateString()
      }
    } else {
      const weekStart = new Date(viewDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      dateFilter = (appt) => {
        const apptDate = new Date(appt.appointment_datetime)
        return apptDate >= weekStart && apptDate < weekEnd
      }
    }

    return appointments.filter(appt => appt.staff_id === staffId && dateFilter(appt))
  }

  const renderDayView = () => (
    <div className="flex gap-1 bg-white rounded-lg border border-gray-200 overflow-auto h-[600px]">
      {/* Time labels column */}
      <div className="w-16 border-r border-gray-200 flex-shrink-0">
        <div className="h-12 border-b border-gray-200"></div>
        {hours.map((hour) => (
          <div key={hour} className="h-12 border-b border-gray-200 flex items-start pt-1">
            <span className="text-xs text-gray-600 px-1">{hour}:00</span>
          </div> 
        ))}
      </div>

      {/* Staff columns */}
      <div className="flex gap-1 flex-1 overflow-x-auto">
        {visibleStaff.map((member) => (
          <div key={member.staff_id} className="flex-1 min-w-[200px] border-r border-gray-200">
            {/* Staff header */}
            <div className="h-12 border-b border-gray-200 px-3 py-2 bg-gray-50 sticky top-0">
              <p className="text-sm font-semibold text-gray-900">{member.first_name} {member.last_name}</p>
              {member.specialty && <p className="text-xs text-gray-600">{member.specialty}</p>}
            </div>

            {/* Time slots */}
            <div className="relative bg-white"> 
              {hours.map((hour) => (
                <div
                  key={hour}
                  onClick={() => onTimeSlotClick(member.staff_id, new Date(viewDate.setHours(hour, 0, 0, 0)))}
                  className="h-12 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                />
              ))}

              {/* Appointments overlay */}
              <div className="absolute inset-0">
                {getStaffAppointments(member.staff_id).map((appointment) => {
                  const { topPercent, heightPercent } = getAppointmentPosition(appointment)
                  const totalHeight = hours.length * 48

                  return (
                    <div
                      key={appointment.appointment_id}
                      onClick={() => onAppointmentClick(appointment)}
                      className={`absolute left-1 right-1 rounded-md p-2 cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${getStatusColor(appointment.status)}`}
                      style={{
                        top: `${(topPercent / 100) * totalHeight}px`,
                        height: `${(heightPercent / 100) * totalHeight}px`,
                        minHeight: '24px'
                      }}
                    >
                      <p className="text-xs font-semibold text-white truncate">
                        {appointment.bs_clients.first_name}
                      </p>
                      <p className="text-xs text-white truncate">{appointment.bs_services?.service_name}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderWeekView = () => {
    const weekStart = new Date(viewDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      return date
    })

    return (
      <div className="flex gap-1 bg-white rounded-lg border border-gray-200 overflow-auto h-[600px]">
        {/* Time labels column */}
        <div className="w-16 border-r border-gray-200 flex-shrink-0">
          <div className="h-12 border-b border-gray-200"></div>
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b border-gray-200 flex items-start pt-1">
              <span className="text-xs text-gray-600 px-1">{hour}:00</span>
            </div>
          ))}
        </div>

        {/* Days of week */}
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {days.map((date) => (
            <div key={date.toDateString()} className="flex-1 min-w-[150px] border-r border-gray-200">
              {/* Day header */}
              <div className="h-12 border-b border-gray-200 px-2 py-2 bg-gray-50 sticky top-0">
                <p className="text-xs font-semibold text-gray-900">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-xs text-gray-600">{date.getDate()}</p>
              </div>

              {/* Time slots */}
              <div className="relative bg-white">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onTimeSlotClick(visibleStaff[0]?.staff_id || 0, new Date(date.setHours(hour, 0, 0, 0)))}
                    className="h-12 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  />
                ))}

                {/* Show all appointments for all staff on this day */}
                <div className="absolute inset-0 pointer-events-none">
    {getStaffAppointments(member.staff_id).map((appointment) => {
      const { topPercent, heightPercent } = getAppointmentPosition(appointment)
      const totalHeight = hours.length * 48

      return (
        <div
          key={appointment.appointment_id}
          // The event needs to be passed to the handler
          onClick={(event) => onAppointmentClick(appointment, event)} 
          // Re-enable pointer events for the appointment block itself
          className={`absolute left-1 right-1 rounded-md p-2 cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${getStatusColor(appointment.status)} pointer-events-auto`}
          style={{
            top: `${(topPercent / 100) * totalHeight}px`,
            height: `${(heightPercent / 100) * totalHeight}px`,
            minHeight: '24px'
          }}
        >
          <p className="text-xs font-semibold text-white truncate">
            {appointment.bs_clients.first_name}
          </p>
          <p className="text-xs text-white truncate">{appointment.bs_services?.service_name}</p>
        </div>
      )
    })}
  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return viewType === 'day' ? renderDayView() : renderWeekView()
}

export default CalendarGrid
