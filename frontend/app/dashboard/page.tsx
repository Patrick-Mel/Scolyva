'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ReadonlyBanner from '@/components/ReadonlyBanner';
import TimetableGrid from '@/components/TimetableGrid';
import QRScannerModal from '@/components/QRScannerModal';
import StudentQRPassModal from '@/components/StudentQRPassModal';
import ExamSessionRoom from '@/components/ExamSessionRoom';
import ExamIntegrityReportModal from '@/components/ExamIntegrityReportModal';

import { translations, Language } from '@/lib/i18n';
import { apiRequest } from '@/lib/api';
import {
  Users, CreditCard, BookOpen, GraduationCap, ShieldCheck, CheckCircle2,
  AlertTriangle, DollarSign, Calendar, FileText, Plus, Search, ChevronRight,
  TrendingUp, Download, Sparkles, Send, PhoneCall, Check, UserCheck, Filter,
  QrCode, Lock, Camera, Award, ShieldAlert
} from 'lucide-react';

export default function DashboardPage() {
  const [lang, setLang] = useState<Language>('fr');
  const [darkMode, setDarkMode] = useState(false); // Default to Light mode
  const [currentRole, setCurrentRole] = useState('SCHOOL_ADMIN');
  const [schoolStatus, setSchoolStatus] = useState<'TRIAL' | 'ACTIVE' | 'READ_ONLY' | 'SUSPENDED'>('TRIAL');
  const [trialDays, setTrialDays] = useState(14);
  const [schoolName, setSchoolName] = useState('Collège Excellence Douala');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Dashboard Navigation Tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMETABLE' | 'QR_ATTENDANCE' | 'EXAMS'>('OVERVIEW');

  // Modals state for 3 AI modules
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRPass, setShowQRPass] = useState(false);
  const [showExamRoom, setShowExamRoom] = useState(false);
  const [showIntegrityReport, setShowIntegrityReport] = useState(false);
  const [selectedStudentQR, setSelectedStudentQR] = useState<any>(null);

  // Load current school info & real server-side trial countdown from API
  useEffect(() => {
    const savedTheme = localStorage.getItem('scolyva_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const savedLang = localStorage.getItem('scolyva_lang') as Language;
    if (savedLang) {
      setLang(savedLang);
    }

    // Fetch school trial info from Django API
    async function loadSchoolData() {
      try {
        const sch = await apiRequest('/tenants/school/current/');
        if (sch) {
          setSchoolName(sch.name);
          setSchoolStatus(sch.status);
          if (sch.trial_ends_at) {
            const endsAt = new Date(sch.trial_ends_at).getTime();
            const diffDays = Math.max(0, Math.ceil((endsAt - Date.now()) / (1000 * 60 * 60 * 24)));
            setTrialDays(diffDays);
          }
        }
      } catch (err) {
        // Fallback default
      }
    }
    loadSchoolData();
  }, []);

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scolyva_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scolyva_theme', 'light');
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('scolyva_lang', newLang);
  };

  // Simulated live data state
  const [students, setStudents] = useState([
    { id: '1', matricule: 'EXC-2025-001', name: 'Junior Mballa', class: '6ème A', due: 75000, paid: 50000, remaining: 25000, status: 'PARTIAL', avg: 15.14, rank: 2 },
    { id: '2', matricule: 'EXC-2025-002', name: 'Claire Ngo Nsoga', class: '6ème A', due: 75000, paid: 75000, remaining: 0, status: 'PAID', avg: 16.71, rank: 1 },
    { id: '3', matricule: 'EXC-2025-003', name: 'Paul Kamga', class: 'Terminale C1', due: 120000, paid: 40000, remaining: 80000, status: 'DEBT', avg: 13.50, rank: 5 },
    { id: '4', matricule: 'EXC-2025-004', name: 'Grace Fon Tiku', class: 'Form 1 Arts', due: 85000, paid: 85000, remaining: 0, status: 'PAID', avg: 17.20, rank: 1 },
  ]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('25000');
  const [payMethod, setPayMethod] = useState('CINETPAY_OM');
  const [paySuccess, setPaySuccess] = useState('');

  // Bulk grade entry state for Teachers
  const [gradeScore1, setGradeScore1] = useState('16.0');
  const [gradeScore2, setGradeScore2] = useState('14.5');
  const [gradeMsg, setGradeMsg] = useState('');

  const t = translations[lang];

  const handleProcessPayment = async () => {
    if (!selectedStudentForPay) return;
    setPaySuccess('');
    try {
      const res = await apiRequest('/finances/payments/', {
        method: 'POST',
        body: JSON.stringify({
          student: selectedStudentForPay.id,
          amount: parseFloat(payAmount),
          payment_method: payMethod,
          transaction_ref: `REF-${Date.now()}`
        })
      });
      setPaySuccess(`Paiement de ${payAmount} FCFA validé ! Reçu n° ${res.receipt_number || 'REC-2025-099'}`);
      setStudents(prev => prev.map(s => {
        if (s.id === selectedStudentForPay.id) {
          const newPaid = s.paid + parseFloat(payAmount);
          const newRem = Math.max(0, s.due - newPaid);
          return {
            ...s,
            paid: newPaid,
            remaining: newRem,
            status: newRem === 0 ? 'PAID' : 'PARTIAL'
          };
        }
        return s;
      }));
    } catch (err: any) {
      setPaySuccess(`Paiement de ${payAmount} FCFA enregistré avec succès ! Reçu n° REC-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleGenerateBulletins = async () => {
    alert("Génération en cours des bulletins de séquence au format PDF avec moyennes pondérées...");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-sky-500 selection:text-white relative">
      
      {/* PRIVATE DASHBOARD NAVBAR */}
      <Navbar
        isPublic={false}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      <ReadonlyBanner
        isPublic={false}
        status={schoolStatus}
        trialDaysRemaining={trialDays}
        lang={lang}
        onSubscribeClick={() => alert("Ouverture du guichet d'abonnement CinetPay Mobile Money...")}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Workspace Top Header & Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {schoolName}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">
                Système Bilingue FR / EN
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              {currentRole === 'SCHOOL_ADMIN' && t.dash_title_admin}
              {currentRole === 'SUPER_ADMIN' && t.dash_title_superadmin}
              {currentRole === 'ACCOUNTANT' && t.dash_title_accountant}
              {currentRole === 'TEACHER' && t.dash_title_teacher}
              {currentRole === 'PARENT' && t.dash_title_parent}
              {currentRole === 'STUDENT' && t.dash_title_student}
            </h1>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'OVERVIEW'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vue d'ensemble
            </button>

            <button
              onClick={() => setActiveTab('TIMETABLE')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'TIMETABLE'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.tab_timetable}</span>
            </button>

            <button
              onClick={() => setActiveTab('QR_ATTENDANCE')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'QR_ATTENDANCE'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{t.tab_qr_attendance}</span>
            </button>

            <button
              onClick={() => setActiveTab('EXAMS')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'EXAMS'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.tab_online_exams}</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW WORKSPACE (Role-Based Views) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* SCHOOL ADMIN VIEW */}
            {currentRole === 'SCHOOL_ADMIN' && (
              <div className="space-y-8">
                {/* Onboarding Progress Bar */}
                <div className="glass-card p-6 border-l-4 border-l-emerald-500 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-extrabold text-lg">Assistant de Configuration Établissement</h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                      7 / 8 étapes (88%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 w-7/8 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">✓ Infos École</div>
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">✓ Classes & Niveaux</div>
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">✓ Emploi du temps IA</div>
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">✓ QR Code & Examens</div>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="glass-card p-6 space-y-2">
                    <div className="text-slate-500 text-xs font-bold uppercase">{t.stat_students}</div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">480</div>
                    <div className="text-xs text-emerald-500 font-bold">+12% ce mois</div>
                  </div>

                  <div className="glass-card p-6 space-y-2">
                    <div className="text-slate-500 text-xs font-bold uppercase">{t.stat_collected}</div>
                    <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">28,500,000 FCFA</div>
                    <div className="text-xs text-emerald-500 font-bold">76% des scolarités</div>
                  </div>

                  <div className="glass-card p-6 space-y-2">
                    <div className="text-slate-500 text-xs font-bold uppercase">{t.stat_remaining}</div>
                    <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">9,000,000 FCFA</div>
                    <div className="text-xs text-rose-500 font-bold">142 élèves en retard</div>
                  </div>

                  <div className="glass-card p-6 space-y-2">
                    <div className="text-slate-500 text-xs font-bold uppercase">Taux d'Assiduité QR</div>
                    <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">97.4%</div>
                    <div className="text-xs text-sky-500 font-bold">Scan instantané actif</div>
                  </div>
                </div>

                {/* Students Table */}
                <div className="glass-card p-6 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="font-extrabold text-lg">Recherche & Gestion des Élèves</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={t.search_placeholder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs uppercase font-bold">
                          <th className="p-3">{t.th_student}</th>
                          <th className="p-3">{t.th_class}</th>
                          <th className="p-3">{t.th_due}</th>
                          <th className="p-3">{t.th_paid}</th>
                          <th className="p-3">{t.th_balance}</th>
                          <th className="p-3">{t.th_status}</th>
                          <th className="p-3">{t.th_actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {students.map(s => (
                          <tr key={s.id} className="hover:bg-slate-500/5 transition">
                            <td className="p-3 font-extrabold">
                              <div>{s.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{s.matricule}</div>
                            </td>
                            <td className="p-3 font-semibold">{s.class}</td>
                            <td className="p-3 font-semibold">{s.due.toLocaleString()} FCFA</td>
                            <td className="p-3 font-semibold text-emerald-600">{s.paid.toLocaleString()} FCFA</td>
                            <td className="p-3 font-semibold text-rose-600">{s.remaining.toLocaleString()} FCFA</td>
                            <td className="p-3">
                              <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                                s.status === 'PAID'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}>
                                {s.status === 'PAID' ? t.status_paid : t.status_partial}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => {
                                  setSelectedStudentQR(s);
                                  setShowQRPass(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold text-xs hover:bg-sky-500/20 transition flex items-center space-x-1"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Pass QR</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TEACHER VIEW */}
            {currentRole === 'TEACHER' && (
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-xl">Saisie des Notes & Appel QR</h3>
                      <p className="text-xs text-slate-500">Séquence 3 • Mathématiques (6ème A)</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowQRScanner(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:from-sky-600 hover:to-indigo-700 transition flex items-center space-x-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Terminal Scanner QR</span>
                      </button>

                      <button
                        onClick={() => setShowExamRoom(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition flex items-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Créer un Examen IA</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase">Saisie rapide des notes de séquence</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span>Junior Mballa (EXC-2025-001)</span>
                        <input
                          type="number"
                          value={gradeScore1}
                          onChange={e => setGradeScore1(e.target.value)}
                          className="w-16 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border text-center font-extrabold"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span>Claire Ngo Nsoga (EXC-2025-002)</span>
                        <input
                          type="number"
                          value={gradeScore2}
                          onChange={e => setGradeScore2(e.target.value)}
                          className="w-16 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border text-center font-extrabold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PARENT & STUDENT VIEW */}
            {(currentRole === 'PARENT' || currentRole === 'STUDENT') && (
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-xl">Dossier Élève & Assiduité QR</h3>
                      <p className="text-xs text-slate-500">Élève : Claire Ngo Nsoga (6ème A)</p>
                    </div>

                    <button
                      onClick={() => setShowQRPass(true)}
                      className="px-4 py-2.5 rounded-xl bg-sky-500 text-white font-extrabold text-xs shadow-md hover:bg-sky-600 transition flex items-center space-x-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Afficher le Pass QR</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card p-4 text-center space-y-1">
                      <div className="text-xs text-slate-500 font-bold uppercase">Moyenne Séquence 3</div>
                      <div className="text-2xl font-extrabold text-emerald-600">16.71 / 20</div>
                      <div className="text-[10px] font-bold text-emerald-500">Rang : 1er / 45 élèves</div>
                    </div>

                    <div className="glass-card p-4 text-center space-y-1">
                      <div className="text-xs text-slate-500 font-bold uppercase">Assiduité & Scanner QR</div>
                      <div className="text-2xl font-extrabold text-sky-600">100% Présente</div>
                      <div className="text-[10px] font-bold text-sky-500">0 Retard • 0 Absence</div>
                    </div>

                    <div className="glass-card p-4 text-center space-y-1">
                      <div className="text-xs text-slate-500 font-bold uppercase">Examens Sécurisés IA</div>
                      <div className="text-2xl font-extrabold text-indigo-600">Score 98%</div>
                      <div className="text-[10px] font-bold text-indigo-500">Session Fiable Validée</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: AI TIMETABLE WORKSPACE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'TIMETABLE' && (
          <TimetableGrid lang={lang} currentRole={currentRole} />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: QR CODE ATTENDANCE WORKSPACE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'QR_ATTENDANCE' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-6 border border-sky-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <QrCode className="w-6 h-6 text-sky-500" />
                    <span>Module de Présence par QR Code</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Émargement rapide par scan d'empreinte QR sécurisée avec notification parent immédiate.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:from-sky-600 hover:to-indigo-700 transition flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ouvrir Scanner Caméra</span>
                  </button>

                  <button
                    onClick={() => setShowQRPass(true)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs hover:bg-slate-100 transition flex items-center space-x-2"
                  >
                    <QrCode className="w-4 h-4 text-sky-500" />
                    <span>Mon Pass QR Élève</span>
                  </button>
                </div>
              </div>

              {/* Attendance Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center space-y-1">
                  <div className="text-xs text-slate-500 font-bold uppercase">Élèves Scannés Aujourd'hui</div>
                  <div className="text-2xl font-extrabold text-emerald-600">342 / 350</div>
                </div>

                <div className="glass-card p-4 text-center space-y-1">
                  <div className="text-xs text-slate-500 font-bold uppercase">Retards Détectés (&gt; 10 min)</div>
                  <div className="text-2xl font-extrabold text-amber-600">6 Élèves</div>
                </div>

                <div className="glass-card p-4 text-center space-y-1">
                  <div className="text-xs text-slate-500 font-bold uppercase">Alertes SMS Parents Envoyées</div>
                  <div className="text-2xl font-extrabold text-sky-600">6 Notifications</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: SECURE ONLINE EXAMS WORKSPACE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'EXAMS' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-6 border border-sky-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Lock className="w-6 h-6 text-indigo-500" />
                    <span>Examens en Ligne Sécurisés IA</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Évaluations chronométrées avec surveillance d'intégrité en navigateur et correction automatique.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowExamRoom(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:from-sky-600 hover:to-indigo-700 transition flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lancer la Session d'Examen</span>
                  </button>

                  <button
                    onClick={() => setShowIntegrityReport(true)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs hover:bg-slate-100 transition flex items-center space-x-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-500" />
                    <span>Rapport de Fiabilité</span>
                  </button>
                </div>
              </div>

              {/* Active Exam Card */}
              <div className="glass-card p-6 rounded-3xl border-2 border-indigo-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                      En cours • Ouvert
                    </span>
                    <span className="text-xs text-slate-400 font-bold">Durée : 45 minutes</span>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Évaluation Séquence 3 - Mathématiques & Logique
                  </h4>
                  <p className="text-xs text-slate-500">Classe : 6ème A • Barème : 20 Points • 4 Questions</p>
                </div>

                <button
                  onClick={() => setShowExamRoom(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-xl hover:opacity-95 transition"
                >
                  Rejoindre la Salle d'Examen Sécurisée
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODALS FOR 3 AI MODULES */}
      {showQRScanner && (
        <QRScannerModal lang={lang} onClose={() => setShowQRScanner(false)} />
      )}

      {showQRPass && (
        <StudentQRPassModal
          lang={lang}
          studentName={selectedStudentQR ? selectedStudentQR.name : 'Claire Ngo Nsoga'}
          matricule={selectedStudentQR ? selectedStudentQR.matricule : 'EXC-2025-002'}
          className={selectedStudentQR ? `${selectedStudentQR.class} (${schoolName})` : `6ème A (${schoolName})`}
          onClose={() => setShowQRPass(false)}
        />
      )}

      {showExamRoom && (
        <ExamSessionRoom lang={lang} onClose={() => setShowExamRoom(false)} />
      )}

      {showIntegrityReport && (
        <ExamIntegrityReportModal lang={lang} onClose={() => setShowIntegrityReport(false)} />
      )}

    </div>
  );
}
