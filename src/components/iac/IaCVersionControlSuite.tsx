import React, { useState } from "react";
import {
  FileCode2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
  Shield,
  Layers,
} from "lucide-react";
import { initialIaCTemplates, initialGitBranches } from "../../data/mockInfrastructure";
import { IaCTemplate } from "../../types";
import { CodeViewer } from "../common/CodeViewer";

interface IaCSuiteProps {
  onAskCopilot: (prompt: string, role?: string, useThinking?: boolean) => void;
}

export const IaCVersionControlSuite: React.FC<IaCSuiteProps> = ({ onAskCopilot }) => {
  const [activeTab, setActiveTab] = useState<"iac" | "git" | "azure_devops">("iac");
  const [templates] = useState<IaCTemplate[]>(initialIaCTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<IaCTemplate>(initialIaCTemplates[0]);
  const [branches] = useState(initialGitBranches);

  // Azure DevOps Pipeline YAML
  const [pipelinePrompt, setPipelinePrompt] = useState("");
  const [pipelineYaml, setPipelineYaml] = useState<string | null>(null);
  const [isGeneratingPipeline, setIsGeneratingPipeline] = useState(false);

  const defaultPipelineYaml = `# Azure DevOps Multi-Stage Infrastructure Deployment Pipeline
# Standardized CI/CD for Terraform & VMware vSphere
trigger:
  branches:
    include:
      - main
      - release/*

variables:
  - group: Contoso-Infrastructure-Secrets
  - name: terraformVersion
    value: '1.7.5'

stages:
  - stage: LintAndValidate
    displayName: 'Lint, Format & InSpec Security Scan'
    jobs:
      - job: StaticAnalysis
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - script: |
              terraform fmt -check
              terraform init -backend=false
              terraform validate
            displayName: 'Terraform Validate'

  - stage: Plan
    displayName: 'Terraform Plan (Dry-Run)'
    dependsOn: LintAndValidate
    jobs:
      - job: GeneratePlan
        pool:
          name: 'Contoso-OnPrem-BuildPool'
        steps:
          - script: |
              terraform init
              terraform plan -out=tfplan.binary
            displayName: 'Generate Execution Plan'

  - stage: ApplyWithApproval
    displayName: 'Production Gate & Apply'
    dependsOn: Plan
    jobs:
      - deployment: DeployInfra
        environment: 'Production-Enterprise-Datacenter'
        strategy:
          runOnce:
            deploy:
              steps:
                - script: |
                    terraform apply -auto-approve tfplan.binary
                  displayName: 'Apply Infrastructure'`;

  const handleGeneratePipeline = async () => {
    if (!pipelinePrompt) return;
    setIsGeneratingPipeline(true);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptType: "Azure DevOps Pipeline YAML",
          objective: pipelinePrompt,
          targetEnvironment: "Azure DevOps / GitHub Actions",
          includeSafetyChecks: true,
        }),
      });
      const data = await res.json();
      setPipelineYaml(data.script || "# Failed to generate pipeline.");
    } catch (err: any) {
      setPipelineYaml(`# Error: ${err.message}`);
    } finally {
      setIsGeneratingPipeline(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "iac", label: "Infrastructure as Code (Terraform & Bicep)", icon: FileCode2 },
          { id: "git", label: "Git Branching & Version Control", icon: GitBranch },
          { id: "azure_devops", label: "Azure DevOps CI/CD Pipelines", icon: Layers },
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

      {/* TAB 1: IaC Blueprints */}
      {activeTab === "iac" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Standardized IaC Modules
            </h3>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplate.id === tpl.id
                    ? "bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    {tpl.framework}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {tpl.complianceStatus}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{tpl.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Platform: {tpl.targetPlatform}</p>
              </div>
            ))}

            <button
              onClick={() =>
                onAskCopilot(
                  `Perform an automated security & compliance audit on the following ${selectedTemplate.framework} code:\n\n${selectedTemplate.code}`,
                  "cloud_iac"
                )
              }
              className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Audit IaC with Copilot
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-cyan-400" />
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target: {selectedTemplate.targetPlatform} | Version: {selectedTemplate.version}
                  </p>
                </div>
              </div>

              <CodeViewer
                code={selectedTemplate.code}
                language={selectedTemplate.framework === "Terraform" ? "terraform" : "bicep"}
                title={`${selectedTemplate.framework} Configuration`}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Git Version Control */}
      {activeTab === "git" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  Git Repository Management (contoso-infrastructure-iac)
                </h3>
                <p className="text-xs text-slate-400">
                  Remote: https://dev.azure.com/contoso-enterprise/Infra/_git/iac-core
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 text-xs font-mono">
                Branch Policy: 2 Required Reviewers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Branch Name</th>
                    <th className="p-3">Latest Commit</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Last Updated</th>
                    <th className="p-3 text-right">Protection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {branches.map((b) => (
                    <tr key={b.name} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                        {b.name}
                        {b.isDefault && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                            default
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{b.lastCommit}</td>
                      <td className="p-3 text-slate-300">{b.author}</td>
                      <td className="p-3 font-mono text-slate-400">{b.updatedAt}</td>
                      <td className="p-3 text-right">
                        {b.protected ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                            Protected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            Feature
                          </span>
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

      {/* TAB 3: Azure DevOps Pipelines */}
      {activeTab === "azure_devops" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Azure DevOps Infrastructure CI/CD Pipeline Generator
            </h3>
            <p className="text-xs text-slate-400">
              Standardize build, dry-run plan validation, InSpec security scanning, and manual approval gates for production deployments.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={pipelinePrompt}
                onChange={(e) => setPipelinePrompt(e.target.value)}
                placeholder="e.g. Pipeline for deploying RHEL 9 golden images with VMware Packer and Terraform..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleGeneratePipeline}
                disabled={isGeneratingPipeline || !pipelinePrompt}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                {isGeneratingPipeline ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate YAML Pipeline
                  </>
                )}
              </button>
            </div>

            <CodeViewer
              code={pipelineYaml || defaultPipelineYaml}
              language="yaml"
              title="azure-pipelines.yml"
            />
          </div>
        </div>
      )}
    </div>
  );
};
