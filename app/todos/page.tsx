'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { useState, useEffect } from "react"
import { Plus, Trash2, CheckCircle2, Circle, Clock, Bell } from "lucide-react"

interface Todo {
  id: string
  title: string
  description?: string
  dueDate?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  type: 'reminder' | 'todo'
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
    type: 'todo' as const,
  })
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('billingTodos')
    if (stored) {
      setTodos(JSON.parse(stored))
    }
  }, [])

  const handleAddTodo = () => {
    if (!newTodo.title) return

    const todo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTodo.title,
      description: newTodo.description,
      dueDate: newTodo.dueDate,
      completed: false,
      priority: newTodo.priority,
      createdAt: new Date().toISOString(),
      type: newTodo.type,
    }

    const updated = [...todos, todo]
    setTodos(updated)
    localStorage.setItem('billingTodos', JSON.stringify(updated))

    setNewTodo({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      type: 'todo',
    })
    setShowForm(false)
    setSavedMessage('Task added successfully')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleToggleTodo = (id: string) => {
    const updated = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    )
    setTodos(updated)
    localStorage.setItem('billingTodos', JSON.stringify(updated))
  }

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id)
    setTodos(updated)
    localStorage.setItem('billingTodos', JSON.stringify(updated))
    setSavedMessage('Task deleted')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400'
      default:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400'
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const reminderCount = todos.filter(t => t.type === 'reminder' && !t.completed).length
  const todosCount = todos.filter(t => t.type === 'todo' && !t.completed).length

  return (
    <ProtectedLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Todos & Reminders</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Stay on top of your tasks and deadlines</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-slide-up">
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow p-6 border border-gray-200 dark:border-[#2B2B30]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{todos.length}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow p-6 border border-gray-200 dark:border-[#2B2B30]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Reminders</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{reminderCount}</p>
              </div>
              <Bell className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow p-6 border border-gray-200 dark:border-[#2B2B30]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{todosCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg animate-slide-up">
            {savedMessage}
          </div>
        )}

        {/* Add Task Form */}
        {showForm && (
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="Task title..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder="Add details..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500 resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={newTodo.type}
                    onChange={(e) => setNewTodo({ ...newTodo, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-[#2B2B30] rounded-lg dark:bg-[#0F0F12] dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">Todo</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddTodo}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#2B2B30] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2B2B30]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({todos.filter(t => {
                if (f === 'active') return !t.completed
                if (f === 'completed') return t.completed
                return true
              }).length})
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-2 animate-slide-up">
          {filteredTodos.length === 0 ? (
            <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow p-12 text-center border border-gray-200 dark:border-[#2B2B30]">
              <Circle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white dark:bg-[#1F1F23] rounded-xl shadow p-4 border border-gray-200 dark:border-[#2B2B30] hover:shadow-lg transition ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleTodo(todo.id)}
                    className="mt-1 flex-shrink-0 transition-colors"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        todo.completed
                          ? 'text-gray-500 dark:text-gray-500 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {todo.title}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-400">
                        {todo.type}
                      </span>
                    </div>

                    {todo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{todo.description}</p>
                    )}

                    {todo.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(todo.dueDate).toLocaleDateString()}
                        {isOverdue(todo.dueDate) && !todo.completed && (
                          <span className="text-red-600 dark:text-red-400 font-semibold ml-1">Overdue</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="flex-shrink-0 p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
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
