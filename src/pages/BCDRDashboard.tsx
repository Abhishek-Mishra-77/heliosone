import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Server,
  FileText,
  BookOpen,
  Truck,
  ArrowUpRight,
  Building2,
  Users,
  Activity,
  TrendingUp,
  Info,
  BarChart3
} from 'lucide-react'
import { useAuthStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { ResiliencyScoring } from '../pages/ResiliencyScoring'
import { GapAnalysis } from '../pages/GapAnalysis'
import { MaturityAssessment } from '../pages/MaturityAssessment'

interface AssessmentProgress {
  total: number;
  completed: number;
  status: boolean
}


const MODULES = [
  {
    id: 'scoring',
    name: 'Resiliency Scoring',
    description: 'Evaluate program maturity and resilience',
    icon: Shield,
    route: '/bcdr/scoring',
    active: true,
    stats: null
  },
  {
    id: 'gap',
    name: 'Gap Analysis',
    description: 'Identify and track improvement areas',
    icon: TrendingUp,
    route: '/bcdr/gap-analysis',
    active: true,
    stats: null
  },
  {
    id: 'maturity',
    name: 'Maturity Assessment',
    description: 'Assess program maturity level',
    icon: Activity,
    route: '/bcdr/maturity',
    active: true,
    stats: null
  },
  {
    id: 'bia',
    name: 'Business Impact Analysis',
    description: 'Analyze process impacts and recovery',
    icon: Building2,
    route: '/bcdr/business-impact',
    active: true,
    stats: null
  },
  {
    id: 'departments',
    name: 'Departments',
    description: 'Department-level assessments',
    icon: Users,
    route: '/bcdr/departments',
    active: true,
    stats: null
  },
  {
    id: 'analysis',
    name: 'Assessment Analysis',
    description: 'Review and analyze assessment results',
    icon: BarChart3,
    route: '/bcdr/assessment-analysis',
    active: true,
    stats: null
  }
]

// Define assessment steps dynamically
const ASSESSMENTS = [
  {
    id: 'gap',
    name: 'Gap Analysis',
    description: 'Identify and assess gaps in your BCDR program based on industry standards',
  },
  {
    id: 'maturity',
    name: 'Maturity Assessment',
    description: 'Evaluate your BCDR program capabilities based on industry standards',
  },
  {
    id: 'scoring',
    name: 'Resiliency Scoring',
    description: 'Evaluate your organization’s resilience capabilities based on industry standards',
  }
]

interface DashboardStats {
  activeUsers: number
  criticalProcesses: number
  lastAssessment: string | null
}

export function BCDRDashboard() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 0,
    criticalProcesses: 0,
    lastAssessment: null
  })
  const [assessmentIndex, setAssessmentIndex] = useState<number>(0)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [questions, setQuestions] = useState<any[]>({
    scoring: [],
    gap: [],
    maturity: []
  })
  const [progress, setProgress] = useState<{ [key: string]: AssessmentProgress }>({
    scoring: { total: 0, completed: 0, status: false },
    gap: { total: 0, completed: 0, status: false },
    maturity: { total: 0, completed: 0, status: false }
  });

  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization?.id) {
      fetchQuestionsData()
      fetchDashboardStats()
    }
  }, [organization?.id])

  const fetchDashboardStats = async () => {
    try {
      // Fetch active users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', organization?.id)

      if (usersError) throw usersError

      // Fetch critical processes
      const { data: processes, error: processesError } = await supabase
        .from('business_processes')
        .select('id')
        .eq('organization_id', organization?.id)
        .eq('priority', 'critical')

      if (processesError) throw processesError

      // Fetch last assessment
      const { data: assessments, error: assessmentsError } = await supabase
        .from('bcdr_assessments')
        .select('assessment_date')
        .eq('organization_id', organization?.id)
        .order('assessment_date', { ascending: false })
        .limit(1)

      if (assessmentsError) throw assessmentsError

      setStats({
        activeUsers: users?.length || 0,
        criticalProcesses: processes?.length || 0,
        lastAssessment: assessments?.[0]?.assessment_date || null
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      window.toast?.error('Failed to fetch dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionsData = async () => {
    try {
      // Fetch the questions directly from the 'resiliency_questions' table
      const { data: ResiliencyQuestions, error: questionError1 } = await supabase
        .from("resiliency_questions")
        .select("*")
        .order("order_index");

      const { data: MaturityQuestions, error: questionError2 } = await supabase
        .from("maturity_assessment_questions")
        .select("*")
        .order("maturity_level", { ascending: true })
        .order("order_index");

      const { data: GapAnalysisQuestions, error: questionError3 } = await supabase
        .from("gap_analysis_questions")
        .select("*")
        .order("order_index");
      // Set the questions state
      setQuestions({
        scoring: ResiliencyQuestions || [],
        gap: GapAnalysisQuestions || [],
        maturity: MaturityQuestions || [],
      });

      setProgress({
        scoring: { total: scoringQuestions?.length || 0, completed: 0, status: false },
        gap: { total: gapQuestions?.length || 0, completed: 0, status: false },
        maturity: { total: maturityQuestions?.length || 0, completed: 0, status: false },
      });

    } catch (error) {
      console.error("Error fetching questions data:", error);
    };
  }

  const handleModuleClick = (moduleId: string, route: string) => {
    navigate(route)
  }

  const handleStartAssessment = (assessmentId: string) => {
    setActiveAssessment(assessmentId); // Update state to start the assessment
  };

  // Update progress when a question is answered
  const updateProgress = (assessmentId: string, completedCount: number, status: boolean) => {
    setProgress((prev) => ({
      ...prev,
      [assessmentId]: {
        ...prev[assessmentId],
        completed: completedCount,
        status
      }
    }));
  };

  const renderAssessmentComponent = () => {
    switch (activeAssessment) {
      case 'gap':
        return <GapAnalysis
          questions={questions.gap}
          updateProgress={updateProgress}
          setIsActive={setIsActive}
          setAssessmentIndex={setAssessmentIndex}
          setActiveAssessment={setActiveAssessment}
        />;
      case 'maturity':
        return <MaturityAssessment
          questions={questions.maturity}
          updateProgress={updateProgress}
          setIsActive={setIsActive}
          setAssessmentIndex={setAssessmentIndex}
          setActiveAssessment={setActiveAssessment}
        />;
      case 'scoring':
        return <ResiliencyScoring
          questions={questions.scoring}
          updateProgress={updateProgress}
          setIsActive={setIsActive}
          setAssessmentIndex={setAssessmentIndex}
          setActiveAssessment={setActiveAssessment}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Organization Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Info Banner */}
        <div className="bg-white border-2 border-blue-500 rounded-lg p-2 mb-6 shadow-lg justify-center">
          <div className="flex  justify-between items-center space-x-4">
            {/* Icon and Text Container */}
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-500" />
              <div className="flex flex-col">
                <p className="text-md text-gray-700">
                  Select each process below to assess its potential impacts. All processes must be evaluated.
                </p>
              </div>
            </div>
            {/* Got it Button */}
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md hover:bg-blue-600">
              Got it
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              BCDR Assessment
            </h2>
            <p>Review and analyze assessements results across all BCDR domains</p>
          </div>
        </div>

        <div>
          <h2 className="sr-only">Steps</h2>
          <div
            className="relative after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-gray-100"
          >
            <ol className="relative z-10 flex justify-between text-sm font-medium text-gray-500">
              {ASSESSMENTS.map((assessment, i) => (
                <li className="flex items-center gap-2 bg-white p-2">
                  <span
                    className={`size-6 rounded-full text-center text-[10px]/6 font-bold
    ${i === assessmentIndex ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
  `}
                  >
                    {i + 1}
                  </span>
                  <span className="hidden sm:block"> {assessment.name} </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {!isActive && <div className='flex justify-center items-center mt-5'>
          <div className='text-center p-6 bg-white'>
            {/* Dynamically display assessment name and description based on assessmentIndex */}
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              {ASSESSMENTS[assessmentIndex].name}
            </h1>
            <p className='text-md text-gray-600 mb-6'>
              {ASSESSMENTS[assessmentIndex].description}
            </p>

            {/* Button to start the assessment */}
            <button
              onClick={() => {
                handleStartAssessment(ASSESSMENTS[assessmentIndex].id)
                setIsActive(true)
              }}
              className='bg-blue-500 text-white px-6 py-3 rounded-md text-sm font-medium shadow-md hover:bg-blue-600 transition duration-300'>
              Get Started
            </button>
          </div>
        </div>}

        {/* Render the selected assessment dynamically */}
        {renderAssessmentComponent()}
      </div>
    </div>
  )
}