import React, { useState, useEffect } from 'react'
import { staffService, Staff, StaffInput, StaffSchedule, StaffScheduleInput } from '../services/staffService'
import { Plus, Edit2, Trash2, X, Clock, User } from 'lucide-react'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [schedules, setSchedules] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<StaffSchedule | null>(null)

  const [staffFormData, setStaffFormData] = useState<StaffInput>({
    first_name: '',
    last_name: '',
    specialty: '',
    phone_number: '',
    email: ''
  })

  const [scheduleFormData, setScheduleFormData] = useState<Partial<StaffScheduleInput>>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00'
  })

  useEffect(() => {
    loadStaff()
  }, [])

  useEffect(() => {
    if (selectedStaff) {
      loadSchedules(selectedStaff.staff_id)
    }
  }, [selectedStaff])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const data = await staffService.getAllStaff()
      setStaff(data)
      if (data.length > 0 && !selectedStaff) {
        setSelectedStaff(data[0])
      }
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSchedules = async (staffId: number) => {
    try {
      const data = await staffService.getStaffSchedules(staffId)
      setSchedules(data)
    } catch (error) {
      console.error('Error loading schedules:', error)
    }
  }

  const handleAddNewStaff = () => {
    setEditingStaff(null)
    setStaffFormData({
      first_name: '',
      last_name: '',
      specialty: '',
      phone_number: '',
      email: ''
    })
    setShowStaffModal(true)
  }

  const handleEditStaff = (member: Staff) => {
    setEditingStaff(member)
    setStaffFormData({
      first_name: member.first_name,
      last_name: member.last_name || '',
      specialty: member.specialty || '',
      phone_number: member.phone_number || '',
      email: member.email || ''
    })
    setShowStaffModal(true)
  }

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return

    try {
      await staffService.deleteStaff(staffId)
      if (selectedStaff?.staff_id === staffId) {
        setSelectedStaff(null)
      }
      await loadStaff()
    } catch (error) {
      alert('Error deleting staff member. They may have associated appointments.')
    }
  }

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff.staff_id, staffFormData)
      } else {
        const newStaff = await staffService.createStaff(staffFormData)
        if (newStaff) {
          setSelectedStaff(newStaff)
        }
      }
      setShowStaffModal(false)
      await loadStaff()
    } catch (error) {
      alert('Error saving staff member.')
    }
  }

  const handleAddSchedule = () => {
    if (!selectedStaff) return
    setEditingSchedule(null)
    setScheduleFormData({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00'
    })
    setShowScheduleModal(true)
  }

  const handleEditSchedule = (schedule: StaffSchedule) => {
    setEditingSchedule(schedule)
    setScheduleFormData({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time
    })
    setShowScheduleModal(true)
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      await staffService.deleteSchedule(scheduleId)
      if (selectedStaff) {
        await loadSchedules(selectedStaff.staff_id)
      }
    } catch (error) {
      alert('Error deleting schedule.')
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) return

    try {
      const scheduleData: StaffScheduleInput = {
        staff_id: selectedStaff.staff_id,
        day_of_week: scheduleFormData.day_of_week!,
        start_time: scheduleFormData.start_time!,
        end_time: scheduleFormData.end_time!
      }

      if (editingSchedule) {
        await staffService.updateSchedule(editingSchedule.schedule_id, scheduleData)
      } else {
        await staffService.createSchedule(scheduleData)
      }
      setShowScheduleModal(false)
      await loadSchedules(selectedStaff.staff_id)
    } catch (error) {
      alert('Error saving schedule.')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff & Schedules Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage staff members and work schedules</p>
        </div>
        <button
          onClick={handleAddNewStaff}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {staff.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No staff members found.
              </div>
            ) : (
              staff.map((member) => (
                <div
                  key={member.staff_id}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStaff?.staff_id === member.staff_id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                  onClick={() => setSelectedStaff(member)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </p>
                        {member.specialty && (
                          <p className="text-xs text-gray-500">{member.specialty}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditStaff(member)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteStaff(member.staff_id)
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg overflow-hidden">
          {selectedStaff ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedStaff.first_name} {selectedStaff.last_name}'s Schedule
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Weekly working hours</p>
                </div>
                <button
                  onClick={handleAddSchedule}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </button>
              </div>

              <div className="p-6">
                {selectedStaff.email && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{selectedStaff.email}</p>
                      </div>
                      {selectedStaff.phone_number && (
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStaff.phone_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No schedules set. Add working hours for this staff member.
                    </div>
                  ) : (
                    schedules.map((schedule) => (
                      <div
                        key={schedule.schedule_id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {DAYS_OF_WEEK[schedule.day_of_week - 1]}
                            </p>
                            <p className="text-xs text-gray-500">
                              {schedule.start_time} - {schedule.end_time}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full py-12 text-gray-500">
              Select a staff member to view their schedule
            </div>
          )}
        </div>
      </div>

      {showStaffModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowStaffModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffFormData.first_name}
                    onChange={(e) => setStaffFormData({ ...staffFormData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={staffFormData.last_name}
                    onChange={(e) => setStaffFormData({ ...staffFormData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={staffFormData.specialty}
                  onChange={(e) => setStaffFormData({ ...staffFormData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={staffFormData.phone_number}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week *
                </label>
                <select
                  required
                  value={scheduleFormData.day_of_week}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, day_of_week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index + 1}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleFormData.start_time}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleFormData.end_time}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffManagement
