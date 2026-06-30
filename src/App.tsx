/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  CheckSquare, 
  Square, 
  Download, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  RefreshCw, 
  SlidersHorizontal,
  Briefcase, 
  Globe, 
  Calendar, 
  Unlock, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Code,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { pythonBackendFiles, PythonFile } from "./python_backend_source";
import { initialCases, LegalCase, HearingHistoryEntry } from "./mock_cases";
import { exportCasePDF, exportCaseWord, exportBatchPDF, exportBatchWord } from "./utils/exporter";
import { firebaseService } from "./firebase";
import { HomePage, AboutPage, PricingPage, UpgradeModal } from "./components/SaaSPages";

export default function App() {
  // SaaS Navigation Views
  const [currentView, setCurrentView] = useState<"home" | "about" | "pricing" | "dashboard">("home");
  const [isPro, setIsPro] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Navigation & Authentication
  const [activeTab, setActiveTab] = useState<"console" | "blueprint">("console");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("mahaswetastarry@gmail.com");
  const [password, setPassword] = useState<string>("••••••••");
  
  // App Notification Messages
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Core Cases Collection
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [casesLoading, setCasesLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Attempt to restore persistent session on component mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await firebaseService.getCurrentUser();
        if (currentUser) {
          setIsAuthenticated(true);
          setCurrentView("dashboard");
          if (currentUser.email) {
            setEmail(currentUser.email);
          }
          showNotification(`Authenticated session restored for ${currentUser.email || "user"}`);
        }
      } catch (err) {
        console.error("Session restoration failure:", err);
      }
    };
    restoreSession();
  }, []);

  // Synchronize dynamic case listings on session state changes
  useEffect(() => {
    if (isAuthenticated) {
      const loadCasesAndProfileFromDb = async () => {
        setCasesLoading(true);
        try {
          const currentUser = await firebaseService.getCurrentUser();
          if (!currentUser) return;

          // Fetch subscription tier status
          const profile = await firebaseService.getUserProfile(currentUser.id);
          if (profile) {
            setIsPro(profile.isPro);
          } else {
            setIsPro(false);
          }

          let list = await firebaseService.fetchCases();
          const seedKey = `veritas_firebase_seeded_${currentUser.id}`;
          if (list.length === 0 && !localStorage.getItem(seedKey)) {
            // Seed the Firestore database with initialCases for a gorgeous day-one presentation under this user's UID
            for (const c of initialCases) {
              await firebaseService.saveCase(c);
            }
            list = await firebaseService.fetchCases();
            localStorage.setItem(seedKey, "true");
          }
          setCases(list);
        } catch (err) {
          console.error(err);
          showNotification("Failed to fetch legal record dockets from Firebase database.", "info");
        } finally {
          setCasesLoading(false);
        }
      };
      loadCasesAndProfileFromDb();
    } else {
      setCases([]);
      setIsPro(false);
    }
  }, [isAuthenticated]);

  // Subscription Case Counter (Limit check resets on first day of calendar month dynamically)
  const casesThisMonthCount = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    return cases.filter(c => {
      if (!c.createdAt) return false;
      const date = new Date(c.createdAt);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    }).length;
  }, [cases]);

  // Handle upgrading the advocate to Veritas Pro Tier
  const handleUpgradeToPro = async () => {
    try {
      const currentUser = await firebaseService.getCurrentUser();
      if (currentUser) {
        await firebaseService.updateUserProfile(currentUser.id, { isPro: true });
        setIsPro(true);
        showNotification("Congratulations! You have upgraded to VERITAS Pro.", "success");
      } else {
        setIsPro(true);
        showNotification("Simulated upgrade successful for sandbox advocate.", "success");
      }
      window.open("https://rzp.io/rzp/vO48zMI", "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      showNotification("Could not complete subscription upgrade.", "info");
    }
  };

  // Phase 2 Form State (12 parameters)
  const [formCaseIndex, setFormCaseIndex] = useState("");
  const [formPetitioner, setFormPetitioner] = useState("");
  const [formRespondent, setFormRespondent] = useState("Petitioner");
  const [formAdvocate, setFormAdvocate] = useState("Clara Underwood, Esq.");
  const [formCategory, setFormCategory] = useState<string>("Writ");
  const [formForum, setFormForum] = useState("");
  const [formWritType, setFormWritType] = useState("");
  const [formFilingYear, setFormFilingYear] = useState(new Date().getFullYear());
  const [formStatus, setFormStatus] = useState("Notice");
  const [formKeywords, setFormKeywords] = useState("");
  const [formFilingStart, setFormFilingStart] = useState("2026-06-20");
  const [formFilingEnd, setFormFilingEnd] = useState("2026-06-25");
  const [formHearingStart, setFormHearingStart] = useState("2026-07-10");
  const [formHearingEnd, setFormHearingEnd] = useState("2026-07-11");
  const [formHearings, setFormHearings] = useState<Array<{ date: string; status: string }>>([
    { date: "2026-07-10", status: "Notice" }
  ]);

  // Phase 3 Grid Interactions
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isExportExpanded, setIsExportExpanded] = useState(false);

  // Advanced Export Settings
  const [exportYear, setExportYear] = useState<string>("all");
  const [exportMonth, setExportMonth] = useState<string>("all");
  const [exportDate, setExportDate] = useState<string>("");
  const [exportCategory, setExportCategory] = useState<string>("all");
  const [exportForum, setExportForum] = useState<string>("all");

  // Mutation and Actions loading matrices
  const [advancingId, setAdvancingId] = useState<number | null>(null);
  
  // Local state for the "Mark Hearing Completed" dialog overlay/form
  const [completingHearing, setCompletingHearing] = useState<{
    hearingNo: number;
    outcome: string;
    remarks: string;
    nextDate: string;
    status: string;
  } | null>(null);

  // Selected Python Code File
  const [selectedPyFile, setSelectedPyFile] = useState<PythonFile>(pythonBackendFiles[0]);

  // Case Editing Dialog Active Entity state
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);

  // Keypress listener for modal dismissal via Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (completingHearing) {
          setCompletingHearing(null);
        } else if (editingCase) {
          setEditingCase(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingCase, completingHearing]);

  // Lock background scroll when modals are displayed, and restore on unmount
  useEffect(() => {
    if (editingCase || completingHearing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingCase, completingHearing]);

  // Instant save custom action for editing active docket
  const handleSaveEditCase = async (updated: LegalCase) => {
    try {
      const saved = await firebaseService.saveCase(updated);
      setCases(prev => prev.map(c => c.id === saved.id ? saved : c));
      showNotification(`Docket ${updated.caseIndexNo} modifications stored to database.`);
      setEditingCase(null);
    } catch (err: any) {
      showNotification("Database save failure: " + err.message, "info");
    }
  };

  // Dynamic Hearing Completion & Next Hearing Sequential Auto-Generation
  const handleConfirmHearingCompleted = async (caseId: number) => {
    if (!completingHearing || !editingCase) return;

    try {
      const existingHistory = editingCase.hearingHistory || [];

      // 1. Mark current upcoming hearing as completed and append outcome/remarks
      const updatedHistory = existingHistory.map(h => {
        if (h.hearingNo === completingHearing.hearingNo) {
          return {
            ...h,
            completed: true,
            outcome: completingHearing.outcome || "Completed",
            remarks: completingHearing.remarks || "Concluded automatically."
          };
        }
        return h;
      });

      // 2. Check if selected status is Judgment Delivered or Case Disposed or Disposed
      const isDisposedStatus = completingHearing.status === "Judgment Delivered" || completingHearing.status === "Case Disposed" || completingHearing.status === "Disposed";

      let finalHistory = [...updatedHistory];
      let nextHearingNo = completingHearing.hearingNo;
      let nextDateStartEnd = "";

      if (!isDisposedStatus) {
        // Automatically create the next sequential upcoming hearing with the user-entered date
        nextHearingNo = completingHearing.hearingNo + 1;
        const nextHearing: HearingHistoryEntry = {
          hearingNo: nextHearingNo,
          date: completingHearing.nextDate,
          status: completingHearing.status || "Trial",
          completed: false, // upcoming active
          outcome: "",
          remarks: "Scheduled next progression level automatically."
        };
        finalHistory = [...updatedHistory, nextHearing];
        nextDateStartEnd = completingHearing.nextDate;
      }

      // Automatically make the latest scheduled hearing active on case status
      const nextCaseStatus = completingHearing.status || editingCase.currentCaseStatus || "Notice";

      const updatedCase: LegalCase = {
        ...editingCase,
        currentCaseStatus: nextCaseStatus,
        hearingIndex: nextHearingNo,
        hearingDateStart: nextDateStartEnd,
        hearingDateEnd: nextDateStartEnd,
        hearingHistory: finalHistory
      };

      const saved = await firebaseService.saveCase(updatedCase);
      setCases(prev => prev.map(c => c.id === caseId ? saved : c));
      setEditingCase(null); // Close the edit docket modal synchronously on save
      setCompletingHearing(null); // Close the nested completion modal on save

      showNotification(
        isDisposedStatus
          ? `Hearing #${completingHearing.hearingNo} completed. Case marked closed (${nextCaseStatus}).`
          : `Hearing #${completingHearing.hearingNo} completed. Sequential Hearing #${nextHearingNo} scheduled successfully.`
      );
    } catch (err: any) {
      showNotification("Error updating hearing: " + err.message, "info");
    }
  };

  // Direct toggle Completed/Done states
  const handleToggleCaseCompleted = async (caseId: number) => {
    try {
      const targetCase = cases.find(c => c.id === caseId);
      if (!targetCase) return;

      const isDone = targetCase.currentCaseStatus === "Completed";
      const updatedCase: LegalCase = {
        ...targetCase,
        currentCaseStatus: isDone ? "Stage 1: Active Hearing" : "Completed"
      };

      const saved = await firebaseService.saveCase(updatedCase);
      setCases(prev => prev.map(c => c.id === caseId ? saved : c));
      showNotification(`Docket status updated.`);
    } catch (err: any) {
      showNotification("Failed to toggle: " + err.message, "info");
    }
  };

  // Toast dispatch helper
  const showNotification = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Real Firebase-backed Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showNotification("Credentials email and password are required.", "info");
      return;
    }
    
    setAuthLoading(true);
    const finalPassword = (!password || password === "••••••••") ? "password123" : password;
    try {
      if (authMode === "login") {
        const { data, error } = await firebaseService.signIn(email, finalPassword);
        if (error) {
          // If sign in fails, try to automatically sign up/register for a seamless onboarding experience!
          const signUpRes = await firebaseService.signUp(email, finalPassword);
          if (signUpRes.error) {
            showNotification(error.message || signUpRes.error.message, "info");
          } else {
            setIsAuthenticated(true);
            showNotification(`Welcome new advocate! Secure workspace established for ${email}`);
          }
        } else {
          setIsAuthenticated(true);
          showNotification(`Secure entry granted. Connected as ${email}`);
        }
      } else {
        const { data, error } = await firebaseService.signUp(email, finalPassword);
        if (error) {
          showNotification(error.message, "info");
        } else {
          setIsAuthenticated(true);
          showNotification(`A new advocate account has been established for ${email}`);
        }
      }
    } catch (err: any) {
      showNotification(err.message || "Failed to authenticate.", "info");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBypassAuth = async () => {
    const targetEmail = email || "mahaswetastarry@gmail.com";
    const finalPassword = "password123";
    setAuthLoading(true);
    try {
      // Robust bypass check: try to sign in, fall back to sign up if needed so it ALWAYS succeeds
      let res = await firebaseService.signIn(targetEmail, finalPassword);
      if (res.error) {
        res = await firebaseService.signUp(targetEmail, finalPassword);
      }
      
      if (res.error) {
        showNotification(`Bypass failed: ${res.error.message}`, "info");
      } else {
        setIsAuthenticated(true);
        setEmail(targetEmail);
        showNotification("Verified Sandbox Session authorized successfully.");
      }
    } catch (err: any) {
      showNotification(`Bypass error: ${err.message}`, "info");
    } finally {
      setAuthLoading(false);
    }
  };

  // Pre-fill dossiers helper
  const triggerPrefillDossier = () => {
    const indicesRandom = Math.floor(1000 + Math.random() * 9000);
    setFormCaseIndex(`WP(C)-${indicesRandom}/2026`);
    setFormPetitioner("Global Sentinel Trust");
    setFormRespondent("Environmental Protection Agency");
    setFormForum("Supreme Court of Judicial Records");
    setFormWritType("Certiorari Statutory Relief");
    setFormKeywords("federal-code, public-equity, resource-distribution");
    showNotification("Dossier prefilled with authentic legal indicators.", "info");
  };

  // Create Case Payload & Sync to Firebase
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();

    // Subscription Limit check for Free users (limit to 20 cases per calendar month)
    if (!isPro && casesThisMonthCount >= 20) {
      setShowUpgradeModal(true);
      showNotification("Monthly Case Limit Reached (20/20). Please upgrade.", "info");
      return;
    }

    if (!formCaseIndex || !formPetitioner || !formRespondent || !formForum || !formWritType) {
      showNotification("Validation Error: Please complete vital docket information.", "info");
      return;
    }

    const exists = cases.some(c => c.caseIndexNo.trim().toUpperCase() === formCaseIndex.trim().toUpperCase());
    if (exists) {
      showNotification(`Docket footprint collision: Case ${formCaseIndex} already exists.`, "info");
      return;
    }

    const hearingHistoryPayload = formHearings.map((h, i) => ({
      hearingNo: i + 1,
      date: h.date,
      status: h.status,
      completed: false,
      outcome: "",
      remarks: i === 0 ? "Initial register catalog assignment." : `Scheduled hearing #${i + 1}.`
    }));

    const ongoingHearing = hearingHistoryPayload.find(h => !h.completed) || hearingHistoryPayload[0];

    const newCasePayload: Omit<LegalCase, "id"> & { id?: number } = {
      caseIndexNo: formCaseIndex,
      petitionerParty: formPetitioner,
      respondentParty: formRespondent,
      advocateOnRecord: formAdvocate || "Clara Underwood, Esq.",
      classificationCategory: formCategory,
      judicialForum: formForum,
      writCaseType: formWritType,
      filingYearTarget: Number(formFilingYear),
      currentCaseStatus: ongoingHearing ? ongoingHearing.status : formStatus,
      keywordsContentMapping: formKeywords || "regulatory",
      filingDateStart: formFilingStart,
      filingDateEnd: formFilingEnd,
      hearingDateStart: formHearings[0]?.date || "2026-07-10",
      hearingDateEnd: formHearings[formHearings.length - 1]?.date || "2026-07-10",
      hearingIndex: 1,
      notes: "Log critical notes, hearing observations, or case briefs.",
      caseSummary: "This case has been successfully filed on the Veritas ledger.",
      petitionerContact: "client-contact@veritasbase.legal",
      respondentContact: "dept-legal-office@government.gov",
      hearingHistory: hearingHistoryPayload
    };

    try {
      const savedCase = await firebaseService.saveCase(newCasePayload);
      setCases(prev => [savedCase, ...prev]);
      showNotification(`Docket ${formCaseIndex} securely synchronised into database repository.`);

      // Reset
      setFormCaseIndex("");
      setFormPetitioner("");
      setFormRespondent("Petitioner");
      setFormForum("");
      setFormWritType("");
      setFormKeywords("");
      setFormHearings([{ date: "2026-07-10", status: "Notice" }]);
      setFormStatus("Notice");
    } catch (err: any) {
      if (err.message === "MONTHLY_LIMIT_REACHED" || err.message?.includes("MONTHLY_LIMIT_REACHED")) {
        setShowUpgradeModal(true);
        showNotification("Monthly Case Limit Reached (20/20). Please upgrade.", "info");
      } else {
        showNotification("Failed to synchronize: " + err.message, "info");
      }
    }
  };

  // Delete case entry helper
  const handleDeleteCase = async (id: number) => {
    try {
      await firebaseService.deleteCase(id);
      setCases(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showNotification("Case docket permanently removed from database repository.");
    } catch (err: any) {
      showNotification("Error deleting case: " + err.message, "info");
    }
  };

  // Unify advance hearing handle to open edit workspace
  const handleAdvanceHearing = async (caseId: number) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (targetCase) {
      setEditingCase(targetCase);
    }
  };

  // Grid Selection Managers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredCases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCases.map(c => c.id)));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Text search filtration matrix
  const filteredCases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return cases.filter(c => {
      // 1. Text Search query
      if (q) {
        return (
          c.caseIndexNo.toLowerCase().includes(q) ||
          c.petitionerParty.toLowerCase().includes(q) ||
          c.respondentParty.toLowerCase().includes(q) ||
          c.advocateOnRecord.toLowerCase().includes(q) ||
          c.judicialForum.toLowerCase().includes(q) ||
          c.keywordsContentMapping.toLowerCase().includes(q) ||
          c.writCaseType.toLowerCase().includes(q) ||
          c.classificationCategory.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cases, searchQuery]);

  // Find cases with past scheduled hearing dates that are not yet marked as completed
  const elapsedCases = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    return cases.filter(c => {
      const upcoming = (c.hearingHistory || []).find(h => !h.completed);
      if (!upcoming) return false;
      return upcoming.date < todayStr;
    });
  }, [cases]);

  // Get dynamic unique values for filtering menu
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(cases.map(c => c.filingYearTarget))).sort((a: number, b: number) => b - a);
  }, [cases]);

  const uniqueForums = useMemo(() => {
    return Array.from(new Set(cases.map(c => c.judicialForum))).sort();
  }, [cases]);

  // Secure Streaming / Chunked Client Export Compiler
  const triggerExportMatrix = (format: "pdf" | "word") => {
    let target = filteredCases;

    // Apply active Export Matrix Dropdown choices if selected
    if (exportYear !== "all") {
      target = target.filter(c => c.filingYearTarget === Number(exportYear));
    }
    if (exportMonth !== "all") {
      target = target.filter(c => {
        const parts = c.filingDateStart.split("-");
        return parts.length >= 2 && parts[1] === exportMonth;
      });
    }
    if (exportDate) {
      target = target.filter(c => c.filingDateStart === exportDate);
    }
    if (exportCategory !== "all") {
      target = target.filter(c => c.classificationCategory === exportCategory);
    }
    if (exportForum !== "all") {
      target = target.filter(c => c.judicialForum === exportForum);
    }
    if (selectedIds.size > 0) {
      target = target.filter(c => selectedIds.has(c.id));
    }

    if (target.length === 0) {
      showNotification("Export Error: No case dockets match defined matrix query restrictions.", "info");
      return;
    }

    if (format === "pdf") {
      exportBatchPDF(target);
    } else {
      exportBatchWord(target);
    }

    showNotification(`Streaming Compiled Package: ${target.length} docket records safely exported.`);
  };

  // Convert Integer index track to dynamic Ordinal string
  const getOrdinalBadgeText = (index: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = index % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${index}${suffix} Hearing`;
  };

  const getSuggestedStatusForHearingNo = (hearingNo: number) => {
    if (hearingNo === 1) return "Notice";
    if (hearingNo === 2) return "Preliminary Hearing";
    if (hearingNo === 3) return "Trial";
    if (hearingNo === 4) return "Cross Examination";
    if (hearingNo === 5) return "Arguments";
    if (hearingNo === 6) return "Judgment Reserved";
    return "Disposed";
  };

  // Downloader for explicit FastAPI static files
  const triggerDownloadPythonBackendFile = (file: PythonFile) => {
    const blob = new Blob([file.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", file.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Downloaded backend module: ${file.filename}`);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#1A1A1A] font-sans selection:bg-lavender selection:text-slate-900">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white text-slate-800 px-5 py-3 text-sm tracking-wide font-mono shadow-elegant rounded-lg border-2 border-mauve"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse border border-cyan-400" />
            <span className="font-semibold text-slate-800">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Header Frame */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo Frame with strict branding constraints */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentView("home")}>
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl font-black tracking-wider bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                Veritas
              </h1>
              {isAuthenticated && (
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {isPro ? "PRO" : "FREE"}
                </span>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 border-l border-slate-100 pl-4 font-semibold">
              <span>LEDGER SYSTEM v1.08</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            </div>
          </div>

          {/* SaaS Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-4 font-mono text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setCurrentView("home")}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === "home" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-650 hover:text-slate-950"}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView("about")}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === "about" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-650 hover:text-slate-950"}`}
            >
              About
            </button>
            <button
              onClick={() => setCurrentView("pricing")}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${currentView === "pricing" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-650 hover:text-slate-950"}`}
            >
              Pricing
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer font-bold ${currentView === "dashboard" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"}`}
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </button>
          </nav>

        </div>
      </header>



      {/* Main Core Layout Viewport */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1">

        {currentView === "home" && (
          <HomePage 
            onNavigate={setCurrentView} 
            isAuthenticated={isAuthenticated} 
            isPro={isPro} 
            onUpgrade={handleUpgradeToPro} 
          />
        )}

        {currentView === "about" && (
          <AboutPage />
        )}

        {currentView === "pricing" && (
          <PricingPage 
            onNavigate={setCurrentView} 
            isAuthenticated={isAuthenticated} 
            isPro={isPro} 
            onUpgrade={handleUpgradeToPro} 
          />
        )}

        {currentView === "dashboard" && (
          <>
            {/* Secondary workspace toolbar for logged-in advocates */}
            {isAuthenticated && (
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">WORKSPACE MODE:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      id="btn-nav-console"
                      onClick={() => setActiveTab("console")}
                      className={`px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all rounded border ${
                        activeTab === "console" 
                          ? "bg-slate-800 text-white border-transparent shadow-xs" 
                          : "bg-white text-slate-650 border-slate-250 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      Console
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-reset-ledger"
                    onClick={() => {
                      setCases(initialCases);
                      setSelectedIds(new Set());
                      showNotification("Registry state reset to dynamic mock parameters.");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 transition-all rounded border border-slate-205 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Reset Database to Mock Standards"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Reset Ledger</span>
                  </button>

                  <button
                    onClick={async () => {
                      await firebaseService.signOut();
                      setIsAuthenticated(false);
                      showNotification("Advocate session dropped. Workspace sealed.");
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 text-[11px] font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Disconnect Workspace"
                  >
                    <X className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="max-w-md mx-auto py-12">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 border border-mauve rounded-2xl p-8 shadow-lg"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex p-3.5 bg-periwinkle border border-mauve rounded-xl mb-3 shadow-sm">
                      <ShieldCheck className="w-7 h-7 text-lavender" />
                    </div>
                    <h2 className="font-sans text-xl font-bold uppercase tracking-wider text-slate-805">
                      {authMode === "login" ? "SESSION GATEWAY" : "REGISTER ASSIGNMENT"}
                    </h2>
                    <p className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-widest font-bold">
                      ADVOCATE CONSOLE ACCESS
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-mono text-slate-600 font-bold mb-1.5">
                        Authorized Email Address
                      </label>
                      <input
                        id="input-auth-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-lavender px-4 py-2.5 text-sm outline-none transition-all rounded-lg font-mono text-slate-800 placeholder-slate-400"
                        placeholder="advocate@veritas.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest font-mono text-slate-600 font-bold mb-1.5">
                        Security Passcode
                      </label>
                      <input
                        id="input-auth-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-lavender px-4 py-2.5 text-sm outline-none transition-all rounded-lg font-mono text-slate-800 placeholder-slate-400"
                        placeholder="Enter security passport key"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        id="btn-auth-submit"
                        type="submit"
                        className="w-full bg-gradient-to-r from-lavender via-mauve to-bubblegum hover:opacity-95 text-slate-800 text-xs font-mono font-bold uppercase tracking-widest py-3.5 transition-all duration-150 rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>{authMode === "login" ? "Verify Session Credentials" : "Initialize Workspace Chamber"}</span>
                        <ArrowRight className="w-4 h-4 text-slate-800" />
                      </button>
                    </div>
                  </form>

                  {/* Dev Bypass Options with strict transparency */}
                  <div className="mt-8 pt-6 border-t border-dashed border-mauve/40 space-y-3">
                    <button
                      id="btn-auth-bypass"
                      onClick={handleBypassAuth}
                      className="w-full bg-white border border-mauve hover:bg-periwinkle text-slate-700 text-xs font-mono font-bold uppercase tracking-widest py-3 transition-all duration-150 rounded-lg flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-lavender" />
                      <span>Sandbox Auth Bypass</span>
                    </button>
                    
                    <div className="flex justify-center text-[11px] text-purple-600 pt-1 px-1 font-mono font-bold">
                      <button 
                        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                        className="hover:text-bubblegum underline"
                      >
                        {authMode === "login" ? "Configure register endpoint" : "Return to Login Console"}
                      </button>
                    </div>
                  </div>

                </motion.div>
              </div>
            ) : (
              /* Authenticated App Viewport */
              <div className="animate-fade-in">
            
            {/* Console view is now the permanent primary viewport */}
            <div className="space-y-10">

                {/* Grid Layout containing CONFIGURATOR Form and LEDGER Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  
                  {/* PHASE 2: DATA REGISTRY CONFIGURATOR (4 Cols) */}
                  <div className="lg:col-span-4 space-y-6">

                    {/* ENHANCED HEARINGS WORKFLOW COCKPIT */}
                    {elapsedCases.length > 0 && (
                      <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-amber-805">
                          <AlertTriangle className="w-5 h-5 animate-pulse text-amber-700" />
                          <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                            ELAPSED HEARINGS ATTENTION
                          </h4>
                        </div>
                        <p className="text-[10px] font-mono text-amber-850 leading-relaxed uppercase font-bold">
                          {elapsedCases.length} ACTIVE {elapsedCases.length === 1 ? "DOCKET HAS" : "DOCKETS HAVE"} PASSED SCHEDULED ACTION DATES WITH NO PROGRESSION RECORDED.
                        </p>
                        
                        <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                          {elapsedCases.map(c => {
                            const upcoming = (c.hearingHistory || []).find(h => !h.completed);
                            if (!upcoming) return null;
                            return (
                              <div key={c.id} className="bg-white border border-amber-200 hover:border-amber-400 transition-all rounded-lg p-3 text-left">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-mono text-xs font-bold text-black">{c.caseIndexNo}</span>
                                  <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-850 px-1.5 py-0.5 rounded border border-amber-200">
                                    PASSED
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-650 font-sans truncate mb-2">
                                  {getOrdinalBadgeText(upcoming.hearingNo)} set on <span className="font-bold underline">{upcoming.date}</span> (Stage: {upcoming.status})
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCase(c);
                                    setCompletingHearing({
                                      hearingNo: upcoming.hearingNo,
                                      outcome: "",
                                      remarks: "",
                                      nextDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0],
                                      status: getSuggestedStatusForHearingNo(upcoming.hearingNo + 1)
                                    });
                                  }}
                                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-[10px] py-1.5 rounded-md transition-all tracking-wider text-center flex items-center justify-center gap-1 cursor-pointer"
                                  title="Mark completed to swap upcoming hearing on top"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span>Advance Stage & Swap on Top</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="bg-white/95 border border-mauve rounded-2xl shadow-sm p-6">
                      
                      <div className="flex items-center justify-between border-b border-dashed border-mauve pb-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-lavender" />
                          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                            DOCKET CREATOR
                          </h3>
                        </div>
                      </div>

                      <form onSubmit={handleCreateCase} className="space-y-4">
                        
                        {/* Param 1: Case Index No */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                              1. Case Index No
                            </label>
                            <span className="text-[9px] text-slate-400 font-mono font-medium">Unique Key</span>
                          </div>
                          <input
                            id="input-param-index"
                            type="text"
                            required
                            placeholder="WP(C)-9821/2026"
                            value={formCaseIndex}
                            onChange={(e) => setFormCaseIndex(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg font-mono text-slate-800 placeholder-slate-350"
                          />
                        </div>

                        {/* Param 2 & 3: Petitioner / Respondent Party */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              2. Party Name
                            </label>
                            <input
                              id="input-param-petitioner"
                              type="text"
                              required
                              placeholder="Plaintiff Corp"
                              value={formPetitioner}
                              onChange={(e) => setFormPetitioner(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg text-slate-800 placeholder-slate-350"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              3. Party Status
                            </label>
                            <select
                              id="select-param-respondent"
                              value={formRespondent}
                              onChange={(e) => setFormRespondent(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg text-slate-800 font-mono"
                            >
                              <option value="Petitioner">Petitioner</option>
                              <option value="Respondent">Respondent</option>
                            </select>
                          </div>
                        </div>

                        {/* Param 4 & 5: Advocate / Classification Dropdown */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              4. Advocate on Record
                            </label>
                            <input
                              id="input-param-advocate"
                              type="text"
                              placeholder="Clara Underwood, Esq."
                              value={formAdvocate}
                              onChange={(e) => setFormAdvocate(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg text-slate-800 placeholder-slate-350"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              5. Classification Category
                            </label>
                            <input
                              id="select-param-category"
                              type="text"
                              placeholder="Writ, Appeal, Civil, etc."
                              value={formCategory}
                              onChange={(e) => setFormCategory(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg text-slate-800 placeholder-slate-350"
                            />
                          </div>
                        </div>

                        {/* Param 6 & 7: Judicial Forum / Writ-Case Type */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              6. Judicial Forum
                            </label>
                            <input
                              id="input-param-forum"
                              type="text"
                              required
                              placeholder="Supreme Court"
                              value={formForum}
                              onChange={(e) => setFormForum(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg text-slate-800 placeholder-slate-350"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              7. Writ/Case Type
                            </label>
                            <input
                              id="input-param-type"
                              type="text"
                              required
                              placeholder="Certiorari Petition"
                              value={formWritType}
                              onChange={(e) => setFormWritType(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg text-slate-800 placeholder-slate-350"
                            />
                          </div>
                        </div>

                        {/* Param 8 & 9: Filing Year / Status */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              8. Filing Year Target
                            </label>
                            <input
                              id="input-param-year"
                              type="number"
                              required
                              min={1980}
                              max={2030}
                              value={formFilingYear}
                              onChange={(e) => setFormFilingYear(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg font-mono text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                              9. Case Status
                            </label>
                            <select
                              id="input-param-status"
                              required
                              value={formStatus}
                              onChange={(e) => {
                                const newS = e.target.value;
                                setFormStatus(newS);
                                setFormHearings(prev => {
                                  const next = [...prev];
                                  if (next.length > 0) {
                                    next[0].status = newS;
                                  }
                                  return next;
                                });
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg font-mono text-slate-800"
                            >
                              <option value="Notice">Notice</option>
                              <option value="Preliminary Hearing">Preliminary Hearing</option>
                              <option value="Trial">Trial</option>
                              <option value="Cross Examination">Cross Examination</option>
                              <option value="Arguments">Arguments</option>
                              <option value="Judgment Reserved">Judgment Reserved</option>
                              <option value="Disposed">Disposed</option>
                            </select>
                          </div>
                        </div>

                        {/* Param 10: Note */}
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold mb-1">
                            10. Note
                          </label>
                          <input
                            id="input-param-keywords"
                            type="text"
                            placeholder="e.g. Important case notes"
                            value={formKeywords}
                            onChange={(e) => setFormKeywords(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white px-3 py-1.5 text-xs outline-none transition-all rounded-lg font-mono text-slate-800 placeholder-slate-300"
                          />
                        </div>

                        {/* Param 12: Hearings Schedule (1st Hearing + Add Hearing) */}
                        <div className="border border-mauve p-3.5 rounded-xl bg-violet-50/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="block text-[10px] uppercase tracking-wider font-mono text-slate-600 font-bold">
                              12. Hearings Scheduler
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const count = formHearings.length;
                                const prevHearing = formHearings[count - 1];
                                const prevDate = prevHearing ? new Date(prevHearing.date) : new Date("2026-07-10");
                                if (isNaN(prevDate.getTime())) {
                                  prevDate.setTime(new Date("2026-07-10").getTime());
                                }
                                prevDate.setDate(prevDate.getDate() + 14);
                                const defaultNextDate = prevDate.toISOString().split('T')[0];
                                
                                setFormHearings([...formHearings, { 
                                  date: defaultNextDate, 
                                  status: "Preliminary Hearing" 
                                }]);
                              }}
                              className="text-[9px] font-mono font-bold text-slate-800 hover:bg-slate-200 bg-slate-100 border border-slate-200 px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>Add Hearing</span>
                            </button>
                          </div>

                          <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                            {formHearings.map((h, i) => {
                              const ordinalLabel = i === 0 ? "1st Hearing" : i === 1 ? "2nd Hearing" : i === 2 ? "3rd Hearing" : `${i + 1}th Hearing`;
                              return (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white border border-slate-150 p-2 rounded-lg shadow-2xs">
                                  <span className="text-[10px] font-mono font-bold text-slate-800 uppercase min-w-[80px]">
                                    {ordinalLabel}
                                  </span>
                                  <input
                                    type="date"
                                    required
                                    value={h.date}
                                    onChange={(e) => {
                                      const updated = [...formHearings];
                                      updated[i].date = e.target.value;
                                      setFormHearings(updated);
                                      if (i === 0) {
                                        setFormHearingStart(e.target.value);
                                      }
                                    }}
                                    className="w-full sm:w-auto flex-1 bg-white border border-slate-200 px-2 py-1 text-xs outline-none rounded font-mono text-slate-800 focus:border-indigo-400"
                                  />
                                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                    <select
                                      value={h.status}
                                      onChange={(e) => {
                                        const updated = [...formHearings];
                                        updated[i].status = e.target.value;
                                        setFormHearings(updated);
                                        if (i === 0) {
                                          setFormStatus(e.target.value);
                                        }
                                      }}
                                      className="bg-white border border-slate-200 px-1.5 py-1 text-[11px] outline-none rounded font-sans text-slate-800 focus:border-indigo-400 w-full sm:w-32"
                                    >
                                      <option value="Notice">Notice</option>
                                      <option value="Preliminary Hearing">Preliminary Hearing</option>
                                      <option value="Trial">Trial</option>
                                      <option value="Cross Examination">Cross Examination</option>
                                      <option value="Arguments">Arguments</option>
                                      <option value="Judgment Reserved">Judgment Reserved</option>
                                      <option value="Disposed">Disposed</option>
                                    </select>
                                    {i > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormHearings(formHearings.filter((_, idx) => idx !== i));
                                        }}
                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded transition-colors"
                                        title="Remove hearing"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Param 11: Allocation Filing Date Range (Start/End) */}
                        <div className="border border-mauve p-3 rounded-xl bg-periwinkle/30 space-y-2">
                          <span className="block text-[9px] uppercase tracking-wider font-mono text-slate-600 font-bold">
                            11. Allocation Filing Date Range
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[8px] font-mono text-slate-500 font-bold">START DATE</span>
                              <input
                                id="input-param-filingstart"
                                type="date"
                                required
                                value={formFilingStart}
                                onChange={(e) => setFormFilingStart(e.target.value)}
                                className="w-full bg-white border border-slate-200 hover:border-slate-300 p-1 text-[11.5px] outline-none rounded-md font-mono text-slate-705"
                              />
                            </div>
                            <div>
                              <span className="block text-[8px] font-mono text-slate-500 font-bold">END DATE</span>
                              <input
                                id="input-param-filingend"
                                type="date"
                                required
                                value={formFilingEnd}
                                onChange={(e) => setFormFilingEnd(e.target.value)}
                                className="w-full bg-white border border-slate-200 hover:border-slate-300 p-1 text-[11.5px] outline-none rounded-md font-mono text-slate-705"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 space-y-3">
                          {!isPro && casesThisMonthCount >= 20 ? (
                            <div className="space-y-2 animate-fade-in">
                              <button
                                type="button"
                                onClick={() => setShowUpgradeModal(true)}
                                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white text-xs font-mono font-bold uppercase tracking-widest py-3.5 transition-all duration-155 rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                              >
                                <Unlock className="w-3.5 h-3.5 text-white animate-pulse" />
                                <span>Upgrade to Pro to Create</span>
                              </button>
                              <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-[11px] text-rose-700 font-sans text-center">
                                Monthly Free Tier Limit Reached (20/20 cases created). Upgrade to VERITAS Pro for unlimited case management.
                              </div>
                            </div>
                          ) : (
                            <button
                              id="btn-form-submit"
                              type="submit"
                              className="w-full bg-gradient-to-r from-lavender via-mauve to-bubblegum hover:opacity-95 text-slate-800 text-xs font-mono font-bold uppercase tracking-widest py-3.5 transition-all duration-155 rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-slate-800" />
                              <span>Commit Case Parameters</span>
                            </button>
                          )}
                          
                          <div className="text-center mt-3 text-xs font-mono text-slate-600 tracking-wider flex items-center justify-center gap-1.5 flex-wrap">
                            <span>CASE STATE:</span>
                            <span className="font-bold text-slate-800 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-205">{formStatus}</span>
                            {!isPro && (
                              <span className="text-[10px] bg-slate-100 border border-slate-205 px-2 py-0.5 rounded text-slate-600 font-bold">
                                {casesThisMonthCount}/20 FREE CASES
                              </span>
                            )}
                          </div>
                        </div>

                      </form>

                    </div>

                  </div>

                  {/* PHASE 3: CASE MANAGEMENT LEDGER GRID (8 Cols) */}
                  <div className="lg:col-span-8 space-y-6">

                     {/* Ledger Action Header Toolbar */}
                    <div className="bg-white/95 border border-mauve rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                      
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-lavender" />
                        <input
                          id="input-ledger-search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-lavender focus:bg-white pl-11 pr-10 py-2.5 text-xs outline-none transition-all rounded-lg font-mono text-slate-800 placeholder-slate-400 shadow-sm"
                          placeholder="Search database index... (e.g. state-taxation, supreme, Clara)"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-605"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Filter/Export Collapse Trigger */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          id="btn-matrix-toggle"
                          onClick={() => setIsExportExpanded(!isExportExpanded)}
                          className={`px-5 py-2.5 border text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                            isExportExpanded 
                              ? "bg-periwinkle border-mauve text-slate-800" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-periwinkle/30"
                          }`}
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Advanced Export Matrix</span>
                          {isExportExpanded ? <ChevronUp className="w-3.5 h-3.5 text-lavender" /> : <ChevronDown className="w-3.5 h-3.5 text-lavender" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Advanced Export Matrix Frame */}
                    <AnimatePresence>
                      {isExportExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white/95 border border-mauve rounded-xl p-6 shadow-sm space-y-4">
                            <h4 className="font-mono text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-mauve pb-2 flex items-center gap-2">
                              <Download className="w-3.5 h-3.5 text-lavender" />
                              Dynamic Batch Stream Parameters
                            </h4>


                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
                              <div>
                                <label className="block text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider mb-1">
                                  Filing Year Filter
                                </label>
                                <select
                                  id="select-export-year"
                                  value={exportYear}
                                  onChange={(e) => setExportYear(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 text-xs font-mono outline-none rounded-lg text-slate-800 focus:border-lavender"
                                >
                                  <option value="all">All Filing Years</option>
                                  {uniqueYears.map(yr => (
                                    <option key={yr} value={yr}>{yr}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider mb-1">
                                  Filing Month Filter
                                </label>
                                <select
                                  id="select-export-month"
                                  value={exportMonth}
                                  onChange={(e) => setExportMonth(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 text-xs font-mono outline-none rounded-lg text-slate-800 focus:border-lavender"
                                >
                                  <option value="all">All Months</option>
                                  <option value="01">January</option>
                                  <option value="02">February</option>
                                  <option value="03">March</option>
                                  <option value="04">April</option>
                                  <option value="05">May</option>
                                  <option value="06">June</option>
                                  <option value="07">July</option>
                                  <option value="08">August</option>
                                  <option value="09">September</option>
                                  <option value="10">October</option>
                                  <option value="11">November</option>
                                  <option value="12">December</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider mb-1">
                                  Filing Date Filter
                                </label>
                                <input
                                  id="input-export-date"
                                  type="date"
                                  value={exportDate}
                                  onChange={(e) => setExportDate(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 text-xs font-mono outline-none rounded-lg text-slate-800 focus:border-lavender"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider mb-1">
                                  Category Classification
                                </label>
                                <select
                                  id="select-export-category"
                                  value={exportCategory}
                                  onChange={(e) => setExportCategory(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 text-xs font-mono outline-none rounded-lg text-slate-800 focus:border-lavender"
                                >
                                  <option value="all">All Categories</option>
                                  <option value="Writ">Writ</option>
                                  <option value="Appeal">Appeal</option>
                                  <option value="Civil">Civil</option>
                                  <option value="Review">Review</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider mb-1">
                                  Judicial Forum Target
                                </label>
                                <select
                                  id="select-export-forum"
                                  value={exportForum}
                                  onChange={(e) => setExportForum(e.target.value)}
                                  className="w-full bg-white border border-slate-200 p-2 text-xs font-mono outline-none rounded-lg text-slate-800 focus:border-lavender"
                                >
                                  <option value="all">All Forums</option>
                                  {uniqueForums.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col justify-end">
                                <span className="block text-[10px] font-mono text-slate-500 font-bold mb-1">
                                  {selectedIds.size > 0 ? `• ${selectedIds.size} cases selected` : "No individual selections"}
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    id="btn-trigger-pdf"
                                    onClick={() => triggerExportMatrix("pdf")}
                                    className="bg-gradient-to-r from-lavender to-mauve hover:opacity-95 text-slate-800 font-bold text-[11px] font-mono py-2 rounded-lg hover:shadow-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-800" />
                                    <span>PDF</span>
                                  </button>
                                  <button
                                    id="btn-trigger-word"
                                    onClick={() => triggerExportMatrix("word")}
                                    className="bg-gradient-to-r from-mauve to-bubblegum hover:opacity-95 text-slate-800 font-bold text-[11px] font-mono py-2 rounded-lg hover:shadow-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-800" />
                                    <span>WORD</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {selectedIds.size > 0 && (
                              <div className="pt-2 flex justify-between items-center bg-periwinkle/30 p-2.5 border border-dashed border-mauve rounded-lg text-[11px] font-mono">
                                <span className="text-slate-700 font-semibold">
                                  Registry Export limits compiled strictly to the <b>{selectedIds.size} individually checked items</b>.
                                </span>
                                <button 
                                  onClick={() => setSelectedIds(new Set())}
                                  className="text-slate-600 hover:text-bubblegum underline font-bold"
                                >
                                  Clear selection filters
                                </button>
                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Client Ledger Table Card */}
                    <div className="bg-white/95 border border-mauve rounded-xl shadow-sm overflow-hidden">
                      
                      {/* Active Status Header */}
                      <div className="p-5 border-b border-mauve flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-bubblegum animate-pulse" />
                          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800">
                            DOCKET LEDGER
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-650 font-mono bg-periwinkle px-3 py-1 rounded-full border border-mauve/45 shadow-sm">
                          Showing {filteredCases.length} of {cases.length} records matching search index
                        </span>
                      </div>

                      {/* Main Scrollable Data Ledger */}
                      {filteredCases.length === 0 ? (
                        cases.length === 0 ? (
                          <div className="p-16 text-center space-y-5 bg-slate-50/10">
                            <div className="text-3xl select-none">📖</div>
                            <h4 className="font-sans text-sm text-slate-800 font-bold uppercase tracking-wider">
                              YOUR LEDGER IS EMPTY
                            </h4>
                            <p className="text-xs text-slate-550 max-w-sm mx-auto font-sans italic font-bold leading-relaxed uppercase">
                              Get started by creating your first docket entry to track petitioners, respondents, and case indices.
                            </p>
                            <div className="pt-2">
                              <button
                                id="btn-empty-create-docket"
                                onClick={() => {
                                  const el = document.getElementById("input-param-index");
                                  if (el) {
                                    el.focus();
                                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                                  }
                                }}
                                className="mx-auto text-xs font-mono font-bold text-slate-700 hover:text-white hover:bg-slate-800 bg-white border border-slate-250 px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                              >
                                <span>+ Create Docket</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-16 text-center space-y-5 bg-slate-50/10">
                            <div className="text-3xl select-none">🔍</div>
                            <h4 className="font-sans text-sm text-slate-800 font-bold uppercase tracking-wider">
                              No Docket Indexes Matched
                            </h4>
                            <p className="text-xs text-slate-550 max-w-sm mx-auto font-mono leading-relaxed">
                              The search query could not locate database record nodes mapping Petitioner, Respondent, AOR, or Case Indices.
                            </p>
                            <div className="pt-2">
                              <button
                                onClick={() => setSearchQuery("")}
                                className="mx-auto text-xs font-mono font-bold text-slate-700 hover:text-white hover:bg-slate-800 bg-white border border-slate-250 px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer uppercase tracking-wider"
                              >
                                Reset Search Filters
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-periwinkle/30 text-slate-705 text-[10px] font-mono font-bold uppercase tracking-wider border-b border-mauve/60">
                                <th className="p-4 w-12 text-center">
                                  <button onClick={handleToggleSelectAll} className="hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                                    {selectedIds.size === filteredCases.length ? (
                                      <CheckSquare className="w-4 h-4 text-bubblegum fill-white" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-405" />
                                    )}
                                  </button>
                                </th>
                                <th className="p-4 text-slate-800 font-bold">1. Case Index</th>
                                <th className="p-4 text-slate-800 font-bold">Dossier Parties (2 & 3)</th>
                                <th className="p-4 text-slate-800 font-bold">Classification Details (5 & 6)</th>
                                <th className="p-4 text-slate-800 font-bold">Dates (7 & 8)</th>
                                <th className="p-4 text-right text-slate-800 font-bold">Hearings Stage & Progression</th>
                                <th className="p-4 text-right text-slate-800 font-bold">State Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-mauve/40">
                              {filteredCases.map((c) => {
                                const isSelected = selectedIds.has(c.id);
                                const upcomingHearing = (c.hearingHistory || []).find(h => !h.completed);
                                const totalHearingsCount = (c.hearingHistory || []).length;
                                const currentScheduledDate = upcomingHearing ? upcomingHearing.date : "-";
                                return (
                                  <tr 
                                    key={c.id}
                                    className={`hover:bg-periwinkle/10 transition-colors text-xs ${
                                      isSelected ? "bg-periwinkle/20" : "bg-white"
                                    }`}
                                  >
                                    {/* Selection Checkbox Column */}
                                    <td className="p-4 text-center">
                                      <button onClick={() => handleToggleSelectOne(c.id)} className="hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                                        {isSelected ? (
                                          <CheckSquare className="w-4 h-4 text-bubblegum fill-white" />
                                        ) : (
                                          <Square className="w-4 h-4 text-mauve/60" />
                                        )}
                                      </button>
                                    </td>

                                    {/* Index & Forum column */}
                                    <td className="p-4 whitespace-nowrap">
                                      <div className="font-mono text-[11px] font-bold text-black flex items-center gap-1.5">
                                        <span>{c.caseIndexNo}</span>
                                      </div>
                                      <div className="text-[10px] text-neutral-450 mt-0.5 truncate max-w-[140px]" title={c.judicialForum}>
                                        {c.judicialForum}
                                      </div>
                                      <div className="mt-1 flex items-center gap-1.5">
                                        <span className="text-[9px] font-mono text-neutral-450">
                                          Yr: {c.filingYearTarget}
                                        </span>
                                        <span className="text-[8px] bg-neutral-100 text-neutral-600 px-1 py-0.2 rounded-xs font-mono">
                                          ID: {c.id.toString().slice(-4)}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Parties Involved */}
                                    <td className="p-4">
                                      <div className="font-semibold text-neutral-900 truncate max-w-[160px]" title={c.petitionerParty}>
                                        {c.petitionerParty}
                                      </div>
                                      <div className="text-[10px] text-neutral-400 font-mono uppercase mt-0.5">VS</div>
                                      <div className="text-slate-700 truncate max-w-[160px] font-medium" title={c.respondentParty}>
                                        {c.respondentParty}
                                      </div>
                                      <div className="text-[9px] text-neutral-400 font-mono mt-1.5">
                                        AOR: {c.advocateOnRecord}
                                      </div>
                                    </td>

                                    {/* Classification Category Details */}
                                    <td className="p-4">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-xl font-bold border ${
                                          c.classificationCategory === "Writ" ? "bg-lavender/35 text-slate-805 border-mauve/45" :
                                          c.classificationCategory === "Appeal" ? "bg-periwinkle/45 text-slate-805 border-mauve/45" :
                                          c.classificationCategory === "Civil" ? "bg-mint/45 text-slate-805 border-cyan-300" :
                                          "bg-bubblegum/35 text-slate-805 border-mauve/45"
                                        }`}>
                                          {c.classificationCategory}
                                        </span>
                                        
                                        {/* Dynamic resolution status indicator interactive button */}
                                        <button
                                          id={`btn-case-complete-${c.id}`}
                                          onClick={() => handleToggleCaseCompleted(c.id)}
                                          className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold font-mono text-[9px] uppercase tracking-wider border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                                            c.currentCaseStatus === "Completed"
                                              ? "bg-mint text-slate-800 border-cyan-300 shadow-3xs"
                                              : c.currentCaseStatus === "Admitted"
                                              ? "bg-periwinkle border-mauve/50 text-slate-700 hover:bg-periwinkle/80"
                                              : "bg-bubblegum/40 border-mauve/50 text-slate-700 hover:bg-bubblegum/60"
                                          }`}
                                          title="Click to quickly toggle case resolution Completed/Done state"
                                        >
                                          {c.currentCaseStatus === "Completed" ? (
                                            <Check className="w-3 h-3 text-slate-800" />
                                          ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                                          )}
                                          <span>{c.currentCaseStatus === "Completed" ? "Completed/Done" : c.currentCaseStatus}</span>
                                         </button>
                                       </div>
                                      
                                      <div className="text-[10px] text-neutral-500 mt-1.5 font-mono italic truncate max-w-[170px]" title={c.writCaseType}>
                                        {c.writCaseType}
                                      </div>
                                      {c.keywordsContentMapping && (
                                        <div className="text-[8px] text-neutral-400 font-mono mt-1 truncate max-w-[150px]">
                                          Note: {c.keywordsContentMapping}
                                        </div>
                                      )}
                                    </td>

                                    {/* Calendar Date Blocks */}
                                    <td className="p-4 whitespace-nowrap text-[11px] font-mono text-neutral-600">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] text-neutral-450 uppercase w-15">Filed:</span>
                                        <span className="text-neutral-800 font-medium">{c.filingDateStart}</span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <span className="text-[9px] text-neutral-450 uppercase w-15">Upcoming:</span>
                                        <span className={`font-semibold ${upcomingHearing ? "text-indigo-600 font-bold" : "text-neutral-400 font-medium"}`}>
                                          {currentScheduledDate}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Hearings index State badge */}
                                    <td className="p-4 text-right whitespace-nowrap">
                                      <span className={`font-mono text-xs font-bold border px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
                                        upcomingHearing
                                          ? "bg-lavender/35 border-mauve/45 text-slate-805"
                                          : "bg-mint/45 border-cyan-300 text-slate-805"
                                      }`}>
                                        <div className={`w-2 h-2 rounded-full ${
                                          upcomingHearing ? "bg-bubblegum animate-pulse" : "bg-cyan-500"
                                        }`} />
                                        <span>
                                          {upcomingHearing 
                                            ? getOrdinalBadgeText(upcomingHearing.hearingNo)
                                            : `No Upcoming (${totalHearingsCount} Completed)`}
                                        </span>
                                      </span>
                                      <div className="text-[9px] text-neutral-450 font-mono mt-1 pr-1">
                                        Case State: {c.currentCaseStatus}
                                      </div>
                                    </td>

                                    {/* Mutations & Action Nodes */}
                                    <td className="p-4 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          id={`btn-case-pdf-${c.id}`}
                                          onClick={() => exportCasePDF(c)}
                                          className="px-3 py-1.5 text-[9px] uppercase font-mono font-bold tracking-wider rounded-full border transition-all flex items-center gap-1 bg-white border-mauve text-slate-700 hover:bg-periwinkle hover:text-slate-900 cursor-pointer active:scale-103 shadow-2xs"
                                          title="Generate Premium PDF Document"
                                        >
                                          <FileText className="w-3 h-3 text-slate-500" />
                                          <span>PDF</span>
                                        </button>

                                        <button
                                          id={`btn-case-docx-${c.id}`}
                                          onClick={() => exportCaseWord(c)}
                                          className="px-3 py-1.5 text-[9px] uppercase font-mono font-bold tracking-wider rounded-full border transition-all flex items-center gap-1 bg-white border-mauve text-slate-700 hover:bg-periwinkle hover:text-slate-900 cursor-pointer active:scale-103 shadow-2xs"
                                          title="Generate Microsoft Word Document"
                                        >
                                          <Download className="w-3 h-3 text-slate-500" />
                                          <span>Word</span>
                                        </button>

                                        {/* Interactive Edit option for managing hearing stages and markings */}
                                        <button
                                          id={`btn-case-edit-${c.id}`}
                                          onClick={() => setEditingCase(c)}
                                          className="px-3.5 py-1.5 text-[9px] uppercase font-mono font-bold tracking-wider rounded-full border transition-all flex items-center gap-1 bg-white border-mauve text-slate-700 hover:bg-bubblegum/30 hover:text-slate-900 cursor-pointer active:scale-103 shadow-2xs"
                                          title="Edit Case details and advance hearing status"
                                        >
                                          <span>Edit</span>
                                        </button>

                                        <button
                                          id={`btn-case-delete-${c.id}`}
                                          onClick={() => handleDeleteCase(c.id)}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-full transition-all cursor-pointer"
                                          title="Delete case entry"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>

                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Registry Footer Telemetry metrics */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-2">
                      <span>VERITAS PLATFORM MATRIX</span>
                    </div>

                  </div>

                </div>

              </div>
            </div>
            )}
          </>
        )}

      </main>

      {/* SaaS Footer */}
      <footer className="bg-slate-50 border-t border-slate-150 py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-sans text-base font-bold bg-gradient-to-r from-slate-800 to-indigo-950 bg-clip-text text-transparent">
              Veritas
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              © {new Date().getFullYear()} VERITAS. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <button onClick={() => setCurrentView("about")} className="hover:text-indigo-600 transition-colors cursor-pointer">
              About
            </button>
            <button onClick={() => setCurrentView("pricing")} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Pricing
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: Edit Case and Manage Hearings Timeline */}
      <AnimatePresence>
        {editingCase && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditingCase(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-150 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-lavender via-mauve to-periwinkle px-6 py-4 flex items-center justify-between text-slate-800 shrink-0 border-b border-slate-150">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-705" />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800">
                    EDIT DOCKET TIMELINE
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditingCase(null)} 
                  className="p-1.5 hover:bg-slate-800/10 rounded-full text-slate-800 transition-all cursor-pointer"
                  title="Close Dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form wrapping Content and Sticky Footer for absolute visibility */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSaveEditCase(editingCase); }} 
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {/* Modal Body (Scrollable Content Area) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Dynamic Hearings Roadmap Manager */}
                  <div className="bg-slate-50 border border-mauve/60 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                          Hearing Progress Status: {editingCase.currentCaseStatus}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-sans mt-0.5">
                          Dynamic Hearings Roadmap
                        </h4>
                      </div>
                      
                      <span className="text-[10px] font-mono bg-periwinkle text-slate-800 px-3 py-1 rounded-full border border-mauve">
                        Total Hearings: {(editingCase.hearingHistory || []).length}
                      </span>
                    </div>

                    {/* UPCOMING HEARING DETAIL */}
                    {(() => {
                      const upcoming = (editingCase.hearingHistory || []).find(h => !h.completed);
                      if (upcoming) {
                        return (
                          <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow-3xs hover:border-indigo-300 transition-all text-left">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-bubblegum animate-pulse" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-bubblegum font-extrabold">
                                  Upcoming Stage: {getOrdinalBadgeText(upcoming.hearingNo)}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border font-bold">
                                Date: {upcoming.date}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-650 bg-slate-50/50 p-3 rounded-lg border border-slate-100 mb-4">
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Hearing Stage Status</span>
                                <span className="text-slate-800 font-semibold">{upcoming.status || editingCase.currentCaseStatus}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Remarks / Directives</span>
                                <span className="text-slate-800 truncate block" title={upcoming.remarks}>{upcoming.remarks || "No active log."}</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setCompletingHearing({
                                    hearingNo: upcoming.hearingNo,
                                    outcome: "",
                                    remarks: "",
                                    nextDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0],
                                    status: getSuggestedStatusForHearingNo(upcoming.hearingNo + 1)
                                  });
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs py-2 rounded-lg tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Complete Hearing</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedHistory = (editingCase.hearingHistory || [])
                                    .filter(item => item.hearingNo !== upcoming.hearingNo)
                                    .map((item, idx) => ({ ...item, hearingNo: idx + 1 }));
                                  const latestHearing = updatedHistory[updatedHistory.length - 1];
                                  const firstHearing = updatedHistory[0];
                                  setEditingCase({
                                    ...editingCase,
                                    hearingHistory: updatedHistory,
                                    currentCaseStatus: updatedHistory.find(item => !item.completed)?.status || latestHearing?.status || "Notice",
                                    hearingDateStart: firstHearing?.date || editingCase.hearingDateStart,
                                    hearingDateEnd: latestHearing?.date || editingCase.hearingDateEnd
                                  });
                                  showNotification(`Upcoming hearing #${upcoming.hearingNo} deleted from roadmap.`);
                                }}
                                className="px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                title="Delete this upcoming hearing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-white border border-dashed border-cyan-300 rounded-lg p-6 text-center text-xs font-mono text-cyan-700">
                            <Check className="w-6 h-6 mx-auto text-cyan-500 mb-1" />
                            <span>Case Disposed or All Hearings Completed. No active pending schedule.</span>
                          </div>
                        );
                      }
                    })()}

                    {/* PREVIOUS HEARINGS - HEARING HISTORY */}
                    <div className="text-left">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold font-bold mb-2">
                        Hearing History Section (Chronological Archive)
                      </span>
                      {(() => {
                        const completed = (editingCase.hearingHistory || []).filter(h => h.completed).sort((a, b) => b.hearingNo - a.hearingNo);
                        if (completed.length === 0) {
                          return (
                            <div className="bg-white/50 border border-slate-200 rounded-lg p-4 text-center text-[11px] font-mono text-slate-400">
                              No completed history entries yet.
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {completed.map((h) => (
                              <div key={h.hearingNo} className="bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-lg p-3 text-xs flex items-center justify-between gap-3 font-mono">
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                      #{h.hearingNo}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{h.status}</span>
                                    <span className="text-[10px] text-neutral-450">({h.date})</span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 truncate" title={h.outcome}>
                                    <span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Outcome:</span>
                                    {h.outcome || "N/A"}
                                  </div>
                                  {h.remarks && (
                                    <div className="text-[9px] text-neutral-450 truncate" title={h.remarks}>
                                      <span className="text-slate-300 font-bold uppercase text-[8px] mr-1">Notes:</span>
                                      {h.remarks}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] text-cyan-600 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-cyan-600" /> Completed
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedHistory = (editingCase.hearingHistory || [])
                                        .filter(item => item.hearingNo !== h.hearingNo)
                                        .map((item, idx) => ({ ...item, hearingNo: idx + 1 }));
                                      const latestHearing = updatedHistory[updatedHistory.length - 1];
                                      const firstHearing = updatedHistory[0];
                                      setEditingCase({
                                        ...editingCase,
                                        hearingHistory: updatedHistory,
                                        currentCaseStatus: updatedHistory.find(item => !item.completed)?.status || latestHearing?.status || "Notice",
                                        hearingDateStart: firstHearing?.date || editingCase.hearingDateStart,
                                        hearingDateEnd: latestHearing?.date || editingCase.hearingDateEnd
                                      });
                                      showNotification(`Completed hearing #${h.hearingNo} deleted from archive.`);
                                    }}
                                    className="p-1 px-2 border border-transparent hover:border-rose-200 bg-transparent hover:bg-rose-50 text-rose-500 hover:text-rose-700 font-mono font-bold text-[10px] rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    title="Delete this history record"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Grid of 12 Parameters fields inside Edit Modal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto p-3 border border-mauve/45 bg-periwinkle/10 rounded-xl">
                    {/* Param 1 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-650 font-bold">
                        1. Case Index No
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCase.caseIndexNo}
                        onChange={(e) => setEditingCase({ ...editingCase, caseIndexNo: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg font-mono text-slate-800 focus:border-indigo-400 transition-all"
                      />
                    </div>

                    {/* Param 4 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        4. Advocate On Record
                      </label>
                      <input
                        type="text"
                        value={editingCase.advocateOnRecord}
                        onChange={(e) => setEditingCase({ ...editingCase, advocateOnRecord: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-mono"
                      />
                    </div>

                    {/* Param 2 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        2. Party Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCase.petitionerParty}
                        onChange={(e) => setEditingCase({ ...editingCase, petitionerParty: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-sans"
                      />
                    </div>

                    {/* Param 3 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        3. Party Status
                      </label>
                      <select
                        value={editingCase.respondentParty}
                        onChange={(e) => setEditingCase({ ...editingCase, respondentParty: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-mono"
                      >
                        <option value="Petitioner">Petitioner</option>
                        <option value="Respondent">Respondent</option>
                      </select>
                    </div>

                    {/* Param 5 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        5. Classification Category
                      </label>
                      <input
                        type="text"
                        placeholder="Writ, Appeal, Civil, etc."
                        value={editingCase.classificationCategory}
                        onChange={(e) => setEditingCase({ ...editingCase, classificationCategory: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all"
                      />
                    </div>

                    {/* Param 6 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        6. Judicial Forum
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCase.judicialForum}
                        onChange={(e) => setEditingCase({ ...editingCase, judicialForum: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-sans"
                      />
                    </div>

                    {/* Param 7 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        7. Writ Case Type
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCase.writCaseType}
                        onChange={(e) => setEditingCase({ ...editingCase, writCaseType: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-sans"
                      />
                    </div>

                    {/* Param 8 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-650 font-bold">
                        8. Filing Year Target
                      </label>
                      <input
                        type="number"
                        required
                        value={editingCase.filingYearTarget}
                        onChange={(e) => setEditingCase({ ...editingCase, filingYearTarget: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-mono"
                      />
                    </div>

                    {/* Param 9 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        9. Case Status State
                      </label>
                      <select
                        value={editingCase.currentCaseStatus}
                        onChange={(e) => setEditingCase({ ...editingCase, currentCaseStatus: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-mono"
                      >
                        <option value="Notice">Notice</option>
                        <option value="Preliminary Hearing">Preliminary Hearing</option>
                        <option value="Trial">Trial</option>
                        <option value="Cross Examination">Cross Examination</option>
                        <option value="Arguments">Arguments</option>
                        <option value="Judgment Reserved">Judgment Reserved</option>
                        <option value="Disposed">Disposed</option>
                      </select>
                    </div>

                    {/* Param 10 */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        10. Note
                      </label>
                      <input
                        type="text"
                        value={editingCase.keywordsContentMapping}
                        onChange={(e) => setEditingCase({ ...editingCase, keywordsContentMapping: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 focus:border-indigo-400 transition-all font-sans"
                      />
                    </div>

                    {/* Param 11 dates */}
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        11. Filing Date Start
                      </label>
                      <input
                        type="date"
                        required
                        value={editingCase.filingDateStart}
                        onChange={(e) => setEditingCase({ ...editingCase, filingDateStart: e.target.value })}
                        className="w-full bg-white border border-slate-200 p-1.5 text-xs outline-none rounded-lg font-mono text-slate-805 focus:border-indigo-400 transition-all"
                      />
                    </div>

                    {/* Param 12: Hearings Scheduler (1st Hearing + Add Hearing) */}
                    <div className="md:col-span-2 border border-mauve p-3.5 rounded-xl bg-violet-50/20 space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] uppercase tracking-wider font-mono text-slate-600 font-bold">
                          12. Hearings Scheduler
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentHistory = editingCase.hearingHistory || [];
                            const nextNo = currentHistory.length > 0 
                              ? Math.max(...currentHistory.map(h => h.hearingNo)) + 1 
                              : 1;
                            const lastHearing = currentHistory[currentHistory.length - 1];
                            const lastDate = lastHearing ? new Date(lastHearing.date) : new Date();
                            if (isNaN(lastDate.getTime())) {
                              lastDate.setTime(new Date().getTime());
                            }
                            lastDate.setDate(lastDate.getDate() + 14);
                            const defaultNextDate = lastDate.toISOString().split('T')[0];

                            const newHearing: HearingHistoryEntry = {
                              hearingNo: nextNo,
                              date: defaultNextDate,
                              status: "Preliminary Hearing",
                              completed: false,
                              remarks: `Scheduled hearing #${nextNo}.`,
                              outcome: ""
                            };
                            
                            setEditingCase({
                              ...editingCase,
                              hearingHistory: [...currentHistory, newHearing],
                              hearingDateEnd: defaultNextDate
                            });
                          }}
                          className="text-[9px] font-mono font-bold text-slate-800 hover:bg-slate-200 bg-slate-100 border border-slate-200 px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Add Hearing</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {(editingCase.hearingHistory || []).map((h, i) => {
                          const ordinalLabel = i === 0 ? "1st Hearing" : i === 1 ? "2nd Hearing" : i === 2 ? "3rd Hearing" : `${i + 1}th Hearing`;
                          return (
                            <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white border border-slate-150 p-2 rounded-lg shadow-2xs">
                              <span className="text-[10px] font-mono font-bold text-slate-800 uppercase min-w-[80px]">
                                {ordinalLabel}
                              </span>
                              <input
                                type="date"
                                required
                                value={h.date}
                                onChange={(e) => {
                                  const updatedHistory = (editingCase.hearingHistory || []).map((currH, idx) => {
                                    if (idx === i) {
                                      return { ...currH, date: e.target.value };
                                    }
                                    return currH;
                                  });
                                  setEditingCase({
                                    ...editingCase,
                                    hearingHistory: updatedHistory,
                                    ...(i === 0 ? { hearingDateStart: e.target.value } : {}),
                                    ...(i === updatedHistory.length - 1 ? { hearingDateEnd: e.target.value } : {})
                                  });
                                }}
                                className="w-full sm:w-auto flex-1 bg-white border border-slate-200 px-2 py-1 text-xs outline-none rounded font-mono text-slate-800 focus:border-indigo-400"
                              />
                              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                <select
                                  value={h.status}
                                  onChange={(e) => {
                                    const nextS = e.target.value;
                                    const updatedHistory = (editingCase.hearingHistory || []).map((currH, idx) => {
                                      if (idx === i) {
                                        return { ...currH, status: nextS };
                                      }
                                      return currH;
                                    });
                                    setEditingCase({
                                      ...editingCase,
                                      hearingHistory: updatedHistory,
                                      ...(i === 0 ? { currentCaseStatus: nextS } : {})
                                    });
                                  }}
                                  className="bg-white border border-slate-200 px-1.5 py-1 text-[11px] outline-none rounded font-sans text-slate-800 focus:border-indigo-400 w-full sm:w-32"
                                >
                                  <option value="Notice">Notice</option>
                                  <option value="Preliminary Hearing">Preliminary Hearing</option>
                                  <option value="Trial">Trial</option>
                                  <option value="Cross Examination">Cross Examination</option>
                                  <option value="Arguments">Arguments</option>
                                  <option value="Judgment Reserved">Judgment Reserved</option>
                                  <option value="Disposed">Disposed</option>
                                </select>
                                {i > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedHistory = (editingCase.hearingHistory || [])
                                        .filter((_, idx) => idx !== i)
                                        .map((currH, idx) => ({ ...currH, hearingNo: idx + 1 }));
                                      setEditingCase({
                                        ...editingCase,
                                        hearingHistory: updatedHistory,
                                        hearingDateStart: updatedHistory[0]?.date || editingCase.hearingDateStart,
                                        hearingDateEnd: updatedHistory[updatedHistory.length - 1]?.date || editingCase.hearingDateEnd
                                      });
                                    }}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded transition-colors"
                                    title="Remove hearing"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Dialog buttons Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingCase(null)}
                    className="px-5 py-2.5 bg-white hover:bg-periwinkle/30 font-mono text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg border border-slate-250 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-lavender via-mauve to-bubblegum hover:opacity-95 text-slate-800 text-xs font-mono font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm border border-mauve/40"
                  >
                    <Check className="w-4 h-4 text-slate-805" />
                    <span>Save Parameters</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Hearing Completion (Hearing Outcome Form) */}
      <AnimatePresence>
        {completingHearing && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
            onClick={() => setCompletingHearing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-left max-h-[85vh] relative"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider">
                    HEARING OUTCOME (Hearing #{completingHearing.hearingNo})
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setCompletingHearing(null)} 
                  className="p-1 hover:bg-white/10 rounded-full text-white/80 transition-all cursor-pointer"
                  title="Close Outcome Dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form container wrapping body and footer for sticky action buttons */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingCase) {
                    handleConfirmHearingCompleted(editingCase.id);
                  }
                }} 
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Outcome Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-650 font-bold">
                      Outcome *
                    </label>
                    <input
                      type="text"
                      required
                      list="hearing-outcomes-list"
                      placeholder="e.g. Adjourned, Notice Served, Evidence Recorded"
                      value={completingHearing.outcome}
                      onChange={(e) => setCompletingHearing({ ...completingHearing, outcome: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-lavender px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 font-sans"
                      id="input-hearing-outcome"
                    />
                    <datalist id="hearing-outcomes-list">
                      <option value="Adjourned" />
                      <option value="Notice Served" />
                      <option value="Evidence Recorded" />
                      <option value="Cross Examination Completed" />
                      <option value="Arguments Heard" />
                      <option value="Reserved for Judgment" />
                      <option value="Judgment Delivered" />
                      <option value="Case Disposed" />
                    </datalist>
                  </div>

                  {/* Remarks Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                      Remarks
                    </label>
                    <textarea
                      placeholder="Enter judicial directives or log details..."
                      rows={3}
                      value={completingHearing.remarks}
                      onChange={(e) => setCompletingHearing({ ...completingHearing, remarks: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-lavender px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 font-sans"
                      id="input-hearing-remarks"
                    />
                  </div>

                  {/* Next Stage Status Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                      Next Stage Status *
                    </label>
                    <select
                      value={completingHearing.status}
                      onChange={(e) => setCompletingHearing({ ...completingHearing, status: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-lavender px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 font-mono"
                      id="input-hearing-nextstatus"
                    >
                      <option value="Notice">Notice</option>
                      <option value="Preliminary Hearing">Preliminary Hearing</option>
                      <option value="Trial">Trial</option>
                      <option value="Cross Examination">Cross Examination</option>
                      <option value="Arguments">Arguments</option>
                      <option value="Judgment Reserved">Judgment Reserved</option>
                      <option value="Judgment Delivered">Judgment Delivered</option>
                      <option value="Case Disposed">Case Disposed</option>
                    </select>
                  </div>

                  {/* Next Hearing Date (Hide if Case Disposed or Judgment Delivered) */}
                  {completingHearing.status !== "Judgment Delivered" && completingHearing.status !== "Case Disposed" && completingHearing.status !== "Disposed" && (
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-widest font-mono text-slate-600 font-bold">
                        Next Hearing Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={completingHearing.nextDate}
                        onChange={(e) => setCompletingHearing({ ...completingHearing, nextDate: e.target.value })}
                        className="w-full bg-white border border-slate-200 focus:border-lavender px-3 py-1.5 text-xs outline-none rounded-lg text-slate-800 font-mono"
                        id="input-hearing-nextdate"
                      />
                    </div>
                  )}
                </div>

                {/* Sticky Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCompletingHearing(null)}
                    className="px-4 py-2 text-[11px] font-mono font-bold uppercase rounded-lg border hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {completingHearing.status === "Judgment Delivered" || completingHearing.status === "Case Disposed" || completingHearing.status === "Disposed"
                        ? "Save & Close Case"
                        : "Save & Create Next Hearing"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SaaS Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)} 
          onConfirmUpgrade={async () => {
            await handleUpgradeToPro();
            setShowUpgradeModal(false);
          }}
        />
      )}

    </div>
  );
}
