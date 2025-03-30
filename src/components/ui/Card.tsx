import React from 'react'
import clsx from 'clsx'

interface CardProps {
  title?: string
  subtitle?: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
  loading?: boolean
  error?: string
  action?: React.ReactNode
}

export function Card({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  className,
  loading,
  error,
  action
}: CardProps) {
  return (
    <div className={clsx(
      "bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden",
      className
    )}>
      {(title || subtitle || Icon || action) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
            {action}
          </div>
        </div>
      )}
      
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : children}
      </div>
    </div>
  )
}