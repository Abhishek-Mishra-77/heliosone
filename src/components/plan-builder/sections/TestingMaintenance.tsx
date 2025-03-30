import React from 'react'

interface TestingMaintenanceProps {
  testingSchedule: {
    frequency: string
    lastTest: string
    nextTest: string
    scope: string
  }
  onChange: (testingSchedule: TestingMaintenanceProps['testingSchedule']) => void
}

export function TestingMaintenance({ testingSchedule, onChange }: TestingMaintenanceProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">Testing Frequency</label>
          <select
            value={testingSchedule.frequency}
            onChange={(e) => onChange({ ...testingSchedule, frequency: e.target.value })}
            className="select"
            required
          >
            <option value="Annually">Annually</option>
            <option value="Semi-annually">Semi-annually</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Last Test Date</label>
          <input
            type="date"
            value={testingSchedule.lastTest}
            onChange={(e) => onChange({ ...testingSchedule, lastTest: e.target.value })}
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Next Test Date</label>
          <input
            type="date"
            value={testingSchedule.nextTest}
            onChange={(e) => onChange({ ...testingSchedule, nextTest: e.target.value })}
            className="input"
            required
          />
        </div>

        <div className="form-group md:col-span-2">
          <label className="form-label">Test Scope</label>
          <textarea
            value={testingSchedule.scope}
            onChange={(e) => onChange({ ...testingSchedule, scope: e.target.value })}
            className="input"
            rows={3}
            required
            placeholder="Describe the scope of testing activities..."
          />
        </div>
      </div>
    </div>
  )
}