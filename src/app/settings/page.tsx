"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast, ToastProvider } from "@/components/ui/Toast";

const STORAGE_KEY = "API_TOKEN";

function SettingsContent() {
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
      <h1 className="text-2xl font-semibold text-ink mb-4">Settings</h1>
      <Card>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink mb-2 block">API Token</label>
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your API token"
                className="flex-1 rounded-[var(--radius-control)] border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button variant="secondary" size="sm" onClick={() => setShow((s) => !s)}>
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
