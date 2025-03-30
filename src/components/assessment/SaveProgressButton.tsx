import { Save } from 'lucide-react'
import clsx from 'clsx'

interface SaveProgressButtonProps {
  onClick: () => void
  saving: boolean
  lastSaved?: string | null
}

export function SaveProgressButton({ onClick, saving, lastSaved }: SaveProgressButtonProps) {
  return (
    <div className="flex items-center space-x-2">
      {lastSaved && (
        <span className="text-sm text-gray-500">
          Last saved: {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={onClick}
        disabled={saving}
        className={clsx(
          "btn-secondary",
          saving && "opacity-50 cursor-not-allowed"
        )}
      >
        <Save className="w-5 h-5 mr-2" />
        {saving ? 'Saving...' : 'Save Progress'}
      </button>
    </div>
  )
}