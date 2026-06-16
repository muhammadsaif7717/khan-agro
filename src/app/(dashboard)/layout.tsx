"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  Menu, 
  LogOut, 
  AlertTriangle, 
  X, 
  User, 
  KeyRound,
  Sun,
  Moon,
  Globe,
  ShieldAlert,
  History
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

// ─── Settings Sidebar Sheet ──────────────────────────────────────────────────
function SettingsSidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { 
    isDbConnected, lastSaved, language, setLanguage, t, theme, toggleTheme, logout, showConfirm 
  } = useApp();

  const handleLogout = () => {
    showConfirm({
      message: t("confirmLogout"),
      type: "danger",
      onConfirm: () => {
        logout();
        onClose();
        router.replace("/login");
      }
    });
  };

  const handleNavigateToAccount = (hash?: string) => {
    if (hash) {
      router.push(`/account${hash}`);
      if (window.location.pathname === "/account") {
        const el = document.getElementById(hash.substring(1));
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      router.push("/account");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface border-l border-border/80 w-full max-w-[320px] h-full p-6 shadow-2xl flex flex-col justify-between animate-slide-in-right" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6 flex-1">
          {/* Header with X Close Button */}
          <div className="flex items-center justify-between pb-3.5 border-b border-border">
            <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
              <Menu className="w-5 h-5 text-emerald-400" /> {language === "bn" ? "মেনু" : "Menu"}
            </h3>
            <Button 
              onClick={onClose} 
              variant="secondary" 
              size="icon" 
              className="w-8 h-8 rounded-full border border-border/60 hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </Button>
          </div>
 
          {/* Database System Connection Status Pill */}
          <div className="p-3.5 bg-surface/80 border border-border/80 rounded-2xl flex flex-col gap-1.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t("dbStatus")}</span>
              <div className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full pulse-dot ${isDbConnected === true ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`} />
                <span className={`text-[10px] font-black tracking-wide ${isDbConnected === true ? "text-emerald-400" : "text-red-400"}`}>
                  {isDbConnected === true ? t("dbActive") : t("dbOfflineShort")}
                </span>
              </div>
            </div>
            {lastSaved && (
              <div className="flex items-center justify-between border-t border-border/60 pt-1.5 mt-0.5">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wide">
                  {language === "bn" ? "সর্বশেষ সিঙ্ক" : "Sync Time"}
                </span>
                <span className="text-text-secondary font-mono text-[9px] font-bold uppercase tracking-wider">
                  {new Date(lastSaved).toLocaleString(language === "bn" ? "bn-BD" : "en-US")}
                </span>
              </div>
            )}
          </div>
 
          {/* Language Selection Toggle — closes on selection */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Globe className="w-3.5 h-3.5" /> {t("languageSelect")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => { setLanguage("bn"); onClose(); }}
                variant={language === "bn" ? "emerald" : "secondary"}
                className="h-10 text-xs font-bold transition-all duration-200"
              >
                {language === "bn" ? "বাংলা" : "Bangla"}
              </Button>
              <Button
                onClick={() => { setLanguage("en"); onClose(); }}
                variant={language === "en" ? "emerald" : "secondary"}
                className="h-10 text-xs font-bold transition-all duration-200"
              >
                {language === "bn" ? "ইংরেজি" : "English"}
              </Button>
            </div>
          </div>
 
          {/* Theme Selection Toggle — closes on selection */}
          <div className="space-y-2.5 pt-2 border-t border-border">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              {theme === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />} {t("themeSelect")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => { if (theme !== "light") toggleTheme(); onClose(); }}
                variant={theme === "light" ? "emerald" : "secondary"}
                className="h-10 text-xs font-bold transition-all duration-200"
              >
                {t("themeLight")}
              </Button>
              <Button
                onClick={() => { if (theme !== "dark") toggleTheme(); onClose(); }}
                variant={theme === "dark" ? "emerald" : "secondary"}
                className="h-10 text-xs font-bold transition-all duration-200"
              >
                {t("themeDark")}
              </Button>
            </div>
          </div>
 
          {/* Security & Credentials Redirection list buttons */}
          <div className="space-y-2.5 pt-4 border-t border-border">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> {t("accountTitle")}
            </h4>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleNavigateToAccount()}
                variant="secondary"
                className="w-full h-11 text-xs font-bold flex items-center justify-start gap-3 px-4 bg-surface/80 border border-border/80 hover:bg-surface-hover hover:border-border text-text-secondary transition-all rounded-xl"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>{t("usernameChangeTitle")}</span>
              </Button>
              <Button
                onClick={() => handleNavigateToAccount()}
                variant="secondary"
                className="w-full h-11 text-xs font-bold flex items-center justify-start gap-3 px-4 bg-surface/80 border border-border/80 hover:bg-surface-hover hover:border-border text-text-secondary transition-all rounded-xl"
              >
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>{t("passwordChangeTitle")}</span>
              </Button>
              <Button
                onClick={() => handleNavigateToAccount("#login-history")}
                variant="secondary"
                className="w-full h-11 text-xs font-bold flex items-center justify-start gap-3 px-4 bg-surface/80 border border-border/80 hover:bg-surface-hover hover:border-border text-text-secondary transition-all rounded-xl"
              >
                <History className="w-4 h-4 text-emerald-400" />
                <span>{t("loginHistory")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Logout Button inside sidebar */}
        <div className="pt-4 border-t border-border/80 mt-auto shrink-0">
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl text-red-400 font-bold h-11 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 text-red-400" /> {t("logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isDbConnected, language, t } = useApp();
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
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500/10 via-emerald-500/5 to-amber-500/5 rounded-3xl flex items-center justify-center shadow-lg border border-emerald-500/25 animate-pulse mb-6">
          <Logo size={48} className="animate-bounce" />
        </div>
        <h2 className="text-xl font-black tracking-widest text-emerald-400">KHAN AGRO</h2>
        <p className="text-xs text-text-muted mt-1 font-semibold">{t("dbLoading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* ── Topbar ── */}
      <header className="h-[58px] bg-header-bg backdrop-blur-md border-b border-border/80 sticky top-0 z-50 flex items-center w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500/10 via-emerald-500/5 to-amber-500/5 rounded-xl flex items-center justify-center shadow border border-emerald-500/20">
              <Logo size={26} />
            </div>
            <div className="flex flex-col">
              <span className="text-md font-black tracking-widest leading-none text-text-primary">KHAN</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold tracking-[0.25em] text-emerald-400 leading-none">AGRO FARM</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSettingsOpen(true)}
              variant="ghost"
              size="icon"
              title={language === "bn" ? "মেনু" : "Menu"}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/5 via-surface/20 to-amber-500/0 hover:from-emerald-500/10 hover:to-emerald-500/5 shadow-md hover:shadow-emerald-950/20 hover:scale-105 active:scale-95 group transition-all duration-300"
            >
              <Menu className="w-[20px] h-[20px] text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
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

      {/* ── Settings Sidebar Sheet ── */}
      {settingsOpen && <SettingsSidebar onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
