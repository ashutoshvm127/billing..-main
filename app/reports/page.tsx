'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import { PageNavigation } from "@/components/page-navigation"
import { useEffect, useState } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, FileText, Clock, Download } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getInvoices, saveReportSnapshot } from "@/lib/billing-store"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  amount: number
  status: string
  createdAt: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    paidAmount: 0,
    pendingAmount: 0
  })
  const [chartData, setChartData] = useState([])
  const [statusData, setStatusData] = useState([])

  useEffect(() => {
    const loadReportsData = async () => {
      if (!user?.id) return

      const invoicesList = await getInvoices(user.id)
      setInvoices(invoicesList)

      // Calculate stats
      const totalRevenue = invoicesList.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0)
      const paidAmount = invoicesList
        .filter((inv: Invoice) => inv.status === 'paid')
        .reduce((sum: number, inv: Invoice) => sum + inv.amount, 0)
      const pendingAmount = totalRevenue - paidAmount

      setStats({
        totalRevenue,
        totalInvoices: invoicesList.length,
        paidAmount,
        pendingAmount
      })

      // Prepare chart data - monthly revenue
      const monthlyData: { [key: string]: number } = {}
      invoicesList.forEach((inv: Invoice) => {
        const month = new Date(inv.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        monthlyData[month] = (monthlyData[month] || 0) + inv.amount
      })

      const chartDataArray = Object.entries(monthlyData).map(([month, amount]) => ({
        month,
        revenue: amount
      }))
      setChartData(chartDataArray)

      // Status breakdown
      const statusBreakdown: { [key: string]: number } = {}
      invoicesList.forEach((inv: Invoice) => {
        statusBreakdown[inv.status] = (statusBreakdown[inv.status] || 0) + 1
      })

      const statusDataArray = Object.entries(statusBreakdown).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }))
      setStatusData(statusDataArray)

      await saveReportSnapshot({
        id: `report-${user.id}`,
        userId: user.id,
        totalRevenue,
        totalInvoices: invoicesList.length,
        paidAmount,
        pendingAmount,
        amountCollected: paidAmount,
        createdAt: new Date().toISOString(),
      })
    }

    loadReportsData()
  }, [user?.id])

  const colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B']

  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += 'Invoice Report\n'
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    csvContent += 'Summary\n'
    csvContent += `Total Revenue,${stats.totalRevenue.toFixed(2)}\n`
    csvContent += `Total Invoices,${stats.totalInvoices}\n`
    csvContent += `Paid Amount,${stats.paidAmount.toFixed(2)}\n`
    csvContent += `Pending Amount,${stats.pendingAmount.toFixed(2)}\n\n`
    csvContent += 'Invoice Details\n'
    csvContent += 'Invoice #,Client,Amount,Status,Date\n'
    invoices.forEach(inv => {
      csvContent += `${inv.invoiceNumber || 'N/A'},${inv.clientName || 'N/A'},${inv.amount.toFixed(2)},${inv.status},${new Date(inv.createdAt).toLocaleDateString()}\n`
    })

    const element = document.createElement('a')
    element.setAttribute('href', encodeURI(csvContent))
    element.setAttribute('download', `invoice-report-${new Date().getTime()}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const exportToPDF = () => {
    const content = `
INVOICE REPORT
Generated on: ${new Date().toLocaleDateString()}

SUMMARY
Total Revenue: $${stats.totalRevenue.toFixed(2)}
Total Invoices: ${stats.totalInvoices}
Paid Amount: $${stats.paidAmount.toFixed(2)}
Pending Amount: $${stats.pendingAmount.toFixed(2)}

INVOICE DETAILS
${invoices.map((inv, i) => `${i + 1}. ${inv.invoiceNumber || 'N/A'} - ${inv.clientName || 'N/A'} - $${inv.amount.toFixed(2)} - ${inv.status} - ${new Date(inv.createdAt).toLocaleDateString()}`).join('\n')}

---
This is a computer-generated report
`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `invoice-report-${new Date().getTime()}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const StatCard = ({ icon: Icon, label, value, change }: any) => (
    <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] hover:shadow-xl transition animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && <p className="text-sm text-green-600 dark:text-green-400 mt-1">{change}</p>}
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )

  return (
    <ProtectedLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Navigation */}
        <PageNavigation 
          title="Reports & Analytics"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Reports' }
          ]}
        />

        {/* Header with Export Buttons */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Track your billing performance and revenue</p>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
          />
          <StatCard
            icon={FileText}
            label="Total Invoices"
            value={stats.totalInvoices}
          />
          <StatCard
            icon={TrendingUp}
            label="Paid Amount"
            value={`$${stats.paidAmount.toFixed(2)}`}
            change={`${stats.totalInvoices > 0 ? ((stats.paidAmount / stats.totalRevenue) * 100).toFixed(1) : 0}% collected`}
          />
          <StatCard
            icon={Clock}
            label="Pending Amount"
            value={`$${stats.pendingAmount.toFixed(2)}`}
            change={`${stats.totalInvoices > 0 ? ((stats.pendingAmount / stats.totalRevenue) * 100).toFixed(1) : 0}% pending`}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Revenue */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F1F23', border: '1px solid #2B2B30', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Invoice Status */}
          <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Invoice Status</h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices Summary */}
        <div className="bg-white dark:bg-[#1F1F23] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-[#2B2B30] animate-slide-up">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Invoices Summary</h2>
          {invoices.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No invoices to display</p>
          ) : (
            <div className="space-y-2">
              {invoices.slice(-5).reverse().map((invoice, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0F0F12] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Invoice #{idx + 1}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">${invoice.amount.toFixed(2)}</p>
                    <span className={`text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'text-green-700 dark:text-green-400'
    case 'sent':
      return 'text-blue-700 dark:text-blue-400'
    case 'overdue':
      return 'text-red-700 dark:text-red-400'
    default:
      return 'text-gray-700 dark:text-gray-400'
  }
}
