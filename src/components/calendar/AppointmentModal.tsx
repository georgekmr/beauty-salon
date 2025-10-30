import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { clientsService, Client } from '../../services/clientsService'
import { servicesService, Service } from '../../services/servicesService'
import { Staff } from '../../services/staffService'

interface AppointmentModalProps {
  staffMembers: Staff[]
  selectedStaffId?: number
  selectedDateTime?: Date
  onBook: (data: {
    client_id: number
    staff_id: number
    service_id: number
    appointment_datetime: string
    notes: string
  }) => Promise<void>
  onClose: () => void
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  staffMembers,
  selectedStaffId,
  selectedDateTime,
  onBook,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<number>(selectedStaffId || staffMembers[0]?.staff_id || 0)
  const [appointmentDate, setAppointmentDate] = useState(
    selectedDateTime?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  )
  const [appointmentTime, setAppointmentTime] = useState(
    selectedDateTime?.toTimeString().slice(0, 5) || '09:00'
  )
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showClientSearch, setShowClientSearch] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchClients()
    } else {
      setClients([])
    }
  }, [searchQuery])

  const loadData = async () => {
    try {
      const servicesData = await servicesService.getAllServices()
      setServices(servicesData)
      if (servicesData.length > 0) {
        setSelectedService(servicesData[0])
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const searchClients = async () => {
    try {
      const results = await clientsService.searchClients(searchQuery)
      setClients(results)
    } catch (error) {
      console.error('Error searching clients:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedClient || !selectedService) {
      setError('Please select a client and service')
      return
    }

    try {
      setLoading(true)
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)

      await onBook({
        client_id: selectedClient.client_id,
        staff_id: selectedStaff,
        service_id: selectedService.service_id,
        appointment_datetime: appointmentDateTime.toISOString(),
        notes
      })

      onClose()
    } catch (err: any) {
      setError(err.message || 'Error booking appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-blue-50">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{selectedClient.phone_number}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowClientSearch(true)}
                  placeholder="Search by phone, first name, or last name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {showClientSearch && clients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {clients.map((client) => (
                      <button
                        key={client.client_id}
                        type="button"
                        onClick={() => {
                          setSelectedClient(client)
                          setSearchQuery('')
                          setShowClientSearch(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">
                          {client.first_name} {client.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{client.phone_number}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Staff Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Staff Member *
              </label>
              <select
                required
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {staffMembers.map((staff) => (
                  <option key={staff.staff_id} value={staff.staff_id}>
                    {staff.first_name} {staff.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service *
              </label>
              <select
                required
                value={selectedService?.service_id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.service_id === parseInt(e.target.value))
                  setSelectedService(service || null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.service_name} ({service.duration_minutes}m) - ${service.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special requests or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Duration info */}
          {selectedService && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Duration: <span className="font-medium">{selectedService.duration_minutes} minutes</span>
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedClient || !selectedService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentModal
