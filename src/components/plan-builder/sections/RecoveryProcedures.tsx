import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'

interface Task {
  task: string
  owner: string
  timing: string
  dependencies: string[]
}

interface Phase {
  phase: string
  tasks: Task[]
}

interface RecoveryProceduresProps {
  procedures: Phase[]
  onChange: (procedures: Phase[]) => void
}

export function RecoveryProcedures({ procedures, onChange }: RecoveryProceduresProps) {
  const addPhase = () => {
    onChange([...procedures, { phase: '', tasks: [] }])
  }

  const removePhase = (index: number) => {
    onChange(procedures.filter((_, i) => i !== index))
  }

  const addTask = (phaseIndex: number) => {
    const newProcedures = [...procedures]
    newProcedures[phaseIndex].tasks.push({
      task: '',
      owner: '',
      timing: '',
      dependencies: []
    })
    onChange(newProcedures)
  }

  const removeTask = (phaseIndex: number, taskIndex: number) => {
    const newProcedures = [...procedures]
    newProcedures[phaseIndex].tasks = newProcedures[phaseIndex].tasks.filter(
      (_, i) => i !== taskIndex
    )
    onChange(newProcedures)
  }

  const updatePhase = (index: number, phase: Phase) => {
    const newProcedures = [...procedures]
    newProcedures[index] = phase
    onChange(newProcedures)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recovery Procedures</h3>
        <button
          onClick={addPhase}
          className="btn-secondary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Phase
        </button>
      </div>

      <div className="space-y-6">
        {procedures.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="form-group flex-1 mr-4">
                <label className="form-label">Phase Name</label>
                <input
                  type="text"
                  value={phase.phase}
                  onChange={(e) => updatePhase(phaseIndex, { ...phase, phase: e.target.value })}
                  className="input"
                  required
                  placeholder="e.g., Initial Response, Recovery, Restoration"
                />
              </div>
              <button
                onClick={() => removePhase(phaseIndex)}
                className="text-red-600 hover:text-red-800 mt-6"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {phase.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Task {taskIndex + 1}</h4>
                    <button
                      onClick={() => removeTask(phaseIndex, taskIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Task Description</label>
                      <input
                        type="text"
                        value={task.task}
                        onChange={(e) => {
                          const newTasks = [...phase.tasks]
                          newTasks[taskIndex] = { ...task, task: e.target.value }
                          updatePhase(phaseIndex, { ...phase, tasks: newTasks })
                        }}
                        className="input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Owner</label>
                      <input
                        type="text"
                        value={task.owner}
                        onChange={(e) => {
                          const newTasks = [...phase.tasks]
                          newTasks[taskIndex] = { ...task, owner: e.target.value }
                          updatePhase(phaseIndex, { ...phase, tasks: newTasks })
                        }}
                        className="input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Timing</label>
                      <select
                        value={task.timing}
                        onChange={(e) => {
                          const newTasks = [...phase.tasks]
                          newTasks[taskIndex] = { ...task, timing: e.target.value }
                          updatePhase(phaseIndex, { ...phase, tasks: newTasks })
                        }}
                        className="select"
                        required
                      >
                        <option value="">Select timing</option>
                        <option value="immediate">Immediate</option>
                        <option value="within-1h">Within 1 hour</option>
                        <option value="within-4h">Within 4 hours</option>
                        <option value="within-24h">Within 24 hours</option>
                        <option value="as-needed">As needed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dependencies (comma-separated)</label>
                      <input
                        type="text"
                        value={task.dependencies.join(', ')}
                        onChange={(e) => {
                          const newTasks = [...phase.tasks]
                          newTasks[taskIndex] = {
                            ...task,
                            dependencies: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                          }
                          updatePhase(phaseIndex, { ...phase, tasks: newTasks })
                        }}
                        className="input"
                        placeholder="e.g., Task 1, Power restored, Network access"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addTask(phaseIndex)}
                className="btn-secondary w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}