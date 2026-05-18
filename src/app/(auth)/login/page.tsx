"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, t } = useApp();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMsg(t("loginErrorEmpty"));
      return;
    }
    setIsSubmitting(true);
    // Small delay for animation feel
    await new Promise((r) => setTimeout(r, 300));
    const success = await login(username, password);
    if (success) {
      router.replace("/");
    } else {
      setErrorMsg(t("loginErrorInvalid"));
      setIsSubmitting(false);
    }
  };

  // Show loading while data fetches on first load
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#070b13] px-4">
      {/* Ambient glow bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm bg-[#0e1626] border border-slate-800/80 rounded-3xl p-8 shadow-2xl text-center animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500/10 via-emerald-500/5 to-amber-500/5 rounded-2xl flex items-center justify-center shadow-lg border border-emerald-500/25">
            <Logo size={52} />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-widest text-emerald-400 uppercase">KHAN</h1>
        <p className="text-xs font-bold tracking-[0.35em] text-slate-400 mb-7 uppercase">AGRO FARM</p>

        <div className="space-y-4 text-left">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">
              {t("usernameLabel")}
            </label>
            <Input
              id="login-username"
              type="text"
              placeholder={t("usernamePlaceholder")}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrorMsg(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 block">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="current-password"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs font-semibold text-center animate-fade-in flex items-center justify-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
            </p>
          )}

          <Button
            id="login-submit"
            onClick={handleLogin}
            disabled={isSubmitting}
            variant="emerald"
            className="w-full h-11 text-xs rounded-xl mt-3 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("loggingIn")}
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> {t("loginButton")}
              </>
            )}
          </Button>
        </div>

        <p className="text-[10px] text-slate-600 mt-6 font-semibold">{t("copyright")}</p>
      </div>
    </div>
  );
}
