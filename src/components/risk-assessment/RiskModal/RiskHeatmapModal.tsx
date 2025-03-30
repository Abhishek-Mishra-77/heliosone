import React from "react";
import { X, Target, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import clsx from "clsx";

interface RiskMatrixModalProps {
  category: string;
  data: {
    likelihood: number;
    impact: number;
    evidenceCompliance: number;
    criticalFindings: number;
    details: string;
    recommendations: Array<{
      title: string;
      description: string;
      priority: "critical" | "high" | "medium" | "low";
    }>;
  };
  onClose: () => void;
}

const getRiskLevel = (likelihood: number, impact: number) => {
  const riskScore = likelihood * impact;
  if (riskScore >= 16) return "critical";
  if (riskScore >= 9) return "high";
  if (riskScore >= 4) return "medium";
  return "low";
};

export function RiskMatrixModal({
  category,
  data,
  onClose,
}: RiskMatrixModalProps) {
  const riskLevel = getRiskLevel(data.likelihood, data.impact);

  console.log(category , data);
  console.log("RISK MODAL OPENING");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Target className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">{category}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {/* Risk Level Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Risk Level
              </span>
              <span
                className={clsx(
                  "block mt-1 text-lg font-semibold",
                  riskLevel === "critical" && "text-red-600",
                  riskLevel === "high" && "text-orange-600",
                  riskLevel === "medium" && "text-yellow-600",
                  riskLevel === "low" && "text-green-600"
                )}
              >
                {riskLevel.toUpperCase()}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Likelihood
              </span>
              <span className="block mt-1 text-lg font-semibold text-indigo-600">
                {data.likelihood}/5
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Impact</span>
              <span className="block mt-1 text-lg font-semibold text-red-600">
                {data.impact}/5
              </span>
            </div>
          </div>

          {/* Category Details */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Analysis Details
            </h3>
            <p className="text-gray-600">{data.details}</p>
          </div>

          {/* Recommendations */}
          {data.recommendations?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 text-indigo-600 mr-2" />{" "}
                Recommendations
              </h3>
              <div className="space-y-4">
                {data.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={clsx(
                      "p-4 rounded-lg border",
                      rec.priority === "critical" && "bg-red-50 border-red-100",
                      rec.priority === "high" &&
                        "bg-orange-50 border-orange-100",
                      rec.priority === "medium" &&
                        "bg-yellow-50 border-yellow-100",
                      rec.priority === "low" && "bg-green-50 border-green-100"
                    )}
                  >
                    <div className="flex items-center mb-2">
                      {rec.priority === "critical" ||
                      rec.priority === "high" ? (
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      )}
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <span
                        className={clsx(
                          "ml-2 px-2 py-0.5 text-xs font-medium rounded-full",
                          rec.priority === "critical" &&
                            "bg-red-100 text-red-800",
                          rec.priority === "high" &&
                            "bg-orange-100 text-orange-800",
                          rec.priority === "medium" &&
                            "bg-yellow-100 text-yellow-800",
                          rec.priority === "low" &&
                            "bg-green-100 text-green-800"
                        )}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
