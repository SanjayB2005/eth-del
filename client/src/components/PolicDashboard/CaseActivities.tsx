'use client'

import React, { useState } from 'react'

interface CaseActivity {
  id: string
  type: 'evidence_uploaded' | 'report_filed' | 'status_changed' | 'note_added'
  description: string
  timestamp: string
  user: string
  status?: string
}

export default function CaseActivities() {
  const [activities] = useState<CaseActivity[]>([
    {
      id: '1',
      type: 'evidence_uploaded',
      description: 'Evidence files uploaded',
      timestamp: '2 hours ago',
      user: 'Officer Smith',
    },
    {
      id: '2',
      type: 'report_filed',
      description: 'Initial incident report filed',
      timestamp: '1 day ago',
      user: 'Detective Johnson',
      status: 'Under Review'
    }
  ])

  const getActivityIcon = (type: CaseActivity['type']) => {
    switch (type) {
      case 'evidence_uploaded':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
      case 'report_filed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'status_changed':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'note_added':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-5">Recent Activities</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-5">{activity.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-xs text-gray-600 font-medium">{activity.user}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  {activity.status && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        {activity.status}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-4 bg-gray-200"></div>
            )}
          </div>
        ))}
      </div>
      
      <button className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
        View all activities →
      </button>
    </div>
  )
}