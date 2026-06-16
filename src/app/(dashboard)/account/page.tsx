"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck,
  Lock,
  ArrowLeft,
  Database,
  Download,
  Upload,
  History,
  Smartphone,
  Monitor,
  Trash2,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  const { isDbConnected, changeUsername, changePassword, exportBackup, importBackup, showConfirm, language, logout, t } = useApp();

  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  const fetchSessions = async () => {
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      setSessions(data);
    } catch (err: any) {
      setSessionsError(err.message || "Error");
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminateSession = async (sessionId: string, isCurrent: boolean) => {
    showConfirm({
      message: language === "bn" 
        ? "আপনি কি নিশ্চিতভাবে এই ডিভাইস থেকে লগআউট করতে চান?" 
        : "Are you sure you want to terminate this login session?",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/sessions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId })
          });
          if (res.ok) {
            if (isCurrent) {
              logout();
              window.location.href = "/login";
            } else {
              fetchSessions();
            }
          }
        } catch (err) {
          console.error("Failed to terminate session:", err);
        }
      }
    });
  };

  const formatSessionTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(language === "bn" ? "bn-BD" : "en-US");
    } catch {
      return isoString;
    }
  };

  // Import states
  const [importMsg, setImportMsg] = useState({ text: "", ok: false });
  const [importLoading, setImportLoading] = useState(false);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportMsg({ text: "", ok: false });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setImportMsg({ text: "❌ ফাইলটি খালি!", ok: false });
        setImportLoading(false);
        return;
      }
      const res = await importBackup(text);
      setImportMsg({ text: res.msg, ok: res.ok });
      setImportLoading(false);
    };
    reader.onerror = () => {
      setImportMsg({ text: "❌ ফাইল পড়তে সমস্যা হয়েছে!", ok: false });
      setImportLoading(false);
    };
    reader.readAsText(file);
  };

  // Username states
  const [newUsername, setNewUsername] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showUnamePass, setShowUnamePass] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState({ text: "", ok: false });
  const [usernameLoading, setUsernameLoading] = useState(false);

  // Password states
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", ok: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !confirmPass) {
      setUsernameMsg({ text: t("pleaseFillAll"), ok: false });
      return;
    }
    setUsernameLoading(true);
    setUsernameMsg({ text: "", ok: false });
    const result = await changeUsername(newUsername, confirmPass);
    setUsernameMsg({ text: result.msg, ok: result.ok });
    setUsernameLoading(false);
    if (result.ok) {
      setNewUsername("");
      setConfirmPass("");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass || !confirmNewPass) {
      setPasswordMsg({ text: t("pleaseFillAll"), ok: false });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg({ text: "", ok: false });
    const result = await changePassword(oldPass, newPass, confirmNewPass);
    setPasswordMsg({ text: result.msg, ok: result.ok });
    setPasswordLoading(false);
    if (result.ok) {
      setOldPass("");
      setNewPass("");
      setConfirmNewPass("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="p-1.5 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-border transition-colors text-text-muted hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> {t("accountTitle")}
            </h1>
          </div>
          <p className="text-xs text-text-muted font-medium pl-8">{t("accountDesc")}</p>
        </div>
      </div>

      {/* Grid for forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username form Card */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 transition-all duration-300">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-md font-extrabold text-text-primary">{t("usernameChangeTitle")}</h3>
          </div>

          <form onSubmit={handleChangeUsername} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("usernameLabel") || "New Username"}</label>
              <Input 
                type="text" 
                placeholder={t("newUsernamePlaceholder")} 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)}
                className="h-11 text-xs" 
                disabled={!isDbConnected || usernameLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("confirmPassPlaceholder") || "Confirm Password"}</label>
              <div className="relative">
                <Input 
                  type={showUnamePass ? "text" : "password"} 
                  placeholder={t("confirmPassPlaceholder")} 
                  value={confirmPass} 
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="h-11 text-xs pr-10" 
                  disabled={!isDbConnected || usernameLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowUnamePass(!showUnamePass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={usernameLoading}
                >
                  {showUnamePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!isDbConnected || usernameLoading} 
              variant="emerald"
              className="w-full h-11 text-xs font-bold flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-4 h-4" /> {usernameLoading ? "..." : t("usernameConfirmButton")}
            </Button>

            {usernameMsg.text && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
                usernameMsg.ok 
                  ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" 
                  : "bg-red-950/20 border-red-900/50 text-red-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${usernameMsg.ok ? "bg-emerald-400" : "bg-red-450"}`} />
                {usernameMsg.text}
              </div>
            )}
          </form>
        </div>

        {/* Password form Card */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 transition-all duration-300">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-md font-extrabold text-text-primary">{t("passwordChangeTitle")}</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("currentPasswordPlaceholder") || "Current Password"}</label>
              <div className="relative">
                <Input 
                  type={showOldPass ? "text" : "password"} 
                  placeholder={t("currentPasswordPlaceholder")} 
                  value={oldPass} 
                  onChange={(e) => setOldPass(e.target.value)}
                  className="h-11 text-xs pr-10" 
                  disabled={!isDbConnected || passwordLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowOldPass(!showOldPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={passwordLoading}
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("newPasswordPlaceholder") || "New Password"}</label>
              <div className="relative">
                <Input 
                  type={showNewPass ? "text" : "password"} 
                  placeholder={t("newPasswordPlaceholder")} 
                  value={newPass} 
                  onChange={(e) => setNewPass(e.target.value)}
                  className="h-11 text-xs pr-10" 
                  disabled={!isDbConnected || passwordLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPass(!showNewPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={passwordLoading}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("confirmNewPasswordPlaceholder") || "Confirm New Password"}</label>
              <div className="relative">
                <Input 
                  type={showConfirmNewPass ? "text" : "password"} 
                  placeholder={t("confirmNewPasswordPlaceholder")} 
                  value={confirmNewPass} 
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  className="h-11 text-xs pr-10" 
                  disabled={!isDbConnected || passwordLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmNewPass(!showConfirmNewPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={passwordLoading}
                >
                  {showConfirmNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!isDbConnected || passwordLoading} 
              variant="emerald"
              className="w-full h-11 text-xs font-bold flex items-center justify-center gap-2 mt-4"
            >
              <Lock className="w-4 h-4" /> {passwordLoading ? "..." : t("passwordConfirmButton")}
            </Button>

            {passwordMsg.text && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
                passwordMsg.ok 
                  ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" 
                  : "bg-red-950/20 border-red-900/50 text-red-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passwordMsg.ok ? "bg-emerald-400" : "bg-red-450"}`} />
                {passwordMsg.text}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Backup & Restore Panel */}
      <div className="glass-panel rounded-3xl p-6 space-y-6 transition-all duration-300 mt-6">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-md font-extrabold text-text-primary">{t("backupSectionTitle")}</h3>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{t("backupSectionSubtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Export section */}
          <div className="space-y-3 p-5 rounded-2xl bg-bg/40 border border-border">
            <h4 className="text-sm font-bold text-text-secondary flex items-center gap-1.5 font-extrabold">
              <Download className="w-4 h-4 text-emerald-400" /> {t("backupExportTitle")}
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              {t("backupExportDesc")}
            </p>
            <Button
              onClick={exportBackup}
              disabled={!isDbConnected}
              variant="emerald"
              className="w-full h-11 text-xs font-bold flex items-center justify-center gap-2 mt-4"
            >
              <Download className="w-4 h-4" /> {t("backupExportButton")}
            </Button>
          </div>

          {/* Import section */}
          <div className="space-y-3 p-5 rounded-2xl bg-bg/40 border border-border">
            <h4 className="text-sm font-bold text-text-secondary flex items-center gap-1.5 font-extrabold">
              <Upload className="w-4 h-4 text-emerald-400" /> {t("backupImportTitle")}
            </h4>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              {t("backupImportDesc")}
            </p>
            
            <div className="relative mt-4">
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={!isDbConnected || importLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <Button
                type="button"
                disabled={!isDbConnected || importLoading}
                variant="outline"
                className="w-full h-11 text-xs font-bold border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-400" /> {importLoading ? t("backupImportLoading") : t("backupImportButton")}
              </Button>
            </div>
          </div>
        </div>

        {importMsg.text && (
          <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
            importMsg.ok 
              ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" 
              : "bg-red-950/20 border-red-900/50 text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${importMsg.ok ? "bg-emerald-400" : "bg-red-450"}`} />
            {importMsg.text}
          </div>
        )}
      </div>

      {/* ── Active Sessions Panel ── */}
      <div id="login-history" className="glass-panel rounded-3xl p-6 space-y-4 transition-all duration-300 mt-6 scroll-mt-20">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <History className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-md font-extrabold text-text-primary">{t("activeSessions")}</h3>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
              {language === "bn" ? "আপনার অ্যাকাউন্টের সক্রিয় সেশনসমূহের তালিকা" : "Manage active devices connected to your account"}
            </p>
          </div>
        </div>

        {sessionsLoading && (
          <div className="text-center py-8 text-xs text-text-muted font-semibold">
            {language === "bn" ? "সেশনসমূহ লোড হচ্ছে..." : "Loading sessions..."}
          </div>
        )}

        {sessionsError && (
          <div className="text-center py-8 text-xs text-red-400 font-bold">
            ❌ {sessionsError}
          </div>
        )}

        {!sessionsLoading && !sessionsError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sessions.map((session) => {
              const isDesktop = !/iOS|Android/i.test(session.device);
              const DeviceIcon = isDesktop ? Monitor : Smartphone;

              return (
                <div 
                  key={session.id}
                  className={`p-4 rounded-2xl bg-bg/40 border transition-all duration-200 flex justify-between items-start gap-4 ${
                    session.isCurrent 
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]" 
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      session.isCurrent 
                        ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400" 
                        : "bg-surface-hover/80 border-border text-text-secondary"
                    }`}>
                      <DeviceIcon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-text-primary break-all">{session.device}</span>
                        {session.isCurrent && (
                          <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {t("sessionCurrent")}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{t("sessionIp")}: {session.ip}</span>
                      </div>
                      <div className="text-[9px] text-text-muted font-semibold">
                        {t("sessionLoginTime")}: {formatSessionTime(session.createdAt)}
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      onClick={() => handleTerminateSession(session.id, session.isCurrent)}
                      variant="destructive"
                      size="icon"
                      className="rounded-xl w-8 h-8 shrink-0 flex items-center justify-center transition-all bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400"
                      title={t("sessionLogoutBtn")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
