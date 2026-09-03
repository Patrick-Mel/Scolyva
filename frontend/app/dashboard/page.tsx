'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ReadonlyBanner from '@/components/ReadonlyBanner';
import { translations, Language } from '../../lib/i18n';
import { apiRequest } from '../../lib/api';
import {
  Users, CreditCard, BookOpen, GraduationCap, ShieldCheck, CheckCircle2,
  AlertTriangle, DollarSign, Calendar, FileText, Plus, Search, ChevronRight,
  TrendingUp, Download, Sparkles, Send, PhoneCall, Check, UserCheck, Filter
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

  const [schools, setSchools] = useState([
    { id: '1', name: 'Collège Excellence Douala', slug: 'college-excellence', status: 'TRIAL', system: 'FRANCOPHONE', students: 480, revenue: 150000 },
    { id: '2', name: 'St. Patrick College Bamenda', slug: 'st-patrick-bamenda', status: 'ACTIVE', system: 'ANGLOPHONE', students: 620, revenue: 350000 },
    { id: '3', name: 'Lycée Bilingue de Yaoundé', slug: 'lycee-yaounde', status: 'READ_ONLY', system: 'BOTH', students: 1200, revenue: 0 },
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

  // Attendance state for Teachers
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  const t = translations[lang];

  // Filtered Students Search
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSimulatePayment = () => {
    if (!selectedStudentForPay) return;
    const amt = parseFloat(payAmount);
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentForPay.id) {
        const newPaid = s.paid + amt;
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
    setPaySuccess(`Paiement de ${amt.toLocaleString()} FCFA effectué via CinetPay ! Reçu REC-${Date.now().toString().slice(-6)} généré.`);
    setTimeout(() => {
      setPaySuccess('');
      setShowPayModal(false);
    }, 2500);
  };

  const handleGenerateBulletins = () => {
    alert("Bulletins de Séquence générés avec succès ! Les classements et appréciations ont été recalculés.");
  };

  const handleSaveGrades = () => {
    setGradeMsg("Notes enregistrées pour la Séquence 1 !");
    setTimeout(() => setGradeMsg(''), 3000);
  };

  const handleSaveAttendance = () => {
    setAttendanceMsg(`Appel de la classe validé ! ${absentStudents.length} élève(s) absent(s) notifié(s) par SMS aux parents.`);
    setTimeout(() => setAttendanceMsg(''), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* PRIVATE DASHBOARD NAVBAR: Displays Role Selector inside workspace only */}
      <Navbar
        isPublic={false}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* PRIVATE SCHOOL READONLY BANNER: Rendered ONLY in private school workspace with real server trial days */}
      <ReadonlyBanner
        isPublic={false}
        status={schoolStatus}
        trialDaysRemaining={trialDays}
        lang={lang}
        onSubscribeClick={() => {
          setSchoolStatus('ACTIVE');
          alert(`Félicitations ! Votre école '${schoolName}' est désormais sous abonnement Pro (350,000 FCFA/an) via CinetPay.`);
        }}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-8">

        {/* Dynamic Dashboard Role Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 border-l-4 border-l-sky-500 shadow-md">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {currentRole === 'SUPER_ADMIN' ? 'Plateforme Scolyva' : schoolName}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
                {currentRole}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">
              {currentRole === 'SCHOOL_ADMIN' && t.dash_title_admin}
              {currentRole === 'SUPER_ADMIN' && t.dash_title_superadmin}
              {currentRole === 'ACCOUNTANT' && t.dash_title_accountant}
              {currentRole === 'TEACHER' && t.dash_title_teacher}
              {currentRole === 'PARENT' && t.dash_title_parent}
              {currentRole === 'STUDENT' && t.dash_title_student}
            </h1>
          </div>

          {/* Action shortcuts */}
          <div className="flex items-center space-x-3">
            {currentRole === 'ACCOUNTANT' && (
              <button
                onClick={() => {
                  setSelectedStudentForPay(students[0]);
                  setShowPayModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Enregistrer un Encaissement</span>
              </button>
            )}

            {currentRole === 'SCHOOL_ADMIN' && (
              <button
                onClick={handleGenerateBulletins}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-md hover:from-sky-600 hover:to-indigo-700 transition flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>{t.btn_generate_bulletins}</span>
              </button>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ROLE 1: SCHOOL ADMIN VIEW */}
        {/* ---------------------------------------------------- */}
        {currentRole === 'SCHOOL_ADMIN' && (
          <div className="space-y-8">
            {/* Onboarding Wizard Progress Bar */}
            <div className="glass-card p-6 border-l-4 border-l-emerald-500 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-extrabold text-lg">Assistant de Configuration (Onboarding)</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  6 / 8 étapes complétées (75%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 w-3/4 rounded-full" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">✓ Infos École & Logo</div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">✓ Classes & Niveaux</div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">✓ Matières & Enseignants</div>
                <div className="flex items-center space-x-1 text-sky-600 dark:text-sky-400">➜ Structure des Frais</div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card p-6 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                  <span>{t.stat_students}</span>
                  <Users className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">480</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+12% vs année précédente</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                  <span>{t.stat_collected}</span>
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">32,400,000 FCFA</div>
                <div className="text-xs text-slate-500 font-semibold">Taux de recouvrement: 82%</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                  <span>{t.stat_avg}</span>
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">14.85 / 20</div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Séquence 1 - Francophone</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                  <span>Statut Abonnement</span>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {schoolStatus === 'TRIAL' ? `${trialDays}j d'essai` : 'Actif Pro'}
                </div>
                <div className="text-xs text-slate-500 font-semibold">Expirera dans {trialDays} jours</div>
              </div>
            </div>

            {/* Students Table with Search & Filter */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="font-extrabold text-lg">Élèves de l'Établissement</h3>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, matricule..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold outline-none"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="PAID">À Jour</option>
                    <option value="PARTIAL">Partiellement Payé</option>
                    <option value="DEBT">Impayé</option>
                  </select>

                  <button
                    onClick={() => alert("Formulaire d'inscription d'un nouvel élève ouvert.")}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.btn_add_student}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs uppercase font-extrabold text-slate-500">
                    <tr>
                      <th className="p-3">Matricule</th>
                      <th className="p-3">Élève</th>
                      <th className="p-3">Classe</th>
                      <th className="p-3">Solde Dû</th>
                      <th className="p-3">Payé</th>
                      <th className="p-3">Reste</th>
                      <th className="p-3">Statut Solde</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">{s.matricule}</td>
                        <td className="p-3 font-bold">{s.name}</td>
                        <td className="p-3 font-semibold">{s.class}</td>
                        <td className="p-3 font-semibold">{s.due.toLocaleString()} FCFA</td>
                        <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{s.paid.toLocaleString()} FCFA</td>
                        <td className="p-3 font-bold text-rose-500">{s.remaining.toLocaleString()} FCFA</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            s.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {s.status === 'PAID' ? 'A Jour' : 'Impayé'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedStudentForPay(s);
                              setPayAmount(s.remaining.toString());
                              setShowPayModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-500/20 transition"
                          >
                            Encaissement Mobile Money
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

        {/* ---------------------------------------------------- */}
        {/* ROLE 2: SUPER ADMIN PLATFORM VIEW */}
        {/* ---------------------------------------------------- */}
        {currentRole === 'SUPER_ADMIN' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card p-6 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Établissements Clients</div>
                <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">3 Écoles</div>
                <div className="text-xs text-slate-500">2 Actives, 1 en Essai 14j</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Revenus Abonnements Scolyva</div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">500,000 FCFA</div>
                <div className="text-xs text-emerald-500">Paiements via CinetPay</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Élèves Hébergés</div>
                <div className="text-3xl font-extrabold">2,300</div>
                <div className="text-xs text-slate-500">Partagés sur 1 seule DB PostgreSQL</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Statut Stockage R2</div>
                <div className="text-3xl font-extrabold text-indigo-500">Actif (S3)</div>
                <div className="text-xs text-slate-500">Presigned URLs fonctionnelles</div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-extrabold text-lg">Répertoire des Établissements Scolaires</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs uppercase font-extrabold text-slate-500">
                    <tr>
                      <th className="p-3">Établissement</th>
                      <th className="p-3">Sous-domaine</th>
                      <th className="p-3">Système</th>
                      <th className="p-3">Effectif</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Action Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {schools.map(sch => (
                      <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="p-3 font-bold">{sch.name}</td>
                        <td className="p-3 font-mono text-sky-600 dark:text-sky-400">{sch.slug}.scolyva.com</td>
                        <td className="p-3 font-semibold">{sch.system}</td>
                        <td className="p-3 font-semibold">{sch.students} élèves</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            sch.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                            sch.status === 'TRIAL' ? 'bg-sky-100 dark:bg-sky-950 text-sky-600' :
                            'bg-amber-100 dark:bg-amber-950 text-amber-600'
                          }`}>
                            {sch.status}
                          </span>
                        </td>
                        <td className="p-3 flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSchools(prev => prev.map(s => s.id === sch.id ? { ...s, status: 'ACTIVE' } : s));
                              alert(`L'établissement ${sch.name} a été basculé en statut ACTIF.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs hover:bg-emerald-500/20 transition"
                          >
                            Activer Plan Pro
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

        {/* ---------------------------------------------------- */}
        {/* ROLE 3: ACCOUNTANT VIEW */}
        {/* ---------------------------------------------------- */}
        {currentRole === 'ACCOUNTANT' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card p-6 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Attendu Scolarité</div>
                <div className="text-3xl font-extrabold">270,000 FCFA</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Encaissé au Guichet / Mobile Money</div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">165,000 FCFA</div>
              </div>

              <div className="glass-card p-6 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Reste à Recouvrer (Impayés)</div>
                <div className="text-3xl font-extrabold text-rose-500">105,000 FCFA</div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-extrabold text-lg">Tableau de Recouvrement par Élève</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs uppercase font-extrabold text-slate-500">
                    <tr>
                      <th className="p-3">Matricule</th>
                      <th className="p-3">Nom Élève</th>
                      <th className="p-3">Classe</th>
                      <th className="p-3">Frais Payés</th>
                      <th className="p-3">Reste à Payer</th>
                      <th className="p-3">Rappel SMS Parent</th>
                      <th className="p-3">Payer via CinetPay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">{s.matricule}</td>
                        <td className="p-3 font-bold">{s.name}</td>
                        <td className="p-3 font-semibold">{s.class}</td>
                        <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{s.paid.toLocaleString()} FCFA</td>
                        <td className="p-3 font-bold text-rose-500">{s.remaining.toLocaleString()} FCFA</td>
                        <td className="p-3">
                          <button
                            onClick={() => alert(`Rappel de paiement SMS envoyé aux parents de ${s.name} (+237670112233).`)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs hover:bg-amber-500/20 transition flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Envoyer SMS</span>
                          </button>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedStudentForPay(s);
                              setPayAmount(s.remaining > 0 ? s.remaining.toString() : '10000');
                              setShowPayModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition"
                          >
                            Payer (MoMo/OM)
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

        {/* ---------------------------------------------------- */}
        {/* ROLE 4: TEACHER VIEW */}
        {/* ---------------------------------------------------- */}
        {currentRole === 'TEACHER' && (
          <div className="space-y-8">
            {/* Gradebook entry */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg">Saisie des Notes — Séquence 1 (Mathématiques - 6ème A)</h3>
                  <p className="text-xs text-slate-500">Coefficient: 4.0 • Note max: 20.0</p>
                </div>
                <button
                  onClick={handleSaveGrades}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 transition"
                >
                  {t.btn_save}
                </button>
              </div>

              {gradeMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-sm border border-emerald-500">
                  {gradeMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-900">
                  <div>
                    <div className="font-extrabold text-sm">Junior Mballa</div>
                    <div className="text-xs text-slate-500 font-mono">EXC-2025-001</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-500">Note / 20:</span>
                    <input
                      type="number"
                      step="0.5"
                      className="w-24 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-center"
                      value={gradeScore1}
                      onChange={e => setGradeScore1(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-900">
                  <div>
                    <div className="font-extrabold text-sm">Claire Ngo Nsoga</div>
                    <div className="text-xs text-slate-500 font-mono">EXC-2025-002</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-500">Note / 20:</span>
                    <input
                      type="number"
                      step="0.5"
                      className="w-24 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-center"
                      value={gradeScore2}
                      onChange={e => setGradeScore2(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Caller */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg">Feuille d'Appel Présence — 6ème A</h3>
                  <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition"
                >
                  Valider l'Appel
                </button>
              </div>

              {attendanceMsg && (
                <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-600 font-bold text-sm border border-indigo-500">
                  {attendanceMsg}
                </div>
              )}

              <div className="space-y-3">
                {students.map(st => {
                  const isAbs = absentStudents.includes(st.id);
                  return (
                    <div key={st.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900">
                      <span className="font-bold text-sm">{st.name} ({st.class})</span>
                      <button
                        onClick={() => {
                          setAbsentStudents(prev => isAbs ? prev.filter(x => x !== st.id) : [...prev, st.id]);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                          isAbs ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isAbs ? 'Marqué ABSENT' : 'PRÉSENT'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ROLE 5: PARENT VIEW */}
        {/* ---------------------------------------------------- */}
        {currentRole === 'PARENT' && (
          <div className="space-y-8">
            <div className="glass-card p-6 border-l-4 border-l-sky-500 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold text-sky-500 uppercase">Parent d'Élève</div>
                  <h3 className="text-2xl font-extrabold">Dossier de Junior Mballa (6ème A)</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentForPay(students[0]);
                    setPayAmount(students[0].remaining.toString());
                    setShowPayModal(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-xl hover:scale-105 transition"
                >
                  {t.btn_pay_cinetpay}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900">
                  <div className="text-xs text-slate-500 font-bold uppercase">Moyenne Générale S1</div>
                  <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">15.14 / 20</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Rang: 2ème / 25</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900">
                  <div className="text-xs text-slate-500 font-bold uppercase">Frais de Scolarité</div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">50,000 FCFA Payés</div>
                  <div className="text-xs text-rose-500 font-bold">Reste: 25,000 FCFA</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900">
                  <div className="text-xs text-slate-500 font-bold uppercase">Présence au Cours</div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
                  <div className="text-xs text-slate-500 font-semibold">0 absence non justifiée</div>
                </div>
              </div>
            </div>

            {/* Sequence Report Card Viewer */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-extrabold text-lg">Bulletin de Notes Officiel — Séquence 1</h3>
              <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex justify-between items-center border-b pb-3 text-xs font-bold text-slate-500">
                  <span>Matière</span>
                  <span>Coef</span>
                  <span>Note / 20</span>
                  <span>Note Pondérée</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Mathématiques</span>
                  <span className="font-mono">4.0</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">16.0 / 20</span>
                  <span className="font-mono font-bold">64.0 pts</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Français</span>
                  <span className="font-mono">3.0</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">14.0 / 20</span>
                  <span className="font-mono font-bold">42.0 pts</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center font-extrabold text-base">
                  <span>Total & Moyenne Général:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">15.14 / 20 (Très Bien - Félicitations)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ROLE 6: STUDENT VIEW */}
        {/* ---------------------------------------------------- */}
        {currentRole === 'STUDENT' && (
          <div className="space-y-8">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-2xl font-extrabold">Mon Bulletin & Emploi du Temps</h3>
              <p className="text-sm text-slate-500">Bienvenue Junior ! Retrouvez vos notes et bulletins validés par l'établissement.</p>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white space-y-2 shadow-lg">
                <div className="text-xs uppercase font-bold text-sky-200">Dernier Bulletin Généré</div>
                <div className="text-3xl font-extrabold">15.14 / 20 — 2ème de la classe (6ème A)</div>
                <div className="text-xs text-sky-100">Appréciation du Conseil: Très Bien - Félicitations</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CinetPay Payment Popup Modal */}
      {showPayModal && selectedStudentForPay && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg">Paiement CinetPay Mobile Money</h3>
                <p className="text-xs text-slate-500">{selectedStudentForPay.name} ({selectedStudentForPay.class})</p>
              </div>
            </div>

            {paySuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500 text-emerald-600 text-sm font-bold text-center">
                {paySuccess}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Montant à payer (FCFA)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-extrabold text-xl text-emerald-600"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mode de Règlement</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-bold"
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                  >
                    <option value="CINETPAY_OM">Orange Money (CinetPay)</option>
                    <option value="CINETPAY_MOMO">MTN Mobile Money (CinetPay)</option>
                    <option value="CINETPAY_CARD">Carte Visa / Mastercard</option>
                  </select>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 text-white font-extrabold text-base shadow-lg transition"
                >
                  Confirmer le Paiement Mobile Money
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
