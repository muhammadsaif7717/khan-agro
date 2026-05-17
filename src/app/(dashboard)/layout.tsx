"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  Settings, 
  LogOut, 
  AlertTriangle, 
  Save, 
  DownloadCloud, 
  UploadCloud, 
  CheckCircle2, 
  X, 
  User, 
  KeyRound,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Globe
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ onClose }: { onClose: () => void }) {
  const { 
    isDbConnected, changeUsername, changePassword, exportBackup, importBackup, 
    language, setLanguage, t 
  } = useApp();

  const [newUsername, setNewUsername] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showUnamePass, setShowUnamePass] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState({ text: "", ok: false });

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", ok: false });

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState({ text: "", ok: false });

  const handleChangeUsername = async () => {
    const result = await changeUsername(newUsername, confirmPass);
    setUsernameMsg({ text: result.msg, ok: result.ok });
    if (result.ok) { setNewUsername(""); setConfirmPass(""); }
  };

  const handleChangePassword = async () => {
    const result = await changePassword(oldPass, newPass, confirmNewPass);
    setPasswordMsg({ text: result.msg, ok: result.ok });
    if (result.ok) { setOldPass(""); setNewPass(""); setConfirmNewPass(""); }
  };

  const handleImport = async () => {
    const result = await importBackup(importText);
    setImportMsg({ text: result.msg, ok: result.ok });
    if (result.ok) { setImportText(""); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#0e1626] border border-slate-800/80 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" /> {t("settings")}
        </h3>

        {/* Language Selection Toggle */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <Globe className="w-3.5 h-3.5" /> {t("languageSelect")}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setLanguage("bn")}
              variant={language === "bn" ? "emerald" : "secondary"}
              className="h-10 text-xs font-bold transition-all duration-200"
            >
              বাংলা (Bangla)
            </Button>
            <Button
              onClick={() => setLanguage("en")}
              variant={language === "en" ? "emerald" : "secondary"}
              className="h-10 text-xs font-bold transition-all duration-200"
            >
              English
            </Button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-3">
            <Save className="w-3.5 h-3.5" /> {t("backupRestore")}
          </h4>
          <Button onClick={exportBackup} className="w-full text-white font-bold text-xs flex items-center justify-center gap-2">
            <DownloadCloud className="w-4 h-4" /> {t("backupDownload")}
          </Button>
          <Button onClick={() => setShowImport(!showImport)} className="w-full text-white font-bold text-xs flex items-center justify-center gap-2">
            <UploadCloud className="w-4 h-4" /> {t("backupUpload")}
          </Button>
          {showImport && (
            <div className="space-y-2 animate-fade-in">
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
                placeholder='{"income":[...],"expense":[...],...}'
                className="w-full h-28 bg-[#070b13] text-emerald-400 border border-slate-800/80 rounded-lg p-2.5 font-mono text-xs outline-none focus:border-emerald-500 resize-none"
              />
              <Button onClick={handleImport} disabled={!isDbConnected} variant="emerald"
                className="w-full flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {t("importButton")}
              </Button>
              {importMsg.text && <p className={`text-[10px] font-bold ${importMsg.ok ? "text-emerald-400" : "text-red-400"}`}>{importMsg.text}</p>}
            </div>
          )}
        </div>

        {/* Change Username */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <User className="w-3.5 h-3.5" /> {t("usernameChangeTitle")}
          </h4>
          <Input type="text" placeholder={t("newUsernamePlaceholder")} value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
            className="h-10 text-xs" />
          <div className="relative">
            <Input type={showUnamePass ? "text" : "password"} placeholder={t("confirmPassPlaceholder")} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
              className="h-10 text-xs pr-10" />
            <button type="button" onClick={() => setShowUnamePass(!showUnamePass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showUnamePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button onClick={handleChangeUsername} disabled={!isDbConnected} variant="emerald"
            className="w-full flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {t("usernameConfirmButton")}
          </Button>
          {usernameMsg.text && <p className={`text-[10px] font-bold ${usernameMsg.ok ? "text-emerald-400" : "text-red-400"}`}>{usernameMsg.text}</p>}
        </div>

        {/* Change Password */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <KeyRound className="w-3.5 h-3.5" /> {t("passwordChangeTitle")}
          </h4>
          <div className="relative">
            <Input type={showOldPass ? "text" : "password"} placeholder={t("currentPasswordPlaceholder")} value={oldPass} onChange={(e) => setOldPass(e.target.value)}
              className="h-10 text-xs pr-10" />
            <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input type={showNewPass ? "text" : "password"} placeholder={t("newPasswordPlaceholder")} value={newPass} onChange={(e) => setNewPass(e.target.value)}
              className="h-10 text-xs pr-10" />
            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input type={showConfirmNewPass ? "text" : "password"} placeholder={t("confirmNewPasswordPlaceholder")} value={confirmNewPass} onChange={(e) => setConfirmNewPass(e.target.value)}
              className="h-10 text-xs pr-10" />
            <button type="button" onClick={() => setShowConfirmNewPass(!showConfirmNewPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showConfirmNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button onClick={handleChangePassword} disabled={!isDbConnected} variant="emerald"
            className="w-full flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {t("passwordConfirmButton")}
          </Button>
          {passwordMsg.text && <p className={`text-[10px] font-bold ${passwordMsg.ok ? "text-emerald-400" : "text-red-400"}`}>{passwordMsg.text}</p>}
        </div>

        <Button onClick={onClose} variant="secondary" className="w-full flex items-center justify-center gap-2 mt-2">
          <X className="w-4 h-4" /> {t("close")}
        </Button>
      </div>
    </div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isDbConnected, saveStatus, logout, theme, toggleTheme, t } = useApp();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Auth guard — redirect to /login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070b13]">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500/10 via-emerald-500/5 to-amber-500/5 rounded-3xl flex items-center justify-center shadow-lg border border-emerald-500/25 animate-pulse mb-6">
          <Logo size={48} className="animate-bounce" />
        </div>
        <h2 className="text-xl font-black tracking-widest text-emerald-400">KHAN AGRO</h2>
        <p className="text-xs text-slate-400 mt-1 font-semibold">{t("dbLoading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    if (confirm(t("confirmLogout"))) {
      logout();
      router.replace("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070b13]">
      {/* ── Topbar ── */}
      <header className="h-[58px] bg-[#0e1626]/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 flex items-center w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500/10 via-emerald-500/5 to-amber-500/5 rounded-xl flex items-center justify-center shadow border border-emerald-500/20">
              <Logo size={26} />
            </div>
            <div className="flex flex-col">
              <span className="text-md font-black tracking-widest leading-none text-white">KHAN</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold tracking-[0.25em] text-emerald-400 leading-none">AGRO FARM</span>
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full pulse-dot ${isDbConnected === true ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`}
                  title={isDbConnected === true ? t("dbActive") : t("dbOfflineShort")}
                />
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2.5 py-1 rounded-md font-bold tracking-wide">
              {saveStatus}
            </span>
            <Button
              onClick={toggleTheme}
              variant="default"
              size="icon"
              title="Theme Toggle"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </Button>
            <Button
              onClick={() => setSettingsOpen(true)}
              variant="default"
              size="icon"
              title={t("settings")}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="icon"
              title="Logout"
              className="bg-red-950/40 hover:bg-red-900 border border-red-900/50 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── DB Offline Banner ── */}
      {isDbConnected === false && (
        <div className="bg-red-950/40 border-b border-red-900/60 px-4 py-2 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">{t("dbOffline")}</span>
        </div>
      )}

      {/* ── Page Content ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {children}
      </main>

      {/* ── Bottom Floating Dock ── */}
      <Navbar />

      {/* ── Settings Modal ── */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
