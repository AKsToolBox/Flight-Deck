import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  RotateCcw,
  User,
  Bot,
  Brain,
  Zap,
  Terminal,
  Server,
  AlertCircle,
  FileCode2,
  Trash2,
} from "lucide-react";
import { ChatMessage } from "../../types";
import { CodeViewer } from "../common/CodeViewer";

interface CopilotSuiteProps {
  initialPrompt?: string;
  initialRole?: string;
  useThinkingGlobal: boolean;
  onToggleThinkingGlobal: () => void;
}

export const CopilotSuite: React.FC<CopilotSuiteProps> = ({
  initialPrompt,
  initialRole = "general_sre",
  useThinkingGlobal,
  onToggleThinkingGlobal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hello! I am your Enterprise Infrastructure & SRE AI Copilot powered by Google DeepMind's Gemini models.

I specialize in:
• **Windows Server**: Active Directory, Entra ID hybrid sync, Group Policy (GPO), PowerShell 7+, DNS/DHCP IPAM, and WSUS.
• **Enterprise Linux**: RHEL 9, Ubuntu 24.04 LTS, Rocky Linux, systemd services, kernel sysctl tuning, and Bash automation.
• **Infrastructure as Code**: Terraform HCL, Azure Bicep, Git branching strategy, and Azure DevOps CI/CD pipelines.
• **Virtualization**: VMware vCenter, ESXi resource scheduling, CPU Ready % contention, and snapshot lifecycles.
• **Incident Management**: High-thinking Root Cause Analysis (RCA), capacity planning, and postmortems.
• **Configuration Management**: Chef 18 Cookbooks, Policyfiles, and InSpec CIS Benchmark compliance.

Toggle **High Thinking Mode** above to enable reasoning tokens with **Gemini 3.1 Pro Preview** for complex architectural queries!`,
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: "gemini-3.5-flash",
    },
  ]);

  const [inputMessage, setInputMessage] = useState(initialPrompt || "");
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [useThinking, setUseThinking] = useState(useThinkingGlobal);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInputMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    setUseThinking(useThinkingGlobal);
  }, [useThinkingGlobal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      label: "Kerberos Clock Skew Remediation",
      role: "windows_admin",
      prompt: "A Linux RHEL member server cannot authenticate to Active Directory due to Kerberos error 'Clock skew too great'. Walk me through exact PowerShell and chrony commands to fix PDC emulator sync.",
    },
    {
      label: "Diagnose VMware CPU Ready %RDY",
      role: "virtualization",
      prompt: "One of our critical SQL VMs has 14% CPU Ready time on an ESXi 8.0 cluster. Analyze whether we should downsize vCPUs or adjust DRS thresholds.",
    },
    {
      label: "Zero-Drift Chef Policyfiles",
      role: "cloud_iac",
      prompt: "Explain how to write an immutable Chef Policyfile with locked cookbook dependencies for an enterprise Windows Server IIS web farm.",
    },
    {
      label: "Linux sysctl Network Optimization",
      role: "linux_sre",
      prompt: "Provide an optimal /etc/sysctl.d/99-network.conf for a high-traffic NGINX reverse proxy handling 25,000 requests/sec.",
    },
    {
      label: "P1 Crash Kernel-Power RCA",
      role: "incident_commander",
      prompt: "A Windows Server 2022 domain controller suffered an unexpected restart with Event ID 41 Kernel-Power (BugcheckCode 0x133 DPC_WATCHDOG_VIOLATION). Outline root causes and triage plan.",
    },
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Build history for backend
      const historyPayload = messages
        .filter((m) => m.id !== "welcome-msg")
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          role: selectedRole,
          useThinking,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.reply || "No response received from AI model.",
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `Error contacting SRE Copilot backend: ${err.message}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Copilot Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-500/30 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Gemini Enterprise SRE Copilot
              {useThinking && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <Brain className="w-3 h-3 text-indigo-400" />
                  High Thinking (Gemini 3.1 Pro Preview)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive multi-turn infrastructure assistant with specialized role personas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Persona selector */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="general_sre">Role: Senior Infrastructure Architect</option>
            <option value="windows_admin">Role: Principal Windows &amp; AD Engineer</option>
            <option value="linux_sre">Role: Enterprise Linux &amp; Kernel SRE</option>
            <option value="cloud_iac">Role: Cloud &amp; IaC Automation Lead</option>
            <option value="virtualization">Role: VMware Virtualization Specialist</option>
            <option value="incident_commander">Role: P1 Major Incident Commander</option>
          </select>

          {/* Thinking Mode Toggle */}
          <button
            onClick={() => {
              setUseThinking(!useThinking);
              onToggleThinkingGlobal();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              useThinking
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/25"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            {useThinking ? "Thinking: High (Pro)" : "Fast Mode (Flash)"}
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Suggestions:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedRole(qp.role);
              handleSendMessage(qp.prompt);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-white border border-slate-700/80 hover:border-blue-500/50 text-[11px] whitespace-nowrap transition-colors shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isUser ? "ml-auto" : "mr-auto"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-indigo-600/30 border border-indigo-500/40 text-indigo-300"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    {isUser ? "You (SRE Operator)" : "Copilot"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  {msg.modelUsed && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-indigo-300 rounded border border-slate-700">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                      : "bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap font-sans"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-4xl mr-auto animate-in fade-in">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-950/80 border border-slate-800 text-slate-300 text-xs flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>
                {useThinking
                  ? "Gemini 3.1 Pro is reasoning through system architecture with High Thinking tokens..."
                  : "Synthesizing response with Gemini 3.5 Flash..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything across Windows Server, Linux, IaC, VMware, Chef, or incident RCA..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
