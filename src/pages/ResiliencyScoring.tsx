import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/store";
import { useAssessmentCompletion } from "../hooks/useAssessmentCompletion";
import { useAssessmentProgress } from "../hooks/useAssessmentProgress";
import { CategorySelector } from "../components/resiliency-scoring/CategorySelector";
import { QuestionCard } from "../components/resiliency-scoring/QuestionCard";
import { Navigation } from "../components/resiliency-scoring/Navigation";
import { SaveProgressButton } from "../components/assessment/SaveProgressButton";
import {
  AlertTriangle,
  Info,
  BookOpen,
  Target,
  Shield,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface ResiliencyQuestion {
  id: string;
  category_id: string;
  question: string;
  description: string;
  type: "boolean" | "scale" | "text" | "date" | "multi_choice";
  options: any;
  weight: number;
  evidence_required: boolean;
  evidence_description: string;
  evidence_requirements: {
    required_files: string[];
    max_size_mb: number;
    min_files: number;
    max_files: number;
    naming_convention: string;
  };
  standard_reference: {
    name: string;
    clause: string;
    description: string;
  };
  conditional_logic?: {
    dependsOn: string;
    condition: "equals" | "not_equals" | "greater_than" | "less_than";
    value: any;
  };
}

interface QuestionResponse {
  value: any;
  evidence?: File[];
}

const INDUSTRY_STANDARDS = [
  {
    name: "ISO 22301:2019",
    description: "Business Continuity Management Systems",
    link: "https://www.iso.org/standard/75106.html",
  },
  {
    name: "NIST SP 800-34",
    description: "Contingency Planning Guide",
    link: "https://csrc.nist.gov/publications/detail/sp/800-34/rev-1/final",
  },
  {
    name: "BCI Good Practice Guidelines",
    description: "Business Continuity Best Practices",
    link: "https://www.thebci.org/resource/good-practice-guidelines.html",
  },
];

export function ResiliencyScoring() {
  const { organization, profile } = useAuthStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<
    Record<string, ResiliencyQuestion[]>
  >({});
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [showHelp, setShowHelp] = useState<string | null>(null);
  const [showStandard, setShowStandard] = useState<string | null>(null);
  const [existingAssessment, setExistingAssessment] = useState<any>(null);
  const { handleAssessmentComplete } = useAssessmentCompletion();
  const {
    savedProgress,
    saving: savingProgress,
    saveProgress,
  } = useAssessmentProgress("resiliency");

  const calculateOverallProgress = () => {
    const allQuestions = Object.values(questions).flat();
    if (allQuestions.length === 0) return 0;

    const answeredQuestions = allQuestions.filter((q) => {
      if (q.conditional_logic) {
        const dependentResponse =
          responses[q.conditional_logic.dependsOn]?.value;
        if (dependentResponse === undefined) return false;

        switch (q.conditional_logic.condition) {
          case "equals":
            if (dependentResponse !== q.conditional_logic.value) return false;
            break;
          case "not_equals":
            if (dependentResponse === q.conditional_logic.value) return false;
            break;
          case "greater_than":
            if (dependentResponse <= q.conditional_logic.value) return false;
            break;
          case "less_than":
            if (dependentResponse >= q.conditional_logic.value) return false;
            break;
        }
      }

      return responses[q.id]?.value !== undefined;
    }).length;

    return Math.round((answeredQuestions / allQuestions.length) * 100);
  };

  useEffect(() => {
    if (organization?.id) {
  
      fetchAssessmentData();
    }
  }, [organization?.id]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for existing assessment
      const { data: assessment } = await supabase
        .from("bcdr_assessments")
        .select("*")
        .eq("organization_id", organization?.id)
        .eq("bcdr_assessment_type", "resiliency")
        .eq("status", "completed")
        .maybeSingle();

      setExistingAssessment(assessment);

      const { data: categories, error: categoriesError } = await supabase
        .from("resiliency_categories")
        .select("*")
        .order("order_index");

      if (categoriesError) throw categoriesError;
      setCategories(categories || []);

      if (categories?.length > 0) {
        setActiveCategory(categories[0]);

        for (const category of categories) {
          const { data: questionData, error: questionError } = await supabase
            .from("resiliency_questions")
            .select("*")
            .eq("category_id", category.id)
            .order("order_index");

          if (questionError) throw questionError;

          const questionsWithLogic = questionData?.map((q) => {
            switch (category.name) {
              case "Leadership and Governance":
                if (
                  q.question === "How often does the steering committee meet?"
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question ===
                          "Is there a formal BCDR steering committee?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                if (q.question === "How often is the BCDR policy reviewed?") {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question === "Is there a documented BCDR policy?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;

              case "Risk Management":
                if (
                  q.question.includes("risk treatment") ||
                  q.question.includes("risk monitoring")
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question ===
                          "Do you have a formal risk assessment methodology?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;

              case "Business Impact Analysis":
                if (
                  q.question.includes("impact criteria") ||
                  q.question.includes("dependency mapping")
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question ===
                          "Do you have a formal BIA methodology?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;

              case "Incident Response":
                if (
                  q.question.includes("incident classification") ||
                  q.question.includes("response time")
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question ===
                          "Do you have documented incident response procedures?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;

              case "Recovery Strategy":
                if (
                  q.question.includes("recovery strategy") ||
                  q.question.includes("strategy review")
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question === "Are recovery strategies documented?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;

              case "Plan Development":
                if (
                  q.question.includes("plan review") ||
                  q.question.includes("plan distribution")
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question ===
                          "Do you have standardized plan templates?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;

              case "Training and Awareness":
                if (
                  q.question.includes("training frequency") ||
                  q.question.includes("training effectiveness")
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question ===
                          "Do you have a formal training program?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;

              case "Exercise Program":
                if (
                  q.question.includes("exercise type") ||
                  q.question.includes("exercise frequency")
                ) {
                  return {
                    ...q,
                    conditional_logic: {
                      dependsOn: questionData.find(
                        (dq) =>
                          dq.question ===
                          "Do you have a formal exercise program?"
                      )?.id,
                      condition: "equals",
                      value: true,
                    },
                  };
                }
                break;
            }
            return q;
          });

          setQuestions((prev) => ({
            ...prev,
            [category.id]: questionsWithLogic || [],
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load assessment"
      );
      window.toast?.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };


  const startNewAssessment = async () => {
    try {
      setLoading(true);

      // Archive the existing assessment
      if (existingAssessment) {
        const { error: archiveError } = await supabase
          .from("bcdr_assessments")
          .update({ status: "archived" })
          .eq("id", existingAssessment.id);

        if (archiveError) throw archiveError;
      }

      // Reset state
      setExistingAssessment(null);
      setResponses({});

      // Refresh data
      await fetchAssessmentData();

      window.toast?.success("Started new resiliency assessment");
    } catch (error) {
      console.error("Error starting new assessment:", error);
      window.toast?.error("Failed to start new assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (
    questionId: string,
    value: any,
    evidence?: File[]
  ) => {
    setResponses((prev) => {
      const newResponses = {
        ...prev,
        [questionId]: {
          value,
          evidence: evidence || prev[questionId]?.evidence,
        },
      };

      const dependentQuestions = Object.values(questions)
        .flat()
        .filter((q) => q.conditional_logic?.dependsOn === questionId);

      dependentQuestions.forEach((q) => {
        delete newResponses[q.id];
      });

      return newResponses;
    });
  };

  const saveAssessment = async () => {
    if (!organization?.id || !profile?.id) {
      window.toast?.error("Organization or user data not available");
      return;
    }

    try {
      setSaving(true);

      // Create assessment record
      const { data: assessment, error: assessmentError } = await supabase
        .from("bcdr_assessments")
        .insert({
          organization_id: organization.id,
          created_by: profile.id,
          bcdr_assessment_type: "resiliency",
          status: "completed",
          assessment_date: new Date().toISOString(),
          next_review_date: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          current_category: activeCategory?.id || null,
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Process and insert responses
      const formattedResponses = Object.entries(responses)
        .map(([questionId, response]) => {
          const question = Object.values(questions)
            .flat()
            .find((q) => q.id === questionId);

          if (!question) return null;

          let formattedValue: any;
          switch (question.type) {
            case "boolean":
              formattedValue =
                response.value === true || response.value === "true";
              break;
            case "scale":
              formattedValue = parseInt(response.value.toString(), 10);
              break;
            case "multi_choice":
            case "text":
              formattedValue = response.value.toString();
              break;
            case "date":
              formattedValue = response.value;
              break;
            default:
              formattedValue = null;
          }

          return {
            assessment_id: assessment.id,
            question_id: questionId,
            response: { value: formattedValue },
            evidence_links: response.evidence?.map((file) => file.name) || [],
            created_by: profile.id,
          };
        })
        .filter(Boolean);

      // Insert all responses in a single batch
      const { error: responsesError } = await supabase
        .from("resiliency_responses")
        .insert(formattedResponses);

      if (responsesError) throw responsesError;

      await handleAssessmentComplete(organization.id, "resiliency");
      navigate("/bcdr/assessment-analysis");
    } catch (error) {
      console.error("Error saving assessment:", error);
      window.toast?.error("Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
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
                Error Loading Assessment
              </h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchAssessmentData}
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

  if (existingAssessment) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Resiliency Assessment Complete
          </h2>
          <p className="text-gray-600 mb-8">
            You have already completed a resiliency assessment on{" "}
            {new Date(existingAssessment.assessment_date).toLocaleDateString()}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/bcdr/assessment-analysis")}
              className="btn-secondary"
            >
              View Analysis
            </button>
            <button onClick={startNewAssessment} className="btn-primary">
              <RefreshCw className="w-5 h-5 mr-2" />
              Start New Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Resiliency Scoring
            </h1>
            <p className="mt-1 text-gray-600">
              Evaluate your organization's resilience capabilities based on
              industry standards
            </p>
          </div>
          <SaveProgressButton
            onClick={() => saveProgress(responses, activeCategory?.id)}
            saving={savingProgress}
            lastSaved={savedProgress?.lastUpdated}
          />
        </div>

        <div className="border-2 border-gray-100 p-4 rounded-2xl shadow-lg">
          <div className=" p-2 mb-6">
            <div className="flex items-start">
              <BookOpen className="w-5 h-5 text-gray-600 mt-0.5 mr-3" />
              <div className="flex justify-center align-center gap-8">
                <h2 className="text-md font-medium text-gray-900">
                  Industry Standards Reference
                </h2>
                <div className="flex gap-4">
                  {INDUSTRY_STANDARDS.map((standard) => (
                    <a
                      key={standard.name}
                      href={standard.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start text-sm bg-gray-100 rounded-3xl border border-blue-100 hover:border-gray-300 transition-colors p-1"
                    >
                      <Shield className="w-5 h-5 text-gray-500 mr-2" />
                      <div>
                        <div className="font-sm text-gray-900">
                          {standard.name}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-indigo-600 mr-2" />
                <span className="font-medium text-gray-900">
                  Assessment Progress
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Complete all sections to generate your resilience score
                </span>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                    {overallProgress}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${overallProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* <CategorySelector
          categories={categories}
          activeCategory={activeCategory}
          questions={questions}
          responses={responses}
          onCategorySelect={setActiveCategory}
        /> */}

          {console.log(questions[activeCategory.id])}

          {activeCategory && questions[activeCategory.id] && (
            <div className="space-y-6">
              {questions[activeCategory.id].map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  response={responses[question.id]}
                  allResponses={responses}
                  showHelp={showHelp === question.id}
                  showStandard={showStandard === question.id}
                  onToggleHelp={() =>
                    setShowHelp(showHelp === question.id ? null : question.id)
                  }
                  onToggleStandard={() =>
                    setShowStandard(
                      showStandard === question.id ? null : question.id
                    )
                  }
                  onResponseChange={(value, evidence) =>
                    handleResponseChange(question.id, value, evidence)
                  }
                />
              ))}
            </div>
          )}
        </div>

        <Navigation
          currentIndex={categories.indexOf(activeCategory)}
          totalCategories={categories.length}
          saving={saving}
          onPrevious={() => {
            const currentIndex = categories.indexOf(activeCategory);
            if (currentIndex > 0) {
              setActiveCategory(categories[currentIndex - 1]);
            }
          }}
          onNext={() => {
            const currentIndex = categories.indexOf(activeCategory);
            if (currentIndex < categories.length - 1) {
              setActiveCategory(categories[currentIndex + 1]);
            }
          }}
          onSave={saveAssessment}
        />
      </div>
    </div>
  );
}

export default ResiliencyScoring;
