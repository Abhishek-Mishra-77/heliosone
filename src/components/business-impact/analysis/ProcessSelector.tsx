import React from 'react'
import { Search } from 'lucide-react'
import type { BusinessProcess } from '../../../types/business-impact'
import clsx from 'clsx'

interface ProcessSelectorProps {
  processes: BusinessProcess[]
  selectedProcess: BusinessProcess | null
  searchTerm: string
  onSearchChange: (term: string) => void
  onProcessSelect: (process: BusinessProcess) => void
}

export function ProcessSelector({ 
  processes, 
  selectedProcess, 
  searchTerm, 
  onSearchChange,
  onProcessSelect 
}: ProcessSelectorProps) {
  const filteredProcesses = searchTerm
    ? processes.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : processes

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Select Process</h2>
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        {filteredProcesses.map(process => (
          <button
            key={process.id}
            onClick={() => onProcessSelect(process)}
            className={clsx(
              'w-full text-left p-4 rounded-lg border transition-colors',
              selectedProcess?.id === process.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{process.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{process.description}</p>
              </div>
              <span className={clsx(
                'px-2 py-1 text-xs font-medium rounded-full',
                process.priority === 'critical' && 'bg-red-100 text-red-800',
                process.priority === 'high' && 'bg-orange-100 text-orange-800',
                process.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
                process.priority === 'low' && 'bg-green-100 text-green-800'
              )}>
                {process.priority.toUpperCase()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}