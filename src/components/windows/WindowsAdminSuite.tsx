import React, { useState } from "react";
import {
  Users,
  Shield,
  Key,
  Database,
  Network,
  Activity,
  Calendar,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  initialADUsers,
  initialADGroups,
  initialEntraSync,
  initialGPOs,
  initialDNSRecords,
  initialDHCPOptions,
  initialEventLogs,
} from "../../data/mockInfrastructure";
import { ADUser, DNSRecord } from "../../types";
import { CodeViewer } from "../common/CodeViewer";

interface WindowsAdminSuiteProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const WindowsAdminSuite: React.FC<WindowsAdminSuiteProps> = ({ onAskCopilot }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "ad" | "entra" | "gpo" | "powershell" | "dns_dhcp" | "tuning" | "events" | "patch"
  >("ad");

  // AD State
  const [users, setUsers] = useState<ADUser[]>(initialADUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<ADUser | null>(initialADUsers[0]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // DNS State
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>(initialDNSRecords);
  const [newDnsName, setNewDnsName] = useState("");
  const [newDnsType, setNewDnsType] = useState<"A" | "CNAME" | "MX">("A");
  const [newDnsData, setNewDnsData] = useState("");

  // RSOP Simulator state
  const [rsopTargetUser, setRsopTargetUser] = useState("akarim");
  const [rsopTargetComputer, setRsopTargetComputer] = useState("DC01.corp.contoso.internal");
  const [rsopResult, setRsopResult] = useState<string | null>(null);

  // WinRM diagnostic state
  const [winrmHost, setWinrmHost] = useState("WIN-PRD-SQL01.corp.contoso.internal");
  const [winrmOutput, setWinrmOutput] = useState<string | null>(null);
  const [isTestingWinRM, setIsTestingWinRM] = useState(false);

  // AI Script Generator within Windows Suite
  const [psPrompt, setPsPrompt] = useState("");
  const [generatedPsScript, setGeneratedPsScript] = useState<string | null>(null);
  const [isGeneratingPs, setIsGeneratingPs] = useState(false);

  const handleUnlockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, lockedOut: false } : u))
    );
    setActionNotice(`Account unlocked successfully via Active Directory Domain Controller.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleResetPassword = (username: string) => {
    setActionNotice(`Generated temporary Kerberos password reset ticket for ${username}. User must change at next logon.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAddDns = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDnsName || !newDnsData) return;
    const rec: DNSRecord = {
      id: `dns-${Date.now()}`,
      zone: "corp.contoso.internal",
      name: newDnsName,
      type: newDnsType,
      data: newDnsData,
      ttl: 3600,
      timestamp: "Dynamic",
    };
    setDnsRecords((prev) => [rec, ...prev]);
    setNewDnsName("");
    setNewDnsData("");
    setActionNotice(`Dynamic DNS record created: ${rec.name}.${rec.zone} -> ${rec.data}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleRunRSOP = () => {
    setRsopResult(`Resultant Set of Policy (RSoP) Evaluation Report:
Target Computer: ${rsopTargetComputer}
Target User: ${rsopTargetUser}
Applied GPOs (in order of precedence):
 1. SEC-WinServer-CIS-Hardening-L1 (Enforced = True, Version: v18.4)
    - Computer / Windows Settings / Security / Local Policies: SMBv1 Disabled, SMB Signing Mandatory
    - Computer / Administrative Templates / System / WinRM: AllowUnencryptedTraffic = Disabled
 2. Default Domain Controllers Policy (Enforced = True, Version: v42.12)
    - Computer / Security / Kerberos Policy: Max Clock Skew = 5 Minutes
 3. NET-DNS-DHCP-Failover-ClientConfig (Enforced = False)
    - Computer / Network / DNS Client: Primary DNS Suffix = corp.contoso.internal
WMI Filters Evaluated: WMI-Filter-WindowsServer2022-2025 (Matched: TRUE)
Result: 0 GPO conflicts detected. Precedence enforced cleanly.`);
  };

  const handleTestWinRM = () => {
    setIsTestingWinRM(true);
    setWinrmOutput(null);
    setTimeout(() => {
      setIsTestingWinRM(false);
      setWinrmOutput(`Test-WSMan -ComputerName ${winrmHost}
wsmid            : http://schemas.dmtf.org/wbem/wsman/identity/1/wsmanidentity.xsd
ProtocolVersion  : OS: 10.0.20348 SP: 0.0 Stack: 3.0
ProductVendor    : Microsoft Corporation
ProductVersion   : Microsoft Windows Server 2022 Datacenter
WinRM Connectivity: OK (Port 5986 HTTPS with Kerberos mutual auth). Latency: 1.4ms`);
    }, 900);
  };

  const handleGenerateCustomPs = async () => {
    if (!psPrompt) return;
    setIsGeneratingPs(true);
    setGeneratedPsScript(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptType: "PowerShell",
          objective: psPrompt,
          targetEnvironment: "Windows Server 2022/2025 Active Directory",
          includeSafetyChecks: true,
        }),
      });
      const data = await res.json();
      setGeneratedPsScript(data.script || "# Failed to generate script.");
    } catch (err: any) {
      setGeneratedPsScript(`# Error generating script: ${err.message}`);
    } finally {
      setIsGeneratingPs(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.samAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Subnav Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "ad", label: "Active Directory DS", icon: Users },
          { id: "entra", label: "Entra ID (Azure AD)", icon: Shield },
          { id: "gpo", label: "Group Policy (GPO/RSoP)", icon: Key },
          { id: "powershell", label: "PowerShell Workbench", icon: Sparkles },
          { id: "dns_dhcp", label: "DNS & DHCP IPAM", icon: Network },
          { id: "tuning", label: "Performance Tuning", icon: Activity },
          { id: "events", label: "Event Viewer Logs", icon: AlertCircle },
          { id: "patch", label: "Patch & WSUS Lifecycle", icon: Calendar },
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

      {/* Global Notification Banner */}
      {actionNotice && (
        <div className="flex items-center gap-2 p-3 bg-blue-950/80 border border-blue-800 text-blue-200 text-xs rounded-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* SUB-TAB 1: Active Directory */}
      {activeSubTab === "ad" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Active Directory Domain Services - Directory Objects
                  </h3>
                  <p className="text-xs text-slate-400">
                    Domain: corp.contoso.internal | Forest Mode: Windows Server 2025
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by name, UPN, dept..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-60 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() =>
                      onAskCopilot(
                        "Analyze Active Directory replication health, stale accounts, and password policy recommendations.",
                        "windows_admin"
                      )
                    }
                    className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs shrink-0"
                    title="Audit AD with Gemini"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Users table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-lg">User / SamAccount</th>
                      <th className="p-3">Department &amp; Title</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Pwd Set</th>
                      <th className="p-3 rounded-r-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          selectedUser?.id === user.id ? "bg-slate-800/70" : ""
                        }`}
                      >
                        <td className="p-3">
                          <p className="font-semibold text-white">{user.displayName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {user.samAccountName} ({user.userPrincipalName})
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-300">{user.title}</p>
                          <p className="text-[11px] text-slate-400">{user.department}</p>
                        </td>
                        <td className="p-3">
                          {user.lockedOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-900/40 text-red-300 border border-red-800">
                              <Lock className="w-2.5 h-2.5" /> Locked Out
                            </span>
                          ) : user.enabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-900/30 text-emerald-300 border border-emerald-800/80">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {user.passwordLastSet}
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {user.lockedOut && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlockUser(user.id);
                              }}
                              className="px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded text-[11px] font-medium transition-colors"
                            >
                              <Unlock className="w-3 h-3 inline mr-1" />
                              Unlock
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetPassword(user.samAccountName);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] transition-colors"
                          >
                            Reset Pwd
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AD Security Groups Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Privileged &amp; Tiered Security Groups
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {initialADGroups.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-xs">{grp.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800">
                        {grp.memberCount} members
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{grp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Details Inspector */}
          <div className="space-y-4">
            {selectedUser ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 sticky top-20">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{selectedUser.displayName}</h4>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      ID: {selectedUser.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedUser.userPrincipalName}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Organizational Unit &amp; Dept:</span>
                    <span className="text-slate-200 font-medium">{selectedUser.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Domain Logon:</span>
                    <span className="text-slate-200 font-mono">{selectedUser.lastLogon}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kerberos Group Memberships:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedUser.memberOf.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 bg-slate-800 text-blue-300 rounded text-[11px] border border-slate-700 font-mono"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-300 uppercase">PowerShell Equivalent</p>
                  <pre className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-cyan-300 overflow-x-auto">
{`Get-ADUser -Identity "${selectedUser.samAccountName}" -Properties * | 
Select-Object DisplayName, LockedOut, PasswordLastSet, MemberOf`}
                  </pre>
                  <button
                    onClick={() =>
                      onAskCopilot(
                        `Generate an advanced PowerShell script to audit group membership history and login anomalies for user '${selectedUser.samAccountName}'.`,
                        "windows_admin"
                      )
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask Copilot to Audit Permissions
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
                Select an Active Directory user to inspect attributes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Entra ID (Azure AD) Sync */}
      {activeSubTab === "entra" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Microsoft Entra Connect Sync</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-xl font-bold text-white mt-1">Delta Sync Active</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Last cycle: 4 mins ago (0 errors)</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">MFA Enforced Percentage</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">100% Phishing-Resistant</p>
              <p className="text-[11px] text-slate-400 mt-0.5">FIDO2 &amp; Certificate-Based Auth</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Privileged Identity Mgmt (PIM)</span>
                <Key className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">3 Active Roles</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero standing domain privileges</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Hybrid Identity Synchronization &amp; Conditional Access Status
              </h3>
              <button
                onClick={() =>
                  onAskCopilot(
                    "Explain best practices for setting up Microsoft Entra Cloud Sync, PIM role eligibility, and Conditional Access zero-trust policies for domain admins.",
                    "windows_admin"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Copilot Entra Hardening Guide
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">User Principal Name (UPN)</th>
                    <th className="p-3">Sync State</th>
                    <th className="p-3">MFA Registration</th>
                    <th className="p-3">Conditional Access Policy</th>
                    <th className="p-3">Eligible PIM Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {initialEntraSync.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white font-mono">{item.upn}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                          {item.syncStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">{item.mfaState}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.conditionalAccessState === "Compliant"
                              ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800"
                              : "bg-amber-900/30 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {item.conditionalAccessState}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {item.pimRoles.map((role) => (
                            <span
                              key={role}
                              className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 text-[10px]"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Group Policy & RSoP Simulator */}
      {activeSubTab === "gpo" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Active Group Policy Objects (GPO Inventory &amp; Precedence)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Centralized policy configuration applied across OUs, domain controllers, and member servers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialGPOs.map((gpo) => (
                <div
                  key={gpo.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-white">{gpo.name}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        gpo.status === "Enabled"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {gpo.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{gpo.description}</p>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5 pt-1 border-t border-slate-800/80">
                    <p>Linked OU: {gpo.linkedOU}</p>
                    <p>Enforced: {gpo.enforced ? "Yes (No-Override)" : "No"} | Version: {gpo.version}</p>
                    {gpo.wmiFilter && <p className="text-cyan-400">WMI Filter: {gpo.wmiFilter}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RSoP Simulation Tool */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Resultant Set of Policy (RSoP) Interactive Evaluator
                </h4>
                <p className="text-xs text-slate-400">
                  Simulate policy application order, inheritance blocking, and WMI filter resolution.
                </p>
              </div>
              <button
                onClick={handleRunRSOP}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run RSoP Diagnostic
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Target Computer FQDN:
                </label>
                <input
                  type="text"
                  value={rsopTargetComputer}
                  onChange={(e) => setRsopTargetComputer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Target User Account:
                </label>
                <input
                  type="text"
                  value={rsopTargetUser}
                  onChange={(e) => setRsopTargetUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            {rsopResult && (
              <CodeViewer
                code={rsopResult}
                language="powershell"
                title="RSoP Execution Simulation Output"
                showExecute={false}
              />
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PowerShell Workbench & AI Generator */}
      {activeSubTab === "powershell" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              PowerShell AI Script Generator &amp; Enterprise Cmdlet Library
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Generate production-grade PowerShell 7+ scripts with parameter validation, `$ErrorActionPreference = 'Stop'`, and `-WhatIf` dry-run safeguards.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={psPrompt}
                onChange={(e) => setPsPrompt(e.target.value)}
                placeholder="e.g. Audit all AD accounts inactive for 90 days, export to CSV, and disable them..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleGenerateCustomPs}
                disabled={isGeneratingPs || !psPrompt}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                {isGeneratingPs ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Script
                  </>
                )}
              </button>
            </div>

            {generatedPsScript && (
              <CodeViewer
                code={generatedPsScript}
                language="powershell"
                title={`AI Generated Script: ${psPrompt}`}
              />
            )}
          </div>

          {/* Curated Enterprise PowerShell Cmdlet Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>Active Directory Password Age Audit</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-blue-300">AD DS</span>
              </h4>
              <CodeViewer
                code={`# Search for accounts with passwords older than 90 days
Get-ADUser -Filter {Enabled -eq $true -and PasswordNeverExpires -eq $false} \`
  -Properties "DisplayName", "msDS-UserPasswordExpiryTimeComputed", "PasswordLastSet" |
  Select-Object DisplayName, PasswordLastSet, \`
  @{Name="DaysSinceReset"; Expression={((Get-Date) - $_.PasswordLastSet).Days}} |
  Where-Object {$_.DaysSinceReset -gt 90} |
  Sort-Object DaysSinceReset -Descending`}
                language="powershell"
                title="Audit Stale Password Age"
              />
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>WinRM / Remote WMI Health Diagnostic</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-blue-300">Diagnostics</span>
              </h4>
              <CodeViewer
                code={`# Validate Kerberos delegation & remote session
$cred = Get-Credential
Invoke-Command -ComputerName "WIN-PRD-SQL01.corp.contoso.internal" -ScriptBlock {
    Get-Service -Name "MSSQLSERVER", "WinRM", "LanmanServer" |
    Select-Object Name, Status, StartType
} -Credential $cred`}
                language="powershell"
                title="Remote WinRM Service Query"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DNS & DHCP IPAM */}
      {activeSubTab === "dns_dhcp" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DNS Manager */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  DNS Server Management (Zone: corp.contoso.internal)
                </h3>
                <p className="text-xs text-slate-400">
                  Primary Dynamic DNS Server: DC01.corp (Aging &amp; Scavenging Enabled)
                </p>
              </div>
              <button
                onClick={() => {
                  setActionNotice("Flushed local DNS resolver cache on all domain controllers.");
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
              >
                Flush DNS Cache
              </button>
            </div>

            {/* Add Record Form */}
            <form onSubmit={handleAddDns} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-wrap gap-2 text-xs">
              <input
                type="text"
                placeholder="Record name (e.g. app03)"
                value={newDnsName}
                onChange={(e) => setNewDnsName(e.target.value)}
                className="flex-1 min-w-[120px] bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
              <select
                value={newDnsType}
                onChange={(e) => setNewDnsType(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                <option value="A">A</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX</option>
              </select>
              <input
                type="text"
                placeholder="Target IP / Hostname"
                value={newDnsData}
                onChange={(e) => setNewDnsData(e.target.value)}
                className="flex-1 min-w-[140px] bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors"
              >
                + Add Record
              </button>
            </form>

            {/* Records List */}
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Data / Target</th>
                    <th className="p-2.5">TTL</th>
                    <th className="p-2.5">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {dnsRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-white font-semibold">{rec.name}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] border border-blue-800">
                          {rec.type}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-300">{rec.data}</td>
                      <td className="p-2.5 font-mono text-slate-400">{rec.ttl}s</td>
                      <td className="p-2.5 text-slate-400 text-[11px]">{rec.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DHCP Scopes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  DHCP Scopes &amp; Lease Allocation
                </h3>
                <p className="text-xs text-slate-400">
                  Failover Mode: Hot Standby (DC01 / DC02 Sync)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {initialDHCPOptions.map((scope) => {
                const util = Math.round((scope.activeLeases / scope.totalAddresses) * 100);
                return (
                  <div
                    key={scope.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white text-xs">{scope.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono ml-2">
                          ({scope.scopeId} / {scope.subnetMask})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          scope.state === "Exhausted"
                            ? "bg-red-900/40 text-red-300 border border-red-800 animate-pulse"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {scope.state} ({util}% utilized)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          util > 90 ? "bg-red-500" : util > 70 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${util}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                      <span>Range: {scope.startRange} - {scope.endRange}</span>
                      <span>{scope.activeLeases} of {scope.totalAddresses} leased</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: Server Performance Tuning */}
      {activeSubTab === "tuning" && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Windows Server Performance Tuning Best Practices
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enterprise kernel, storage queue depth, and TCP chimney optimization for Windows Server 2022/2025.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-blue-300">Network: Receive Side Scaling (RSS) &amp; Chimney</h4>
                <p className="text-xs text-slate-300">
                  Spreads network packet processing across multiple logical CPUs to avoid CPU0 bottlenecking.
                </p>
                <CodeViewer
                  code={`# Enable RSS on 10GbE / 25GbE adapters
Enable-NetAdapterRss -Name "vSwitch_Prod_10G"
Set-NetOffloadGlobalSetting -ReceiveSideScaling Enabled
# Check current distribution:
Get-NetAdapterRss`}
                  language="powershell"
                  title="Enable RSS NetAdapter"
                />
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-blue-300">Storage: NTFS 8.3 Name Creation &amp; Disk Queue</h4>
                <p className="text-xs text-slate-300">
                  Disabling legacy 8.3 short names boosts NTFS metadata throughput by up to 25% under heavy write loads.
                </p>
                <CodeViewer
                  code={`# Disable 8.3 filename creation on all NTFS volumes
fsutil behavior set disable8dot3 1
# Optimize memory cache for file server workloads
fsutil behavior set memoryusage 2`}
                  language="powershell"
                  title="Optimize NTFS Metadata Throughput"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: Event Viewer & WinRM Diagnostics */}
      {activeSubTab === "events" && (
        <div className="space-y-6">
          {/* WinRM Remote Test Box */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Live WinRM / WS-Man Remote Connectivity Probe
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Port 5985/5986 HTTPS</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={winrmHost}
                onChange={(e) => setWinrmHost(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
              <button
                onClick={handleTestWinRM}
                disabled={isTestingWinRM}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
              >
                {isTestingWinRM ? "Probing..." : "Test-WSMan"}
              </button>
            </div>
            {winrmOutput && (
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                {winrmOutput}
              </pre>
            )}
          </div>

          {/* Event Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Windows Event Viewer Live Feed (System / Security / Application)
                </h3>
                <p className="text-xs text-slate-400">
                  Centralized Windows Server Event Forwarding (WEF) subscription stream.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskCopilot(
                    "Analyze Windows Event ID 41 Kernel-Power crash and Event ID 1000 Application Error in detail with root cause analysis.",
                    "incident_commander",
                    true
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Events with High Thinking
              </button>
            </div>

            <div className="space-y-3">
              {initialEventLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    log.level === "Critical"
                      ? "bg-red-950/40 border-red-800/80 text-red-200"
                      : log.level === "Error"
                      ? "bg-rose-950/30 border-rose-800/70 text-rose-200"
                      : log.level === "Warning"
                      ? "bg-amber-950/30 border-amber-800/70 text-amber-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.level === "Critical"
                            ? "bg-red-900 text-white"
                            : log.level === "Error"
                            ? "bg-rose-900 text-white"
                            : log.level === "Warning"
                            ? "bg-amber-900 text-white"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="font-semibold text-white">Event ID: {log.eventId}</span>
                      <span className="text-slate-400 font-mono">[{log.source}]</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {log.timeGenerated} | {log.computer}
                    </span>
                  </div>
                  <p className="font-mono text-slate-300 text-[11px] leading-relaxed">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: Patch & Lifecycle Management */}
      {activeSubTab === "patch" && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Windows Server Patch Rings &amp; End of Support (EOS / EOL) Tracker
            </h3>
            <p className="text-xs text-slate-400">
              WSUS / Azure Update Manager ring management and legacy OS sunset mitigation plan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-emerald-400">Windows Server 2025</span>
                <p className="text-xs text-slate-300 mt-1">General Availability (Mainstream)</p>
                <p className="text-[11px] text-slate-400 font-mono mt-2">End of Support: Oct 2034</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] rounded border border-emerald-800">
                  Tier-0 Primary Deployment
                </span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-blue-400">Windows Server 2022</span>
                <p className="text-xs text-slate-300 mt-1">Mainstream Support</p>
                <p className="text-[11px] text-slate-400 font-mono mt-2">End of Support: Oct 2031</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-950 text-blue-300 text-[10px] rounded border border-blue-800">
                  92% Patch Compliance
                </span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-amber-400">Windows Server 2019</span>
                <p className="text-xs text-slate-300 mt-1">Extended Support Phase</p>
                <p className="text-[11px] text-slate-400 font-mono mt-2">End of Support: Jan 2029</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-amber-950 text-amber-300 text-[10px] rounded border border-amber-800">
                  Migration Scheduled Q4
                </span>
              </div>

              <div className="p-4 bg-slate-950 border border-red-900/60 rounded-xl">
                <span className="text-xs font-bold text-red-400">Windows Server 2012 / R2</span>
                <p className="text-xs text-slate-300 mt-1">END OF LIFE (ESU Expired)</p>
                <p className="text-[11px] text-red-400 font-mono mt-2">EOL: Oct 10, 2023</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-red-950 text-red-300 text-[10px] rounded border border-red-800 font-bold">
                  0 Instances (Clean Sunset)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
