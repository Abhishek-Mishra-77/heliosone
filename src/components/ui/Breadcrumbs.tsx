import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  title: string
  href?: string
}

interface BreadcrumbsProps {
  crumbs: Crumb[]
}

export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-500"
          >
            <Home className="w-5 h-5" />
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-5 h-5 text-gray-400" />
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {crumb.title}
              </Link>
            ) : (
              <span className="ml-2 text-sm font-medium text-gray-900">
                {crumb.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}