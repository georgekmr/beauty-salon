import { supabase } from '../lib/supabase'

export interface Staff {
  staff_id: number
  first_name: string
  last_name: string | null
  specialty: string | null
  phone_number: string | null
  email: string | null
}

export interface StaffInput {
  first_name: string
  last_name?: string
  specialty?: string
  phone_number?: string
  email?: string
}

export interface StaffSchedule {
  schedule_id: number
  staff_id: number
  day_of_week: number
  start_time: string
  end_time: string
}

export interface StaffScheduleInput {
  staff_id: number
  day_of_week: number
  start_time: string
  end_time: string
}

export const staffService = {
  async getAllStaff(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('bs_staff')
      .select('*')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Error fetching staff:', error)
      throw error
    }

    return data || []
  },

  async createStaff(staff: StaffInput): Promise<Staff | null> {
    const { data, error } = await supabase
      .from('bs_staff')
      .insert([staff])
      .select()
      .single()

    if (error) {
      console.error('Error creating staff:', error)
      throw error
    }

    return data
  },

  async updateStaff(staffId: number, staff: Partial<StaffInput>): Promise<Staff | null> {
    const { data, error } = await supabase
      .from('bs_staff')
      .update(staff)
      .eq('staff_id', staffId)
      .select()
      .single()

    if (error) {
      console.error('Error updating staff:', error)
      throw error
    }

    return data
  },

  async deleteStaff(staffId: number): Promise<void> {
    const { error } = await supabase
      .from('bs_staff')
      .delete()
      .eq('staff_id', staffId)

    if (error) {
      console.error('Error deleting staff:', error)
      throw error
    }
  },

  async getStaffSchedules(staffId: number): Promise<StaffSchedule[]> {
    const { data, error } = await supabase
      .from('bs_staff_schedules')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week', { ascending: true })

    if (error) {
      console.error('Error fetching staff schedules:', error)
      throw error
    }

    return data || []
  },

  async createSchedule(schedule: StaffScheduleInput): Promise<StaffSchedule | null> {
    const { data, error } = await supabase
      .from('bs_staff_schedules')
      .insert([schedule])
      .select()
      .single()

    if (error) {
      console.error('Error creating schedule:', error)
      throw error
    }

    return data
  },

  async updateSchedule(scheduleId: number, schedule: Partial<StaffScheduleInput>): Promise<StaffSchedule | null> {
    const { data, error } = await supabase
      .from('bs_staff_schedules')
      .update(schedule)
      .eq('schedule_id', scheduleId)
      .select()
      .single()

    if (error) {
      console.error('Error updating schedule:', error)
      throw error
    }

    return data
  },

  async deleteSchedule(scheduleId: number): Promise<void> {
    const { error } = await supabase
      .from('bs_staff_schedules')
      .delete()
      .eq('schedule_id', scheduleId)

    if (error) {
      console.error('Error deleting schedule:', error)
      throw error
    }
  }
}
