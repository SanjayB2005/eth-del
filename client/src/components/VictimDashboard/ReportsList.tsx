'use client'

import Link from 'next/link'
import reportsData from '@/data/reports.json'

interface Report {
  id: string
  title: string
  status: 'submitted' | 'under-review' | 'investigation' | 'closed'
  priority: 'low' | 'medium' | 'high'
  submissionDate: string
  lastUpdated: string
  description: string
  evidence: Array<{
    id: string
    filename: string
    type: string
    uploadDate: string
    description: string
  }>
}

export default function ReportsList() {
  const reports = reportsData as Report[]

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'under-review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'investigation':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'closed':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Reports</h1>
            <p className="text-gray-600 mt-1">Track the status of your submitted evidence reports</p>
          </div>
          <Link
            href="/report"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Report
          </Link>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link 
                        href={`/report/${report.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-purple-700 transition-colors"
                      >
                        {report.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">Report ID: {report.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                        {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{report.description}</p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Submitted:</span>
                      <p className="text-gray-900">{formatDate(report.submissionDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Last Updated:</span>
                      <p className="text-gray-900">{formatDate(report.lastUpdated)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Evidence Files:</span>
                      <p className="text-gray-900">{report.evidence.length} file(s)</p>
                    </div>
                  </div>
                </div>

                <div className="lg:ml-6 flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                  <Link
                    href={`/report/${report.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            When you submit evidence reports, they will appear here. You can track their progress and view updates.
          </p>
          <Link
            href="/report"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Submit Your First Report
          </Link>
        </div>
      )}

      {/* Support Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="text-center">
          <h3 className="font-semibold text-purple-900 mb-2">Need Help or Have Questions?</h3>
          <p className="text-sm text-purple-800 mb-4">
            Our support team is here 24/7. You are not alone in this process.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}