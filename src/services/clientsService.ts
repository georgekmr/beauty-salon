import { supabase } from '../lib/supabase'

export interface Client {
  client_id: number
  first_name: string
  last_name: string | null
  phone_number: string
  email: string | null
  date_of_birth: string | null
  client_notes: string | null
  created_at: string
}

export interface ClientInput {
  first_name: string
  last_name?: string
  phone_number: string
  email?: string
  date_of_birth?: string
  client_notes?: string
}

export interface ClientAppointment {
  appointment_id: number
  appointment_datetime: string
  status: string
  notes: string | null
  bs_staff: {
    first_name: string
    last_name: string | null
  }
  bs_services?: {
    service_name: string
  }[]
}

export interface ClientSale {
  sale_id: number
  sale_date: string
  total_amount: number
  status: string
}

export const clientsService = {
  async searchClients(query: string): Promise<Client[]> {
  let queryBuilder = supabase
    .from('bs_clients')
    .select('*')

  // 2. Check if the search query is not empty.
  //    This check prevents the filter from running on an empty string.
  

  // 4. Add sorting and limits to the final query.
  //    This runs regardless of whether a filter was applied.
  queryBuilder = queryBuilder
    .order('first_name', { ascending: true })
    .limit(50)

  // 5. Execute the query and handle potential errors.
  const { data, error } = await queryBuilder

  if (error) {
    console.error('Error searching clients:', error)
    // It's good practice to also log the failed query for debugging.
    console.error('Failed query:', queryBuilder.toString()) 
    throw error
  }

  // For debugging: check what data is being returned.
  // console.log('Data fetched from Supabase:', data);

  return data || []
},

  async getClientById(clientId: number): Promise<Client | null> {
    const { data, error } = await supabase
      .from('bs_clients')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (error) {
      console.error('Error fetching client:', error)
      throw error
    }

    return data
  },

  async checkDuplicate(phone: string, email?: string): Promise<boolean> {
    let query = supabase
      .from('bs_clients')
      .select('client_id')
      .eq('phone_number', phone)

    if (email) {
      query = query.or(`email.eq.${email}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking duplicate:', error)
      return false
    }

    return (data?.length || 0) > 0
  },

  async createClient(client: ClientInput): Promise<Client | null> {
    const duplicate = await this.checkDuplicate(client.phone_number, client.email)
    if (duplicate) {
      throw new Error('A client with this phone number or email already exists')
    }

    const { data, error } = await supabase
      .from('bs_clients')
      .insert([client])
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      throw error
    }

    return data
  },

  async updateClient(clientId: number, client: Partial<ClientInput>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('bs_clients')
      .update(client)
      .eq('client_id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      throw error
    }

    return data
  },

  async deleteClient(clientId: number): Promise<void> {
    const { error } = await supabase
      .from('bs_clients')
      .delete()
      .eq('client_id', clientId)

    if (error) {
      console.error('Error deleting client:', error)
      throw error
    }
  },

  async getClientAppointments(clientId: number): Promise<ClientAppointment[]> {
    const { data, error } = await supabase
      .from('bs_appointments')
      .select(`
        appointment_id,
        appointment_datetime,
        status,
        notes,
        bs_staff (
          first_name,
          last_name
        )
      `)
      .eq('client_id', clientId)
      .order('appointment_datetime', { ascending: false })

    if (error) {
      console.error('Error fetching client appointments:', error)
      throw error
    }

    return data as ClientAppointment[] || []
  },

  async getClientSales(clientId: number): Promise<ClientSale[]> {
    const { data, error } = await supabase
      .from('bs_sales')
      .select('sale_id, sale_date, total_amount, status')
      .eq('client_id', clientId)
      .order('sale_date', { ascending: false })

    if (error) {
      console.error('Error fetching client sales:', error)
      throw error
    }

    return data || []
  }
}
