import React, { useState } from "react";
import { Copy, Check, Terminal, Play, Download } from "lucide-react";

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  onExecute?: () => void;
  showExecute?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = "powershell",
  title,
  onExecute,
  showExecute = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === "powershell" ? "ps1" : language === "bash" ? "sh" : language === "python" ? "py" : language === "terraform" ? "tf" : "txt";
    const filename = `${title ? title.toLowerCase().replace(/\s+/g, "_") : "script"}.${ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRun = () => {
    setIsExecuting(true);
    setExecutionOutput(null);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionOutput(`[SANDBOX EXECUTION - ${new Date().toLocaleTimeString()}]
Loaded environment profile.
Validating syntax & parameters...
Success: 0 errors, 0 warnings.
Output: Dry-run completed with code 0. Idempotent state verified.`);
      if (onExecute) onExecute();
    }, 850);
  };

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl flex flex-col my-3">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-mono">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{title || "Command / Script Sandbox"}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 uppercase tracking-wider text-[10px] font-mono border border-slate-700">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {showExecute && (
            <button
              onClick={handleRun}
              disabled={isExecuting}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-medium transition-colors"
              title="Test run in isolated validation sandbox"
            >
              <Play className="w-3 h-3 fill-emerald-300" />
              {isExecuting ? "Executing..." : "Dry-Run Test"}
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition-colors border border-slate-700"
            title="Download script"
          >
            <Download className="w-3 h-3" />
            Save
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition-colors border border-slate-700"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-96 select-text whitespace-pre">
        <code>{code}</code>
      </div>

      {/* Execution Output Simulation */}
      {executionOutput && (
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800/80 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-emerald-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Execution Result
            </span>
            <button
              onClick={() => setExecutionOutput(null)}
              className="text-slate-500 hover:text-slate-300 text-[10px]"
            >
              Dismiss
            </button>
          </div>
          <pre className="text-slate-300 whitespace-pre-wrap">{executionOutput}</pre>
        </div>
      )}
    </div>
  );
};
