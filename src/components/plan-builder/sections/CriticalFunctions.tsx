import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'

interface CriticalFunction {
  name: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  rto: number
  rpo: number
  dependencies: string[]
}

interface CriticalFunctionsProps {
  functions: CriticalFunction[]
  onChange: (functions: CriticalFunction[]) => void
}

export function CriticalFunctions({ functions, onChange }: CriticalFunctionsProps) {
  const addFunction = () => {
    onChange([
      ...functions,
      { name: '', priority: 'medium', rto: 4, rpo: 1, dependencies: [] }
    ])
  }

  const removeFunction = (index: number) => {
    onChange(functions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Critical Functions</h3>
        <button
          onClick={addFunction}
          className="btn-secondary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Function
        </button>
      </div>

      <div className="space-y-4">
        {functions.map((fn, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-4">
              <h4 className="font-medium text-gray-900">Function {index + 1}</h4>
              <button
                onClick={() => removeFunction(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Function Name</label>
                <input
                  type="text"
                  value={fn.name}
                  onChange={(e) => {
                    const newFunctions = [...functions]
                    newFunctions[index] = { ...fn, name: e.target.value }
                    onChange(newFunctions)
                  }}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={fn.priority}
                  onChange={(e) => {
                    const newFunctions = [...functions]
                    newFunctions[index] = { ...fn, priority: e.target.value as CriticalFunction['priority'] }
                    onChange(newFunctions)
                  }}
                  className="select"
                  required
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">RTO (hours)</label>
                <input
                  type="number"
                  value={fn.rto}
                  onChange={(e) => {
                    const newFunctions = [...functions]
                    newFunctions[index] = { ...fn, rto: parseInt(e.target.value) }
                    onChange(newFunctions)
                  }}
                  className="input"
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">RPO (hours)</label>
                <input
                  type="number"
                  value={fn.rpo}
                  onChange={(e) => {
                    const newFunctions = [...functions]
                    newFunctions[index] = { ...fn, rpo: parseInt(e.target.value) }
                    onChange(newFunctions)
                  }}
                  className="input"
                  required
                  min="0"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Dependencies (comma-separated)</label>
                <input
                  type="text"
                  value={fn.dependencies.join(', ')}
                  onChange={(e) => {
                    const newFunctions = [...functions]
                    newFunctions[index] = {
                      ...fn,
                      dependencies: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                    }
                    onChange(newFunctions)
                  }}
                  className="input"
                  placeholder="e.g., Network, Power, Database"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}