import React, { useState, useEffect } from 'react'
import { CalendarAppointment } from '../../services/calendarService'
import { Staff } from '../../services/staffService'

interface CalendarGridProps {
  appointments: CalendarAppointment[]
  staff: Staff[]
  visibleStaffIds: number[]
  viewDate: Date
  viewType: 'day' | 'week'
  onTimeSlotClick: (staffId: number, time: Date) => void
  onAppointmentClick: (appointment: CalendarAppointment, event: React.MouseEvent) => void
}

const BUSINESS_HOURS = {
  start: 0,
  end: 24
}

const SLOT_HEIGHT = 30

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
    const topSlots = offsetFromBusinessStart / 30

    const duration = appointment.bs_services?.duration_minutes || 60
    const heightSlots = duration / 30

    return {
      topPixels: topSlots * SLOT_HEIGHT,
      heightPixels: heightSlots * SLOT_HEIGHT
    }
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

  const renderDayView = () => {
    const timeSlots = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2)
      const minutes = (i % 2) * 30
      return { hour, minutes, slot: i }
    })

    return (
      <div className="flex gap-1 bg-white rounded-lg border border-gray-200 overflow-auto" style={{ height: 'calc(100vh - 300px)' }}>
        {/* Time labels column */}
        <div className="w-20 border-r border-gray-200 flex-shrink-0 overflow-y-auto bg-gray-50">
          <div style={{ height: `${SLOT_HEIGHT}px` }} className="border-b border-gray-200"></div>
          {hours.map((hour) => (
            <div key={hour} style={{ height: `${SLOT_HEIGHT * 2}px` }} className="border-b border-gray-200 flex items-start pt-1">
              <span className="text-xs text-gray-600 px-1">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Staff columns */}
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {visibleStaff.map((member) => (
            <div key={member.staff_id} className="flex-1 min-w-[250px] border-r border-gray-200">
              {/* Staff header */}
              <div style={{ height: `${SLOT_HEIGHT}px` }} className="border-b border-gray-200 px-3 py-1 bg-gray-50 sticky top-0 z-10 flex items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{member.first_name} {member.last_name}</p>
                  {member.specialty && <p className="text-xs text-gray-600">{member.specialty}</p>}
                </div>
              </div>

              {/* Time slots */}
              <div className="relative bg-white">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.slot}
                    onClick={() => {
                      const clickTime = new Date(viewDate)
                      clickTime.setHours(slot.hour, slot.minutes, 0, 0)
                      onTimeSlotClick(member.staff_id, clickTime)
                    }}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  />
                ))}

                {/* Appointments overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {getStaffAppointments(member.staff_id).map((appointment) => {
                    const { topPixels, heightPixels } = getAppointmentPosition(appointment)

                    return (
                      <div
                        key={appointment.appointment_id}
                        onClick={(event) => {
                          event.stopPropagation()
                          onAppointmentClick(appointment, event)
                        }}
                        className={`absolute left-1 right-1 rounded-md p-1 cursor-pointer hover:shadow-lg transition-shadow border-l-4 pointer-events-auto ${getStatusColor(appointment.status)}`}
                        style={{
                          top: `${topPixels}px`,
                          height: `${heightPixels}px`,
                          minHeight: '24px'
                        }}
                      >
                        <p className="text-xs font-semibold text-white truncate">
                          {appointment.bs_clients.first_name}
                        </p>
                        <p className="text-xs text-white truncate">{appointment.bs_services?.service_name}</p>
                        <p className="text-xs text-white truncate">
                          {new Date(appointment.appointment_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
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

  const renderWeekView = () => {
    const weekStart = new Date(viewDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      return date
    })

    const timeSlots = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2)
      const minutes = (i % 2) * 30
      return { hour, minutes, slot: i }
    })

    return (
      <div className="flex gap-1 bg-white rounded-lg border border-gray-200 overflow-auto" style={{ height: 'calc(100vh - 300px)' }}>
        {/* Time labels column */}
        <div className="w-20 border-r border-gray-200 flex-shrink-0 overflow-y-auto bg-gray-50">
          <div style={{ height: `${SLOT_HEIGHT}px` }} className="border-b border-gray-200"></div>
          {hours.map((hour) => (
            <div key={hour} style={{ height: `${SLOT_HEIGHT * 2}px` }} className="border-b border-gray-200 flex items-start pt-1">
              <span className="text-xs text-gray-600 px-1">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Days of week */}
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {days.map((date) => (
            <div key={date.toDateString()} className="flex-1 min-w-[150px] border-r border-gray-200">
              {/* Day header */}
              <div style={{ height: `${SLOT_HEIGHT}px` }} className="border-b border-gray-200 px-2 py-1 bg-gray-50 sticky top-0 z-10 flex items-center">
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-xs text-gray-600">{date.getDate()}</p>
                </div>
              </div>

              {/* Time slots */}
              <div className="relative bg-white">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.slot}
                    onClick={() => {
                      const clickTime = new Date(date)
                      clickTime.setHours(slot.hour, slot.minutes, 0, 0)
                      onTimeSlotClick(visibleStaff[0]?.staff_id || 0, clickTime)
                    }}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  />
                ))}

                {/* Show all appointments for all staff on this day */}
                <div className="absolute inset-0 pointer-events-none">
                  {appointments
                    .filter((appt) => new Date(appt.appointment_datetime).toDateString() === date.toDateString())
                    .map((appointment) => {
                      const { topPixels, heightPixels } = getAppointmentPosition(appointment)

                      return (
                        <div
                          key={appointment.appointment_id}
                          onClick={(event) => {
                            event.stopPropagation()
                            onAppointmentClick(appointment, event)
                          }}
                          className={`absolute left-1 right-1 rounded-md p-1 cursor-pointer hover:shadow-lg transition-shadow border-l-4 pointer-events-auto ${getStatusColor(appointment.status)}`}
                          style={{
                            top: `${topPixels}px`,
                            height: `${heightPixels}px`,
                            minHeight: '20px'
                          }}
                        >
                          <p className="text-xs font-semibold text-white truncate">
                            {appointment.bs_staff.first_name}
                          </p>
                          <p className="text-xs text-white truncate">
                            {appointment.bs_clients.first_name}
                          </p>
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
