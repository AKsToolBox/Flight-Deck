import React, { useState } from "react";
import {
  Terminal,
  Cpu,
  Sliders,
  AlertTriangle,
  Package,
  Play,
  CheckCircle2,
  Sparkles,
  Server,
  Activity,
  Layers,
  RotateCcw,
} from "lucide-react";
import {
  initialLinuxServers,
  initialSystemdServices,
  initialSysctlParams,
} from "../../data/mockInfrastructure";
import { LinuxServer, SystemdService, SysctlParameter } from "../../types";
import { CodeViewer } from "../common/CodeViewer";

interface LinuxAdminSuiteProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const LinuxAdminSuite: React.FC<LinuxAdminSuiteProps> = ({ onAskCopilot }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "fleet" | "bash" | "sysctl" | "troubleshooting" | "systemd"
  >("fleet");

  const [servers] = useState<LinuxServer[]>(initialLinuxServers);
  const [selectedServer, setSelectedServer] = useState<LinuxServer>(initialLinuxServers[0]);
  const [services, setServices] = useState<SystemdService[]>(initialSystemdServices);
  const [sysctlList, setSysctlList] = useState<SysctlParameter[]>(initialSysctlParams);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Bash AI Generator
  const [bashObjective, setBashObjective] = useState("");
  const [generatedBash, setGeneratedBash] = useState<string | null>(null);
  const [isGeneratingBash, setIsGeneratingBash] = useState(false);

  // Journalctl filter simulation
  const [journalFilter, setJournalFilter] = useState("sssd.service");
  const [journalPriority, setJournalPriority] = useState("err");
  const [journalOutput, setJournalOutput] = useState<string | null>(null);

  const handleServiceAction = (serviceId: string, action: "start" | "stop" | "restart") => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          if (action === "stop") {
            return { ...s, activeState: "inactive", subState: "dead" };
          } else {
            return { ...s, activeState: "active", subState: "running", pid: Math.floor(Math.random() * 4000) + 1000 };
          }
        }
        return s;
      })
    );
    setActionNotice(`systemctl ${action} executed cleanly on ${serviceId}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleApplySysctl = (key: string, recVal: string) => {
    setSysctlList((prev) =>
      prev.map((p) => (p.key === key ? { ...p, currentValue: recVal } : p))
    );
    setActionNotice(`Applied sysctl parameter ${key} = ${recVal} to live kernel (/etc/sysctl.d/99-enterprise-tune.conf).`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleGenerateBash = async () => {
    if (!bashObjective) return;
    setIsGeneratingBash(true);
    setGeneratedBash(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptType: "Bash",
          objective: bashObjective,
          targetEnvironment: "Enterprise Linux (RHEL 9 / Ubuntu 24.04 / Rocky Linux)",
          includeSafetyChecks: true,
        }),
      });
      const data = await res.json();
      setGeneratedBash(data.script || "# Failed to generate script.");
    } catch (err: any) {
      setGeneratedBash(`# Error: ${err.message}`);
    } finally {
      setIsGeneratingBash(false);
    }
  };

  const handleFilterJournal = () => {
    setJournalOutput(`journalctl -u ${journalFilter} -p ${journalPriority} --no-pager -n 25
-- Logs begin at Wed 2026-09-09 00:00:01 UTC, end at Thu 2026-09-10 18:24:12 UTC. --
Sep 10 17:34:01 ${selectedServer.hostname} ${journalFilter}[1042]: [sssd[be[contoso.internal]]] [fo_resolve_service_send] (0x0100): Trying to resolve SRV record for _ldap._tcp.dc._msdcs.corp.contoso.internal
Sep 10 17:34:04 ${selectedServer.hostname} ${journalFilter}[1042]: [sssd[be[contoso.internal]]] [krb5_auth_store_creds] (0x0020): krb5_get_init_creds_password failed: Clock skew too great (37)
Sep 10 17:34:04 ${selectedServer.hostname} ${journalFilter}[1042]: (0x0020): [auth_cache_cleanup] Cached credentials buffer invalidated due to Kerberos ticket refusal.
Sep 10 18:01:22 ${selectedServer.hostname} ${journalFilter}[1042]: [sssd[be[contoso.internal]]] Fallback to offline cache auth mode permitted for 120 minutes.`);
  };

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "fleet", label: "Enterprise Linux Fleet", icon: Server },
          { id: "bash", label: "Bash Automation Workbench", icon: Terminal },
          { id: "sysctl", label: "Kernel & sysctl Tuner", icon: Sliders },
          { id: "troubleshooting", label: "Troubleshooting & journalctl", icon: AlertTriangle },
          { id: "systemd", label: "systemd Services & Packages", icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
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

      {actionNotice && (
        <div className="flex items-center gap-2 p-3 bg-blue-950/80 border border-blue-800 text-blue-200 text-xs rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* SUB-TAB 1: Linux Fleet Overview */}
      {activeSubTab === "fleet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {servers.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedServer(srv)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedServer.id === srv.id
                    ? "bg-slate-800/90 border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    {srv.distro}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      srv.status === "Online"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                    }`}
                  >
                    {srv.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{srv.hostname}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{srv.ipAddress}</p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>CPU: {srv.cpuUsage}%</span>
                    <span>RAM: {srv.memUsage}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Load: {srv.loadAverage.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Server Deep Dive */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Target Node: {selectedServer.hostname}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Linux Kernel: {selectedServer.kernel} | Uptime: {selectedServer.uptime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onAskCopilot(
                      `Diagnose high load average and memory pressure on ${selectedServer.hostname} (${selectedServer.distro}). Provide specific commands for perf, vmstat, and iostat.`,
                      "linux_sre"
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Linux SRE Copilot Audit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Distribution Base</span>
                <span className="text-slate-200 font-semibold">{selectedServer.distro}</span>
                <p className="text-[10px] text-slate-400">SELinux: Enforcing (Targeted)</p>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Active Directory Integration</span>
                <span className="text-slate-200 font-semibold">SSSD + RealmD (Kerberos)</span>
                <p className="text-[10px] text-emerald-400">PAM Modules Configured</p>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Package Management</span>
                <span className="text-slate-200 font-semibold">
                  {selectedServer.distro.includes("Ubuntu") ? "APT + Unattended-Upgrades" : "DNF / YUM + dnf-automatic"}
                </span>
                <p className="text-[10px] text-slate-400">EPEL &amp; Contoso Private Repos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Bash Scripting Workbench */}
      {activeSubTab === "bash" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Enterprise Bash Automation Workbench &amp; AI Generator
            </h3>
            <p className="text-xs text-slate-400">
              Generate robust shell scripts with `set -euo pipefail`, trap cleanup handlers, lock files, and dry-run safety modes.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={bashObjective}
                onChange={(e) => setBashObjective(e.target.value)}
                placeholder="e.g. Rotate /var/log/audit/ logs, compress older than 7 days, upload to S3/Azure Blob, and purge..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleGenerateBash}
                disabled={isGeneratingBash || !bashObjective}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
              >
                {isGeneratingBash ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Generating Bash...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Script
                  </>
                )}
              </button>
            </div>

            {generatedBash && (
              <CodeViewer
                code={generatedBash}
                language="bash"
                title={`AI Generated Bash Script: ${bashObjective}`}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white">Automated Kernel Live-Patching Audit</h4>
              <CodeViewer
                code={`#!/usr/bin/env bash
# Enterprise Live-Patching Health Verification
set -euo pipefail

if ! command -v kpatch &>/dev/null; then
    echo "[!] kpatch utility not found. Installing..."
    dnf install -y kpatch dnf-plugin-kpatch
fi

echo "[*] Loaded kpatch core modules:"
kpatch list
echo "[*] Verifying no unapplied critical security advisories:"
dnf updateinfo list sec --sec-severity=Critical`}
                language="bash"
                title="kpatch_audit.sh"
              />
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white">NTP / Chrony Domain Clock Skew Resync</h4>
              <CodeViewer
                code={`#!/usr/bin/env bash
# Resynchronize Linux system clock against Active Directory PDC
set -euo pipefail

echo "[*] Tracking current chrony offset against DC01.corp:"
chronyc tracking
echo "[*] Forcing burst and immediate step synchronization:"
chronyc makestep
chronyc sources -v`}
                language="bash"
                title="chrony_dc_sync.sh"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Kernel & sysctl Performance Tuning */}
      {activeSubTab === "sysctl" && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Kernel Sysctl Performance &amp; Security Parameter Tuner
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time kernel memory, network socket, and file descriptor tuning across the Linux fleet.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskCopilot(
                    "Recommend ideal sysctl.conf kernel parameters for high-performance Kubernetes worker nodes running high-concurrency NGINX ingress.",
                    "linux_sre"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Copilot Kernel Recommendations
              </button>
            </div>

            <div className="space-y-3">
              {sysctlList.map((param) => {
                const isOptimal = param.currentValue === param.recommendedValue;
                return (
                  <div
                    key={param.key}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-300">{param.key}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {param.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{param.description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right text-xs font-mono">
                        <span className="text-slate-400 text-[11px] block">Current / Target</span>
                        <span className={isOptimal ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                          {param.currentValue}
                        </span>
                        <span className="text-slate-500 mx-1.5">/</span>
                        <span className="text-emerald-400">{param.recommendedValue}</span>
                      </div>

                      {!isOptimal && (
                        <button
                          onClick={() => handleApplySysctl(param.key, param.recommendedValue)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Tune Kernel
                        </button>
                      )}
                      {isOptimal && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Optimal
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Troubleshooting & Journalctl */}
      {activeSubTab === "troubleshooting" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Linux Troubleshooting Console (journalctl / dmesg / OOM Audit)
            </h3>
            <p className="text-xs text-slate-400">
              Correlate systemd journal streams, kernel ring buffers, and network socket tables.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <input
                type="text"
                placeholder="Unit (e.g. sssd.service, nginx.service, containerd.service)"
                value={journalFilter}
                onChange={(e) => setJournalFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
              />
              <select
                value={journalPriority}
                onChange={(e) => setJournalPriority(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
              >
                <option value="emerg">Emergency (0)</option>
                <option value="alert">Alert (1)</option>
                <option value="crit">Critical (2)</option>
                <option value="err">Error (3)</option>
                <option value="warning">Warning (4)</option>
                <option value="info">Info (6)</option>
              </select>
              <button
                onClick={handleFilterJournal}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
              >
                Query Journal
              </button>
            </div>

            {journalOutput ? (
              <CodeViewer
                code={journalOutput}
                language="bash"
                title={`journalctl Output for ${journalFilter}`}
                showExecute={false}
              />
            ) : (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
                Click &quot;Query Journal&quot; to inspect systemd unit logs from {selectedServer.hostname}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: systemd Services & Packages */}
      {activeSubTab === "systemd" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              systemd Unit Manager (System Security, Runtimes &amp; Network Services)
            </h3>
            <p className="text-xs text-slate-400">
              Target Node: {selectedServer.hostname} ({selectedServer.distro})
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Unit Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">State</th>
                    <th className="p-3">PID / Memory</th>
                    <th className="p-3 text-right">Service Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{svc.unitName}</td>
                      <td className="p-3 text-slate-300">{svc.description}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            svc.activeState === "active"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-red-950 text-red-300 border border-red-800"
                          }`}
                        >
                          {svc.activeState} ({svc.subState})
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {svc.pid ? `PID ${svc.pid} (${svc.memoryUsage})` : "-"}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {svc.activeState === "active" ? (
                          <>
                            <button
                              onClick={() => handleServiceAction(svc.id, "restart")}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px]"
                            >
                              Restart
                            </button>
                            <button
                              onClick={() => handleServiceAction(svc.id, "stop")}
                              className="px-2 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded border border-red-800 text-[11px]"
                            >
                              Stop
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleServiceAction(svc.id, "start")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
                          >
                            Start
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
