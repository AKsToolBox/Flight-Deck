import React, { useState } from "react";
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  FileCode,
  Sparkles,
  Play,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { initialChefNodes, initialChefCookbooks } from "../../data/mockInfrastructure";
import { ChefNode, ChefCookbook } from "../../types";
import { CodeViewer } from "../common/CodeViewer";

interface ConfigSuiteProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const ConfigManagementSuite: React.FC<ConfigSuiteProps> = ({ onAskCopilot }) => {
  const [activeTab, setActiveTab] = useState<"nodes" | "cookbooks" | "inspec">("nodes");
  const [nodes, setNodes] = useState<ChefNode[]>(initialChefNodes);
  const [cookbooks] = useState<ChefCookbook[]>(initialChefCookbooks);
  const [selectedCookbook, setSelectedCookbook] = useState<ChefCookbook>(initialChefCookbooks[0]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // InSpec Scan Simulator
  const [isScanning, setIsScanning] = useState(false);
  const [inspecResult, setInspecResult] = useState<string | null>(null);

  const handleRunClient = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              status: "Compliant",
              lastCheckin: "Just now",
              driftDetected: false,
              convergenceTime: "12s",
            }
          : n
      )
    );
    setActionNotice(`chef-client converged node ${nodeId}. State synchronized with policyfile.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleRunInSpec = () => {
    setIsScanning(true);
    setInspecResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setInspecResult(`Profile: CIS Microsoft Windows Server 2022 Benchmark v2.0.0
Node: DC01.corp.contoso.internal

✔  cis-1.1.1: Ensure 'Enforce password history' is set to '24 or more password(s)'
✔  cis-1.1.2: Ensure 'Maximum password age' is set to '60 or fewer days'
✔  cis-2.3.1.1: Ensure 'Accounts: Administrator account status' is set to 'Disabled'
✔  cis-2.3.7.1: Ensure 'Domain member: Digitally encrypt or sign secure channel data' is 'Enabled'
✔  cis-9.3.1: Ensure 'Windows Firewall: Domain: Firewall state' is set to 'On'
⚠  cis-18.9.16.1: Ensure 'Allow Basic authentication' for WinRM is set to 'Disabled' (Remediated by chef-client)

Test Summary: 114 successful, 0 failures, 1 remediated in 4.21s.`);
    }, 1100);
  };

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "nodes", label: "Chef Managed Fleet & Nodes", icon: ShieldCheck },
          { id: "cookbooks", label: "Cookbooks & Policyfiles", icon: FileCode },
          { id: "inspec", label: "Chef InSpec Compliance Scanner", icon: Play },
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

      {actionNotice && (
        <div className="flex items-center gap-2 p-3 bg-blue-950/80 border border-blue-800 text-blue-200 text-xs rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TAB 1: Chef Nodes */}
      {activeTab === "nodes" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Configuration Management Fleet (Chef Enterprise Server 18)
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous configuration state enforcement, drift detection, and automated compliance remediation.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskCopilot(
                    "Explain how to configure Chef Policyfiles with immutable version pinning to enforce Zero-Drift across Windows Server and Linux production fleets.",
                    "cloud_iac"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Zero-Drift Architecture Guide
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Node FQDN</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Policy Group &amp; Name</th>
                    <th className="p-3">Last Converge</th>
                    <th className="p-3">Compliance State</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{node.name}</td>
                      <td className="p-3 text-slate-300">{node.platform}</td>
                      <td className="p-3 font-mono text-slate-400">
                        {node.policyGroup} / {node.policyName}
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {node.lastCheckin} ({node.convergenceTime})
                      </td>
                      <td className="p-3">
                        {node.driftDetected ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                            Configuration Drift
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            Converged
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRunClient(node.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium"
                        >
                          Run chef-client
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cookbooks */}
      {activeTab === "cookbooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cookbook Catalog
            </h3>
            {cookbooks.map((cb) => (
              <div
                key={cb.id || cb.name}
                onClick={() => setSelectedCookbook(cb)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  (selectedCookbook.id || selectedCookbook.name) === (cb.id || cb.name)
                    ? "bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white font-mono">{cb.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    v{cb.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {cb.description || `Cookbook managing ${cb.recipes.join(", ")}`}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-2">
                  Applied to {cb.nodesApplied} nodes ({cb.complianceRate}% compliant)
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedCookbook.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedCookbook.description || `Recipes: ${selectedCookbook.recipes.join(", ")}`}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-blue-300 text-xs font-mono">
                  Cookbook v{selectedCookbook.version}
                </span>
              </div>

              <CodeViewer
                code={selectedCookbook.recipeCode || selectedCookbook.attributesSample}
                language="ruby"
                title="attributes / recipes configuration"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Chef InSpec Compliance */}
      {activeTab === "inspec" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  Chef InSpec Security &amp; Compliance Audit Scanner
                </h3>
                <p className="text-xs text-slate-400">
                  Execute automated CIS Benchmark profiles against target nodes without installing agents.
                </p>
              </div>
              <button
                onClick={handleRunInSpec}
                disabled={isScanning}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Scanning Profile...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Execute CIS Audit Scan
                  </>
                )}
              </button>
            </div>

            {inspecResult ? (
              <CodeViewer
                code={inspecResult}
                language="bash"
                title="Chef InSpec Audit Results"
                showExecute={false}
              />
            ) : (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
                Click &quot;Execute CIS Audit Scan&quot; to run an automated InSpec profile against DC01.corp.contoso.internal.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
