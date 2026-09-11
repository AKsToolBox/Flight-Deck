import React, { useState } from "react";
import {
  Boxes,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  Play,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { initialVMwareClusters, initialVMs } from "../../data/mockInfrastructure";
import { VMwareCluster, VirtualMachine } from "../../types";

interface VirtualizationSuiteProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const VirtualizationSuite: React.FC<VirtualizationSuiteProps> = ({ onAskCopilot }) => {
  const [activeTab, setActiveTab] = useState<"clusters" | "vms" | "provisioning" | "optimization">("clusters");
  const [clusters] = useState<VMwareCluster[]>(initialVMwareClusters);
  const [vms, setVms] = useState<VirtualMachine[]>(initialVMs);
  const [selectedVm, setSelectedVm] = useState<VirtualMachine>(initialVMs[1]); // The degraded one
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // VM Provisioning Wizard State
  const [newVmName, setNewVmName] = useState("PRD-APP-NODE05");
  const [newVmCluster, setNewVmCluster] = useState("PRD-COMPUTE-CLUSTER-01");
  const [newVmOS, setNewVmOS] = useState("Red Hat Enterprise Linux 9 (64-bit)");
  const [newVmVcpu, setNewVmVcpu] = useState(8);
  const [newVmRam, setNewVmRam] = useState(32);
  const [newVmDisk, setNewVmDisk] = useState(150);
  const [newVmDiskType, setNewVmDiskType] = useState<"Thin" | "Thick (Eager Zeroed)">("Thin");

  const handleCreateVM = (e: React.FormEvent) => {
    e.preventDefault();
    const created: VirtualMachine = {
      id: `vm-${Date.now()}`,
      name: newVmName,
      guestOS: newVmOS,
      cluster: newVmCluster,
      host: "esxi-node02.corp",
      vCpu: newVmVcpu,
      vRamGb: newVmRam,
      storageGb: newVmDisk,
      powerState: "Powered On",
      cpuReadyPct: 0.8,
      balloonMemoryMb: 0,
      snapshotCount: 0,
      toolsStatus: "Running (Current)",
    };
    setVms((prev) => [created, ...prev]);
    setActionNotice(`VM ${created.name} provisioned successfully in cluster ${created.cluster} via vCenter API.`);
    setTimeout(() => setActionNotice(null), 3500);
    setActiveTab("vms");
  };

  const handleConsolidateSnapshots = (vmId: string) => {
    setVms((prev) =>
      prev.map((v) => (v.id === vmId ? { ...v, snapshotCount: 0 } : v))
    );
    setActionNotice(`Consolidated snapshots for ${selectedVm.name}. Reclaimed 48.6 GB datastore space.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "clusters", label: "vSphere Clusters & Datastores", icon: Boxes },
          { id: "vms", label: "Virtual Machine Inventory", icon: Activity },
          { id: "provisioning", label: "VM Provisioning Wizard", icon: Layers },
          { id: "optimization", label: "Performance Tuning & CPU Ready", icon: Cpu },
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

      {/* TAB 1: Clusters & Datastores */}
      {activeTab === "clusters" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clusters.map((cls) => {
              const cpuPct = Math.round((cls.cpuUsedGhz / cls.cpuCapacityGhz) * 100);
              const ramPct = Math.round((cls.ramUsedGb / cls.ramCapacityGb) * 100);
              return (
                <div
                  key={cls.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{cls.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{cls.vCenter}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      HA {cls.haStatus} | DRS {cls.drsStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[11px] block">Compute Nodes</span>
                      <span className="text-base font-bold text-white">{cls.hostsCount} ESXi Hosts</span>
                    </div>
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[11px] block">Virtual Machines</span>
                      <span className="text-base font-bold text-white">{cls.vmsCount} Active VMs</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Cluster CPU Capacity</span>
                        <span className="text-white font-mono">
                          {cls.cpuUsedGhz} GHz / {cls.cpuCapacityGhz} GHz ({cpuPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cpuPct > 80 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${cpuPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Cluster RAM Allocation</span>
                        <span className="text-white font-mono">
                          {cls.ramUsedGb} GB / {cls.ramCapacityGb} GB ({ramPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ramPct > 80 ? "bg-amber-500" : "bg-cyan-500"}`}
                          style={{ width: `${ramPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VM Inventory */}
      {activeTab === "vms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                Virtual Machines Fleet
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">VM Name</th>
                      <th className="p-3">Guest OS</th>
                      <th className="p-3">vCPU / vRAM</th>
                      <th className="p-3">CPU Ready %</th>
                      <th className="p-3 text-right">Ballooning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {vms.map((vm) => {
                      const isHighReady = vm.cpuReadyPct > 5.0;
                      return (
                        <tr
                          key={vm.id}
                          onClick={() => setSelectedVm(vm)}
                          className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            selectedVm.id === vm.id ? "bg-slate-800/70" : ""
                          }`}
                        >
                          <td className="p-3 font-semibold text-white font-mono">{vm.name}</td>
                          <td className="p-3 text-slate-300">{vm.guestOS}</td>
                          <td className="p-3 font-mono text-slate-400">
                            {vm.vCpu} vCPU / {vm.vRamGb} GB
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isHighReady
                                  ? "bg-red-950 text-red-300 border border-red-800 animate-pulse"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {vm.cpuReadyPct}%
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono">
                            {vm.balloonMemoryMb > 0 ? (
                              <span className="text-amber-400 font-bold">{vm.balloonMemoryMb} MB</span>
                            ) : (
                              <span className="text-slate-500">0 MB</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* VM Inspector & Optimization actions */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white font-mono">{selectedVm.name}</h4>
                <p className="text-xs text-slate-400">{selectedVm.guestOS}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Host: {selectedVm.host} | Cluster: {selectedVm.cluster}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">VMware Tools:</span>
                  <span className="text-emerald-400 font-medium">{selectedVm.toolsStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Disk Provisioned:</span>
                  <span className="text-white font-mono">{selectedVm.storageGb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Snapshots:</span>
                  <span className={selectedVm.snapshotCount > 1 ? "text-amber-400 font-bold" : "text-slate-300"}>
                    {selectedVm.snapshotCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CPU Ready %:</span>
                  <span
                    className={
                      selectedVm.cpuReadyPct > 5.0 ? "text-red-400 font-bold font-mono" : "text-slate-300 font-mono"
                    }
                  >
                    {selectedVm.cpuReadyPct}% (Threshold: 5.0%)
                  </span>
                </div>
              </div>

              {selectedVm.snapshotCount > 0 && (
                <button
                  onClick={() => handleConsolidateSnapshots(selectedVm.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Consolidate Abandoned Snapshots
                </button>
              )}

              <button
                onClick={() =>
                  onAskCopilot(
                    `Analyze high CPU ready (${selectedVm.cpuReadyPct}%) and memory ballooning (${selectedVm.balloonMemoryMb} MB) on VM ${selectedVm.name} running on host ${selectedVm.host}. Recommend DRS rules or rightsizing.`,
                    "virtualization",
                    true
                  )
                }
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze VM Contention with Copilot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VM Provisioning Wizard */}
      {activeTab === "provisioning" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              VMware vSphere Virtual Machine Provisioning Wizard
            </h3>
            <p className="text-xs text-slate-400">
              Deploy virtual machines from certified enterprise golden templates with automated guest customization specifications.
            </p>

            <form onSubmit={handleCreateVM} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">VM Name (FQDN hostname):</label>
                  <input
                    type="text"
                    value={newVmName}
                    onChange={(e) => setNewVmName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Cluster:</label>
                  <select
                    value={newVmCluster}
                    onChange={(e) => setNewVmCluster(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="PRD-COMPUTE-CLUSTER-01">PRD-COMPUTE-CLUSTER-01</option>
                    <option value="PRD-DATABASE-VSAN-CLUSTER-02">PRD-DATABASE-VSAN-CLUSTER-02</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Guest Operating System:</label>
                  <select
                    value={newVmOS}
                    onChange={(e) => setNewVmOS(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Red Hat Enterprise Linux 9 (64-bit)">RHEL 9 (Golden Image)</option>
                    <option value="Ubuntu Linux 24.04 (64-bit)">Ubuntu 24.04 LTS</option>
                    <option value="Windows Server 2022 Datacenter">Windows Server 2022 Datacenter</option>
                    <option value="Windows Server 2025 Standard">Windows Server 2025 Standard</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Disk Provisioning Policy:</label>
                  <select
                    value={newVmDiskType}
                    onChange={(e) => setNewVmDiskType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Thin">Thin Provision (Space Saving)</option>
                    <option value="Thick (Eager Zeroed)">Thick Provision Eager Zeroed (Max Performance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">vCPU Count:</label>
                  <input
                    type="number"
                    min="1"
                    max="64"
                    value={newVmVcpu}
                    onChange={(e) => setNewVmVcpu(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">vRAM (GB):</label>
                  <input
                    type="number"
                    min="4"
                    max="512"
                    value={newVmRam}
                    onChange={(e) => setNewVmRam(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Disk Size (GB):</label>
                  <input
                    type="number"
                    min="50"
                    max="4000"
                    value={newVmDisk}
                    onChange={(e) => setNewVmDisk(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Deploy Virtual Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: Performance & CPU Ready Tuning */}
      {activeTab === "optimization" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              VMware Performance Contention &amp; CPU Ready Tuning
            </h3>
            <p className="text-xs text-slate-400">
              Diagnostic guide for identifying CPU overcommitment (%RDY &gt; 5%), hypervisor ballooning, and NUMA node alignment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-xs">Understanding %RDY (CPU Ready Time)</h4>
                <p className="text-slate-300 leading-relaxed">
                  %RDY represents the percentage of time a virtual machine was ready to execute instructions on a physical CPU core but had to wait in the ESXi scheduler queue due to CPU oversubscription.
                </p>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-amber-300">
                  Optimal: &lt; 2% | Warning: 2% - 5% | Critical: &gt; 5%
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-xs">Recommended Remediation Action Plan</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Downsize over-allocated VMs: Reduce vCPU count from 8 to 4 to reduce co-scheduling latency.</li>
                  <li>Enable Distributed Resource Scheduler (DRS) aggressive balancing.</li>
                  <li>Verify NUMA node boundaries (avoid vCPUs exceeding physical socket core count).</li>
                  <li>Configure Memory Reservations to disable balloon driver reclamation.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
