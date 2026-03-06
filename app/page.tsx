"use client";

import { useState } from "react";

type OS = "mac" | "win";

function getCommand(os: OS, domain: string) {
  if (os === "mac") {
    return `curl -s https://raw.githubusercontent.com/nmelms/vercel-connect-debug/main/vercel-debug.sh | domain="${domain}" bash | tee vercel-debug.txt`;
  }
  return `$domain = "${domain}"; Invoke-RestMethod -Uri https://raw.githubusercontent.com/nmelms/vercel-connect-debug/main/vercel-debug.ps1 | Invoke-Expression | tee vercel-debug.txt`;
}

export default function VercelDebugTool() {
  const [os, setOs] = useState<OS>(
    typeof navigator !== "undefined" && navigator.userAgent.includes("Win")
      ? "win"
      : "mac"
  );
  const [domain, setDomain] = useState("");
  const [copied, setCopied] = useState(false);
  const [stepDone, setStepDone] = useState(false);
  const [terminalDone, setTerminalDone] = useState(false);
  const [pasteDone, setPasteDone] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  const [whatOpen, setWhatOpen] = useState(false);

  const trimmedDomain = domain.trim();
  const hasSlash = trimmedDomain.includes("/");
  const isValid = trimmedDomain.length > 0 && !hasSlash;
  const error = hasSlash
    ? "Please enter a domain only, not a full URL (e.g. example.com)"
    : null;

  function handleOsChange(next: OS) {
    setOs(next);
    setStepDone(false);
    setCopied(false);
    setTerminalDone(false);
    setPasteDone(false);
    setShareDone(false);
  }

  async function copyCmd() {
    await navigator.clipboard.writeText(getCommand(os, trimmedDomain));
    setCopied(true);
    setStepDone(true);
    setTimeout(() => setCopied(false), 3000);
  }

  const openHint =
    os === "win" ? (
      <>
        Press <Code>Win + R</Code>, type <Code>powershell</Code>, hit Enter.
      </>
    ) : (
      <>
        Press <Code>Cmd ⌘ + Space</Code>, type <Code>Terminal</Code>, hit Enter.
      </>
    );

  const pasteKey = os === "win" ? "Ctrl + V" : "Cmd ⌘ + V";

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="bg-[#111] border border-[#222] rounded-2xl p-10 w-full max-w-lg text-center shadow-2xl">
        {/* Vercel logo */}
        <svg
          className="w-11 h-11 mx-auto mb-5"
          viewBox="0 0 116 100"
          fill="#fff"
        >
          <path d="M57.5 0L115 100H0L57.5 0z" />
        </svg>

        <h1 className="text-white text-xl font-semibold mb-2">
          Vercel Debug Tool
        </h1>
        <p className="text-[#777] text-sm leading-relaxed mb-6">
          Collect diagnostics to share with the Vercel support team.
        </p>

        {/* OS Tabs */}
        <div className="flex bg-[#0a0a0a] border border-[#222] rounded-xl p-1 gap-1 mb-6">
          {(["mac", "win"] as OS[]).map((o) => (
            <button
              key={o}
              onClick={() => handleOsChange(o)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all
                ${os === o ? "bg-[#1e1e1e] text-white border border-[#2e2e2e]" : "text-[#555] hover:text-[#999]"}`}
            >
              {o === "mac" ? <AppleIcon /> : <WindowsIcon />}
              {o === "mac" ? "macOS" : "Windows"}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="mb-6 text-left">
          {[
            {
              label: (
                <strong className="text-[#ddd] font-medium">
                  Enter your domain
                </strong>
              ),
              extra: (
                <div className="mt-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setStepDone(false);
                    }}
                    placeholder="example.com"
                    className={`w-full bg-[#0a0a0a] border rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-[#333] focus:outline-none transition-colors
                      ${error ? "border-red-500 focus:border-red-400" : "border-[#222] focus:border-[#444]"}`}
                  />
                  {error && <p className="mt-2 text-red-400 text-xs">{error}</p>}
                </div>
              ),
              done: isValid,
              active: !isValid,
            },
            {
              label: (
                <>
                  <strong className="text-[#ddd] font-medium">
                    Copy the command
                  </strong>{" "}
                  — click the button below.
                </>
              ),
              extra: null,
              done: stepDone,
              active: isValid && !stepDone,
            },
            {
              label: (
                <>
                  <strong className="text-[#ddd] font-medium">
                    Open {os === "win" ? "PowerShell" : "Terminal"}
                  </strong>{" "}
                  — {openHint}
                </>
              ),
              extra: stepDone && !terminalDone ? (
                <MarkDoneButton onClick={() => setTerminalDone(true)} />
              ) : null,
              done: terminalDone,
              active: stepDone && !terminalDone,
            },
            {
              label: (
                <>
                  <strong className="text-[#ddd] font-medium">
                    Paste and run
                  </strong>{" "}
                  — press <Code>{pasteKey}</Code> then <Code>Enter</Code>.
                </>
              ),
              extra: terminalDone && !pasteDone ? (
                <MarkDoneButton onClick={() => setPasteDone(true)} />
              ) : null,
              done: pasteDone,
              active: terminalDone && !pasteDone,
            },
            {
              label: (
                <>
                  Share the generated <Code>vercel-debug.txt</Code> file with
                  support.
                </>
              ),
              extra: pasteDone && !shareDone ? (
                <MarkDoneButton onClick={() => setShareDone(true)} />
              ) : null,
              done: shareDone,
              active: pasteDone && !shareDone,
            },
          ].map((step, i, arr) => (
            <div
              key={i}
              className={`flex items-start gap-3 py-3 ${i < arr.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}
            >
              <StepNum index={i + 1} done={step.done} active={step.active} />
              <div className="flex-1">
                <p className="text-[#aaa] text-sm leading-relaxed">
                  {step.label}
                </p>
                {step.extra}
              </div>
            </div>
          ))}
        </div>

        {/* Command block */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4 mb-4 text-left font-mono text-xs text-sky-300 break-all leading-relaxed">
          {isValid ? (
            getCommand(os, trimmedDomain)
          ) : (
            <span className="text-[#333]">
              Enter a domain above to generate the command…
            </span>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={copyCmd}
          disabled={!isValid}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-sm transition-all
            ${!isValid ? "bg-[#1a1a1a] text-[#444] cursor-not-allowed" : copied ? "bg-green-400 hover:bg-green-500 text-black cursor-pointer" : "bg-white hover:bg-[#e5e5e5] text-black cursor-pointer"}`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy Command"}
        </button>

        {/* What is this */}
        <button
          onClick={() => setWhatOpen(!whatOpen)}
          className="flex items-center gap-2 mx-auto mt-4 text-[#555] hover:text-[#999] text-sm transition-colors"
        >
          <QuestionIcon />
          What is this?
          <svg
            className={`w-3 h-3 transition-transform ${whatOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {whatOpen && (
          <div className="mt-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-4 text-left text-[#888] text-sm leading-relaxed">
            Run the command below — depending on your operating system — from a
            terminal of your choice. This script will conduct various checks,
            and depending on different factors, it may take up to 15 minutes to
            finish. When complete, it will create a{" "}
            <Code>vercel-debug.txt</Code> file in your current working
            directory, which you can then attach to your open support case with
            Vercel Support.
          </div>
        )}
      </div>
    </main>
  );
}

function MarkDoneButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 text-xs text-[#555] hover:text-[#999] underline underline-offset-2 transition-colors"
    >
      Mark as done
    </button>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-[0.78rem] text-[#ccc] font-mono">
      {children}
    </code>
  );
}

function StepNum({
  index,
  done,
  active,
}: {
  index: number;
  done: boolean;
  active: boolean;
}) {
  const base =
    "flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.72rem] font-bold mt-0.5 transition-all";
  if (done)
    return (
      <div className={`${base} bg-green-400 border-green-400 text-black`}>
        <CheckIcon size={11} />
      </div>
    );
  if (active)
    return (
      <div className={`${base} bg-white border-white text-black`}>{index}</div>
    );
  return (
    <div className={`${base} bg-[#1e1e1e] border border-[#2e2e2e] text-[#666]`}>
      {index}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5.557L10.373 4.5v7.17H3V5.557zM11.33 4.36L21 3v8.67h-9.67V4.36zM3 12.43h7.373V19.5L3 18.443V12.43zM11.33 12.67H21V21l-9.67-1.343V12.67z" />
    </svg>
  );
}
