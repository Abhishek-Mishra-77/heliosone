import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Download, Printer, AlertTriangle, Building2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/store";
import type { BusinessProcess } from "../types/business-impact";
import { TabNavigation } from "../components/business-impact/TabNavigation";
import { CostAnalysis } from "../components/business-impact/CostAnalysis";
import { CategoryAnalysis } from "../components/business-impact/analysis/CategoryAnalysis";
import { ImpactMetrics } from "../components/business-impact/analysis/ImpactMetrics";
import { ProcessSelector } from "../components/business-impact/analysis/ProcessSelector";
import { ProcessOverview } from "../components/business-impact/analysis/ProcessOverview";
import { TimeMetrics } from "../components/business-impact/analysis/TimeMetrics";
import { ImpactAnalysis } from "../components/business-impact/analysis/ImpactAnalysis";
import { BIACalculator } from "../components/business-impact/analysis/BIACalculator";

type AnalysisTab = "overview" | "impact" | "time" | "cost" | "calculator";
type AnalysisScope = "organization" | "process";

export function BusinessImpactAnalysis() {
  const { organization } = useAuthStore();
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [selectedProcess, setSelectedProcess] =
    useState<BusinessProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");
  const [analysisScope, setAnalysisScope] =
    useState<AnalysisScope>("organization");
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (organization?.id) {
      fetchProcesses();
    }
  }, [organization?.id]);

  // Reset selected process when changing scope
  useEffect(() => {
    setSelectedProcess(null);
  }, [analysisScope]);

  async function fetchProcesses() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("business_processes")
        .select("*")
        .eq("organization_id", organization?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processesWithDefaults = (data || []).map((process) => ({
        ...process,
        revenueImpact: process.revenue_impact || {
          daily: 0,
          weekly: 0,
          monthly: 0,
        },
        operationalImpact: process.operational_impact || {
          score: 0,
          details: "",
        },
        reputationalImpact: process.reputational_impact || {
          score: 0,
          details: "",
        },
        applications: process.applications || [],
        infrastructureDependencies: process.infrastructure_dependencies || [],
        externalDependencies: process.external_dependencies || [],
        supplyChainImpact: process.supply_chain_impact || {
          dependencies: [],
          score: 0,
          details: "",
        },
        crossBorderOperations: process.cross_border_operations || {
          regions: [],
          operationTypes: [],
          score: 0,
          details: "",
        },
        environmentalImpact: process.environmental_impact || {
          types: [],
          score: 0,
          details: "",
          mitigationStrategies: [],
        },
        rto: process.rto || 0,
        rpo: process.rpo || 0,
        mtd: process.mtd || 0,
      }));

      setProcesses(processesWithDefaults);
    } catch (error) {
      console.error("Error fetching processes:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch processes"
      );
      window.toast?.error("Failed to fetch processes");
    } finally {
      setLoading(false);
    }
  }

  const generatePDF = async () => {
    // In a real implementation, this would generate a PDF report
    alert("Generating PDF report...");
  };

  const exportCSV = async () => {
    // In a real implementation, this would export data to CSV
    alert("Exporting data to CSV...");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

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
                onClick={fetchProcesses}
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business Impact Analysis
            </h1>
            <p className="mt-1 text-gray-600">
              Comprehensive analysis of business process impacts and
              dependencies
            </p>
          </div>
        </div>

        {/* Analysis Scope Selection */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setAnalysisScope("organization")}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              analysisScope === "organization"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Organization-wide Analysis
          </button>
          <button
            onClick={() => setAnalysisScope("process")}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              analysisScope === "process"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Process-level Analysis
          </button>
        </div>

        {/* Process Selector for Process-level Analysis */}
        {analysisScope === "process" && (
          <ProcessSelector
            processes={processes}
            selectedProcess={selectedProcess}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onProcessSelect={setSelectedProcess}
          />
        )}

        {/* Analysis Type Tabs */}
        <TabNavigation
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "impact", label: "Impact Analysis" },
            { id: "time", label: "Time Metrics" },
            { id: "cost", label: "Cost Analysis" },
            { id: "calculator", label: "BIA Calculator" },
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as AnalysisTab)}
        />

        {/* Content based on scope and tab */}
        <div className="mt-6">
          {activeTab === "overview" &&
            (analysisScope === "organization" ? (
              <div className="space-y-6">
                {/* Organization-wide Impact Stats */}
                <ImpactMetrics processes={processes} />
                <CategoryAnalysis processes={processes} />
              </div>
            ) : selectedProcess ? (
              <ProcessOverview process={selectedProcess} />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Process
                </h3>
                <p className="text-gray-600">
                  Choose a process to view its analysis
                </p>
              </div>
            ))}

          {activeTab === "impact" && (
            <ImpactAnalysis
              processes={
                analysisScope === "process" && selectedProcess
                  ? [selectedProcess]
                  : processes
              }
            />
          )}

          {activeTab === "time" && (
            <TimeMetrics
              processes={
                analysisScope === "process" && selectedProcess
                  ? [selectedProcess]
                  : processes
              }
            />
          )}

          {activeTab === "cost" && (
            <CostAnalysis
              processes={
                analysisScope === "process" && selectedProcess
                  ? [selectedProcess]
                  : processes
              }
              onUpdateProcess={(index, process) => {
                const updatedProcesses = [...processes];
                updatedProcesses[index] = process;
                setProcesses(updatedProcesses);
              }}
            />
          )}

          {activeTab === "calculator" && (
            <BIACalculator processes={processes} />
          )}
        </div>
      </div>
    </div>
  );
}
