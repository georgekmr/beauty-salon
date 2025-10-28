import { supabase } from '../lib/supabase'

export interface Service {
  service_id: number
  service_name: string
  category: string | null
  price: number
  duration_minutes: number
  description: string | null
}

export interface ServiceInput {
  service_name: string
  category?: string
  price: number
  duration_minutes: number
  description?: string
}

export const servicesService = {
  async getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('bs_services')
      .select('*')
      .order('service_name', { ascending: true })

    if (error) {
      console.error('Error fetching services:', error)
      throw error
    }

    return data || []
  },

  async createService(service: ServiceInput): Promise<Service | null> {
    const { data, error } = await supabase
      .from('bs_services')
      .insert([service])
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      throw error
    }

    return data
  },

  async updateService(serviceId: number, service: Partial<ServiceInput>): Promise<Service | null> {
    const { data, error } = await supabase
      .from('bs_services')
      .update(service)
      .eq('service_id', serviceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating service:', error)
      throw error
    }

    return data
  },

  async deleteService(serviceId: number): Promise<void> {
    const { error } = await supabase
      .from('bs_services')
      .delete()
      .eq('service_id', serviceId)

    if (error) {
      console.error('Error deleting service:', error)
      throw error
    }
  }
}
