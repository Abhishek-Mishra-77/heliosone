import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const TOAST_DURATION = 5000 // 5 seconds

const ToastIcon = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const ToastColors = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
}

function ToastMessage({ toast, onDismiss }: ToastProps) {
  const Icon = ToastIcon[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, TOAST_DURATION)

    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div className={clsx(
      'flex items-center p-4 rounded-lg border shadow-lg',
      ToastColors[toast.type]
    )}>
      <Icon className="w-5 h-5 mr-3" />
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 text-gray-400 hover:text-gray-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Expose methods globally
  React.useEffect(() => {
    const toast = {
      success: (message: string) => addToast('success', message),
      error: (message: string) => addToast('error', message),
      warning: (message: string) => addToast('warning', message),
      info: (message: string) => addToast('info', message)
    }

    window.toast = toast
    return () => {
      delete window.toast
    }
  }, [])

  return createPortal(
    <div className="fixed bottom-0 right-0 p-6 space-y-4 z-50">
      {toasts.map(toast => (
        <ToastMessage
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
        />
      ))}
    </div>,
    document.body
  )
}

// Add type definition for global toast
declare global {
  interface Window {
    toast: {
      success: (message: string) => void
      error: (message: string) => void
      warning: (message: string) => void
      info: (message: string) => void
    }
  }
}