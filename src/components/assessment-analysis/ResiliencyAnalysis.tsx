import React, { useState } from 'react'
import { 
  Download,
  Printer,
  AlertCircle
} from 'lucide-react'
import { generateReport } from '../../lib/reports'
import { OverviewStats } from './resiliency/OverviewStats'
import { CategoryAnalysis } from './resiliency/CategoryAnalysis'
import { CategoryModal } from './resiliency/CategoryModal'

interface ResiliencyAnalysisProps {
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
    categoryScores: Record<string, {
      score: number
      trend: number
      evidenceCompliance: number
      criticalFindings: number
      details: string
      recommendations: Array<{
        title: string
        description: string
        priority: 'critical' | 'high' | 'medium' | 'low'
      }>
    }>
  } | null
  loading?: boolean
  organizationName?: string
}

export function ResiliencyAnalysis({ stats, loading, organizationName }: ResiliencyAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleExportPDF = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Resiliency Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'resiliency',
      data: stats
    })

    doc.save('resiliency-analysis-report.pdf')
  }

  const handleGenerateReport = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Resiliency Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'resiliency',
      data: stats
    })

    // Open in new window
    const pdfDataUri = doc.output('datauristring')
    window.open(pdfDataUri)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading resiliency analysis...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
        <p className="text-gray-600 mb-4">Complete a resiliency assessment to view analysis</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <OverviewStats stats={stats} />

      {/* Category Analysis */}
      <CategoryAnalysis 
        categoryScores={stats.categoryScores}
        onCategoryClick={setSelectedCategory}
      />

      {/* Category Modal */}
      {selectedCategory && stats.categoryScores[selectedCategory] && (
        <CategoryModal
          category={selectedCategory}
          data={stats.categoryScores[selectedCategory]}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  )
}

export default ResiliencyAnalysis