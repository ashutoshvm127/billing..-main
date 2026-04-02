'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useState } from "react"
import { Plus, Trash2, Mail, Phone } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  createdAt: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(() => {
    const stored = localStorage.getItem('billingClients')
    return stored ? JSON.parse(stored) : []
  })

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  })

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Name and email are required')
      return
    }

    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      createdAt: new Date().toISOString()
    }

    const updated = [...clients, newClient]
    setClients(updated)
    localStorage.setItem('billingClients', JSON.stringify(updated))
    
    // Reset form
    setFormData({ name: '', email: '', phone: '', company: '', address: '' })
    setShowForm(false)
  }

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id)
    setClients(updated)
    localStorage.setItem('billingClients', JSON.stringify(updated))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Navigation */}
        <PageNavigation 
          title="Clients"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Clients' }
          ]}
        />

        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Manage your client information</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Client</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Tech Company Inc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State ZIP"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  Add Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-[#2B2B30] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {clients.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-[#2B2B30]">
              <p className="text-gray-500 dark:text-gray-400">No clients added yet. Create your first client!</p>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{client.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{client.company}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${client.email}`} className="hover:text-blue-600">
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-[#2B2B30]">
                      <p>{client.address}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </ProtectedLayout>
  )
}
