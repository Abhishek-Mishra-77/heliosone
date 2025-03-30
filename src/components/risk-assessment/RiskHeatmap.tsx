import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { RiskMatrixModal } from "./RiskModal/RiskHeatmapModal";
import { supabase } from "../../lib/supabase";
4;

interface RiskCell {
  count: number;
  risks: Array<{
    id: string;
    title: string;
    category: string;
  }>;
}

type RiskMatrix = Record<string, Record<string, RiskCell>>;

const IMPACT_LEVELS = ["", "low", "medium", "high", "critical"] as const;

const LIKELIHOOD_LEVELS = [
  "rare",
  "unlikely",
  "possible",
  "likely",
  "certain",
] as const;

interface Organization {
  id: string;
  name: string;
  industry: string;
  created_at: string;
  updated_at: string;
}
interface RiskHeatmapProps {
  organization: Organization;
}

export function RiskHeatmap({ organization }: RiskHeatmapProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState<any>(null);
  const [matrix, setMatrix] = useState<RiskMatrix | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchRiskAnalysis = async () => {
      if (!organization?.id) return;

      const { data, error } = await supabase.rpc("get_risk_analysis", {
        org_id: organization.id,
      });

      if (error) {
        console.error("Failed to fetch risk analysis:", error);
        return;
      }

      console.log("Risk analysis data:", data);
      const newMatrix: RiskMatrix = {};

      LIKELIHOOD_LEVELS.forEach((likelihood) => {
        newMatrix[likelihood] = {};
        IMPACT_LEVELS.forEach((impact) => {
          const riskData = data?.risksByType?.[`${likelihood}-${impact}`] || {
            count: 0,
            risks: [],
          };
          newMatrix[likelihood][impact] = {
            count: riskData.count || 0,
            risks: riskData.risks || [],
          };
        });
      });

      setMatrix(newMatrix);
    };
    fetchRiskAnalysis();
  }, [organization?.id]);

  const getCellColor = (likelihood: string, impact: string) => {
    const likelihoodScore = LIKELIHOOD_LEVELS.indexOf(
      likelihood as (typeof LIKELIHOOD_LEVELS)[number]
    );
    const impactScore = IMPACT_LEVELS.indexOf(
      impact as (typeof IMPACT_LEVELS)[number]
    );
    const riskScore = likelihoodScore * impactScore;

    if (riskScore >= 12) return "bg-red-100 hover:bg-red-200";
    if (riskScore >= 8) return "bg-orange-100 hover:bg-orange-200";
    if (riskScore >= 4) return "bg-yellow-100 hover:bg-yellow-200";
    return "bg-green-100 hover:bg-green-200";
  };

  const handleCellClick = (likelihood: string, impact: string) => {
    if (!matrix) return;

    const cellData = matrix[likelihood][impact];
    setSelectedCellData({
      category: `${likelihood} - ${impact}`,
      data: {
        likelihood: LIKELIHOOD_LEVELS.indexOf(likelihood),
        impact: IMPACT_LEVELS.indexOf(impact),
        evidenceCompliance: 0,
        criticalFindings: cellData.count,
        details: "Details about the risk and its impact.",
        recommendations: [
          {
            title: "Backup system improvement",
            description: "Implement more robust backup strategies.",
            priority: "high",
          },
        ],
      },
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Risk Heatmap</h2>
      </div>
      <div className="flex justify-center items-center mb-2 gap-8">
        <h1 className="text-lg font-semibold text-gray-900">Risk Impact</h1>
        <h1 className="text-lg font-semibold text-gray-900">Risk Likelihood</h1>
      </div>

      <div className="overflow-x-auto">
        {matrix ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="w-32"></th>
                {IMPACT_LEVELS.map((impact) => (
                  <th
                    key={impact}
                    className="px-4 py-2 text-sm font-medium text-gray-600 text-center capitalize border border-gray-300"
                  >
                    {impact}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LIKELIHOOD_LEVELS.map((likelihood, rowIndex) => (
                <tr key={likelihood}>
                  {rowIndex === 0 && (
                    <td
                      rowSpan={LIKELIHOOD_LEVELS.length}
                      className="text-xs font-medium text-gray-600 capitalize rotate-180 whitespace-nowrap align-middle border border-gray-300 bg-gray-100"
                      style={{
                        writingMode: "vertical-rl",
                        textAlign: "center",
                        padding: "10px",
                      }}
                    >
                      <h1 className="text-lg font-semibold text-gray-900">
                        Likelihood
                      </h1>
                    </td>
                  )}
                  <td className="px-3 py-2 text-md font-medium text-gray-600 capitalize text-center border border-gray-300 bg-gray-100">
                    {likelihood}
                  </td>
                  {IMPACT_LEVELS.slice(-4).map((impact) => {
                    const cell = matrix[likelihood][impact];
                    return (
                      <td
                        key={impact}
                        className={clsx(
                          "px-4 py-6 text-center border border-gray-300 transition-colors cursor-pointer",
                          getCellColor(likelihood, impact)
                        )}
                        onClick={() => handleCellClick(likelihood, impact)}
                      >
                        <div className="font-bold text-lg">{cell.count}</div>
                        <div className="text-xs text-gray-600">risks</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">Loading heatmap data...</p>
        )}
      </div>

      {isModalOpen && selectedCellData && (
        <RiskMatrixModal
          category={selectedCellData.category}
          data={selectedCellData.data}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
