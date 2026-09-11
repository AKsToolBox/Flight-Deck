import React, { useState } from "react";
import {
  Layers,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  Server,
  Zap,
  ArrowRight,
  Shield,
} from "lucide-react";
import { initialAutomationWorkflows } from "../../data/mockInfrastructure";
import { AutomationWorkflow } from "../../types";
import { CodeViewer } from "../common/CodeViewer";

interface AutomationSuiteProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const AutomationSuite: React.FC<AutomationSuiteProps> = ({ onAskCopilot }) => {
  const [activeTab, setActiveTab] = useState<"runbooks" | "provisioning" | "multi_engine">("runbooks");
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(initialAutomationWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow>(initialAutomationWorkflows[0]);
  const [executionLog, setExecutionLog] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Multi-engine interactive prompt
  const [engineType, setEngineType] = useState<"PowerShell" | "Bash" | "Python">("PowerShell");
  const [engineGoal, setEngineGoal] = useState("");
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Provisioning Template Selector
  const [provisioningType, setProvisioningType] = useState<"cloud_init" | "kickstart" | "sysprep">("cloud_init");

  const handleExecuteWorkflow = (wf: AutomationWorkflow) => {
    setIsExecuting(true);
    setExecutionLog(`[${new Date().toLocaleTimeString()}] INITIATING WORKFLOW: ${wf.name}
Engine: ${wf.type} | Target: Production Enterprise Fleet
Phase 1: Validating pre-flight credentials and Kerberos/SSH keys...
Phase 2: Checking idempotency state & lock files...
Phase 3: Executing task steps...
[STEP 1/3] Pre-checks OK.
[STEP 2/3] Applying changes with rollback checkpoints.
[STEP 3/3] Post-execution telemetry verified.
Status: WORKFLOW COMPLETED SUCCESSFULLY IN 14s. Code: 0.`);
    setTimeout(() => {
      setIsExecuting(false);
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === wf.id
            ? { ...w, lastRunStatus: "Success", lastRunTime: "Just now", lastRunDuration: "14s" }
            : w
        )
      );
    }, 1200);
  };

  const handleGenerateEngineScript = async () => {
    if (!engineGoal) return;
    setIsGenerating(true);
    setGeneratedScript(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptType: engineType,
          objective: engineGoal,
          targetEnvironment: "Enterprise Infrastructure (Hybrid Windows / Linux / VMware)",
          includeSafetyChecks: true,
        }),
      });
      const data = await res.json();
      setGeneratedScript(data.script || "# Script generation empty.");
    } catch (err: any) {
      setGeneratedScript(`# Error generating script: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const cloudInitCode = `#cloud-config
# Enterprise Linux Automated Cloud-Init Golden Image Profile
fqdn: srv-prd-node01.corp.contoso.internal
manage_etc_hosts: true

users:
  - name: ansible_admin
    gecos: Enterprise Ansible Automation
    primary_group: wheel
    sudo: ALL=(ALL) NOPASSWD:ALL
    lock_passwd: true
    ssh_authorized_keys:
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEnterpriseAutomationKeyContoso2026

packages:
  - sssd
  - realmd
  - krb5-workstation
  - chrony
  - open-vm-tools
  - audit

runcmd:
  - systemctl enable --now chronyd
  - systemctl enable --now vmtoolsd
  - echo "vm.swappiness = 10" >> /etc/sysctl.d/99-cloudinit.conf
  - sysctl --system`;

  const kickstartCode = `# Enterprise RHEL 9 Automated Kickstart Profile (ks.cfg)
# Version: 2026.1 Enterprise Baseline
text
skipx
firstboot --disabled
eula --agreed

lang en_US.UTF-8
keyboard us
timezone America/New_York --utc

# Storage Partitioning (CIS Benchmark Compliant LVM)
zerombr
clearpart --all --initlabel
autopart --type=lvm

# Network Configuration
network --bootproto=dhcp --device=link --activate --onboot=yes

# Authentication & Root Password (Locked)
rootpw --lock
user --name=sysadmin --groups=wheel --plaintext --password=TemporaryChangeAtFirstLogon!

# Software Selection
%packages --inst-langs=en
@^minimal-environment
sssd
realmd
oddjob
oddjob-mkhomedir
%end

%post --interpreter=/usr/bin/bash
echo "[POST-INSTALL] Joining Active Directory Realm contoso.internal..."
realm join --user=svc_join_domain --computer-ou="OU=Linux Servers,DC=corp,DC=contoso,DC=internal" corp.contoso.internal
%end`;

  const sysprepCode = `<?xml version="1.0" encoding="utf-8"?>
<!-- Windows Server 2022/2025 Automated Sysprep Unattend.xml -->
<unattend xmlns="urn:schemas-microsoft-com:unattend">
  <settings pass="specialize">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <ComputerName>WIN-PRD-TEMPLATE</ComputerName>
      <TimeZone>Eastern Standard Time</TimeZone>
    </component>
    <component name="Microsoft-Windows-UnattendedJoin" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <Identification>
        <JoinDomain>corp.contoso.internal</JoinDomain>
        <MachineObjectOU>OU=Member Servers,DC=corp,DC=contoso,DC=internal</MachineObjectOU>
      </Identification>
    </component>
  </settings>
</unattend>`;

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "runbooks", label: "Operational Runbooks", icon: Layers },
          { id: "provisioning", label: "Server Provisioning (Cloud-Init/Kickstart/Sysprep)", icon: Server },
          { id: "multi_engine", label: "Multi-Engine Script Generator (PS / Bash / Python)", icon: Zap },
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

      {/* TAB 1: Operational Runbooks */}
      {activeTab === "runbooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Runbook Catalog
            </h3>
            {workflows.map((wf) => (
              <div
                key={wf.id}
                onClick={() => setSelectedWorkflow(wf)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedWorkflow.id === wf.id
                    ? "bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    {wf.type}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      wf.lastRunStatus === "Success"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : wf.lastRunStatus === "Running"
                        ? "bg-blue-950 text-blue-300 border border-blue-800 animate-pulse"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {wf.lastRunStatus}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{wf.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{wf.description}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-2">
                  Last Run: {wf.lastRunTime} ({wf.lastRunDuration})
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    {selectedWorkflow.name}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedWorkflow.description}</p>
                </div>
                <button
                  onClick={() => handleExecuteWorkflow(selectedWorkflow)}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
                >
                  {isExecuting ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      Executing Runbook...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Trigger Runbook Now
                    </>
                  )}
                </button>
              </div>

              <CodeViewer
                code={selectedWorkflow.scriptContent}
                language={selectedWorkflow.type.toLowerCase()}
                title={`${selectedWorkflow.type} Runbook Source Code`}
              />

              {executionLog && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                  {executionLog}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Server Provisioning */}
      {activeTab === "provisioning" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Automated Operating System Provisioning Blueprints
                </h3>
                <p className="text-xs text-slate-400">
                  Standardized declarative deployment profiles for Linux Cloud-init, RHEL Kickstart, and Windows Sysprep.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setProvisioningType("cloud_init")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    provisioningType === "cloud_init"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  Cloud-Init (Ubuntu / Debian)
                </button>
                <button
                  onClick={() => setProvisioningType("kickstart")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    provisioningType === "kickstart"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  Kickstart (RHEL / Rocky)
                </button>
                <button
                  onClick={() => setProvisioningType("sysprep")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    provisioningType === "sysprep"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  Sysprep (Windows Server)
                </button>
              </div>
            </div>

            {provisioningType === "cloud_init" && (
              <CodeViewer
                code={cloudInitCode}
                language="yaml"
                title="user-data (Cloud-Init YAML)"
              />
            )}
            {provisioningType === "kickstart" && (
              <CodeViewer
                code={kickstartCode}
                language="bash"
                title="ks.cfg (Red Hat Enterprise Linux Kickstart)"
              />
            )}
            {provisioningType === "sysprep" && (
              <CodeViewer
                code={sysprepCode}
                language="xml"
                title="unattend.xml (Windows Server Sysprep)"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Multi-Engine Script Generator */}
      {activeTab === "multi_engine" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Multi-Language Infrastructure Script Studio (Gemini 3.5 Flash)
            </h3>
            <p className="text-xs text-slate-400">
              Generate administrative scripts in PowerShell, Bash, or Python with built-in validation checks, logging, and error handling.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={engineType}
                onChange={(e) => setEngineType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-cyan-300"
              >
                <option value="PowerShell">PowerShell 7+</option>
                <option value="Bash">Enterprise Bash (Linux)</option>
                <option value="Python">Python 3 (Infrastructure Automation)</option>
              </select>

              <input
                type="text"
                value={engineGoal}
                onChange={(e) => setEngineGoal(e.target.value)}
                placeholder="e.g. Query VMware cluster VMs with snapshots older than 3 days, export CSV, and send alert..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={handleGenerateEngineScript}
                disabled={isGenerating || !engineGoal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shrink-0"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Synthesize Script
                  </>
                )}
              </button>
            </div>

            {generatedScript && (
              <CodeViewer
                code={generatedScript}
                language={engineType.toLowerCase()}
                title={`${engineType} Automation Script`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
