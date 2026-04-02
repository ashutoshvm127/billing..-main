'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { Plus, Trash2, Shield, User } from "lucide-react"

interface UserAccess {
  id: string
  email: string
  password: string
  role: 'admin' | 'user'
  accessLevel: 'full' | 'limited' | 'readonly'
  createdAt: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserAccess[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'user' as const,
    accessLevel: 'limited' as const,
  })
  const [savedMessage, setSavedMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    // Load users from localStorage
    const stored = localStorage.getItem('billingUsers')
    if (stored) {
      setUsers(JSON.parse(stored))
    } else {
      // Initialize with default admin user
      const defaultUsers: UserAccess[] = [
        {
          id: 'admin-001',
          email: 'admin123',
          password: 'admin123adminfull01/04/2026',
          role: 'admin',
          accessLevel: 'full',
          createdAt: new Date().toISOString(),
        },
      ]
      setUsers(defaultUsers)
      localStorage.setItem('billingUsers', JSON.stringify(defaultUsers))
    }
  }, [])

  const handleAddUser = () => {
    if (!newUser.email || !newUser.password) {
      setSavedMessage('Please fill in all required fields')
      return
    }

    const user: UserAccess = {
      id: Math.random().toString(36).substr(2, 9),
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      accessLevel: newUser.accessLevel,
      createdAt: new Date().toISOString(),
    }

    const updated = [...users, user]
    setUsers(updated)
    localStorage.setItem('billingUsers', JSON.stringify(updated))
    
    setNewUser({ email: '', password: '', role: 'user', accessLevel: 'limited' })
    setShowAddForm(false)
    setSavedMessage('User added successfully')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleRemoveUser = (id: string) => {
    if (user?.role !== 'admin') return
    
    const updated = users.filter(u => u.id !== id)
    setUsers(updated)
    localStorage.setItem('billingUsers', JSON.stringify(updated))
    setSavedMessage('User removed successfully')
    setDeleteConfirm(null)
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const getAccessBadgeColor = (level: string) => {
    switch (level) {
      case 'full':
        return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400'
      case 'limited':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
      case 'readonly':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400'
      default:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400'
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <PageNavigation 
          title="Users & Access Control"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Users' }
          ]}
        />

        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Manage user access to billing software</p>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          )}
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg">
            {savedMessage}
          </div>
        )}

        {/* Add User Form */}
        {showAddForm && user?.role === 'admin' && (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email/Username *
                </label>
                <input
                  type="text"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Access Level
                  </label>
                  <select
                    value={newUser.accessLevel}
                    onChange={(e) => setNewUser({ ...newUser, accessLevel: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full">Full Access</option>
                    <option value="limited">Limited</option>
                    <option value="readonly">Read Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Add User
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

        {/* Users List */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg border border-gray-200 dark:border-[#2B2B30] overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No users added yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#2B2B30]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Access Level</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                    {user?.role === 'admin' && (
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2B2B30]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 text-xs font-semibold">
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAccessBadgeColor(u.accessLevel)}`}>
                          {u.accessLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDeleteConfirm(u.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                            title="Remove user"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-6 border border-blue-200 dark:border-blue-500/20">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">Access Levels</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li><strong>Full Access:</strong> Can create, edit, and delete invoices, manage all features</li>
            <li><strong>Limited:</strong> Can create and edit invoices, view reports</li>
            <li><strong>Read Only:</strong> Can only view invoices and reports, cannot make changes</li>
          </ul>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#1F1F23] rounded-lg p-6 max-w-sm border border-gray-200 dark:border-[#2B2B30]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Remove User?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to remove <strong>{users.find(u => u.id === deleteConfirm)?.email}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#2B2B30] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveUser(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Remove User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


    </ProtectedLayout>
  )
}
