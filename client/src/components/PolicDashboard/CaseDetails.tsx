'use client'

import React from 'react'
import CaseActivities from './CaseActivities'
import EvidenceManager from './EvidenceManager'

interface Case {
  id: string
  caseNumber: string
  title: string
  type: string
  status: 'active' | 'under_investigation' | 'closed'
  priority: 'low' | 'medium' | 'high'
  dateReported: string
  assignedOfficer: string
  description: string
}

interface CaseDetailsProps {
  caseData: Case
  onBackToList: () => void
}

export default function CaseDetails({ caseData, onBackToList }: CaseDetailsProps) {
  const getStatusBadge = (status: Case['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">Active</span>
      case 'under_investigation':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">Under Investigation</span>
      case 'closed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Closed</span>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: Case['priority']) => {
    switch (priority) {
      case 'high':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">High Priority</span>
      case 'medium':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">Medium Priority</span>
      case 'low':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Low Priority</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <button 
          onClick={onBackToList}
          className="flex items-center hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cases Dashboard
        </button>
        <span>&gt;</span>
        <span>Case #{caseData.caseNumber} - {caseData.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Case Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Case Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Case #{caseData.caseNumber}</h2>
                <p className="text-sm text-gray-600">{caseData.title}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Status</span>
                {getStatusBadge(caseData.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Priority</span>
                {getPriorityBadge(caseData.priority)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Type</span>
                <span className="text-sm font-medium text-gray-900">{caseData.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Assigned Officer</span>
                <span className="text-sm font-medium text-gray-900">{caseData.assignedOfficer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Date Reported</span>
                <span className="text-sm font-medium text-gray-900">{caseData.dateReported}</span>
              </div>
            </div>
            
            <div className="flex space-x-3 mb-6">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-sm font-medium">Edit Case</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">Generate Report</span>
              </button>
            </div>
            
            {/* Case Description */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Case Description</h4>
              <p className="text-sm text-gray-700">{caseData.description}</p>
            </div>
          </div>

          {/* Case Activities */}
          <CaseActivities />
        </div>

        {/* Right Column - Evidence and Documentation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Evidence & Documentation</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-600">Case Created: {caseData.dateReported}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Encrypted & Secure</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-6">
                <button className="py-3 px-1 border-b-2 border-blue-500 text-blue-600 text-sm font-medium">Evidence</button>
                <button className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm font-medium transition-colors">Timeline</button>
                <button className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm font-medium transition-colors">Notes</button>
              </nav>
            </div>
          </div>

          {/* Evidence Manager */}
          <EvidenceManager />
        </div>
      </div>
    </div>
  )
}