"use client";

import React, { useState, useCallback } from "react";
import {
  Shield,
  LayoutDashboard,
  Search,
  Plug,
  FileCheck2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  Download,
  ExternalLink,
  ArrowUpRight,
  Zap,
  Lock,
  Globe,
  Server,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type View = "dashboard" | "gaps" | "integrations" | "evidence";

interface FrameworkScore {
  score: number;
  gaps: number;
}

interface Gap {
  id: string;
  framework: string;
  control: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  remediation: string;
  effort: "hours" | "days" | "weeks";
}

interface AnalysisResult {
  overallScore: number;
  frameworks: Record<string, FrameworkScore>;
  gaps: Gap[];
}

interface Integration {
  name: string;
  icon: React.ElementType;
  category: string;
  connected: boolean;
  status?: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const defaultIntegrations: Integration[] = [
  { name: "AWS", icon: Server, category: "Cloud", connected: true, status: "Monitoring 23 resources" },
  { name: "GitHub", icon: Globe, category: "Source Control", connected: true, status: "42 repos connected" },
  { name: "Okta", icon: Lock, category: "Identity", connected: true, status: "Syncing 156 users" },
  { name: "Google Cloud", icon: Server, category: "Cloud", connected: false },
  { name: "Azure AD", icon: Lock, category: "Identity", connected: false },
  { name: "Slack", icon: Globe, category: "Communication", connected: false },
  { name: "Datadog", icon: Zap, category: "Monitoring", connected: false },
  { name: "1Password", icon: Lock, category: "Secrets", connected: false },
  { name: "Jira", icon: Globe, category: "Project Mgmt", connected: false },
  { name: "Vercel", icon: Globe, category: "Deployment", connected: false },
  { name: "Terraform", icon: Server, category: "IaC", connected: false },
  { name: "PagerDuty", icon: Zap, category: "Incident", connected: false },
];

const defaultAnalysis: AnalysisResult = {
  overallScore: 72,
  frameworks: {
    SOC2: { score: 78, gaps: 4 },
    GDPR: { score: 65, gaps: 6 },
    HIPAA: { score: 58, gaps: 8 },
    ISO27001: { score: 70, gaps: 5 },
  },
  gaps: [
    {
      id: "G-001",
      framework: "SOC2",
      control: "CC6.1",
      title: "MFA not enforced on AWS root account",
      description: "The AWS root account does not have MFA enabled. This is a critical security gap that violates the logical access control requirements.",
      severity: "critical",
      remediation: "Enable a hardware MFA device on the AWS root account. Create an IAM policy that denies all actions for the root user without MFA. Consider using AWS Organizations SCPs to enforce MFA across all accounts.",
      effort: "hours",
    },
    {
      id: "G-002",
      framework: "GDPR",
      control: "Art. 32",
      title: "No data retention policy for S3 buckets",
      description: "S3 buckets containing EU user data have no lifecycle policies. Data is retained indefinitely, violating GDPR's data minimization principle.",
      severity: "high",
      remediation: "Implement S3 lifecycle rules for all buckets containing PII. Set default retention of 24 months for operational data, 12 months for analytics. Create automated deletion workflows with audit logging.",
      effort: "days",
    },
    {
      id: "G-003",
      framework: "SOC2",
      control: "CC7.2",
      title: "No automated vulnerability scanning",
      description: "EC2 instances and container images are not being scanned for vulnerabilities on a regular cadence. Manual reviews occur quarterly at best.",
      severity: "high",
      remediation: "Deploy AWS Inspector for EC2 vulnerability scanning. Integrate Trivy into CI/CD pipeline for container image scanning. Configure weekly scan schedules and Slack alerts for critical findings.",
      effort: "days",
    },
    {
      id: "G-004",
      framework: "HIPAA",
      control: "164.312(a)(1)",
      title: "Encryption at rest not verified for RDS",
      description: "RDS instances may not all have encryption at rest enabled. HIPAA requires all PHI to be encrypted both at rest and in transit.",
      severity: "critical",
      remediation: "Audit all RDS instances for encryption status. Enable encryption for any non-encrypted instances (requires snapshot & restore). Enable enforce-SSL parameter in all RDS parameter groups.",
      effort: "days",
    },
    {
      id: "G-005",
      framework: "GDPR",
      control: "Art. 17",
      title: "No right-to-erasure automation",
      description: "No mechanism exists for data subjects to request deletion. Manual process takes 30+ days, exceeding GDPR's 30-day requirement.",
      severity: "medium",
      remediation: "Build a self-service data deletion API endpoint. Create an admin dashboard for processing erasure requests. Implement cascading deletes across all data stores with PII. Add audit trail for compliance proof.",
      effort: "weeks",
    },
    {
      id: "G-006",
      framework: "ISO27001",
      control: "A.12.4",
      title: "Insufficient logging on admin actions",
      description: "Admin panel actions are not comprehensively logged. Current logs only capture login events, not configuration changes or data access.",
      severity: "medium",
      remediation: "Implement structured audit logging for all admin actions. Send logs to centralized SIEM (consider Datadog integration). Create automated alerts for anomalous admin behavior. Retain logs for minimum 12 months.",
      effort: "days",
    },
    {
      id: "G-007",
      framework: "SOC2",
      control: "CC9.2",
      title: "No disaster recovery testing documented",
      description: "While a DR plan exists, there is no evidence of testing within the last 12 months. SOC 2 requires documented DR testing at least annually.",
      severity: "medium",
      remediation: "Schedule quarterly DR tests. Document test procedures, results, and remediation actions. Store evidence in ReguMate for auditor access. Assign DR testing responsibility to the SRE team lead.",
      effort: "hours",
    },
    {
      id: "G-008",
      framework: "HIPAA",
      control: "164.312(b)",
      title: "PHI access logs retained < 6 years",
      description: "Current log retention is 90 days in CloudWatch. HIPAA requires audit logs to be retained for 6 years minimum.",
      severity: "high",
      remediation: "Configure S3 archival for CloudWatch logs with 6-year retention policy. Implement Glacier Deep Archive for cost-effective long-term storage. Verify log integrity with S3 Object Lock.",
      effort: "days",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

const navItems: { key: View; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "gaps", label: "Gap Analysis", icon: Search },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "evidence", label: "Evidence", icon: FileCheck2 },
];

function Sidebar({ active, onNavigate }: { active: View; onNavigate: (v: View) => void }) {
  return (
    <aside className="sidebar-bg w-60 min-h-screen flex flex-col shrink-0 hidden lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">ReguMate</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`sidebar-item ${active === item.key ? "active" : ""} w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active === item.key
                ? "text-white bg-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-slate-400">3 integrations active</span>
        </div>
        <p className="text-[10px] text-slate-600">v0.1.0 MVP</p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Ring Component                                               */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#eab308";
    if (s >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Score</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Severity Badge                                                     */
/* ------------------------------------------------------------------ */

function SeverityBadge({ severity }: { severity: Gap["severity"] }) {
  const styles: Record<string, string> = {
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[severity]}`}>
      {severity === "critical" && <XCircle className="h-3 w-3" />}
      {severity === "high" && <AlertTriangle className="h-3 w-3" />}
      {severity === "medium" && <Clock className="h-3 w-3" />}
      {severity === "low" && <CheckCircle2 className="h-3 w-3" />}
      {severity}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Framework Card                                                     */
/* ------------------------------------------------------------------ */

function FrameworkCard({ name, data }: { name: string; data: FrameworkScore }) {
  const icons: Record<string, React.ElementType> = {
    SOC2: Shield,
    GDPR: Globe,
    HIPAA: Lock,
    ISO27001: FileCheck2,
  };

  const colors: Record<string, string> = {
    SOC2: "from-blue-500 to-indigo-600",
    GDPR: "from-violet-500 to-purple-600",
    HIPAA: "from-emerald-500 to-teal-600",
    ISO27001: "from-orange-500 to-red-500",
  };

  const Icon = icons[name] || Shield;

  return (
    <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[name] || "from-gray-500 to-gray-600"} shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{name}</h3>
            <p className="text-[11px] text-gray-400">{data.gaps} open gap{data.gaps !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <span className={`text-2xl font-extrabold ${data.score >= 80 ? "text-emerald-600" : data.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
          {data.score}
        </span>
      </div>
      <Progress value={data.score} className="h-1.5" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard View                                                     */
/* ------------------------------------------------------------------ */

function DashboardView({ analysis }: { analysis: AnalysisResult }) {
  const criticalGaps = analysis.gaps.filter((g) => g.severity === "critical").length;
  const highGaps = analysis.gaps.filter((g) => g.severity === "high").length;

  return (
    <div className="view-enter space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 flex items-center gap-6 animate-fade-in-up animate-delay-1">
          <ScoreRing score={analysis.overallScore} size={100} strokeWidth={7} />
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-0.5">Overall Compliance</h2>
            <p className="text-2xl font-extrabold text-gray-900">{analysis.overallScore}%</p>
            <p className="text-xs text-gray-400 mt-1">
              {analysis.gaps.length} gaps to resolve
            </p>
          </div>
        </div>

        {/* Critical gaps */}
        <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-6 animate-fade-in-up animate-delay-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Critical Gaps</span>
          </div>
          <p className="text-3xl font-extrabold text-red-600">{criticalGaps}</p>
          <p className="text-xs text-gray-400 mt-1">Require immediate attention</p>
        </div>

        {/* High gaps */}
        <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-6 animate-fade-in-up animate-delay-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">High Priority</span>
          </div>
          <p className="text-3xl font-extrabold text-orange-600">{highGaps}</p>
          <p className="text-xs text-gray-400 mt-1">Should resolve within 30 days</p>
        </div>
      </div>

      {/* Framework cards */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Framework Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(analysis.frameworks).map(([name, data], i) => (
            <div key={name} className={`animate-fade-in-up animate-delay-${i + 2}`}>
              <FrameworkCard name={name} data={data} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent gaps preview */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Top Priority Gaps</h2>
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          {analysis.gaps.slice(0, 4).map((gap) => (
            <div
              key={gap.id}
              className={`severity-${gap.severity} flex items-center justify-between px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <SeverityBadge severity={gap.severity} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{gap.title}</p>
                  <p className="text-[11px] text-gray-400">
                    {gap.framework} &middot; {gap.control} &middot; {gap.effort} to fix
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gaps View                                                          */
/* ------------------------------------------------------------------ */

function GapsView({
  analysis,
  onAnalyze,
  isAnalyzing,
}: {
  analysis: AnalysisResult;
  onAnalyze: (desc: string) => void;
  isAnalyzing: boolean;
}) {
  const [description, setDescription] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [expandedGap, setExpandedGap] = useState<string | null>(null);

  const filteredGaps = analysis.gaps.filter(
    (g) => filterSeverity === "all" || g.severity === filterSeverity
  );

  return (
    <div className="view-enter space-y-6">
      {/* AI Analyze Card */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 rounded-2xl border border-indigo-100/60 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 mb-1">AI-Powered Gap Analysis</h2>
            <p className="text-sm text-gray-500 mb-4">
              Describe your infrastructure, tools, and security practices. Our AI will map them against compliance frameworks and identify gaps.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., We use AWS for hosting (EC2, RDS, S3), GitHub for source control, Okta for SSO with MFA enforced, CloudFront CDN, no vulnerability scanning, quarterly DR reviews..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none h-28 transition-all"
            />
            <div className="flex items-center gap-3 mt-3">
              <Button
                onClick={() => onAnalyze(description)}
                disabled={isAnalyzing || description.trim().length < 10}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold px-6 gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run AI Analysis
                  </>
                )}
              </Button>
              <span className="text-xs text-gray-400">
                Powered by Claude AI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "critical", "high", "medium", "low"].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterSeverity === sev
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
            {sev !== "all" && (
              <span className="ml-1 text-gray-400">
                {analysis.gaps.filter((g) => g.severity === sev).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Gaps list */}
      <div className="space-y-3">
        {filteredGaps.map((gap) => (
          <div
            key={gap.id}
            className={`severity-${gap.severity} bg-white rounded-2xl border border-gray-200/60 overflow-hidden transition-all hover:shadow-md`}
          >
            <button
              onClick={() => setExpandedGap(expandedGap === gap.id ? null : gap.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <SeverityBadge severity={gap.severity} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{gap.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {gap.id} &middot; {gap.framework} &middot; {gap.control}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {gap.effort}
                </Badge>
                <ChevronRight className={`h-4 w-4 text-gray-300 transition-transform ${expandedGap === gap.id ? "rotate-90" : ""}`} />
              </div>
            </button>

            {expandedGap === gap.id && (
              <div className="px-5 pb-4 pt-0 border-t border-gray-100 animate-fade-in-up">
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Gap Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{gap.description}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Remediation Steps</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{gap.remediation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" className="gap-1.5 text-xs bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white cursor-pointer shadow-md">
                    <CheckCircle2 className="h-3 w-3" />
                    Mark as Resolved
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer">
                    <ExternalLink className="h-3 w-3" />
                    View Control Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredGaps.length === 0 && (
          <div className="text-center py-14 text-gray-400 text-sm">
            No gaps match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Integrations View                                                  */
/* ------------------------------------------------------------------ */

function IntegrationsView() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggleConnect = (name: string) => {
    setConnecting(name);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.name === name
            ? {
                ...i,
                connected: !i.connected,
                status: !i.connected ? `Connected just now` : undefined,
              }
            : i
        )
      );
      setConnecting(null);
    }, 1200);
  };

  const connected = integrations.filter((i) => i.connected).length;

  return (
    <div className="view-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Connected Tools</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {connected} of {integrations.length} integrations active
          </p>
        </div>
        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">
          {connected} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className={`integration-card bg-white rounded-2xl border ${
              integration.connected ? "border-emerald-200/60" : "border-gray-200/60"
            } p-5 transition-all hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    integration.connected
                      ? "bg-gradient-to-br from-emerald-50 to-teal-50"
                      : "bg-gray-50"
                  }`}
                >
                  <integration.icon
                    className={`h-5 w-5 ${
                      integration.connected ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{integration.name}</p>
                  <p className="text-[11px] text-gray-400">{integration.category}</p>
                </div>
              </div>
              {integration.connected && (
                <span className="relative flex h-2 w-2 mt-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            {integration.status && (
              <p className="text-xs text-emerald-600 mb-3">{integration.status}</p>
            )}

            <Button
              size="sm"
              variant={integration.connected ? "outline" : "default"}
              onClick={() => toggleConnect(integration.name)}
              disabled={connecting === integration.name}
              className={`w-full text-xs font-semibold gap-1.5 cursor-pointer ${
                integration.connected
                  ? "border-gray-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md"
              }`}
            >
              {connecting === integration.name ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : integration.connected ? (
                "Disconnect"
              ) : (
                <>
                  <Plug className="h-3 w-3" />
                  Connect
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Evidence View                                                      */
/* ------------------------------------------------------------------ */

function EvidenceView({ analysis }: { analysis: AnalysisResult }) {
  const evidencePacks = [
    {
      id: "EP-001",
      framework: "SOC 2 Type II",
      generatedAt: "2026-05-18",
      controls: 48,
      evidence: 156,
      status: "ready" as const,
    },
    {
      id: "EP-002",
      framework: "GDPR",
      generatedAt: "2026-05-17",
      controls: 35,
      evidence: 98,
      status: "ready" as const,
    },
    {
      id: "EP-003",
      framework: "HIPAA",
      generatedAt: "2026-05-15",
      controls: 42,
      evidence: 112,
      status: "incomplete" as const,
    },
    {
      id: "EP-004",
      framework: "ISO 27001",
      generatedAt: "2026-05-10",
      controls: 114,
      evidence: 89,
      status: "generating" as const,
    },
  ];

  const resolvedCount = analysis.gaps.filter((g) => g.severity === "low").length;
  const totalControls = evidencePacks.reduce((acc, p) => acc + p.controls, 0);
  const totalEvidence = evidencePacks.reduce((acc, p) => acc + p.evidence, 0);

  return (
    <div className="view-enter space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck2 className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Evidence Packs</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{evidencePacks.length}</p>
        </div>
        <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Controls</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalControls}</p>
        </div>
        <div className="card-hover bg-white rounded-2xl border border-gray-200/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Evidence Items</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalEvidence}</p>
        </div>
      </div>

      {/* Packs */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Evidence Packs</h2>
        <div className="space-y-3">
          {evidencePacks.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-2xl border border-gray-200/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    pack.status === "ready"
                      ? "bg-gradient-to-br from-emerald-50 to-teal-50"
                      : pack.status === "generating"
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50"
                      : "bg-gradient-to-br from-red-50 to-orange-50"
                  }`}
                >
                  {pack.status === "ready" ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  ) : pack.status === "generating" ? (
                    <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{pack.framework}</p>
                  <p className="text-[11px] text-gray-400">
                    {pack.controls} controls &middot; {pack.evidence} evidence items &middot; Generated {pack.generatedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pack.status === "ready" ? (
                  <>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      READY
                    </Badge>
                    <Button size="sm" className="gap-1.5 text-xs bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white cursor-pointer shadow-md">
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  </>
                ) : pack.status === "generating" ? (
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] font-bold">
                    GENERATING
                  </Badge>
                ) : (
                  <>
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold">
                      {analysis.gaps.filter((g) => g.framework.toUpperCase().replace("ISO27001", "ISO27001").includes(pack.framework.split(" ")[0].toUpperCase()) || pack.framework.includes(g.framework)).length} GAPS
                    </Badge>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer">
                      <ArrowUpRight className="h-3 w-3" />
                      View Gaps
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Nav                                                         */
/* ------------------------------------------------------------------ */

function MobileNav({ active, onNavigate }: { active: View; onNavigate: (v: View) => void }) {
  return (
    <div className="lg:hidden flex items-center gap-1 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl px-3 py-2 sticky top-0 z-20">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.key)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            active === item.key
              ? "bg-indigo-50 text-indigo-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <item.icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [analysis, setAnalysis] = useState<AnalysisResult>(defaultAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(async (description: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Analysis failed:", data.error);
        return;
      }

      if (data.result) {
        setAnalysis(data.result);
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <Sidebar active={activeView} onNavigate={setActiveView} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile nav */}
        <MobileNav active={activeView} onNavigate={setActiveView} />

        {/* Top bar */}
        <header className="h-14 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 sm:px-8 sticky top-0 z-10 lg:top-0">
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">ReguMate</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-gray-800">
              {navItems.find((n) => n.key === activeView)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              Last scan: 2 min ago
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
              JD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar">
          {activeView === "dashboard" && <DashboardView analysis={analysis} />}
          {activeView === "gaps" && (
            <GapsView analysis={analysis} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          )}
          {activeView === "integrations" && <IntegrationsView />}
          {activeView === "evidence" && <EvidenceView analysis={analysis} />}
        </main>
      </div>
    </div>
  );
}
