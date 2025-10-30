import { supabase } from '../lib/supabase'

export interface CalendarAppointment {
  appointment_id: number
  client_id: number
  staff_id: number 
  service_id: number
  appointment_datetime: string
  status: string
  notes: string | null
  bs_clients: {
    first_name: string
    last_name: string | null
    phone_number: string
  }
  bs_staff: {
    staff_id: number
    first_name: string
    last_name: string | null
  }
  bs_services: {
    service_name: string
    duration_minutes: number
  }
}

export interface BookAppointmentInput {
  client_id: number
  staff_id: number
  service_id: number
  appointment_datetime: string
  notes?: string
}

export interface RescheduleInput {
  appointment_datetime: string
}
 
export const calendarService = {
  async getAppointmentsByDate(date: Date): Promise<CalendarAppointment[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('bs_appointments')
      .select(`
        appointment_id,
        client_id,
        staff_id,
        service_id,
        appointment_datetime,
        status,
        notes,
        bs_clients (
          first_name,
          last_name,
          phone_number
        ),
        bs_staff (
          staff_id,
          first_name,
          last_name
        ),
        bs_services (
          service_name,
          duration_minutes
        )
      `)
      .gte('appointment_datetime', startOfDay.toISOString())
      .lt('appointment_datetime', endOfDay.toISOString())
      .order('appointment_datetime', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }

    return data || []
  },

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<CalendarAppointment[]> {
    const { data, error } = await supabase
      .from('bs_appointments')
      .select(`
        appointment_id,
        client_id,
        staff_id,
        service_id,
        appointment_datetime,
        status,
        notes,
        bs_clients (
          first_name,
          last_name,
          phone_number
        ),
        bs_staff (
          staff_id,
          first_name,
          last_name
        ),
        bs_services (
          service_name,
          duration_minutes
        )
      `)
      .gte('appointment_datetime', startDate.toISOString())
      .lt('appointment_datetime', endDate.toISOString())
      .order('appointment_datetime', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }

    return data || []
  },

  async bookAppointment(appointment: BookAppointmentInput): Promise<CalendarAppointment | null> {
    const { data, error } = await supabase
      .from('bs_appointments')
      .insert([{
        ...appointment,
        status: 'Scheduled'
      }])
      .select(`
        appointment_id,
        client_id,
        staff_id,
        service_id,
        appointment_datetime,
        status,
        notes,
        bs_clients (
          first_name,
          last_name,
          phone_number
        ),
        bs_staff (
          staff_id,
          first_name,
          last_name
        ),
        bs_services (
          service_name,
          duration_minutes
        )
      `)
      .single()

    if (error) {
      console.error('Error booking appointment:', error)
      throw error
    }

    return data
  },

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<CalendarAppointment | null> {
    const { data, error } = await supabase
      .from('bs_appointments')
      .update({ status })
      .eq('appointment_id', appointmentId)
      .select(`
        appointment_id,
        client_id,
        staff_id,
        service_id,
        appointment_datetime,
        status,
        notes,
        bs_clients (
          first_name,
          last_name,
          phone_number
        ),
        bs_staff (
          staff_id,
          first_name,
          last_name
        ),
        bs_services (
          service_name,
          duration_minutes
        )
      `)
      .single()

    if (error) {
      console.error('Error updating appointment status:', error)
      throw error
    }

    return data
  },

  async rescheduleAppointment(appointmentId: number, reschedule: RescheduleInput): Promise<CalendarAppointment | null> {
    const { data, error } = await supabase
      .from('bs_appointments')
      .update({ appointment_datetime: reschedule.appointment_datetime })
      .eq('appointment_id', appointmentId)
      .select(`
        appointment_id,
        client_id,
        staff_id,
        service_id,
        appointment_datetime,
        status,
        notes,
        bs_clients (
          first_name,
          last_name,
          phone_number
        ),
        bs_staff (
          staff_id,
          first_name,
          last_name
        ),
        bs_services (
          service_name,
          duration_minutes
        )
      `)
      .single()

    if (error) {
      console.error('Error rescheduling appointment:', error)
      throw error
    }

    return data
  },

  async cancelAppointment(appointmentId: number): Promise<void> {
    const { error } = await supabase
      .from('bs_appointments')
      .update({ status: 'Cancelled' })
      .eq('appointment_id', appointmentId)

    if (error) {
      console.error('Error cancelling appointment:', error)
      throw error
    }
  },

  async deleteAppointment(appointmentId: number): Promise<void> {
    const { error } = await supabase
      .from('bs_appointments')
      .delete()
      .eq('appointment_id', appointmentId)

    if (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }
}
