"use client";

import { useState } from "react";
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
  Upload
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  const { isDbConnected, changeUsername, changePassword, exportBackup, importBackup, t } = useApp();

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
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="p-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/60 transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> {t("accountTitle")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium pl-8">{t("accountDesc")}</p>
        </div>
      </div>

      {/* Grid for forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username form Card */}
        <div className="bg-[#0e1626]/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4 hover:border-slate-800 transition-all duration-300">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-md font-extrabold text-slate-100">{t("usernameChangeTitle")}</h3>
          </div>

          <form onSubmit={handleChangeUsername} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("usernameLabel") || "New Username"}</label>
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("confirmPassPlaceholder") || "Confirm Password"}</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-200 transition-colors"
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
        <div className="bg-[#0e1626]/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4 hover:border-slate-800 transition-all duration-300">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-md font-extrabold text-slate-100">{t("passwordChangeTitle")}</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("currentPasswordPlaceholder") || "Current Password"}</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-200 transition-colors"
                  disabled={passwordLoading}
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("newPasswordPlaceholder") || "New Password"}</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-200 transition-colors"
                  disabled={passwordLoading}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("confirmNewPasswordPlaceholder") || "Confirm New Password"}</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-200 transition-colors"
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
      <div className="bg-[#0e1626]/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 hover:border-slate-800 transition-all duration-300 mt-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-md font-extrabold text-slate-100">ডাটা ব্যাকআপ ও পুনরুদ্ধার (Backup & Restore)</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">ডাটাবেজ সুরক্ষা ও রিস্টোরেশন টুলস</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Export section */}
          <div className="space-y-3 p-5 rounded-2xl bg-[#090d16]/40 border border-slate-800/50">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-extrabold">
              <Download className="w-4 h-4 text-emerald-400" /> ব্যাকআপ ফাইল ডাউনলোড করুন
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              আপনার খামারের আয়, ব্যয়, দান, উত্তোলন এবং বিনিয়োগের সমস্ত ডাটা সুরক্ষিত রাখতে একটি `.json` ব্যাকআপ ফাইল ডাউনলোড করে আপনার লোকাল ডিভাইসে সংরক্ষণ করুন।
            </p>
            <Button
              onClick={exportBackup}
              disabled={!isDbConnected}
              variant="emerald"
              className="w-full h-11 text-xs font-bold flex items-center justify-center gap-2 mt-4"
            >
              <Download className="w-4 h-4" /> ব্যাকআপ ফাইল ডাউনলোড করুন (JSON)
            </Button>
          </div>

          {/* Import section */}
          <div className="space-y-3 p-5 rounded-2xl bg-[#090d16]/40 border border-slate-800/50">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-extrabold">
              <Upload className="w-4 h-4 text-emerald-400" /> ব্যাকআপ ফাইল রিস্টোর করুন
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              আপনার ডিভাইসে সংরক্ষিত পূর্বের `.json` ব্যাকআপ ফাইলটি আপলোড করে আপনার বর্তমান খামারের সম্পূর্ণ ডাটাবেজ পুনরুদ্ধার বা রিস্টোর করতে পারেন।
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
                className="w-full h-11 text-xs font-bold border-slate-800 hover:bg-slate-800/50 text-slate-355 hover:text-white flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-400" /> {importLoading ? "ফাইল প্রসেস হচ্ছে..." : "ব্যাকআপ ফাইল আপলোড করুন (.json)"}
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
    </div>
  );
}
