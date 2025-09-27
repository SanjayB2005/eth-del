import VictimLayout from '@/components/VictimDashboard/VictimLayout'
import ReportDetail from '../../..//components/VictimDashboard/ReportDetail'

export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  return (
    <VictimLayout>
      <ReportDetail reportId={reportId} />
    </VictimLayout>
  )
}