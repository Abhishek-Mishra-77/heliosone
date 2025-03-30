import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  GitCompare,
  Target,
  FileSearch,
  LogOut,
  Users,
  Building2,
  Settings,
  Menu,
  X,
  ChevronRight,
  Layers,
  ClipboardList,
  GitMerge,
  Lightbulb,
  PieChart,
  Shield,
  FileText,
} from "lucide-react";
import { useAuthStore } from "../lib/store";
import { supabase } from "../lib/supabase";
import clsx from "clsx";

// Define navigation categories
const ADMIN_ASSESSMENTS = [
  { name: "Resiliency Scoring", href: "/bcdr/scoring", icon: Target },
  { name: "Gap Analysis", href: "/bcdr/gap-analysis", icon: GitCompare },
  { name: "Maturity Assessment", href: "/bcdr/maturity", icon: BarChart3 },
  {
    name: "Business Impact Analysis",
    href: "/bcdr/business-impact",
    icon: FileSearch,
  },
];

const DEPARTMENT_MANAGEMENT = [
  { name: "Departments", href: "/bcdr/departments", icon: Layers },
  {
    name: "Department Assessments",
    href: "/bcdr/department-assessments",
    icon: ClipboardList,
  },
  { name: "Consolidation Phase", href: "/bcdr/consolidation", icon: GitMerge },
];

const ANALYSIS_REPORTS = [
  {
    name: "Assessment Analysis",
    href: "/bcdr/assessment-analysis",
    icon: PieChart,
  },
  // { name: 'Recommendations', href: '/bcdr/recommendations', icon: Lightbulb }
];

const PLAN_BUILDERS = [
  { name: "BCP Builder", href: "/bcdr/bcp-builder", icon: FileText },
];

const RISK_ASSESSMENT = [
  {
    name: "Risk Dashboard",
    href: "/risk-assessment/dashboard",
    icon: PieChart,
  },
  { name: "Risk Heatmap", href: "/risk-assessment/heatmap", icon: Layers },
  { name: "Risk Table", href: "/risk-assessment/table", icon: ClipboardList },
  { name: "Risk Trends", href: "/risk-assessment/trends", icon: GitMerge },
];

const PLATFORM_ADMIN = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Organizations", href: "/admin/organizations", icon: Building2 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Platform Admins", href: "/admin/platform-admins", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const MODULES = [{ name: "Continuous Resilience", href: "/", icon: Shield }];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { organization, profile, signOut } = useAuthStore();
  const isPlatformAdmin = profile?.role === "super_admin";
  const isOrgAdmin = profile?.role === "admin";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get role display text
  const getRoleDisplay = () => {
    if (isPlatformAdmin) return "Platform Admin";
    if (isOrgAdmin) return "Organization Admin";
    return profile?.role || "User";
  };

  // Determine which navigation to show based on the current route and user role
  const getNavigation = () => {
    if (location.pathname.startsWith("/admin")) {
      return { items: PLATFORM_ADMIN };
    }
    if (location.pathname.startsWith("/bcdr")) {
      return {
        categories: [
          {
            name: "Organization Assessments",
            items: ADMIN_ASSESSMENTS,
            visible: isOrgAdmin,
          },
          // { name: 'Department Management', items: DEPARTMENT_MANAGEMENT, visible: isOrgAdmin },
          {
            name: "Analysis & Reports",
            items: ANALYSIS_REPORTS,
            visible: isOrgAdmin,
          },
          // { name: 'Plan Builders', items: PLAN_BUILDERS, visible: isOrgAdmin }
        ],
      };
    }
    if (location.pathname.startsWith("/risk-assessment")) {
      return { items: RISK_ASSESSMENT };
    }
    return { items: MODULES };
  };

  const nav = getNavigation();

  // Redirect non-admin users to appropriate pages
  useEffect(() => {
    if (!isOrgAdmin && !isPlatformAdmin && location.pathname === "/") {
      window.location.href = "/bcdr/department-assessments";
    }
  }, [location.pathname, isOrgAdmin, isPlatformAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <img src="/helios-logo.png" alt="Helios" className="h-8 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
            {"items" in nav ? (
              <div className="space-y-1">
                {nav.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                        isActive
                          ? "bg-[#FF6634]/10 text-[#FF6634]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            ) : (
              nav.categories.map(
                (category) =>
                  category.visible && (
                    <div key={category.name} className="space-y-1">
                      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.name}
                      </h3>
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={clsx(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                              isActive
                                ? "bg-[#FF6634]/10 text-[#FF6634]"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.name}
                            {isActive && (
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )
              )
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {profile?.full_name}
                </span>
                <span className="text-xs text-gray-500">
                  {!isPlatformAdmin && organization?.name}
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF6634]/10 text-[#FF6634]">
                {getRoleDisplay()}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={clsx(
          "transition-all duration-200 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="h-16 px-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6634]"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-gray-500">
                <img
                  src="/helios-logo.png"
                  alt="Helios"
                  className="h-5 w-auto opacity-50"
                />
                <span className="text-sm">
                  © 2025 Helios. All rights reserved.
                </span>
              </div>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
