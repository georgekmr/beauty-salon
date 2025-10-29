import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsService, Client, ClientAppointment, ClientSale, ClientInput } from '../services/clientsService'
import { ArrowLeft, Phone, Mail, Calendar, Edit2, Save, X, DollarSign } from 'lucide-react'

type TabType = 'details' | 'appointments' | 'purchases'

const ClientProfilePage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<ClientAppointment[]>([])
  const [sales, setSales] = useState<ClientSale[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<ClientInput>({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    date_of_birth: '',
    client_notes: ''
  })

  useEffect(() => {
    if (clientId) {
      loadClientData(parseInt(clientId))
    }
  }, [clientId])

  const loadClientData = async (id: number) => {
    try {
      setLoading(true)
      const [clientData, appointmentsData, salesData] = await Promise.all([
        clientsService.getClientById(id),
        clientsService.getClientAppointments(id),
        clientsService.getClientSales(id)
      ])

      setClient(clientData)
      setAppointments(appointmentsData)
      setSales(salesData)

      if (clientData) {
        setFormData({
          first_name: clientData.first_name,
          last_name: clientData.last_name || '',
          phone_number: clientData.phone_number,
          email: clientData.email || '',
          date_of_birth: clientData.date_of_birth || '',
          client_notes: clientData.client_notes || ''
        })
      }
    } catch (error) {
      console.error('Error loading client data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    if (client) {
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name || '',
        phone_number: client.phone_number,
        email: client.email || '',
        date_of_birth: client.date_of_birth || '',
        client_notes: client.client_notes || ''
      })
    }
    setEditing(false)
  }

  const handleSave = async () => {
    if (!clientId) return

    try {
      await clientsService.updateClient(parseInt(clientId), formData)
      await loadClientData(parseInt(clientId))
      setEditing(false)
    } catch (error) {
      alert('Error updating client')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'no-show':
        return 'bg-red-100 text-red-800'
      case 'checked-in':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
        <button onClick={() => navigate('/clients')} className="mt-4 text-blue-600 hover:text-blue-800">
          Back to Clients
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Profile</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage client information</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {client.first_name} {client.last_name || ''}
              </h2>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone_number}
                </div>
                {client.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {client.email}
                  </div>
                )}
              </div>
            </div>
            {activeTab === 'details' && !editing && (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            {activeTab === 'details' && editing && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appointment History
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'purchases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Purchase History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{client.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{client.last_name || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{client.phone_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{client.email || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {client.date_of_birth ? formatDate(client.date_of_birth) : '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Since</label>
                  <p className="text-gray-900 py-2">{formatDate(client.created_at)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Notes</label>
                {editing ? (
                  <textarea
                    rows={6}
                    value={formData.client_notes}
                    onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes about this client..."
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {client.client_notes || 'No notes added yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No appointments found for this client
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment.appointment_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(appointment.appointment_datetime)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            with {appointment.bs_staff.first_name} {appointment.bs_staff.last_name || ''}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-4">
              {sales.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No purchase history found for this client
                </div>
              ) : (
                sales.map((sale) => (
                  <div
                    key={sale.sale_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Sale #{sale.sale_id}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDateTime(sale.sale_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${sale.total_amount.toFixed(2)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientProfilePage
