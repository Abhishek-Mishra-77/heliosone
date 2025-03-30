import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { AuthPage } from './pages/Auth'
import { ContinuousResilience } from './pages/ContinuousResilience'
import { BCDRDashboard } from './pages/BCDRDashboard'
import { ResiliencyScoring } from './pages/ResiliencyScoring'
import { GapAnalysis } from './pages/GapAnalysis'
import { MaturityAssessment } from './pages/MaturityAssessment'
import { BusinessImpact } from './pages/BusinessImpact'
import { BusinessImpactAnalysis } from './pages/BusinessImpactAnalysis'
import { DepartmentLevels } from './pages/DepartmentLevels'
import { DepartmentQuestionnaires } from './pages/DepartmentQuestionnaires'
import { DepartmentAssessments } from './pages/DepartmentAssessments'
import { ConsolidationPhase } from './pages/ConsolidationPhase'
import { Recommendations } from './pages/Recommendations'
import { AssessmentAnalysis } from './pages/AssessmentAnalysis'
import { AdminOrganizations } from './pages/admin/Organizations'
import { AdminUsers } from './pages/admin/Users'
import { AdminSettings } from './pages/admin/Settings'
import { PlatformAdmins } from './pages/admin/PlatformAdmins'
import { PlatformDashboard } from './pages/admin/PlatformDashboard'
import { BCPBuilderPage } from './pages/BCPBuilder'
import { RiskDashboard } from './components/risk-assessment/RiskDashboard'
import { RiskHeatmap } from './components/risk-assessment/RiskHeatmap'
import { RiskTable } from './components/risk-assessment/RiskTable'
import { RiskTrends } from './components/risk-assessment/RiskTrends'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  {/* Default route - shows either Platform Dashboard or Continuous Resilience based on role */}
                  <Route path="/dashboard" element={<ContinuousResilience />} />
                  
                  {/* BCDR Module Routes */}
                  <Route path="/bcdr" element={<BCDRDashboard />} />
                  <Route path="/bcdr/scoring" element={<ResiliencyScoring />} />
                  <Route path="/bcdr/gap-analysis" element={<GapAnalysis />} />
                  <Route path="/bcdr/maturity" element={<MaturityAssessment />} />
                  <Route path="/bcdr/business-impact" element={<BusinessImpact />} />
                  <Route path="/bcdr/business-impact/analysis" element={<BusinessImpactAnalysis />} />
                  <Route path="/bcdr/departments" element={<DepartmentLevels />} />
                  <Route path="/bcdr/department-questionnaires" element={<DepartmentQuestionnaires />} />
                  <Route path="/bcdr/department-assessments" element={<DepartmentAssessments />} />
                  <Route path="/bcdr/consolidation" element={<ConsolidationPhase />} />
                  <Route path="/bcdr/recommendations" element={<Recommendations />} />
                  <Route path="/bcdr/assessment-analysis" element={<AssessmentAnalysis />} />
                  <Route path="/bcdr/bcp-builder" element={<BCPBuilderPage />} />
                  <Route path="/risk-assessment/dashboard" element={<RiskDashboard />} />
                  <Route path="/risk-assessment/heatmap" element={<RiskHeatmap />} />
                  <Route path="/risk-assessment/table" element={<RiskTable />} />
                  <Route path="/risk-assessment/trends" element={<RiskTrends />} />

                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<PlatformDashboard />} />
                  <Route path="/admin/organizations" element={<AdminOrganizations />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/platform-admins" element={<PlatformAdmins />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App