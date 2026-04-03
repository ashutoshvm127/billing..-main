'use client'

import { ProtectedLayout } from '@/components/protected-layout'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { getInvoices } from '@/lib/billing-store'

interface Metrics {
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  averageInvoiceValue: number
  collectionRate: number
  overdueAmount: number
}

export default function ReportsAIPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [insights, setInsights] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return

      const invoicesList = await getInvoices(user.id)
      setInvoices(invoicesList)

      const totalRevenue = invoicesList.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0)
      const paidInvoices = invoicesList.filter((inv: any) => inv.status === 'paid').length
      const pendingInvoices = invoicesList.filter((inv: any) => inv.status === 'sent' || inv.status === 'draft' || inv.status === 'overdue').length
      const overdueAmount = invoicesList
        .filter((inv: any) => inv.status === 'overdue')
        .reduce((sum: number, inv: any) => sum + inv.totalAmount, 0)

      setMetrics({
        totalRevenue,
        totalInvoices: invoicesList.length,
        paidInvoices,
        pendingInvoices,
        averageInvoiceValue: invoicesList.length > 0 ? totalRevenue / invoicesList.length : 0,
        collectionRate: invoicesList.length > 0 ? (paidInvoices / invoicesList.length) * 100 : 0,
        overdueAmount
      })
    }

    loadData()
  }, [user?.id])

  const generateInsights = async () => {
    if (!metrics) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices, metrics })
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      setInsights(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!metrics) {
    return (
      <ProtectedLayout>
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Analytics & Reports</h1>
          <Button
            onClick={generateInsights}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Get AI Insights'}
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Revenue"
            value={`$${metrics.totalRevenue.toFixed(2)}`}
            icon={TrendingUp}
            trend="up"
          />
          <MetricCard
            label="Total Invoices"
            value={metrics.totalInvoices}
            icon={CheckCircle}
          />
          <MetricCard
            label="Collection Rate"
            value={`${metrics.collectionRate.toFixed(1)}%`}
            icon={TrendingUp}
          />
          <MetricCard
            label="Overdue Amount"
            value={`$${metrics.overdueAmount.toFixed(2)}`}
            icon={AlertCircle}
            trend="down"
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Paid</span>
                <span className="font-semibold text-green-600">{metrics.paidInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-600">{metrics.pendingInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Value</span>
                <span className="font-semibold">${metrics.averageInvoiceValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Average</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(metrics.totalRevenue / 12).toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Days to Payment</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">~30 days</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Health Score</p>
                  <div className="w-full bg-gray-200 dark:bg-[#0F0F12] rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(metrics.collectionRate, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="ml-2 text-sm font-semibold">{metrics.collectionRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-xl p-8 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  AI Insights & Recommendations
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {insights}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-6 border border-red-200 dark:border-red-500/20">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {invoices.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-xl p-6 border border-yellow-200 dark:border-yellow-500/20 text-center">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <p className="text-yellow-700 dark:text-yellow-400">
              Create some invoices first to see analytics
            </p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}

function MetricCard({ label, value, icon: Icon, trend }: any) {
  return (
    <div className="bg-white dark:bg-[#1F1F23] rounded-xl p-6 border border-gray-200 dark:border-[#2B2B30] hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-100 dark:bg-green-500/10' : trend === 'down' ? 'bg-red-100 dark:bg-red-500/10' : 'bg-blue-100 dark:bg-blue-500/10'}`}>
          <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
        </div>
      </div>
    </div>
  )
}
