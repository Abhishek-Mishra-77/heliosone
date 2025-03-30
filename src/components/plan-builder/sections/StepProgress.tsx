import React from 'react'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface Step {
  title: string
  icon: LucideIcon
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="mb-8">
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
          />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className={clsx(
                  "p-4 rounded-lg border-2 transition-all",
                  index === currentStep
                    ? "border-indigo-600 bg-indigo-50"
                    : index < currentStep
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={clsx(
                    "w-5 h-5",
                    index === currentStep ? "text-indigo-600" :
                    index < currentStep ? "text-green-500" :
                    "text-gray-400"
                  )} />
                  <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}