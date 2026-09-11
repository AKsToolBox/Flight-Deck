import React from "react";
import {
  Server,
  Terminal,
  Cpu,
  Boxes,
  FileCode2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { NavigationTab } from "../types";

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeIncidentsCount: number;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeIncidentsCount,
}) => {
  const navItems: NavItem[] = [
    {
      id: "windows",
      label: "Windows Server",
      sublabel: "AD, Entra, GPO, PowerShell, DNS, Patch",
      icon: Server,
    },
    {
      id: "linux",
      label: "Linux Administration",
      sublabel: "RHEL, Ubuntu, Rocky, Bash, systemd",
      icon: Terminal,
    },
    {
      id: "automation",
      label: "Infrastructure Automation",
      sublabel: "PowerShell, Bash, Python Runbooks",
      icon: Layers,
    },
    {
      id: "iac",
      label: "IaC & Version Control",
      sublabel: "Terraform, Bicep, Git, Azure DevOps",
      icon: FileCode2,
    },
    {
      id: "vmware",
      label: "VMware Virtualization",
      sublabel: "vCenter, ESXi, DRS, Provisioning",
      icon: Boxes,
    },
    {
      id: "performance",
      label: "Incident & Performance",
      sublabel: "Bottleneck RCA, Telemetry, Capacity",
      icon: AlertCircle,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
    },
    {
      id: "configmgmt",
      label: "Configuration Management",
      sublabel: "Chef Cookbooks, InSpec, Drift Audit",
      icon: ShieldCheck,
    },
    {
      id: "reporting",
      label: "Executive Reporting",
      sublabel: "CIS Audit, Patch Compliance, PDF",
      icon: FileSpreadsheet,
    },
    {
      id: "copilot",
      label: "AI SRE Copilot",
      sublabel: "Gemini 3 Pro High Thinking & Chat",
      icon: Sparkles,
      badge: "AI",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Navigation section */}
      <div className="p-3">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Enterprise Operations
        </p>
        <nav className="space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive
                        ? "bg-blue-500/40 text-white"
                        : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold leading-tight truncate">
                      {item.label}
                    </p>
                    <p
                      className={`text-[10px] leading-tight truncate mt-0.5 ${
                        isActive ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {item.sublabel}
                    </p>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                      isActive
                        ? "bg-white text-blue-700"
                        : item.badge === "AI"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System environment pill at bottom */}
      <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 font-medium text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Infrastructure Engine
          </span>
          <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Online
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          Contoso Forest (contoso.internal)
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          PDC: DC01 | vCenter 8.0U2 | Chef 18
        </p>
      </div>
    </aside>
  );
};
