import React, { useState } from "react";
import {
  AlertCircle,
  Activity,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Cpu,
  Database,
  Layers,
} from "lucide-react";
import { initialIncidents, mockTelemetryTimeline } from "../../data/mockInfrastructure";
import { IncidentRecord } from "../../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface IncidentPerformanceProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const IncidentPerformanceSuite: React.FC<IncidentPerformanceProps> = ({ onAskCopilot }) => {
  const [activeTab, setActiveTab] = useState<"incidents" | "rca_ai" | "telemetry" | "capacity">("incidents");
  const [incidents, setIncidents] = useState<IncidentRecord[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord>(initialIncidents[0]);

  // AI RCA State
  const [isAnalyzingRCA, setIsAnalyzingRCA] = useState(false);
  const [rcaResult, setRcaResult] = useState<any>(null);
  const [customIncidentTitle, setCustomIncidentTitle] = useState("");
  const [customIncidentSymptoms, setCustomIncidentSymptoms] = useState("");
  const [customIncidentLogs, setCustomIncidentLogs] = useState("");

  const handleResolveIncident = (incId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incId ? { ...inc, status: "Resolved" } : inc))
    );
  };

  const handleRunRCA = async (incidentToAnalyze?: IncidentRecord) => {
    setIsAnalyzingRCA(true);
    setRcaResult(null);

    const title = incidentToAnalyze?.title || customIncidentTitle || selectedIncident.title;
    const symptoms =
      incidentToAnalyze?.symptoms.join("\n") ||
      customIncidentSymptoms ||
      selectedIncident.symptoms.join("\n");
    const logs =
      incidentToAnalyze?.rawLogs || customIncidentLogs || selectedIncident.rawLogs;
    const target = incidentToAnalyze?.targetHost || selectedIncident.targetHost;

    try {
      const res = await fetch("/api/analyze-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentTitle: title,
          targetSystem: target,
          symptoms: symptoms.split("\n"),
          rawLogs: logs,
        }),
      });
      const data = await res.json();
      setRcaResult(data);
    } catch (err: any) {
      setRcaResult({
        rootCause: `Failed to trigger analysis: ${err.message}`,
        immediateActions: [],
        preventativeMeasures: [],
      });
    } finally {
      setIsAnalyzingRCA(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "incidents", label: "Active Incidents & Postmortems", icon: AlertCircle },
          { id: "rca_ai", label: "AI Root Cause Analysis (High Thinking)", icon: Sparkles },
          { id: "telemetry", label: "Real-time Telemetry & Metrics", icon: Activity },
          { id: "capacity", label: "Capacity Planning & Runway", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Incidents List */}
      {activeTab === "incidents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Enterprise Incident Board
            </h3>
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedIncident.id === inc.id
                    ? "bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      inc.severity === "P1"
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : inc.severity === "P2"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {inc.severity} Critical
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      inc.status === "Resolved"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-red-950/70 text-red-300 border border-red-800 animate-pulse"
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{inc.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1">Host: {inc.targetHost}</p>
                <p className="text-[10px] text-slate-400 mt-1">Opened: {inc.timestamp}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                      {selectedIncident.severity}
                    </span>
                    <h3 className="text-sm font-bold text-white">{selectedIncident.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    System: {selectedIncident.targetHost} | SRE Lead: {selectedIncident.assignedTo}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedIncident.status !== "Resolved" && (
                    <button
                      onClick={() => handleResolveIncident(selectedIncident.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveTab("rca_ai");
                      handleRunRCA(selectedIncident);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Trigger AI RCA
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-1">Reported Symptoms:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    {selectedIncident.symptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-1">Diagnostic Raw Logs:</h4>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-cyan-300 whitespace-pre-wrap overflow-x-auto max-h-48">
                    {selectedIncident.rawLogs}
                  </pre>
                </div>

                {selectedIncident.rootCauseAnalysis && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Root Cause Identified:
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedIncident.rootCauseAnalysis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI RCA (High Thinking Mode) */}
      {activeTab === "rca_ai" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Gemini 3.1 Pro Preview Root Cause Analysis (Deep High-Thinking)
                </h3>
                <p className="text-xs text-slate-400">
                  Leveraging high thinking tokens to dissect kernel traces, memory dumps, stack traces, and syslog streams without output length constraints.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Incident Headline:</label>
                <input
                  type="text"
                  placeholder="e.g. Kerberos Ticket Expiry causing NGINX 502 Outage"
                  value={customIncidentTitle || selectedIncident.title}
                  onChange={(e) => setCustomIncidentTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Observed Symptoms (one per line):</label>
                <input
                  type="text"
                  placeholder="e.g. Memory ballooning, krb5_auth timeout"
                  value={customIncidentSymptoms || selectedIncident.symptoms.join(", ")}
                  onChange={(e) => setCustomIncidentSymptoms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-slate-300 font-semibold block mb-1">Crash Log / Event Viewer Excerpt:</label>
              <textarea
                rows={4}
                value={customIncidentLogs || selectedIncident.rawLogs}
                onChange={(e) => setCustomIncidentLogs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-[11px]"
              />
            </div>

            <button
              onClick={() => handleRunRCA()}
              disabled={isAnalyzingRCA}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              {isAnalyzingRCA ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Reasoning with Gemini 3.1 Pro (Thinking Level: High)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Perform High-Thinking Root Cause Analysis
                </>
              )}
            </button>

            {rcaResult && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 animate-in fade-in">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Definitive Root Cause
                  </h4>
                  <p className="text-slate-200 text-xs leading-relaxed">{rcaResult.rootCause}</p>
                </div>

                {rcaResult.immediateActions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      Immediate Remediation Steps
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                      {rcaResult.immediateActions.map((act: string, i: number) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rcaResult.preventativeMeasures?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      Preventative Engineering Controls
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                      {rcaResult.preventativeMeasures.map((prev: string, i: number) => (
                        <li key={i}>{prev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Real-Time Telemetry Metrics */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Cluster CPU Utilization (% Cores)
                </h4>
                <span className="text-[11px] font-mono text-cyan-400">Peak: 89%</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTelemetryTimeline}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fillOpacity={1} fill="url(#cpuGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Cluster Memory Pressure (RAM %)
                </h4>
                <span className="text-[11px] font-mono text-emerald-400">Current: 76%</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTelemetryTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: 11 }}
                    />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Capacity Planning & Runway */}
      {activeTab === "capacity" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Datacenter Capacity Planning &amp; Hardware Runway Forecast
            </h3>
            <p className="text-xs text-slate-400">
              Predictive linear regression and resource exhaustion thresholds across compute, SAN, and network fabric.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <span className="text-slate-400 block text-[11px]">Compute Cluster Runway</span>
                <span className="text-xl font-bold text-emerald-400">14.2 Months</span>
                <p className="text-slate-400 text-[11px]">
                  Based on 3.2% compound monthly vCPU growth. 48 physical sockets remaining.
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-amber-900/40 rounded-xl space-y-2">
                <span className="text-slate-400 block text-[11px]">Pure SAN Storage Pool</span>
                <span className="text-xl font-bold text-amber-400">4.1 Months</span>
                <p className="text-slate-400 text-[11px]">
                  Storage growth accelerating due to unindexed Elastic search volumes. Expansion needed in Q4.
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <span className="text-slate-400 block text-[11px]">Subnet IPAM Availability</span>
                <span className="text-xl font-bold text-white">82% Available</span>
                <p className="text-slate-400 text-[11px]">
                  IPv4 10.140.0.0/16 address space has 14,200 available host allocations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
