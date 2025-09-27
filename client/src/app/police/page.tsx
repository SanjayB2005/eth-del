import { Metadata } from 'next'
import DashboardLayout from '../../components/PolicDashboard/DashboardLayout'
import PoliceDashboardContent from '../../components/PolicDashboard/PoliceDashboardContent'

export const metadata: Metadata = {
  title: 'Police Dashboard - Evidence Management System',
  description: 'Police dashboard for managing incident reports, evidence, and case documentation',
}

export default function PoliceDashboard() {
  return (
    <DashboardLayout>
      <PoliceDashboardContent />
    </DashboardLayout>
  )
}