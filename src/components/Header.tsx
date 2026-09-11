import React from "react";
  import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    Terminal,
    Search,
    Brain,
  } from "lucide-react";
import { NavigationTab } from "../types";

interface HeaderProps {
  currentTab?: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  isCopilotOpen?: boolean;
  onOpenCopilot?: () => void;
  onToggleCopilot?: () => void;
  activeIncidentsCount: number;
  onOpenQuickAssist?: () => void;
  useThinkingGlobal?: boolean;
  isThinkingModeEnabled?: boolean;
  onToggleThinkingGlobal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  isCopilotOpen,
  onOpenCopilot,
  onToggleCopilot,
  activeIncidentsCount,
  onOpenQuickAssist,
  useThinkingGlobal = false,
  isThinkingModeEnabled,
  onToggleThinkingGlobal,
}) => {
  const thinkingActive = isThinkingModeEnabled ?? useThinkingGlobal;
  const handleCopilotClick = onOpenCopilot || onToggleCopilot || (() => {});
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm">
      {/* Brand & Workspace indicator */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-900/30">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">
              Enterprise Systems Console
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80 rounded-full">
              v4.2 PROD
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Hybrid Windows &amp; Linux Operations, VMware, IaC &amp; Incident SRE
          </p>
        </div>
      </div>

      {/* Fleet Live Telemetry Pills */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Directory: 2 DCs Synced</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>VMware Clusters: 2 Active (DRS Auto)</span>
        </div>

        {activeIncidentsCount > 0 && (
          <button
            onClick={() => onSelectTab && onSelectTab("performance")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{activeIncidentsCount} Incidents Requiring Triage</span>
          </button>
        )}
      </div>

      {/* Quick Action Tools & Copilot Trigger */}
      <div className="flex items-center gap-2.5">
        {onToggleThinkingGlobal && (
          <button
            onClick={onToggleThinkingGlobal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              thinkingActive
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200"
            }`}
            title="Toggle Gemini 3.1 Pro High Thinking Mode"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{thinkingActive ? "Thinking: HIGH" : "Thinking: OFF"}</span>
          </button>
        )}

        <button
          onClick={handleCopilotClick}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer ${
            isCopilotOpen
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
              : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-600/30"
          }`}
        >
          {thinkingActive ? (
            <Brain className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-white" />
          )}
          <span>SRE Copilot</span>
          {thinkingActive && (
            <span className="px-1.5 py-0.2 text-[9px] bg-amber-400 text-slate-950 font-bold rounded uppercase">
              Pro
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
