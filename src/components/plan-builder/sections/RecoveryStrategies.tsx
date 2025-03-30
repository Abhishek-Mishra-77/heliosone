import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface RecoveryStrategy {
  function: string
  strategy: string
  resources: string
  owner: string
}

interface RecoveryStrategiesProps {
  strategies: RecoveryStrategy[]
  onChange: (strategies: RecoveryStrategy[]) => void
}

export function RecoveryStrategies({ strategies, onChange }: RecoveryStrategiesProps) {
  const addStrategy = () => {
    onChange([
      ...strategies,
      { function: '', strategy: '', resources: '', owner: '' }
    ])
  }

  const removeStrategy = (index: number) => {
    onChange(strategies.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recovery Strategies</h3>
        <button
          onClick={addStrategy}
          className="btn-secondary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Strategy
        </button>
      </div>

      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-4">
              <h4 className="font-medium text-gray-900">Strategy {index + 1}</h4>
              <button
                onClick={() => removeStrategy(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Function</label>
                <input
                  type="text"
                  value={strategy.function}
                  onChange={(e) => {
                    const newStrategies = [...strategies]
                    newStrategies[index] = { ...strategy, function: e.target.value }
                    onChange(newStrategies)
                  }}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Strategy</label>
                <input
                  type="text"
                  value={strategy.strategy}
                  onChange={(e) => {
                    const newStrategies = [...strategies]
                    newStrategies[index] = { ...strategy, strategy: e.target.value }
                    onChange(newStrategies)
                  }}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Resources</label>
                <input
                  type="text"
                  value={strategy.resources}
                  onChange={(e) => {
                    const newStrategies = [...strategies]
                    newStrategies[index] = { ...strategy, resources: e.target.value }
                    onChange(newStrategies)
                  }}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Owner</label>
                <input
                  type="text"
                  value={strategy.owner}
                  onChange={(e) => {
                    const newStrategies = [...strategies]
                    newStrategies[index] = { ...strategy, owner: e.target.value }
                    onChange(newStrategies)
                  }}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}