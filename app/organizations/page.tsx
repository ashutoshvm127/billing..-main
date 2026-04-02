'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { Plus, Trash2, Building2 } from "lucide-react"

interface Organization {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  createdAt: string
}

export default function OrganizationsPage() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOrg, setNewOrg] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    // Load organizations from localStorage
    const stored = localStorage.getItem('organizations')
    if (stored) {
      setOrganizations(JSON.parse(stored))
    }
  }, [])

  const handleAddOrganization = () => {
    if (!newOrg.name || !newOrg.email) {
      setSavedMessage('Please fill in required fields')
      return
    }

    const organization: Organization = {
      id: Math.random().toString(36).substr(2, 9),
      name: newOrg.name,
      email: newOrg.email,
      phone: newOrg.phone,
      address: newOrg.address,
      city: newOrg.city,
      state: newOrg.state,
      zipCode: newOrg.zipCode,
      createdAt: new Date().toISOString(),
    }

    const updated = [...organizations, organization]
    setOrganizations(updated)
    localStorage.setItem('organizations', JSON.stringify(updated))
    
    setNewOrg({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    })
    setShowAddForm(false)
    setSavedMessage('Organization added successfully')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleRemoveOrganization = (id: string) => {
    if (user?.role !== 'admin') return
    
    const updated = organizations.filter(o => o.id !== id)
    setOrganizations(updated)
    localStorage.setItem('organizations', JSON.stringify(updated))
    setSavedMessage('Organization removed successfully')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizations & Companies</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your organizations and company information</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Organization
            </button>
          )}
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg">
            {savedMessage}
          </div>
        )}

        {/* Add Organization Form */}
        {showAddForm && user?.role === 'admin' && (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Organization</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    placeholder="Company Name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newOrg.email}
                    onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                    placeholder="company@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newOrg.phone}
                    onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newOrg.address}
                    onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
                    placeholder="Street Address"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newOrg.city}
                    onChange={(e) => setNewOrg({ ...newOrg, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={newOrg.state}
                    onChange={(e) => setNewOrg({ ...newOrg, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={newOrg.zipCode}
                    onChange={(e) => setNewOrg({ ...newOrg, zipCode: e.target.value })}
                    placeholder="Zip Code"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddOrganization}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Add Organization
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#2B2B30] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Organizations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.length === 0 && !showAddForm ? (
            <div className="col-span-full bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-[#2B2B30]">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No organizations added yet</p>
            </div>
          ) : (
            organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{org.name}</h3>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleRemoveOrganization(org.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                      title="Remove organization"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Email:</strong> {org.email}</p>
                  {org.phone && <p><strong>Phone:</strong> {org.phone}</p>}
                  {org.address && (
                    <p>
                      <strong>Address:</strong> {org.address}
                      {org.city && `, ${org.city}`}
                      {org.state && `, ${org.state}`}
                      {org.zipCode && ` ${org.zipCode}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 pt-2">
                    Added on {new Date(org.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}
