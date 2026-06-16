"use client";

import  {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { RecordItem, FarmData, SavedTotalItem, Note, Asset } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { Language, TranslationKey, translations } from "@/lib/translations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmOptions {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "danger" | "info" | "success";
  singleButton?: boolean;
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;

  // Data
  income: RecordItem[];
  expense: RecordItem[];
  donation: RecordItem[];
  withdraw: RecordItem[];
  investment: RecordItem[];
  reinvestment: RecordItem[];
  returnedCash: RecordItem[];
  savedTotals: Record<string, SavedTotalItem[]>;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  calcHistory: string[];
  setCalcHistory: (history: string[]) => void;

  // DB status
  isDbConnected: boolean | null;
  isLoading: boolean;
  lastSaved: string;

  // CRUD helpers
  addItem: (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, text: string, amount: number, date: string, category?: string) => Promise<void>;
  deleteItem: (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, index: number) => Promise<void>;
  saveAndResetCategory: (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, note?: string) => Promise<void>;
  saveAndResetAll: (note?: string) => Promise<void>;
  deleteSavedTotal: (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, index: number) => Promise<void>;
  saveAllData: (
    inc?: RecordItem[],
    exp?: RecordItem[],
    don?: RecordItem[],
    wth?: RecordItem[],
    inv?: RecordItem[],
    reinv?: RecordItem[],
    retCash?: RecordItem[],
    saved?: Record<string, SavedTotalItem[]>,
    newNotes?: Note[],
    newAssets?: Asset[],
    newCalcHist?: string[]
  ) => Promise<void>;
  deleteHistorySession: (date: string, note: string) => Promise<void>;
  setReturnedCashOffset: (amount: number) => Promise<void>;
  // Settings & Backup
  changeUsername: (newUser: string, pass: string) => Promise<{ ok: boolean; msg: string }>;
  changePassword: (oldPass: string, newPass: string, confirmNewPass: string) => Promise<{ ok: boolean; msg: string }>;
  exportBackup: () => void;
  importBackup: (jsonText: string) => Promise<{ ok: boolean; msg: string }>;
  showConfirm: (options: ConfirmOptions) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmState(options);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);
  const [income, setIncome] = useState<RecordItem[]>([]);
  const [expense, setExpense] = useState<RecordItem[]>([]);
  const [donation, setDonation] = useState<RecordItem[]>([]);
  const [withdraw, setWithdraw] = useState<RecordItem[]>([]);
  const [investment, setInvestment] = useState<RecordItem[]>([]);
  const [reinvestment, setReinvestment] = useState<RecordItem[]>([]);
  const [returnedCash, setReturnedCash] = useState<RecordItem[]>([]);
  const [savedTotals, setSavedTotals] = useState<Record<string, SavedTotalItem[]>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState("");


  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const [language, setLanguageState] = useState<Language>("en");

  // ── Initialize Language ───────────────────────────────────────────────────
  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language;
    if (storedLang && (storedLang === "bn" || storedLang === "en")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(storedLang);
    } else {
      localStorage.setItem("language", "en");
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const langTrans = translations[language] || translations.bn;
      let text = langTrans[key] || translations.bn[key] || (key as string);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [language]
  );

  // ── Initialize Theme ───────────────────────────────────────────────────────
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (storedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(storedTheme);
      if (storedTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } else {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      if (next === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
      return next;
    });
  }, []);

  const pathname = usePathname();
  const router = useRouter();

  // ── Verify Credentials ─────────────────────────────────────────────────────
  const verifyCredentials = useCallback(async (currentPath: string) => {
    const isLoginPage = currentPath === "/login";

    const handleAuthFailure = async () => {
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch {}
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("auth_hashes");
      setIsAuthenticated(false);
      if (!isLoginPage) {
        router.replace("/login");
      }
    };

    const storedHashes = localStorage.getItem("auth_hashes");
    if (!storedHashes) {
      if (!isLoginPage) {
        await handleAuthFailure();
      }
      return false;
    }

    try {
      const hashes = JSON.parse(storedHashes);
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          hashedUsername: hashes.username, 
          hashedPassword: hashes.password 
        }),
      });

      if (verifyRes.ok) {
        const data = await verifyRes.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          if (isLoginPage) {
            router.replace("/");
          }
          return true;
        } else {
          await handleAuthFailure();
          return false;
        }
      } else {
        await handleAuthFailure();
        return false;
      }
    } catch {
      await handleAuthFailure();
      return false;
    }
  }, [router]);

  // ── Save all data to MongoDB ───────────────────────────────────────────────
  const saveAllData = useCallback(
    async (
      inc: RecordItem[] = income,
      exp: RecordItem[] = expense,
      don: RecordItem[] = donation,
      wth: RecordItem[] = withdraw,
      inv: RecordItem[] = investment,
      reinv: RecordItem[] = reinvestment,
      retCash: RecordItem[] = returnedCash,
      saved: Record<string, SavedTotalItem[]> = savedTotals,
      newNotes: Note[] = notes,
      newAssets: Asset[] = assets,
      newCalcHist: string[] = calcHistory
    ) => {
      try {
        const res = await fetch("/api/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            income: inc,
            expense: exp,
            donation: don,
            withdraw: wth,
            investment: inv,
            reinvestment: reinv,
            returnedCash: retCash,
            savedTotals: saved,
            notes: newNotes,
            assets: newAssets,
            calcHistory: newCalcHist
          }),
        });
        if (res.ok) {
          setIsDbConnected(true);
          setLastSaved(new Date().toISOString());
          queryClient.invalidateQueries({ queryKey: ["records"] });
        } else {
          setIsDbConnected(false);
        }
      } catch {
        setIsDbConnected(false);
      }
    },
    [income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, notes, assets, calcHistory, queryClient]
  );

  // ── React Query for Records ───────────────────────────────────────────────
  const { data: recordsData } = useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      const res = await fetch("/api/records");
      if (!res.ok) throw new Error("Failed to fetch records");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (recordsData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (recordsData.income) setIncome(recordsData.income);
      if (recordsData.expense) setExpense(recordsData.expense);
      if (recordsData.donation) setDonation(recordsData.donation);
      if (recordsData.withdraw) setWithdraw(recordsData.withdraw);
      if (recordsData.investment) setInvestment(recordsData.investment);
      if (recordsData.reinvestment) setReinvestment(recordsData.reinvestment);
      if (recordsData.returnedCash) setReturnedCash(recordsData.returnedCash);
      if (recordsData.savedTotals) setSavedTotals(recordsData.savedTotals);
      if (recordsData.notes) setNotes(recordsData.notes);
      if (recordsData.assets) setAssets(recordsData.assets);
      if (recordsData.calcHistory) setCalcHistory(recordsData.calcHistory);
      setIsDbConnected(!recordsData.dbOffline);
      if (!recordsData.dbOffline) setLastSaved(new Date().toISOString());
    }
  }, [recordsData]);



  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await verifyCredentials(window.location.pathname);
      setIsLoading(false);
    };
    init();
  }, [verifyCredentials]);

  // ── Check credentials on subsequent route visits ────────────────────────────
  useEffect(() => {
    if (!isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      verifyCredentials(pathname);
    }
  }, [pathname, isLoading, verifyCredentials]);

  // ── Autosave every 2 minutes ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(async () => {
      await saveAllData();
    }, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated, saveAllData]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        const data = await res.json();
        
        if (data.success && data.hashes) {
          localStorage.setItem("auth_hashes", JSON.stringify(data.hashes));
          setIsAuthenticated(true);
          return true;
        }
      } catch (err) {
        console.error("Login Error:", err);
      }
      return false;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("auth_hashes");
    setIsAuthenticated(false);
  }, []);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addItem = useCallback(
    async (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, text: string, amount: number, date: string) => {
      const item: RecordItem = { text: text.trim(), amount, date };
      let inc = income, exp = expense, don = donation, wth = withdraw, inv = investment, reinv = reinvestment, retCash = returnedCash;

      if (type === "income") { inc = [...income, item]; setIncome(inc); }
      else if (type === "expense") { exp = [...expense, item]; setExpense(exp); }
      else if (type === "donation") { don = [...donation, item]; setDonation(don); }
      else if (type === "withdraw") { wth = [...withdraw, item]; setWithdraw(wth); }
      else if (type === "investment") { inv = [...investment, item]; setInvestment(inv); }
      else if (type === "reinvestment") { reinv = [...reinvestment, item]; setReinvestment(reinv); }
      else if (type === "returnedCash") { retCash = [...returnedCash, item]; setReturnedCash(retCash); }

      await saveAllData(inc, exp, don, wth, inv, reinv, retCash);
    },
    [income, expense, donation, withdraw, investment, reinvestment, returnedCash, saveAllData]
  );

  const deleteItem = useCallback(
    async (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, index: number) => {
      let inc = income, exp = expense, don = donation, wth = withdraw, inv = investment, reinv = reinvestment, retCash = returnedCash;

      if (type === "income") { inc = income.filter((_, i) => i !== index); setIncome(inc); }
      else if (type === "expense") { exp = expense.filter((_, i) => i !== index); setExpense(exp); }
      else if (type === "donation") { don = donation.filter((_, i) => i !== index); setDonation(don); }
      else if (type === "withdraw") { wth = withdraw.filter((_, i) => i !== index); setWithdraw(wth); }
      else if (type === "investment") { inv = investment.filter((_, i) => i !== index); setInvestment(inv); }
      else if (type === "reinvestment") { reinv = reinvestment.filter((_, i) => i !== index); setReinvestment(reinv); }
      else if (type === "returnedCash") { retCash = returnedCash.filter((_, i) => i !== index); setReturnedCash(retCash); }

      await saveAllData(inc, exp, don, wth, inv, reinv, retCash);
    },
    [income, expense, donation, withdraw, investment, reinvestment, returnedCash, saveAllData]
  );

  const setReturnedCashOffset = useCallback(async (amount: number) => {
    const newSaved = { ...savedTotals };
    const currentList = newSaved["returnedCashOffset"] || [];
    newSaved["returnedCashOffset"] = [...currentList, { amount, note: "Reset", date: new Date().toISOString().split("T")[0], id: Date.now().toString() }];
    setSavedTotals(newSaved);
    await saveAllData(income, expense, donation, withdraw, investment, reinvestment, returnedCash, newSaved);
  }, [income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, saveAllData]);

  const saveAndResetCategory = useCallback(
    async (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, note?: string) => {
      const listMap: Record<Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, RecordItem[]> = {
        income, expense, donation, withdraw, investment, reinvestment, returnedCash
      };
      const list = listMap[type] || [];
      const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
      if (totalAmount === 0) return;

      const formattedDate = new Date().toISOString().split("T")[0];
      const sessionId = Date.now().toString();
      const newSavedItem: SavedTotalItem = {
        amount: totalAmount,
        date: formattedDate,
        note: note?.trim() || `Reset on ${formattedDate}`,
        id: sessionId
      };

      const updatedSavedTotals = {
        ...savedTotals,
        [type]: [...(savedTotals[type] || []), newSavedItem]
      };
      setSavedTotals(updatedSavedTotals);

      let inc = income, exp = expense, don = donation, wth = withdraw, inv = investment, reinv = reinvestment, retCash = returnedCash;
      if (type === "income") { inc = []; setIncome([]); }
      else if (type === "expense") { exp = []; setExpense([]); }
      else if (type === "donation") { don = []; setDonation([]); }
      else if (type === "withdraw") { wth = []; setWithdraw([]); }
      else if (type === "investment") { inv = []; setInvestment([]); }
      else if (type === "reinvestment") { reinv = []; setReinvestment([]); }
      else if (type === "returnedCash") { retCash = []; setReturnedCash([]); }

      await saveAllData(inc, exp, don, wth, inv, reinv, retCash, updatedSavedTotals);
    },
    [income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, saveAllData]
  );

  const saveAndResetAll = useCallback(
    async (note?: string) => {
      const listMap: Record<Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, RecordItem[]> = {
        income, expense, donation, withdraw, investment, reinvestment, returnedCash
      };
      
      const formattedDate = new Date().toISOString().split("T")[0];
      const defaultNote = note?.trim() || `Reset on ${formattedDate}`;
      const sessionId = Date.now().toString();
      const updatedSavedTotals = { ...savedTotals };
      
      let hasUpdates = false;

      // Calculate cash balance of the active cycle before resetting
      const activeReinvestment = reinvestment.reduce((sum, item) => sum + item.amount, 0);
      const activeExpense = expense.reduce((sum, item) => sum + item.amount, 0);
      const activeCashBalanceVal = activeReinvestment - activeExpense;

      (Object.keys(listMap) as Array<Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">>).forEach((type) => {
        const list = listMap[type];
        const totalAmount = list.reduce((sum, item) => sum + item.amount, 0);
        if (totalAmount > 0) {
          hasUpdates = true;
          // Do not add returnedCash to the history totals
          if (type !== "returnedCash") {
            const newSavedItem: SavedTotalItem = {
              amount: totalAmount,
              date: formattedDate,
              note: defaultNote,
              id: sessionId
            };
            updatedSavedTotals[type] = [...(updatedSavedTotals[type] || []), newSavedItem];
          }
        }
      });

      // Clear the returnedCashOffset as well
      if (updatedSavedTotals["returnedCashOffset"]) {
          updatedSavedTotals["returnedCashOffset"] = [];
          hasUpdates = true;
      }

      if (!hasUpdates) return;

      // Save calculated cash balance under key "cashBalance"
      const newSavedCashBalanceItem: SavedTotalItem = {
        amount: activeCashBalanceVal,
        date: formattedDate,
        note: defaultNote,
        id: sessionId
      };
      updatedSavedTotals["cashBalance"] = [...(updatedSavedTotals["cashBalance"] || []), newSavedCashBalanceItem];

      setSavedTotals(updatedSavedTotals);
      setIncome([]);
      setExpense([]);
      setDonation([]);
      setWithdraw([]);
      setInvestment([]);
      setReinvestment([]);
      setReturnedCash([]);

      await saveAllData([], [], [], [], [], [], [], updatedSavedTotals);
    },
    [income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, saveAllData]
  );

  const deleteSavedTotal = useCallback(
    async (type: Exclude<keyof FarmData, "savedTotals" | "notes" | "assets" | "calcHistory">, index: number) => {
      const typeSavedList = savedTotals[type] || [];
      const updatedList = typeSavedList.filter((_, i) => i !== index);
      const updatedSavedTotals = {
        ...savedTotals,
        [type]: updatedList
      };
      setSavedTotals(updatedSavedTotals);

      await saveAllData(income, expense, donation, withdraw, investment, reinvestment, returnedCash, updatedSavedTotals);
    },
    [income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, saveAllData]
  );

  const deleteHistorySession = useCallback(
    async (idOrDate: string, note: string) => {
      // Build updated savedTotals in one pass — filter out ALL entries matching this session key
      const updatedSavedTotals: Record<string, SavedTotalItem[]> = {};
      for (const key of Object.keys(savedTotals)) {
        updatedSavedTotals[key] = (savedTotals[key] || []).filter(
          (item) => {
            if (item.id) {
              return item.id !== idOrDate;
            }
            return !(item.date === idOrDate && (item.note ?? "") === note);
          }
        );
      }
      setSavedTotals(updatedSavedTotals);
      await saveAllData(income, expense, donation, withdraw, investment, reinvestment, returnedCash, updatedSavedTotals);
    },
    [income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, saveAllData]
  );

  // ── Settings & Credentials ──────────────────────────────────────────────────
  const changeUsername = async (newUser: string, pass: string) => {
    if (!pass) return { ok: false, msg: "❌ বর্তমান পাসওয়ার্ড আবশ্যক!" };
    if (!newUser.trim() || newUser.length < 3) return { ok: false, msg: "❌ ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে!" };

    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername: newUser.trim(), oldPassword: pass }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.hashes) localStorage.setItem("auth_hashes", JSON.stringify(data.hashes));
        return { ok: true, msg: "✅ ইউজারনেম পরিবর্তন সফল হয়েছে!" };
      } else {
        return { ok: false, msg: data.error || "❌ সার্ভার এরর!" };
      }
    } catch {
      return { ok: false, msg: "❌ নেটওয়ার্ক এরর!" };
    }
  };

  const changePassword = async (oldPass: string, newPass: string, confirmNewPass: string) => {
    if (!oldPass) return { ok: false, msg: "❌ বর্তমান পাসওয়ার্ড আবশ্যক!" };
    if (newPass !== confirmNewPass) return { ok: false, msg: "❌ নতুন পাসওয়ার্ড মিলছে না!" };
    if (newPass.length < 4) return { ok: false, msg: "❌ পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!" };

    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPass, oldPassword: oldPass }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.hashes) localStorage.setItem("auth_hashes", JSON.stringify(data.hashes));
        return { ok: true, msg: "✅ পাসওয়ার্ড পরিবর্তন সফল হয়েছে!" };
      } else {
        return { ok: false, msg: data.error || "❌ সার্ভার এরর!" };
      }
    } catch {
      return { ok: false, msg: "❌ নেটওয়ার্ক এরর!" };
    }
  };

  // ── Backup ─────────────────────────────────────────────────────────────────
  const exportBackup = useCallback(() => {
    const data = { income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, notes, assets, calcHistory };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `khan_agro_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals, notes, assets, calcHistory]);

  const importBackup = async (jsonText: string) => {
    try {
      const d = JSON.parse(jsonText);
      if (Array.isArray(d.income)) setIncome(d.income);
      if (Array.isArray(d.expense)) setExpense(d.expense);
      if (Array.isArray(d.donation)) setDonation(d.donation);
      if (Array.isArray(d.withdraw)) setWithdraw(d.withdraw);
      if (Array.isArray(d.investment)) setInvestment(d.investment);
      if (Array.isArray(d.reinvestment)) setReinvestment(d.reinvestment);
      if (Array.isArray(d.returnedCash)) setReturnedCash(d.returnedCash);
      if (d.savedTotals && typeof d.savedTotals === "object") setSavedTotals(d.savedTotals);
      if (Array.isArray(d.notes)) setNotes(d.notes);
      if (Array.isArray(d.assets)) setAssets(d.assets);
      if (Array.isArray(d.calcHistory)) setCalcHistory(d.calcHistory);
      
      await saveAllData(
        Array.isArray(d.income) ? d.income : income,
        Array.isArray(d.expense) ? d.expense : expense,
        Array.isArray(d.donation) ? d.donation : donation,
        Array.isArray(d.withdraw) ? d.withdraw : withdraw,
        Array.isArray(d.investment) ? d.investment : investment,
        Array.isArray(d.reinvestment) ? d.reinvestment : reinvestment,
        Array.isArray(d.returnedCash) ? d.returnedCash : returnedCash,
        d.savedTotals && typeof d.savedTotals === "object" ? d.savedTotals : savedTotals,
        Array.isArray(d.notes) ? d.notes : notes,
        Array.isArray(d.assets) ? d.assets : assets,
        Array.isArray(d.calcHistory) ? d.calcHistory : calcHistory
      );
      
      return { ok: true, msg: "✅ ব্যাকআপ রিস্টোর সফল হয়েছে!" };
    } catch {
      return { ok: false, msg: "❌ JSON ফরম্যাট সঠিক নয়!" };
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, setIsAuthenticated, login, logout,
        theme, toggleTheme,
        language, setLanguage, t,
        income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals,
        notes, setNotes, assets, setAssets, calcHistory, setCalcHistory,
        isDbConnected, isLoading, lastSaved,
        addItem, deleteItem, saveAndResetCategory, saveAndResetAll, deleteSavedTotal, deleteHistorySession, setReturnedCashOffset,
        changeUsername, changePassword, exportBackup, importBackup, saveAllData,
        showConfirm
      }}
    >
      {children}
      {confirmState && (
        <ConfirmDialog
          options={confirmState}
          onClose={closeConfirm}
          language={language}
        />
      )}
    </AppContext.Provider>
  );
}

function ConfirmDialog({ 
  options, 
  onClose,
  language
}: { 
  options: ConfirmOptions; 
  onClose: () => void;
  language: string;
}) {
  const { title, message, onConfirm, onCancel, type = "danger", singleButton = false } = options;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const Icon = type === "danger" 
    ? AlertTriangle 
    : type === "success" 
      ? CheckCircle2 
      : Info;

  const iconColor = type === "danger" 
    ? "text-red-400 bg-red-500/10 border-red-500/20" 
    : type === "success" 
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
      : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";

  const confirmBtnBg = type === "danger"
    ? "bg-red-500 hover:bg-red-600 text-white"
    : "bg-emerald-500 hover:bg-emerald-600 text-white";

  const cancelLabel = language === "bn" ? "বাতিল" : "Cancel";
  const confirmLabel = singleButton
    ? (language === "bn" ? "ঠিক আছে" : "OK")
    : (language === "bn" ? "নিশ্চিত করুন" : "Confirm");
  const defaultTitle = title || (
    type === "danger" 
      ? (language === "bn" ? "সতর্কতা" : "Warning") 
      : (language === "bn" ? "নিশ্চিতকরণ" : "Confirmation")
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border border-border/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-md font-black text-text-primary mb-2 tracking-tight">
          {defaultTitle}
        </h3>
        <p className="text-xs text-text-secondary font-medium leading-relaxed mb-6 whitespace-pre-wrap break-words max-w-xs">
          {message}
        </p>
        <div className="flex w-full gap-3 mt-auto">
          {!singleButton && (
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 h-11 text-xs font-bold border-border bg-surface-hover hover:bg-border/60 text-text-secondary transition-colors rounded-xl"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className={`flex-1 h-11 text-xs font-bold rounded-xl transition-all ${confirmBtnBg}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
