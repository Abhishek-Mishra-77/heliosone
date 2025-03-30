import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Communication {
  stakeholder: string
  method: string
  timing: string
  message: string
  owner: string
}

interface CommunicationPlanProps {
  communications: Communication[]
  onChange: (communications: Communication[]) => void
}

export function CommunicationPlan({ communications, onChange }: CommunicationPlanProps) {
  const addCommunication = () => {
    onChange([
      ...communications,
      { stakeholder: '', method: '', timing: '', message: '', owner: '' }
    ])
  }

  const removeCommunication = (index: number) => {
    onChange(communications.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Communication Plan</h3>
        <button
          onClick={addCommunication}
          className="btn-secondary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Communication
        </button>
      </div>

      <div className="space-y-4">
        {communications.map((comm, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-4">
              <h4 className="font-medium text-gray-900">Communication {index + 1}</h4>
              <button
                onClick={() => removeCommunication(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Stakeholder</label>
                <input
                  type="text"
                  value={comm.stakeholder}
                  onChange={(e) => {
                    const newComms = [...communications]
                    newComms[index] = { ...comm, stakeholder: e.target.value }
                    onChange(newComms)
                  }}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Method</label>
                <select
                  value={comm.method}
                  onChange={(e) => {
                    const newComms = [...communications]
                    newComms[index] = { ...comm, method: e.target.value }
                    onChange(newComms)
                  }}
                  className="select"
                  required
                >
                  <option value="">Select method</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                  <option value="teams">Teams/Slack</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Timing</label>
                <select
                  value={comm.timing}
                  onChange={(e) => {
                    const newComms = [...communications]
                    newComms[index] = { ...comm, timing: e.target.value }
                    onChange(newComms)
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
                <label className="form-label">Owner</label>
                <input
                  type="text"
                  value={comm.owner}
                  onChange={(e) => {
                    const newComms = [...communications]
                    newComms[index] = { ...comm, owner: e.target.value }
                    onChange(newComms)
                  }}
                  className="input"
                  required
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Message Template</label>
                <textarea
                  value={comm.message}
                  onChange={(e) => {
                    const newComms = [...communications]
                    newComms[index] = { ...comm, message: e.target.value }
                    onChange(newComms)
                  }}
                  className="input"
                  rows={3}
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