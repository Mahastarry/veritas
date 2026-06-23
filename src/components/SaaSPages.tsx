import React from "react";
import { 
  Briefcase, 
  ShieldCheck, 
  FileText, 
  Cloud, 
  Unlock, 
  Clock, 
  Check, 
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  X
} from "lucide-react";

interface PageProps {
  onNavigate: (view: "home" | "about" | "pricing" | "dashboard") => void;
  isAuthenticated: boolean;
  isPro: boolean;
  onUpgrade: () => void;
}

export function HomePage({ onNavigate, isAuthenticated }: PageProps) {
  return (
    <div className="space-y-20 py-4 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 py-12 md:py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 border border-mauve/45 rounded-full text-slate-700 text-xs font-mono font-bold tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-lavender" />
          <span>SMART LEGAL WORKFLOWS FOR MODERN ADVOCATES</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
          Modern Legal Case <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Management Simplified</span>
        </h1>
        <p className="text-base md:text-lg text-slate-650 max-w-2xl mx-auto leading-relaxed">
          Track cases, manage hearings, and generate professional legal reports from a single platform. Built to optimize daily administration for legal practitioners.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Free"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate("pricing")}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Pricing</span>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-sans font-bold tracking-tight text-slate-900">
            Features Designed for Excellence
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            Everything you need to maintain a highly structured legal ledger with optimal speed and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-mauve/45 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-sans font-bold text-slate-900">Case Management</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Log complex case dockets with up to 12 vital legal parameters including petitioner, respondent, forum, and index numbers.
            </p>
          </div>

          <div className="bg-white border border-mauve/45 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-sans font-bold text-slate-900">Hearing Stage Tracking</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Schedule, archive, and complete hearings. Maintain an audit-ready historic roadmap of case progression step-by-step.
            </p>
          </div>

          <div className="bg-white border border-mauve/45 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center text-pink-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-sans font-bold text-slate-900">Professional PDF Reports</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instantly generate beautifully formatted legal briefs, summaries, and complete case sheets ready for client review.
            </p>
          </div>

          <div className="bg-white border border-mauve/45 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 md:col-span-1">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-sans font-bold text-slate-900">Cloud Storage</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your data is safely backed up in Firestore Cloud Database, with robust offline-first local storage safety fallbacks.
            </p>
          </div>

          <div className="bg-white border border-mauve/45 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 md:col-span-2">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Unlock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-sans font-bold text-slate-900">Secure Authentication</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Ensure data confidentiality. Built-in Firebase security boundaries guarantee your client and docket records are completely private.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-50 border border-slate-150 rounded-3xl p-8 md:p-12 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-slate-900">
            Engineered for Legal Accuracy
          </h2>
          <p className="text-slate-600 text-sm">
            Experience immediate operational leverage across all dimensions of your law practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-900 text-base">Save Time</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automate repetitive filing entry with dynamic prefill indicators, reducing document metadata preparation by up to 80%.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-900 text-base">Organize Case Records</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Maintain single-source-of-truth legal files containing status details, history archives, and vital client references.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-900 text-base">Automate Hearing Tracking</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Stay continuously aware of upcoming trials and arguments. Update timelines dynamically inside of your active cases list.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-slate-900 text-base">Generate Court-Ready Reports</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Print structured, clean PDFs complete with hearing chronologies to present directly to chambers, senior advocates, or clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-indigo-900 to-purple-950 text-white rounded-3xl p-8 md:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,182,193,0.1),transparent_50%)]" />
        <h2 className="text-3xl md:text-4xl font-sans font-bold tracking-tight max-w-xl mx-auto">
          Ready to Streamline Your Court Records?
        </h2>
        <p className="text-indigo-200 text-sm md:text-base max-w-lg mx-auto">
          Set up your secure Veritas workspace today and organize up to 20 cases per month completely free.
        </p>
        <div className="pt-2 relative z-10">
          <button
            onClick={() => onNavigate("dashboard")}
            className="px-8 py-4 bg-white hover:bg-slate-100 text-indigo-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer active:scale-98"
          >
            <span>Start Free Today</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="space-y-16 py-4 animate-fade-in max-w-4xl mx-auto text-left">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-slate-900">
          About <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">VERITAS</span>
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
          Pioneering legal workflow automation with absolute accuracy, speed, and privacy.
        </p>
      </section>

      <section className="prose prose-slate max-w-none space-y-6">
        <h2 className="text-xl font-sans font-bold text-slate-900 border-b border-slate-100 pb-2">
          The Purpose of VERITAS
        </h2>
        <p className="text-slate-650 text-sm leading-relaxed">
          Veritas is a high-performance legal SaaS platform built specifically for advocate practice management. In the fast-paced legal system, managing massive volumes of judicial filings, hearing timelines, and client dossiers requires rigorous administration. 
        </p>
        <p className="text-slate-650 text-sm leading-relaxed">
          Veritas automates these highly manual records, allowing practitioners to record up to 12 legal parameters, organize upcoming hearings dynamically, and instantly compile and print court-ready client portfolios and PDF case summaries.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-sans font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Our Mission
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Simplify legal case administration through intelligent digital workflows. We strive to automate administrative friction, enabling advocates to focus strictly on judicial arguments and defense.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-3">
          <h3 className="text-base font-sans font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            Our Vision
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Make legal record management accessible, efficient, and professional for attorneys worldwide. We aim to become the secure, premier digital ledger for advocates across judicial jurisdictions.
          </p>
        </div>
      </div>

      <section className="space-y-6 pt-4">
        <h2 className="text-xl font-sans font-bold text-slate-900 border-b border-slate-100 pb-2">
          Core Operating Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-sans font-bold text-slate-800">1. Accuracy</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Strict parameters ensure that filing metadata matches actual registry docket indices.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-sans font-bold text-slate-800">2. Simplicity</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              We eliminate complex interface bloat. Veritas provides clear fields, direct buttons, and instantaneous report generators.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-sans font-bold text-slate-800">3. Security</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Zero-knowledge boundaries ensure cases are accessible strictly by authenticated record owners.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-sans font-bold text-slate-800">4. Accessibility</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Providing flexible subscription models that keep high-level legal management accessible to small law clinics and solo practices alike.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function PricingPage({ onNavigate, isAuthenticated, isPro, onUpgrade }: PageProps) {
  return (
    <div className="space-y-16 py-4 animate-fade-in max-w-5xl mx-auto">
      <section className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-mono font-bold tracking-wider">
          <span>SECURE BILLING PLANS</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-slate-900">
          Choose the Plan That Fits Your Practice.
        </h1>
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Upgrade your law practice with unlimited cloud case registries and priority customer care.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        
        {/* Free Plan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xs relative hover:border-slate-300 transition-all text-left">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-sans font-bold text-slate-800">Free Plan</h3>
              <p className="text-slate-500 text-xs">For solo litigators establishing digital records.</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-sans font-bold text-slate-900">₹0</span>
              <span className="text-slate-500 text-xs font-mono">/ FOREVER</span>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3.5">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest block">What's Included:</span>
              <ul className="space-y-2.5 text-slate-650 text-xs">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Up to 20 Cases per Calendar Month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Hearing Progress Tracking</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>PDF Report Generation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Secure Cloud Storage</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1 text-[11px] text-slate-600">
              <span className="font-bold text-slate-700 uppercase font-mono tracking-wider block">Plan Limitation:</span>
              <p>Create up to 20 new cases per month at no cost.</p>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => onNavigate("dashboard")}
              className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-250 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Free"}
            </button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-indigo-950 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col justify-between shadow-lg relative text-left text-white transform md:scale-102">
          {/* Most Popular Ribbon */}
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
            Most Popular
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-sans font-bold">VERITAS Pro Annual</h3>
              <p className="text-indigo-200 text-xs">For high-scale advocate practices requiring unlimited storage.</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-sans font-bold text-white">₹999</span>
              <span className="text-indigo-200 text-xs font-mono">/ YEAR</span>
            </div>

            <hr className="border-indigo-900" />

            <div className="space-y-3.5">
              <span className="text-xs font-mono font-bold text-indigo-200 uppercase tracking-widest block">What's Included:</span>
              <ul className="space-y-2.5 text-indigo-100 text-xs">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited Cases</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Unlimited Hearing Records</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Unlimited PDF Exports</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Future Premium Features</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="font-semibold text-white">No Monthly Restrictions</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            {isPro ? (
              <div className="text-center py-3 bg-indigo-900/40 border border-indigo-800 rounded-xl text-xs text-indigo-200 font-mono font-bold uppercase tracking-wider">
                ✓ PRO SUBSCRIPTION ACTIVE
              </div>
            ) : (
              <button
                onClick={onUpgrade}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer text-center hover:scale-102"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

interface UpgradeModalProps {
  onClose: () => void;
  onConfirmUpgrade: () => void;
}

export function UpgradeModal({ onClose, onConfirmUpgrade }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="upgrade-modal">
      <div className="bg-white border-2 border-mauve max-w-md w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl text-left animate-zoom-in" id="upgrade-modal-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-rose-600">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="font-sans font-bold text-lg text-slate-900" id="upgrade-modal-title">Monthly Limit Reached</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-650 transition-colors p-1 cursor-pointer"
            id="upgrade-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-650 text-sm leading-relaxed" id="upgrade-modal-msg-1">
            You have reached your monthly limit of 20 case creations.
          </p>
          <p className="text-slate-650 text-sm leading-relaxed font-semibold" id="upgrade-modal-msg-2">
            Upgrade to VERITAS Pro Annual for ₹999/year and unlock unlimited case management, hearing tracking, and PDF generation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={onConfirmUpgrade}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:opacity-95 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md text-center cursor-pointer"
            id="upgrade-modal-confirm-btn"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer"
            id="upgrade-modal-cancel-btn"
          >
            Cancel
          </button>
        </div>
        
        <div className="text-center text-[10px] font-mono text-slate-400">
          * Powered by VERITAS Secure Checkout
        </div>
      </div>
    </div>
  );
}
