'use client'

import React, { useState } from 'react'

interface TimelineEvent {
  id: string
  type: 'report_filed' | 'evidence_submitted' | 'officer_assigned' | 'interview_conducted' | 'status_update' | 'court_date'
  title: string
  description: string
  timestamp: string
  date: string
  user?: string
  status?: 'completed' | 'in_progress' | 'pending' | 'cancelled'
}

export default function CaseTimeline() {
  const [timelineEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      type: 'report_filed',
      title: 'Anonymous Report Filed',
      description: 'Initial incident report submitted through anonymous platform with evidence attachments',
      timestamp: '2024-03-15 14:30:00',
      date: 'March 15, 2024',
      user: 'Anonymous User #A001',
      status: 'completed'
    },
    {
      id: '2',
      type: 'officer_assigned',
      title: 'Case Assigned to Detective',
      description: 'Case assigned to Detective Johnson for investigation based on incident type and severity',
      timestamp: '2024-03-15 15:45:00',
      date: 'March 15, 2024',
      user: 'Sergeant Wilson',
      status: 'completed'
    },
    {
      id: '3',
      type: 'evidence_submitted',
      title: 'Additional Evidence Received',
      description: 'Victim submitted additional photo evidence and voice recordings through secure portal',
      timestamp: '2024-03-16 09:15:00',
      date: 'March 16, 2024',
      user: 'Anonymous User #A001',
      status: 'completed'
    },
    {
      id: '4',
      type: 'interview_conducted',
      title: 'Victim Interview Scheduled',
      description: 'Virtual interview arranged to protect victim anonymity while gathering additional details',
      timestamp: '2024-03-18 14:00:00',
      date: 'March 18, 2024',
      user: 'Detective Johnson',
      status: 'in_progress'
    },
    {
      id: '5',
      type: 'status_update',
      title: 'Investigation Status Update',
      description: 'Evidence analysis completed, preparing charges recommendation',
      timestamp: '2024-03-20 16:30:00',
      date: 'March 20, 2024',
      user: 'Detective Johnson',
      status: 'pending'
    },
    {
      id: '6',
      type: 'court_date',
      title: 'Court Proceedings Scheduled',
      description: 'Preliminary hearing scheduled with victim protection measures in place',
      timestamp: '2024-03-25 10:00:00',
      date: 'March 25, 2024',
      user: 'District Attorney Office',
      status: 'pending'
    }
  ])

  const getEventIcon = (type: TimelineEvent['type'], status: TimelineEvent['status']) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center"
    let bgColor = "bg-gray-100"
    let iconColor = "text-gray-500"
    
    if (status === 'completed') {
      bgColor = "bg-green-100"
      iconColor = "text-green-600"
    } else if (status === 'in_progress') {
      bgColor = "bg-blue-100"
      iconColor = "text-blue-600"
    } else if (status === 'pending') {
      bgColor = "bg-yellow-100"
      iconColor = "text-yellow-600"
    } else if (status === 'cancelled') {
      bgColor = "bg-red-100"
      iconColor = "text-red-600"
    }

    const iconElement = (() => {
      switch (type) {
        case 'report_filed':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        case 'officer_assigned':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        case 'evidence_submitted':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )
        case 'interview_conducted':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )
        case 'status_update':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        case 'court_date':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          )
        default:
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
      }
    })()

    return (
      <div className={`${baseClasses} ${bgColor}`}>
        <div className={iconColor}>
          {iconElement}
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
      case 'in_progress':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Case Timeline</h3>
        <p className="text-sm text-gray-500 mt-1">
          Complete chronological record of case events and milestones
        </p>
      </div>

      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {timelineEvents.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== timelineEvents.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      {getEventIcon(event.type, event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(event.status)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{event.date}</span>
                        {event.user && (
                          <>
                            <span>•</span>
                            <span>{event.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Export Timeline →
          </button>
        </div>
      </div>
    </div>
  )
}