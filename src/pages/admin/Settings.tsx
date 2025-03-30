import React, { useState } from 'react'
import { Settings, Save, Shield, Mail, Lock, Globe, Clock, Bell } from 'lucide-react'
import { useAuthStore } from '../../lib/store'

interface TimeZone {
  value: string
  label: string
}

const TIME_ZONES: TimeZone[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'British Time (BST)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)' },
]

export function AdminSettings() {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(false)

  // Platform Settings
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Helios BCDR',
    defaultTimeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '24h',
    
    // Security Settings
    mfaRequired: true,
    passwordMinLength: 12,
    passwordExpiration: 90, // days
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    ipWhitelisting: false,
    
    // Email Settings
    emailFromName: 'Helios BCDR',
    emailFromAddress: 'notifications@helios.com',
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    
    // Notification Settings
    notifyOnCriticalEvents: true,
    notifyOnUserCreation: true,
    notifyOnAssessmentCompletion: true,
    notifyOnSystemUpdates: true,
    
    // Retention Settings
    auditLogRetention: 365, // days
    assessmentHistoryRetention: 730, // days
    documentRetention: 1825, // days
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // In a real application, this would save to your database
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (!profile?.role?.includes('super_admin')) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Settings className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">General Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Time Zone</label>
                <select
                  value={settings.defaultTimeZone}
                  onChange={(e) => setSettings({ ...settings, defaultTimeZone: e.target.value })}
                  className="select"
                >
                  {TIME_ZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="select"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Time Format</label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                  className="select"
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Security Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.mfaRequired}
                    onChange={(e) => setSettings({ ...settings, mfaRequired: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">Require MFA for all users</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Password Length</label>
                <input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                  min="8"
                  max="32"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password Expiration (days)</label>
                <input
                  type="number"
                  value={settings.passwordExpiration}
                  onChange={(e) => setSettings({ ...settings, passwordExpiration: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Login Attempts</label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.ipWhitelisting}
                    onChange={(e) => setSettings({ ...settings, ipWhitelisting: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable IP Whitelisting</span>
                </label>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Email Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">From Name</label>
                <input
                  type="text"
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({ ...settings, emailFromName: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">From Email Address</label>
                <input
                  type="email"
                  value={settings.emailFromAddress}
                  onChange={(e) => setSettings({ ...settings, emailFromAddress: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="input"
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">SMTP Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.smtpSecure}
                    onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">Use TLS/SSL</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Notification Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnCriticalEvents}
                    onChange={(e) => setSettings({ ...settings, notifyOnCriticalEvents: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">Critical Events</span>
                </label>
              </div>
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnUserCreation}
                    onChange={(e) => setSettings({ ...settings, notifyOnUserCreation: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">User Creation</span>
                </label>
              </div>
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnAssessmentCompletion}
                    onChange={(e) => setSettings({ ...settings, notifyOnAssessmentCompletion: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">Assessment Completion</span>
                </label>
              </div>
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnSystemUpdates}
                    onChange={(e) => setSettings({ ...settings, notifyOnSystemUpdates: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">System Updates</span>
                </label>
              </div>
            </div>
          </div>

          {/* Data Retention Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Data Retention Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Audit Log Retention (days)</label>
                <input
                  type="number"
                  value={settings.auditLogRetention}
                  onChange={(e) => setSettings({ ...settings, auditLogRetention: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assessment History Retention (days)</label>
                <input
                  type="number"
                  value={settings.assessmentHistoryRetention}
                  onChange={(e) => setSettings({ ...settings, assessmentHistoryRetention: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Document Retention (days)</label>
                <input
                  type="number"
                  value={settings.documentRetention}
                  onChange={(e) => setSettings({ ...settings, documentRetention: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}