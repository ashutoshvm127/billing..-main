'use client'

import { ProtectedLayout } from "@/components/protected-layout"
import Dashboard from "@/components/kokonutui/dashboard"

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
  )
}

