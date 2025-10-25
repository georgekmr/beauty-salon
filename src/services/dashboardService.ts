import { supabase } from '../lib/supabase'

export interface DashboardKPIs {
  total_revenue: number
  service_revenue: number
  product_revenue: number
  new_clients_count: number
  staff_occupancy_rate: number
}

export interface ActivityFeed {
  activity_time: string
  activity_type: string
  description: string
}

export interface SalesTrendData {
  date: string
  revenue: number
}

export interface StaffStatus {
  staff_id: number
  staff_name: string
  current_appointment: string | null
  daily_sales: number
}

export const dashboardService = {
  async getDashboardKPIs(startDate: string, endDate: string): Promise<DashboardKPIs | null> {
    const { data, error } = await supabase.rpc('bs_get_dashboard_kpis', {
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) {
      console.error('Error fetching KPIs:', error)
      return null
    }

    return data?.[0] || null
  },

  async getActivityFeed(limit: number = 20): Promise<ActivityFeed[]> {
    const { data, error } = await supabase.rpc('bs_get_dashboard_activity_feed', {
      p_limit: limit
    })

    if (error) {
      console.error('Error fetching activity feed:', error)
      return []
    }

    return data || []
  },

  async getSalesTrend(days: number = 30): Promise<SalesTrendData[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('bs_payments')
      .select('payment_date, amount')
      .gte('payment_date', startDate.toISOString())
      .lte('payment_date', endDate.toISOString())
      .order('payment_date', { ascending: true })

    if (error) {
      console.error('Error fetching sales trend:', error)
      return []
    }

    const trendMap = new Map<string, number>()

    data.forEach((payment) => {
      const date = new Date(payment.payment_date).toISOString().split('T')[0]
      const current = trendMap.get(date) || 0
      trendMap.set(date, current + Number(payment.amount))
    })

    return Array.from(trendMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  async getStaffStatus(): Promise<StaffStatus[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data: staff, error: staffError } = await supabase
      .from('bs_staff')
      .select(`
        staff_id,
        first_name,
        last_name
      `)

    if (staffError) {
      console.error('Error fetching staff:', staffError)
      return []
    }

    const staffStatus: StaffStatus[] = []

    for (const member of staff || []) {
      const { data: appointment } = await supabase
        .from('bs_appointments')
        .select('appointment_datetime, expected_end_datetime, bs_clients(first_name, last_name)')
        .eq('staff_id', member.staff_id)
        .eq('status', 'Checked-In')
        .gte('appointment_datetime', `${today}T00:00:00`)
        .lte('appointment_datetime', `${today}T23:59:59`)
        .maybeSingle()

      const { data: sales } = await supabase
        .from('bs_sale_services')
        .select('price_at_time_of_sale, bs_sales!inner(sale_date)')
        .eq('staff_id', member.staff_id)
        .gte('bs_sales.sale_date', `${today}T00:00:00`)
        .lte('bs_sales.sale_date', `${today}T23:59:59`)

      const dailySales = sales?.reduce((sum, sale) => sum + Number(sale.price_at_time_of_sale), 0) || 0

      let currentAppointment = null
      if (appointment) {
        const client = appointment.bs_clients as any
        currentAppointment = `${client?.first_name || ''} ${client?.last_name || ''}`.trim()
      }

      staffStatus.push({
        staff_id: member.staff_id,
        staff_name: `${member.first_name} ${member.last_name || ''}`.trim(),
        current_appointment: currentAppointment,
        daily_sales: dailySales
      })
    }

    return staffStatus
  }
}
