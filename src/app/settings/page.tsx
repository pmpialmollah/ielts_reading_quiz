"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { ArrowLeft, ExternalLink, KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "API_TOKEN";

function SettingsContent() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEY) || "";
      setToken(t);
    } catch (e) {
      // ignore
    }
  }, []);

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, token);
      push("API token saved.", "success");
    } catch (e) {
      push("Failed to save token.", "error");
    }
  }

  function clearToken() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setToken("");
      push("API token cleared.", "success");
    } catch (e) {
      push("Failed to clear token.", "error");
    }
  }

  function copyToken() {
    try {
      navigator.clipboard.writeText(token || "");
      push("Token copied to clipboard.", "success");
    } catch (e) {
      push("Failed to copy token.", "error");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <button onClick={() => router.push("/")} className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </button>
          <h1 className="text-2xl font-semibold text-ink">Settings</h1>
          <p className="mt-1 text-sm text-ink-muted">Connect Gemini for fresh AI-generated practice and feedback.</p>
        </div>
        <KeyRound className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
      </div>
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-ink">Your Gemini API key</p>
          <p className="mt-1 text-sm text-ink-muted">Paste it here to use live AI generation in this browser.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="api-token" className="text-sm font-medium text-ink mb-2 block">API Token</label>
            <div className="flex gap-2">
              <input
                id="api-token"
                type={show ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your API token"
                className="flex-1 rounded-[var(--radius-control)] border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button variant="secondary" size="sm" onClick={() => setShow((s) => !s)} aria-pressed={show}>
                {show ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-ink-faint mt-2">
              The token is stored only in your browser&apos;s localStorage. Do not store secrets on shared computers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={copyToken} disabled={!token}>
              Copy
            </Button>
            <Button variant="destructive" onClick={clearToken}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-correct" /><p className="text-sm font-semibold text-ink">How to connect Gemini</p></div>
          <p className="mt-1 text-sm text-ink-muted">Follow these steps once, then return to Reading or Writing.</p>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">1</span><div className="text-sm leading-6 text-ink-muted">Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">Google AI Studio <ExternalLink className="h-3 w-3" /></a> and sign in with your Google account.</div></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">2</span><p className="text-sm leading-6 text-ink-muted">Choose <strong className="font-semibold text-ink">Create API key</strong>, select a Google Cloud project if asked, and copy the generated key.</p></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">3</span><p className="text-sm leading-6 text-ink-muted">Paste the key into the <strong className="font-semibold text-ink">API Token</strong> field above, then select <strong className="font-semibold text-ink">Save</strong>.</p></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">4</span><p className="text-sm leading-6 text-ink-muted">Return home and open Reading or Writing. Your requests will now use Gemini live mode instead of the demo content.</p></li>
          </ol>
          <div className="mt-5 rounded-lg border border-border-subtle bg-surface-sunken px-4 py-3 text-xs leading-5 text-ink-muted"><strong className="font-semibold text-ink">Privacy note:</strong> this form stores the key only in this browser&apos;s local storage and sends it to this app&apos;s API route when you generate or evaluate. Never share it, commit it to Git, or save it on a shared computer. Without a key, the app remains available in demo mode.</div>
          <p className="mt-4 text-xs leading-5 text-ink-faint">For local development, you can alternatively add <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-ink-muted">GEMINI_API_KEY=your_key</code> to <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-ink-muted">.env.local</code> and restart the dev server.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  );
}
