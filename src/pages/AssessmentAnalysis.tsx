import React, { useState, useEffect } from "react";
import { useAuthStore } from "../lib/store";
import { ResiliencyAnalysis } from "../components/assessment-analysis/ResiliencyAnalysis";
import { GapAnalysisReport } from "../components/assessment-analysis/GapAnalysisReport";
import { MaturityAnalysis } from "../components/assessment-analysis/MaturityAnalysis";
import { DepartmentAnalysis } from "../components/assessment-analysis/DepartmentAnalysis";
import { BusinessImpactAnalysis } from "../pages/BusinessImpactAnalysis";
import { RiskDashboard } from "../components/risk-assessment/RiskDashboard";
import { TabNavigation } from "../components/business-impact/TabNavigation";
import { supabase } from "../lib/supabase";
import { Download, Printer, AlertTriangle } from "lucide-react";

const TABS = [
  { id: "resiliency", label: "Resiliency Analysis" },
  { id: "gap", label: "Gap Analysis" },
  { id: "maturity", label: "Maturity Analysis" },
  { id: "departments", label: "Department Analysis" },
  { id: "bia", label: "BIA Analysis" },
  { id: "risk", label: "Risk Analysis" },
] as const;

type TabType = (typeof TABS)[number]["id"];

interface AnalysisStats {
  resiliency: any | null;
  gap: any | null;
  maturity: any | null;
  departments: any | null;
  bia: any | null;
  risk: any | null;
}

export function AssessmentAnalysis() {
  const { organization } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("resiliency");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalysisStats>({
    resiliency: null,
    gap: null,
    maturity: null,
    departments: null,
    bia: null,
    risk: null,
  });

  useEffect(() => {
    if (organization?.id) {
      fetchAnalysisData();
    }
  }, [organization?.id, activeTab]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch data if we have an organization
      if (!organization?.id) {
        setStats({
          resiliency: null,
          gap: null,
          maturity: null,
          departments: null,
          bia: null,
        });
        return;
      }

      switch (activeTab) {
        case "resiliency": {
          // First check if there's a completed assessment
          const { data: assessment, error: assessmentError } = await supabase
            .from("bcdr_assessments")
            .select("*")
            .eq("organization_id", organization.id)
            .eq("bcdr_assessment_type", "resiliency")
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (assessmentError && assessmentError.code !== "PGRST116") {
            throw assessmentError;
          }

          // Only fetch analysis if there's a completed assessment
          if (assessment) {
            const { data: resiliencyData, error } = await supabase.rpc(
              "get_resiliency_analysis",
              {
                org_id: organization.id,
                assessment_id: assessment.id,
              }
            );

            if (error) throw error;
            setStats((prev) => ({ ...prev, resiliency: resiliencyData }));
          } else {
            setStats((prev) => ({ ...prev, resiliency: null }));
          }
          break;
        }

        case "gap": {
          const { data: assessment, error: assessmentError } = await supabase
            .from("bcdr_assessments")
            .select("*")
            .eq("organization_id", organization.id)
            .eq("bcdr_assessment_type", "gap")
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (assessmentError && assessmentError.code !== "PGRST116") {
            throw assessmentError;
          }

          if (assessment) {
            const { data: gapData, error } = await supabase.rpc(
              "get_gap_analysis",
              {
                org_id: organization.id,
                assessment_id: assessment.id,
              }
            );

            if (error) throw error;
            setStats((prev) => ({ ...prev, gap: gapData }));
          } else {
            setStats((prev) => ({ ...prev, gap: null }));
          }
          break;
        }

        case "maturity": {
          const { data: assessment, error: assessmentError } = await supabase
            .from("bcdr_assessments")
            .select("*")
            .eq("organization_id", organization.id)
            .eq("bcdr_assessment_type", "maturity")
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (assessmentError && assessmentError.code !== "PGRST116") {
            throw assessmentError;
          }

          if (assessment) {
            const { data: maturityData, error } = await supabase.rpc(
              "get_maturity_analysis",
              {
                org_id: organization.id,
                assessment_id: assessment.id,
              }
            );

            if (error) throw error;
            setStats((prev) => ({ ...prev, maturity: maturityData }));
          } else {
            setStats((prev) => ({ ...prev, maturity: null }));
          }
          break;
        }

        case "departments": {
          // First get all departments for the organization
          const { data: departments, error: deptError } = await supabase
            .from("departments")
            .select("id")
            .eq("organization_id", organization.id);

          if (deptError) throw deptError;

          if (departments && departments.length > 0) {
            // Then check for completed assessments for any of these departments
            const { data: assessments, error: assessError } = await supabase
              .from("department_assessments")
              .select("*")
              .in(
                "department_id",
                departments.map((d) => d.id)
              )
              .eq("status", "completed")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (assessError && assessError.code !== "PGRST116") {
              throw assessError;
            }

            if (assessments) {
              const { data: departmentData, error } = await supabase.rpc(
                "get_department_analysis",
                {
                  org_id: organization.id,
                  assessment_id: assessments.id,
                }
              );

              if (error) throw error;
              setStats((prev) => ({ ...prev, departments: departmentData }));
            } else {
              setStats((prev) => ({ ...prev, departments: null }));
            }
          } else {
            setStats((prev) => ({ ...prev, departments: null }));
          }
          break;
        }

        case "bia": {
          const { data: assessment, error: assessmentError } = await supabase
            .from("bcdr_assessments")
            .select("*")
            .eq("organization_id", organization.id)
            .eq("bcdr_assessment_type", "business_impact")
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (assessmentError && assessmentError.code !== "PGRST116") {
            throw assessmentError;
          }

          if (assessment) {
            const { data: biaData, error } = await supabase
              .from("business_processes")
              .select("*")
              .eq("organization_id", organization.id)
              .eq("assessment_id", assessment.id);

            if (error) throw error;
            setStats((prev) => ({ ...prev, bia: biaData }));
          } else {
            setStats((prev) => ({ ...prev, bia: null }));
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load analysis"
      );
      window.toast?.error("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Analysis
              </h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchAnalysisData}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assessment Analysis
            </h1>
            <p className="mt-1 text-gray-600">
              Review and analyze assessment results across all BCDR domains
            </p>
          </div>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <Download className="w-5 h-5 mr-2" />
              Export Analysis
            </button>
            <button className="btn-primary">
              <Printer className="w-5 h-5 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
        />

        <div className="mt-6">
          {activeTab === "resiliency" && (
            <ResiliencyAnalysis
              stats={stats.resiliency}
              loading={loading}
              organizationName={organization?.name}
            />
          )}

          {activeTab === "gap" && (
            <GapAnalysisReport
              stats={stats.gap}
              loading={loading}
              organizationName={organization?.name}
            />
          )}

          {activeTab === "maturity" && (
            <MaturityAnalysis
              stats={stats.maturity}
              loading={loading}
              organizationName={organization?.name}
            />
          )}

          {activeTab === "departments" && (
            <DepartmentAnalysis
              stats={stats.departments}
              loading={loading}
              organizationName={organization?.name}
            />
          )}

          {activeTab === "risk" && (
            <RiskDashboard
              // stats={stats.departments}
              // loading={loading}
              // organizationName={organization?.name}
            />
          )}

          {activeTab === "bia" && <BusinessImpactAnalysis />}
        </div>
      </div>
    </div>
  );
}

export default AssessmentAnalysis;
