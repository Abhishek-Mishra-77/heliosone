import React from 'react'
import clsx from 'clsx'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: {
    value: number
    label?: string
  }
  className?: string
}

export function Stat({ title, value, icon: Icon, trend, className }: StatProps) {
  return (
    <div className={clsx(
      "rounded-lg p-6",
      className || "bg-gradient-to-br from-indigo-50 to-indigo-100"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-indigo-600 mr-2" />
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        <span className="text-2xl font-bold text-indigo-600">
          {value}
        </span>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          {trend.value > 0 ? (
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={clsx(
            trend.value > 0 ? "text-green-600" : "text-red-600"
          )}>
            {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className="text-gray-500 ml-2">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  )
}