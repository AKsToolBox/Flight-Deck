import React, { useState } from "react";
import { NavigationTab } from "./types";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { WindowsAdminSuite } from "./components/windows/WindowsAdminSuite";
import { LinuxAdminSuite } from "./components/linux/LinuxAdminSuite";
import { AutomationSuite } from "./components/automation/AutomationSuite";
import { IaCVersionControlSuite } from "./components/iac/IaCVersionControlSuite";
import { VirtualizationSuite } from "./components/vmware/VirtualizationSuite";
import { IncidentPerformanceSuite } from "./components/performance/IncidentPerformanceSuite";
import { ConfigManagementSuite } from "./components/configmgmt/ConfigManagementSuite";
import { ExecutiveReportingSuite } from "./components/reporting/ExecutiveReportingSuite";
import { CopilotSuite } from "./components/copilot/CopilotSuite";
import { initialIncidents } from "./data/mockInfrastructure";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>("windows");
  const [useThinkingGlobal, setUseThinkingGlobal] = useState(false);

  // Copilot handover state
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>("");
  const [copilotInitialRole, setCopilotInitialRole] = useState<string>("general_sre");

  const activeIncidentsCount = initialIncidents.filter((i) => i.status !== "Resolved").length;

  const handleAskCopilot = (prompt: string, role = "general_sre", useThinking = false) => {
    setCopilotInitialPrompt(prompt);
    setCopilotInitialRole(role);
    if (useThinking) {
      setUseThinkingGlobal(true);
    }
    setCurrentTab("copilot");
  };

  const handleToggleThinking = () => {
    setUseThinkingGlobal((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        onOpenCopilot={() => setCurrentTab("copilot")}
        activeIncidentsCount={activeIncidentsCount}
        useThinkingGlobal={useThinkingGlobal}
        onToggleThinkingGlobal={handleToggleThinking}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          activeIncidentsCount={activeIncidentsCount}
        />

        {/* Dynamic Domain Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/60">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === "windows" && (
              <WindowsAdminSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "linux" && (
              <LinuxAdminSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "automation" && (
              <AutomationSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "iac" && (
              <IaCVersionControlSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "vmware" && (
              <VirtualizationSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "performance" && (
              <IncidentPerformanceSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "configmgmt" && (
              <ConfigManagementSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "reporting" && (
              <ExecutiveReportingSuite onAskCopilot={handleAskCopilot} />
            )}

            {currentTab === "copilot" && (
              <CopilotSuite
                initialPrompt={copilotInitialPrompt}
                initialRole={copilotInitialRole}
                useThinkingGlobal={useThinkingGlobal}
                onToggleThinkingGlobal={handleToggleThinking}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
