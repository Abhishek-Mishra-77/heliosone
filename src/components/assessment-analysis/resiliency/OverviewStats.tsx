import React from 'react'
import { 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Clock
} from 'lucide-react'

interface OverviewStatsProps {
  stats: {
    overallScore: number
    overallTrend: number
    responseMetrics: {
      meanTimeToDetect: number
      meanTimeToRespond: number
      meanTimeToRecover: number
      trendMTTD: number
      trendMTTR: number
      trendMTTR2: number
    }
    complianceMetrics: {
      documentationScore: number
    }
  }
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-gray-600">Resiliency Score</span>
          </div>
          <span className="text-2xl font-bold text-indigo-600">
            {stats.overallScore}%
          </span>
        </div>
        <div className="mt-2 flex items-center text-sm">
          {stats.overallTrend > 0 ? (
            <>
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats.overallTrend}%</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">{stats.overallTrend}%</span>
            </>
          )}
          <span className="text-gray-500 ml-2">vs last assessment</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-600">Response Time</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {stats.responseMetrics.meanTimeToRespond}m
          </span>
        </div>
        <div className="mt-2 flex items-center text-sm">
          {stats.responseMetrics.trendMTTR < 0 ? (
            <>
              <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">{Math.abs(stats.responseMetrics.trendMTTR)}%</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">+{stats.responseMetrics.trendMTTR}%</span>
            </>
          )}
          <span className="text-gray-500 ml-2">MTTR improvement</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-600">Recovery</span>
          </div>
          <span className="text-2xl font-bold text-green-600">
            {stats.responseMetrics.meanTimeToRecover}h
          </span>
        </div>
        <div className="mt-2 flex items-center text-sm">
          {stats.responseMetrics.trendMTTR2 < 0 ? (
            <>
              <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">{Math.abs(stats.responseMetrics.trendMTTR2)}%</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">+{stats.responseMetrics.trendMTTR2}%</span>
            </>
          )}
          <span className="text-gray-500 ml-2">recovery time</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-600">Compliance</span>
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {stats.complianceMetrics.documentationScore}%
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Documentation compliance
        </div>
      </div>
    </div>
  )
}