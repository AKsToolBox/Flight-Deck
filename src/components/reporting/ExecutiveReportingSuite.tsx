import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Server,
} from "lucide-react";
import { initialExecutiveMetrics } from "../../data/mockInfrastructure";
import { ExecutiveMetrics } from "../../types";

interface ReportingSuiteProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const ExecutiveReportingSuite: React.FC<ReportingSuiteProps> = ({ onAskCopilot }) => {
  const [metrics] = useState<ExecutiveMetrics>(initialExecutiveMetrics);
  const [reportType, setReportType] = useState<"executive_summary" | "cis_benchmark" | "patch_compliance">("executive_summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExecutiveReport, setGeneratedExecutiveReport] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGeneratedExecutiveReport(null);
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          metrics,
        }),
      });
      const data = await res.json();
      setGeneratedExecutiveReport(data.report || "Report generation finished.");
    } catch (err: any) {
      setGeneratedExecutiveReport(`Error synthesizing report: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Enterprise SLA Availability</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{metrics.fleetUptimeSla}%</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Exceeds 99.9% Target</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">CIS Benchmark Compliance</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{metrics.cisComplianceScore}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Audit: Level 1 &amp; Level 2 Controls</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Patch Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{metrics.patchCompliancePct}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">0 Zero-Day Vulnerabilities</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Monitored Nodes</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{metrics.totalServers}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {metrics.criticalAlerts} Active Critical Alerts
          </p>
        </div>
      </div>

      {/* Report Generator Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              Executive Audit &amp; Infrastructure Governance Synthesis
            </h3>
            <p className="text-xs text-slate-400">
              Generate board-ready executive summaries with AI-driven risk scoring, cost analysis, and remediation roadmaps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="executive_summary">Executive Summary &amp; Risk Register</option>
              <option value="cis_benchmark">CIS Security Benchmark Audit</option>
              <option value="patch_compliance">Patch &amp; Vulnerability Lifecycle</option>
            </select>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Report
                </>
              )}
            </button>
            {generatedExecutiveReport && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            )}
          </div>
        </div>

        {/* Generated Report Content */}
        {generatedExecutiveReport ? (
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 font-sans text-xs text-slate-200 leading-relaxed max-w-none">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Contoso Corporation — Infrastructure Operations &amp; Security Brief
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Generated: {new Date().toLocaleDateString()} | Author: Google AI Studio SRE Synthesizer
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                CONFIDENTIAL - EXECUTIVE AUDIT
              </span>
            </div>

            <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">
              {generatedExecutiveReport}
            </div>
          </div>
        ) : (
          <div className="p-10 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
            <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p>Click &quot;Generate Report&quot; to synthesize an executive infrastructure audit using Gemini.</p>
          </div>
        )}
      </div>
    </div>
  );
};
