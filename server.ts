import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI SDK with required user-agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for selecting appropriate model & fallback
function getSystemPromptForRole(roleMode?: string): string {
  switch (roleMode) {
    case "windows_admin":
      return `You are a Senior Windows Server & Cloud Identity Architect. You specialize in Windows Server 2016-2025, Active Directory Domain Services (AD DS), Microsoft Entra ID (Azure AD), Group Policy Objects (GPO / RSOP), advanced PowerShell 7+ scripting, DNS/DHCP infrastructure, WSUS patch lifecycle, and Windows Performance Toolkit / PerfMon diagnostics. Always provide precise cmdlets, registry paths, and enterprise best practices.`;
    case "linux_sre":
      return `You are a Principal Enterprise Linux Systems Engineer & SRE. You specialize in RHEL, CentOS, Rocky Linux, and Ubuntu Server environments. Your core skills include systemd unit management, Bash/Python automation, kernel tuning (sysctl, I/O schedulers, swappiness, THP), package managers (dnf, yum, apt), and troubleshooting via journalctl, dmesg, strace, and eBPF tools.`;
    case "cloud_iac":
      return `You are a Principal Cloud & Infrastructure as Code (IaC) Architect. You specialize in Terraform, Azure Bicep, ARM, Azure DevOps CI/CD YAML pipelines, Git workflows, and configuration management platforms like Chef (cookbooks/recipes/InSpec) and Ansible. Focus on idempotency, declarative architecture, compliance as code, and drift prevention.`;
    case "virtualization":
      return `You are a Senior VMware Virtualization Architect (VCDX/VCAP). You specialize in VMware vSphere 7.x/8.x, vCenter, ESXi clustering, DRS, HA, Storage DRS, vSAN, Distributed Virtual Switches, VM provisioning, CPU ready % tuning, balloon driver optimization, and capacity planning.`;
    case "incident_commander":
      return `You are a Veteran Incident Commander and Performance Tuning Diagnostician. You specialize in rapid triage, root cause analysis (RCA), resolving high-severity P1/P2 outages, correlating logs across heterogeneous Windows/Linux fleets, identifying resource contention bottlenecks (CPU, RAM, Disk I/O, Network), and formulating zero-downtime remediation plans.`;
    default:
      return `You are an Enterprise Infrastructure & Systems Operations Lead with deep mastery across Windows Server Administration (Active Directory, Entra ID, GPO, PowerShell, DNS, DHCP), Enterprise Linux (RHEL, Ubuntu, Rocky, Bash, systemd), Automation (PowerShell, Bash, Python), Infrastructure as Code (Terraform, Bicep, Git, Azure DevOps), VMware Virtualization, Incident RCA, and Chef Configuration Management. Provide rigorous, production-grade technical guidance.`;
  }
}

// 1. Multi-turn Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, modelPreference, roleMode, useThinking } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is missing on server.",
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Determine model
    // Complex tasks / high thinking -> gemini-3.1-pro-preview
    // Fast queries -> gemini-3.1-flash-lite
    // General tasks -> gemini-3.5-flash
    let targetModel = "gemini-3.5-flash";
    if (useThinking || modelPreference === "gemini-3.1-pro-preview") {
      targetModel = "gemini-3.1-pro-preview";
    } else if (modelPreference === "gemini-3.1-flash-lite") {
      targetModel = "gemini-3.1-flash-lite";
    }

    const systemInstruction = getSystemPromptForRole(roleMode);

    // Format contents for multi-turn history
    // Convert messages to Gemini API format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction,
    };

    if (targetModel === "gemini-3.1-pro-preview" && useThinking) {
      // Prompt explicitly says: MUST use gemini-3.1-pro-preview, set thinkingLevel to ThinkingLevel.HIGH, DO NOT set maxOutputTokens
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });
    } catch (modelErr: any) {
      console.warn(`Attempt with ${targetModel} failed: ${modelErr.message}. Attempting fallback to gemini-3.8-flash.`);
      // Fallback to gemini-3.8-flash without thinkingConfig if pro preview encounters tier limitations
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: { systemInstruction },
      });
      targetModel = "gemini-3.8-flash (fallback)";
    }

    res.json({
      reply: response.text || "No response text generated.",
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: error.message || "Failed to process chat request.",
    });
  }
});

// 2. High-Thinking Deep RCA & Incident Resolution API
app.post("/api/analyze-incident", async (req, res) => {
  try {
    const { incidentTitle, severity, osType, symptoms, logs, metrics } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const prompt = `Perform a high-level deep technical Root Cause Analysis (RCA) and emergency incident triage:
INCIDENT TITLE: ${incidentTitle || "Server Outage / Degraded Performance"}
SEVERITY: ${severity || "P2 - Major Degradation"}
TARGET OS / ENVIRONMENT: ${osType || "Hybrid Windows / Linux"}
OBSERVED SYMPTOMS:
${symptoms || "High CPU utilization, latency spike, intermittent service timeouts."}

SYSTEM LOGS & TELEMETRY:
${logs || "No specific log dumps provided. Infer typical bottleneck signatures."}

CURRENT METRICS SNAPSHOT:
${JSON.stringify(metrics || {}, null, 2)}

Provide your analysis formatted as structured markdown with:
1. Executive Summary & Blast Radius
2. Probable Root Cause (Deep Technical Explanation)
3. Step-by-Step Diagnostic Verification Commands (PowerShell for Windows, Bash/journalctl/perf for Linux)
4. Immediate Remediation Runbook (with copy-pasteable script)
5. Long-term Preventive Engineering & Capacity Tuning recommendations`;

    // Complex deep reasoning: Use gemini-3.1-pro-preview with ThinkingLevel.HIGH
    let targetModel = "gemini-3.1-pro-preview";
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction: `You are an elite Incident Commander and SRE Diagnostician. Produce meticulous, step-by-step root cause investigations with exact commands and fail-safe remediation scripts.`,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
    } catch (err: any) {
      console.warn("Pro preview RCA fallback to gemini-3.8-flash:", err.message);
      targetModel = "gemini-3.8-flash (fallback)";
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an elite Incident Commander and SRE Diagnostician. Produce meticulous, step-by-step root cause investigations with exact commands and fail-safe remediation scripts.`,
        },
      });
    }

    res.json({
      analysis: response.text || "No analysis generated.",
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error("Incident analysis error:", error);
    res.status(500).json({ error: error.message || "Incident analysis failed." });
  }
});

// 3. Infrastructure Automation & Script Generator API
app.post("/api/generate-script", async (req, res) => {
  try {
    const { scriptType, objective, targetEnvironment, parameters, includeSafetyChecks } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing." });
    }

    const prompt = `Write an enterprise-grade ${scriptType || "PowerShell"} automation script.
OBJECTIVE: ${objective}
TARGET ENVIRONMENT: ${targetEnvironment || "Enterprise Production (Windows Server / RHEL / VMware / Azure)"}
REQUIRED PARAMETERS: ${parameters || "Standard configurable parameters with defaults"}
SAFETY & IDEMPOTENCY: ${includeSafetyChecks ? "Must include dry-run / -WhatIf support, strict error handling, verbose logging, rollback safety, and input validation." : "Standard enterprise scripting standards."}

Respond with:
- Clear code comments explaining each phase.
- Structured parameter block.
- Pre-flight validation checks.
- Main execution loop with try/catch.
- Post-execution verification output.`;

    // General tasks -> gemini-3.5-flash
    let targetModel = "gemini-3.5-flash";
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction: `You are an expert Automation Engineer specializing in production-ready PowerShell 7, Bash, Python, Terraform HCL, and Chef recipes. Ensure zero hallucinations and rigorous error handling.`,
        },
      });
    } catch (err: any) {
      targetModel = "gemini-3.8-flash";
      response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
      });
    }

    res.json({
      script: response.text || "",
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error("Script generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate script." });
  }
});

// 4. Quick SysAdmin Assist (Fast lookup with gemini-3.1-flash-lite)
app.post("/api/quick-assist", async (req, res) => {
  try {
    const { query, category } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing." });
    }

    // Fast tasks -> gemini-3.1-flash-lite
    let targetModel = "gemini-3.1-flash-lite";
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: `Category: ${category || "General SysAdmin"}\nQuick Question/Lookup: ${query}\nProvide a concise, immediate answer with exact syntax, one-line explanation, and common pitfalls. Maximum 150 words.`,
        config: {
          systemInstruction: "You are a rapid-response enterprise SysAdmin cheat-sheet. Give instantaneous, razor-sharp technical answers with exact syntax.",
        },
      });
    } catch (err: any) {
      targetModel = "gemini-3.8-flash";
      response = await ai.models.generateContent({
        model: targetModel,
        contents: `Category: ${category || "General SysAdmin"}\nQuick Question/Lookup: ${query}\nProvide a concise, immediate answer with exact syntax, one-line explanation, and common pitfalls. Maximum 150 words.`,
      });
    }

    res.json({
      answer: response.text || "",
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error("Quick assist error:", error);
    res.status(500).json({ error: error.message || "Quick assist failed." });
  }
});

// 5. Executive & Compliance Report Generator API
app.post("/api/generate-report", async (req, res) => {
  try {
    const { reportType, fleetData, timeRange } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing." });
    }

    const prompt = `Synthesize an Executive & Operational Infrastructure Report:
REPORT TYPE: ${reportType || "Fleet Health, Security Compliance & Lifecycle Audit"}
PERIOD: ${timeRange || "Current Active Fleet Status"}
TELEMETRY & INVENTORY SUMMARY:
${JSON.stringify(fleetData || {}, null, 2)}

Produce a formal, executive-grade report containing:
1. Executive Management Summary & Operational Health Score (0-100)
2. Windows Server & Linux Fleet Compliance Status (Patch levels, EOL risks, CIS Benchmark compliance)
3. VMware & Cloud Capacity Utilization & Runway Forecast
4. Top 3 Critical Incidents & Root Causes Addressed
5. Priority Strategic Recommendations for Leadership & Infrastructure Roadmap`;

    let targetModel = "gemini-3.5-flash";
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction: "You are an Executive IT Director and Enterprise Systems Auditor. Prepare clean, high-impact infrastructure reports suitable for CIOs, CISOs, and senior engineering teams.",
        },
      });
    } catch (err: any) {
      targetModel = "gemini-3.8-flash";
      response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
      });
    }

    res.json({
      report: response.text || "",
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error("Report generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate report." });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "Enterprise Systems Management Server",
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Vite middleware / Static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise SysOps Management Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
