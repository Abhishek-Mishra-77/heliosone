import React, { useState, useRef } from 'react'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/store'

interface UserImportModalProps {
  show: boolean
  onClose: () => void
  onComplete: () => void
}

interface ImportResult {
  success: boolean
  email: string
  message: string
}

interface CSVUser {
  email: string
  full_name: string
  role: 'admin' | 'user'
}

export function UserImportModal({ show, onClose, onComplete }: UserImportModalProps) {
  const { organization } = useAuthStore()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setResults([])
    }
  }

  const validateCSV = (data: any[]): { isValid: boolean; users: CSVUser[] } => {
    const users: CSVUser[] = []
    const requiredFields = ['email', 'full_name', 'role']
    const validRoles = ['admin', 'user']

    for (const row of data) {
      // Check required fields
      for (const field of requiredFields) {
        if (!row[field]) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      // Validate email format
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(row.email)) {
        throw new Error(`Invalid email format: ${row.email}`)
      }

      // Validate role
      if (!validRoles.includes(row.role)) {
        throw new Error(`Invalid role for ${row.email}: must be 'admin' or 'user'`)
      }

      users.push({
        email: row.email,
        full_name: row.full_name,
        role: row.role as 'admin' | 'user'
      })
    }

    return { isValid: true, users }
  }

  const handleImport = async () => {
    if (!file || !organization?.id) return

    try {
      setLoading(true)
      setError(null)
      setResults([])

      // Parse CSV
      const { data } = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject
        })
      })

      // Validate CSV data
      const { users } = validateCSV(data)

      // Import users
      const { data: importResults, error: importError } = await supabase
        .rpc('import_organization_users', {
          org_id: organization.id,
          user_data: users
        })

      if (importError) throw importError

      setResults(importResults)

      // If there were any successful imports, refresh the user list
      if (importResults.some(r => r.success)) {
        onComplete()
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setFile(null)
    } catch (error) {
      console.error('Error importing users:', error)
      setError(error instanceof Error ? error.message : 'Failed to import users')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal">
      <div className="modal-content max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Import Users</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>File must be in CSV format</li>
              <li>Required columns: email, full_name, role</li>
              <li>Role must be either 'admin' or 'user'</li>
              <li>Email must be a valid email format</li>
            </ul>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  {file ? file.name : 'Click to upload CSV file'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Import Results:</h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-2 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'
                        }`}
                    >
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="ml-2 text-sm font-medium">
                        {result.email}
                      </span>
                      <span className={`ml-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {result.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="btn-primary"
          >
            {loading ? 'Importing...' : 'Import Users'}
          </button>
        </div>
      </div>
    </div>
  )
}