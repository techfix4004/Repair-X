'use client'

import { JobSheet, JobSheetStatus, JobSheetPart } from '@/types/device'
import { useState } from 'react'

interface JobSheetViewProps {
  jobSheet: JobSheet & {
    device: {
      brand: string
      model: string
      category: string
      condition: string
    }
    customer: {
      firstName: string
      lastName: string
      email: string
      phone?: string
    }
    technician?: {
      firstName: string
      lastName: string
    }
    partsUsed?: JobSheetPart[]
  }
  isEditing?: boolean
  onStatusUpdate?: (status: JobSheetStatus) => void
  onAddPart?: (part: Omit<JobSheetPart, 'id' | 'jobSheetId' | 'createdAt'>) => void
}

export default function JobSheetView({ 
  jobSheet, 
  isEditing = false, 
  onStatusUpdate, 
  onAddPart 
}: JobSheetViewProps) {
  const [newPart, setNewPart] = useState({
    partName: '',
    partNumber: '',
    quantity: 1,
    unitCost: 0,
    supplier: ''
  })

  const getStatusColor = (status: JobSheetStatus) => {
    const colors = {
      'CREATED': 'bg-gray-100 text-gray-800',
      'IN_DIAGNOSIS': 'bg-blue-100 text-blue-800', 
      'AWAITING_APPROVAL': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'PARTS_ORDERED': 'bg-purple-100 text-purple-800',
      'TESTING': 'bg-indigo-100 text-indigo-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'text-green-600',
      'MEDIUM': 'text-yellow-600', 
      'HIGH': 'text-orange-600',
      'URGENT': 'text-red-600'
    }
    return colors[priority as keyof typeof colors] || 'text-gray-600'
  }

  const handleAddPart = () => {
    if (newPart.partName && newPart.quantity > 0 && newPart.unitCost >= 0) {
      const totalCost = newPart.quantity * newPart.unitCost
      onAddPart?.({ ...newPart, totalCost })
      setNewPart({ partName: '', partNumber: '', quantity: 1, unitCost: 0, supplier: '' })
    }
  }

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Job Sheet {jobSheet.jobNumber}</h1>
            <p className="text-blue-200 mt-1">
              Created {new Date(jobSheet.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobSheet.status)}`}>
              {jobSheet.status.replace('_', ' ')}
            </span>
            <p className={`text-sm mt-1 font-medium ${getPriorityColor(jobSheet.priority)}`}>
              {jobSheet.priority} Priority
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer & Device Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{jobSheet.customer.firstName} {jobSheet.customer.lastName}</p>
                <p className="text-gray-600">{jobSheet.customer.email}</p>
                {jobSheet.customer.phone && (
                  <p className="text-gray-600">{jobSheet.customer.phone}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Device Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-lg">{jobSheet.device.brand} {jobSheet.device.model}</p>
                <p className="text-gray-600">Category: {jobSheet.device.category}</p>
                <p className="text-gray-600">Condition: {jobSheet.device.condition}</p>
              </div>
            </div>

            {jobSheet.technician && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Assigned Technician</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{jobSheet.technician.firstName} {jobSheet.technician.lastName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Problem & Progress */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Problem Description</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{jobSheet.problemDescription}</p>
              </div>
            </div>

            {jobSheet.diagnosisNotes && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Diagnosis Notes</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{jobSheet.diagnosisNotes}</p>
                </div>
              </div>
            )}

            {/* Time Tracking */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Time Tracking</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Hours</p>
                    <p className="font-semibold">{jobSheet._estimatedHours}h</p>
                  </div>
                  {jobSheet.actualHours && (
                    <div>
                      <p className="text-sm text-gray-600">Actual Hours</p>
                      <p className="font-semibold">{jobSheet.actualHours}h</p>
                    </div>
                  )}
                </div>
                {jobSheet.startedAt && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Started: {new Date(jobSheet.startedAt).toLocaleString()}</p>
                  </div>
                )}
                {jobSheet.completedAt && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">Completed: {new Date(jobSheet.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cost Breakdown</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Labor Cost</p>
                <p className="text-xl font-semibold text-green-600">${jobSheet.laborCost}</p>
              </div>
              {jobSheet.partsCost && (
                <div>
                  <p className="text-sm text-gray-600">Parts Cost</p>
                  <p className="text-xl font-semibold text-blue-600">${jobSheet.partsCost}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${jobSheet.totalCost || (Number(jobSheet.laborCost) + Number(jobSheet.partsCost || 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parts Used */}
        {(jobSheet.partsUsed && jobSheet.partsUsed.length > 0) && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Parts Used</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobSheet.partsUsed.map((part) => (
                    <tr key={part.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {part.partName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {part.partNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {part.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${part.unitCost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${part.totalCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Part Form (for technicians) */}
        {isEditing && onAddPart && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Part</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                  <input
                    type="text"
                    value={newPart.partName}
                    onChange={(e) => setNewPart(prev => ({ ...prev, partName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Part name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                  <input
                    type="text"
                    value={newPart.partNumber}
                    onChange={(e) => setNewPart(prev => ({ ...prev, partNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newPart.quantity}
                    onChange={(e) => setNewPart(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPart.unitCost}
                    onChange={(e) => setNewPart(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddPart}
                    disabled={!newPart.partName || newPart.quantity <= 0}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Part
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update (for technicians) */}
        {isEditing && onStatusUpdate && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {(['IN_DIAGNOSIS', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'PARTS_ORDERED', 'TESTING', 'COMPLETED'] as JobSheetStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusUpdate(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    jobSheet.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warranty Information */}
        {jobSheet.warrantyCoverage && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Warranty Coverage</h2>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800">{jobSheet.warrantyCoverage}</p>
            </div>
          </div>
        )}

        {/* Quality Metrics Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Six Sigma Quality Standards</h3>
          <p className="text-sm text-blue-700">
            This repair follows our Six Sigma quality process with &lt; 3.4 defects per million opportunities target. 
            All work is validated through comprehensive quality checkpoints and testing protocols.
          </p>
        </div>
      </div>
    </div>
  )
}