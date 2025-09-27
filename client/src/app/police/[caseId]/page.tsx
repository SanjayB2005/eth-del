import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DashboardLayout from '../../../components/PolicDashboard/DashboardLayout'
import CaseDetailPage from '../../../components/PolicDashboard/CaseDetailPage'
import casesData from '../../../data/cases.json'

interface PageProps {
  params: Promise<{
    caseId: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { caseId } = await params;
  const caseData = casesData.cases.find(c => c.id === caseId)
  
  if (!caseData) {
    return {
      title: 'Case Not Found - Police Dashboard',
    }
  }

  return {
    title: `Case #${caseData.caseNumber} - ${caseData.title} | Police Dashboard`,
    description: `Police case details for ${caseData.title}`,
  }
}

export default async function CasePage({ params }: PageProps) {
  const { caseId } = await params;
  const caseData = casesData.cases.find(c => c.id === caseId)

  if (!caseData) {
    notFound()
  }

  // Type-cast the data to match the expected interface
  const typedCaseData = {
    ...caseData,
    status: caseData.status as 'active' | 'under_investigation' | 'closed',
    priority: caseData.priority as 'low' | 'medium' | 'high',
    evidence: caseData.evidence.map(e => ({
      ...e,
      type: e.type as 'photo' | 'video' | 'audio' | 'document',
      status: e.status as 'verified' | 'pending' | 'rejected'
    }))
  }

  return (
    <DashboardLayout>
      <CaseDetailPage caseData={typedCaseData} />
    </DashboardLayout>
  )
}