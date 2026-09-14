'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ReadonlyBanner from '@/components/ReadonlyBanner';
import LiveActivityToast from '@/components/LiveActivityToast';
import { translations, Language } from '@/lib/i18n';
import { apiRequest } from '@/lib/api';
import {
  ShieldCheck, BookOpen, CreditCard, Users, CheckCircle2, ArrowRight,
  Sparkles, Building2, Phone, Mail, User, Eye, EyeOff, Lock, Laptop, Check,
  Award, TrendingUp, DollarSign, LogIn, Globe, CheckCircle, Zap, Star,
  GraduationCap, FileSpreadsheet, RefreshCw, BarChart2, Shield, Brain
} from 'lucide-react';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('fr');
  const [darkMode, setDarkMode] = useState(false); // Default to Light mode
  const [activeFeatureTab, setActiveFeatureTab] = useState<'payments' | 'academics' | 'security' | 'classroom'>('payments');
  const [pricingBillingCycle, setPricingBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  // Modals state
  const [showRegModal, setShowRegModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Registration password state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState<any>(null);
  const [regError, setRegError] = useState('');

  // Login Form state
  const [loginSlug, setLoginSlug] = useState('college-excellence');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [formData, setFormData] = useState({
    school_name: '',
    school_slug: '',
    city: 'Douala',
    phone: '+237',
    email: '',
    director_name: '',
    edu_system: 'FRANCOPHONE',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_password: '',
    admin_confirm_password: ''
  });

  // Load persistent preferences on mount
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

  const t = translations[lang];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (formData.admin_password !== formData.admin_confirm_password) {
      setRegError(t.err_password_mismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest('/auth/register-school/', {
        method: 'POST',
        body: JSON.stringify({
          school_name: formData.school_name,
          city: formData.city,
          phone: formData.phone,
          email: formData.email,
          director_name: formData.director_name,
          edu_system: formData.edu_system,
          admin_first_name: formData.admin_first_name,
          admin_last_name: formData.admin_last_name,
          admin_email: formData.admin_email,
          admin_password: formData.admin_password
        }),
      });
      setRegSuccess(res);
      if (res.tokens?.access) {
        localStorage.setItem('scolyva_access_token', res.tokens.access);
        localStorage.setItem('scolyva_school_id', res.school.id);
      }
    } catch (err: any) {
      setRegError(err.message || 'Échec de l\'enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });
      if (res.access) {
        localStorage.setItem('scolyva_access_token', res.access);
        if (res.user?.memberships?.[0]?.school_id) {
          localStorage.setItem('scolyva_school_id', res.user.memberships[0].school_id);
        }
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      localStorage.setItem('scolyva_demo_slug', loginSlug);
      window.location.href = '/dashboard';
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#00a8ff] selection:text-white relative overflow-x-hidden bg-white dark:bg-slate-950">
      
      {/* Radial Soft Blue Hero Glow Container */}
      <div className="absolute top-0 left-0 right-0 h-[650px] eduvate-hero-glow pointer-events-none" />

      {/* PUBLIC NAVBAR */}
      <Navbar
        isPublic={true}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenRegisterModal={() => setShowRegModal(true)}
      />

      <ReadonlyBanner
        isPublic={true}
        status="TRIAL"
        trialDaysRemaining={14}
        lang={lang}
        onSubscribeClick={() => {}}
      />

      {/* Hero Section matching EXACT Eduvate Maquette Layout */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          
          {/* Centered Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-[#00a8ff] dark:text-sky-300 text-xs font-extrabold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#00a8ff]" />
            <span>Plateforme IA de gestion scolaire #1 • Cameroun & Afrique</span>
          </div>

          {/* Giant 2-Line Headline matching exact screenshot */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            La gestion scolaire <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00a8ff] via-[#0096e6] to-[#007cc2] drop-shadow-sm">
              réinventée par l'IA
            </span>
          </h1>

          {/* Centered Subtitle Paragraph matching exact screenshot */}
          <p className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Gérez étudiants, professeurs, emplois du temps, finances, examens et documents — le tout automatisé par l'intelligence artificielle.
          </p>

          {/* Dual Pill CTA Buttons matching exact screenshot */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setShowRegModal(true)}
              className="w-full sm:w-auto btn-eduvate-primary text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-full flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] transition"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.location.href = '/dashboard?demo=true'}
              className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-sm sm:text-base px-8 py-4 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <span>Demander une démonstration</span>
            </button>
          </div>

          {/* 4 Feature Metric Cards Grid matching exact screenshot */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            
            {/* Card 1: 20+ Modules intégrés */}
            <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-2 hover:shadow-xl transition">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#00a8ff] flex items-center justify-center mx-auto">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">20+</div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Modules intégrés</div>
              <div className="text-[11px] font-medium text-slate-400">Gestion complète</div>
            </div>

            {/* Card 2: 100% Automatisé */}
            <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-2 hover:shadow-xl transition">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#00a8ff] flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Automatisé</div>
              <div className="text-[11px] font-medium text-slate-400">Zéro tâche manuelle</div>
            </div>

            {/* Card 3: 24/7 Accessible */}
            <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-2 hover:shadow-xl transition">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#00a8ff] flex items-center justify-center mx-auto">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">24/7</div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Accessible</div>
              <div className="text-[11px] font-medium text-slate-400">Cloud sécurisé</div>
            </div>

            {/* Card 4: IA Dans chaque module */}
            <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-2 hover:shadow-xl transition">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#00a8ff] flex items-center justify-center mx-auto">
                <Brain className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">IA</div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Dans chaque module</div>
              <div className="text-[11px] font-medium text-slate-400">Intelligence artificielle</div>
            </div>

          </div>

          {/* Master 3D Graphic Showcase */}
          <div className="pt-10 relative max-w-5xl mx-auto">
            <div className="glass-card-hero p-3.5 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800/90 scolyva-glow-card">
              <img
                src="/hero_illustration.jpg"
                alt="Plateforme Officielle Scolyva - Master 3D Showcase"
                className="w-full h-auto rounded-2xl shadow-lg object-cover transform hover:scale-[1.01] transition duration-500"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Feature Showcase with 3 AI Modules */}
      <section id="features" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.feat_title}
          </h2>
          <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400">
            {t.feat_subtitle}
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#00a8ff] to-indigo-600 rounded-full mx-auto" />
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveFeatureTab('payments')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-sm ${
              activeFeatureTab === 'payments'
                ? 'btn-eduvate-primary text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Frais & Mobile Money</span>
          </button>

          <button
            onClick={() => setActiveFeatureTab('academics')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-sm ${
              activeFeatureTab === 'academics'
                ? 'btn-eduvate-primary text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Notes, Bulletins & Coefs</span>
          </button>

          <button
            onClick={() => setActiveFeatureTab('classroom')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-sm ${
              activeFeatureTab === 'classroom'
                ? 'btn-eduvate-primary text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Cahier de classe & Présences</span>
          </button>

          <button
            onClick={() => setActiveFeatureTab('security')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-sm ${
              activeFeatureTab === 'security'
                ? 'btn-eduvate-primary text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Isolation Multi-Tenant</span>
          </button>
        </div>

        {/* Feature Tab Content Display */}
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {activeFeatureTab === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00a8ff] bg-sky-50 dark:bg-sky-950 px-3.5 py-1.5 rounded-full border border-sky-200 dark:border-sky-800">
                  Passerelle CinetPay Intégrée
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Paiement Direct Orange Money & MTN MoMo
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  {t.feat_1_desc}
                </p>
                <div className="space-y-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Rapprochement comptable instantané</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Relances automatiques par SMS & Rappels d'échéances</span>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src="/payment_illustration.jpg"
                  alt="Paiement Mobile Money CinetPay"
                  className="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover hover:scale-[1.01] transition duration-300"
                />
              </div>
            </div>
          )}

          {activeFeatureTab === 'academics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Moteur Pédagogique Avancé
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Moyennes Pondérées & Bulletins PDF Automatiques
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  {t.feat_2_desc}
                </p>
                <div className="space-y-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Calcul automatique des rangs de classe et appréciations</span>
                  </div>
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Impression directe et envoi PDF aux parents</span>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src="/report_card_illustration.jpg"
                  alt="Analytiques et Bulletins de Notes Bilingues"
                  className="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover hover:scale-[1.01] transition duration-300"
                />
              </div>
            </div>
          )}

          {activeFeatureTab === 'classroom' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Gestion de Classe Intelligente
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Cahier de Notes & Feuilles d'Appel en Temps Réel
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  Les enseignants saisissent les notes par séquence et font l'appel en un clic depuis leur tablette ou smartphone. Les parents reçoivent une alerte immédiate en cas d'absence.
                </p>
                <div className="space-y-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Suivi quotidien de la discipline et des absences</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Accès sécurisé pour chaque professeur selon son emploi du temps</span>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src="/school_life_illustration.jpg"
                  alt="Cahier de classe et vie scolaire 3D"
                  className="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover hover:scale-[1.01] transition duration-300"
                />
              </div>
            </div>
          )}

          {activeFeatureTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-950 px-3.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Sécurité & Multitenancy
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Isolation Stricte Serveur par `school_id`
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  {t.feat_3_desc}
                </p>
                <div className="space-y-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Garantie de non-fuite de données entre établissements</span>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Stockage Cloudflare R2 avec URLs signées S3 temporaires</span>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src="/hero_illustration.jpg"
                  alt="Isolation Multi-Tenant Scolyva"
                  className="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover hover:scale-[1.01] transition duration-300"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section with Pill Toggle */}
      <section id="pricing" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Tarifs simples, clairs et sans frais cachés
          </h2>
          <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400">
            Profitez de 14 jours d'essai gratuit. Choisissez la formule adaptée au nombre de vos élèves.
          </p>

          {/* Monthly / Annual Billing Toggle Switch */}
          <div className="pt-4 flex items-center justify-center space-x-4">
            <span className={`text-sm font-extrabold cursor-pointer transition ${pricingBillingCycle === 'MONTHLY' ? 'text-[#00a8ff] dark:text-sky-400 scale-105' : 'text-slate-400'}`} onClick={() => setPricingBillingCycle('MONTHLY')}>
              Paiement Mensuel
            </span>

            <button
              onClick={() => setPricingBillingCycle(pricingBillingCycle === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY')}
              className="w-16 h-9 rounded-full bg-slate-200 dark:bg-slate-800 p-1 relative transition duration-300 focus:outline-none"
            >
              <div
                className={`w-7 h-7 rounded-full btn-eduvate-primary shadow-md transform transition duration-300 ${
                  pricingBillingCycle === 'ANNUAL' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>

            <span className={`text-sm font-extrabold cursor-pointer transition flex items-center space-x-1.5 ${pricingBillingCycle === 'ANNUAL' ? 'text-[#00a8ff] dark:text-sky-400 scale-105' : 'text-slate-400'}`} onClick={() => setPricingBillingCycle('ANNUAL')}>
              <span>Paiement Annuel</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/30">
                Économie 2 Mois
              </span>
            </span>
          </div>

          <div className="w-24 h-1.5 bg-gradient-to-r from-[#00a8ff] to-indigo-600 rounded-full mx-auto mt-4" />
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan 1: STARTER */}
          <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#00a8ff] bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Starter
              </span>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  10,000 FCFA <span className="text-xs text-slate-500 font-semibold">/ mois</span>
                </div>
                <div className="text-xs font-bold text-[#00a8ff] dark:text-sky-400 mt-1">
                  Équivalent : 120,000 FCFA par an
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Pour écoles primaires & collèges jusqu'à 200 élèves</p>
              </div>

              <ul className="space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Gestion des élèves & classes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Notes & Bulletins de séquence PDF</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Feuilles d'appel & Présences QR</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Emploi du temps généré par IA</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowRegModal(true)}
              className="w-full py-3.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm hover:opacity-90 transition shadow-md"
            >
              Démarrer l'essai Starter 14j
            </button>
          </div>

          {/* Plan 2: PRO */}
          <div className="glass-card p-8 rounded-3xl space-y-6 border-2 border-[#00a8ff] shadow-2xl relative flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full btn-eduvate-primary text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
              Recommandé Écoles
            </div>

            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Pro
              </span>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  25,000 FCFA <span className="text-xs text-slate-500 font-semibold">/ mois</span>
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  Équivalent : 300,000 FCFA par an
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Pour établissements moyens jusqu'à 600 élèves</p>
              </div>

              <ul className="space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Tout le plan Starter inclus</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Finances complètes & Suivi des impayés</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Examens en ligne sécurisés IA</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Relances automatiques par SMS</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowRegModal(true)}
              className="w-full py-3.5 rounded-full btn-eduvate-primary text-white font-extrabold text-sm transition shadow-xl"
            >
              Démarrer l'essai Pro 14j
            </button>
          </div>

          {/* Plan 3: BUSINESS */}
          <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Business
              </span>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  40,000 FCFA <span className="text-xs text-slate-500 font-semibold">/ mois</span>
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Équivalent : 480,000 FCFA par an
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Grands lycées & collèges bilingues jusqu'à 1500 élèves</p>
              </div>

              <ul className="space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Tout le plan Pro inclus</span>
                </li>
                <li className="flex items-center space-x-2 font-bold text-[#00a8ff] dark:text-sky-400">
                  <CheckCircle2 className="w-4 h-4 text-[#00a8ff] flex-shrink-0" />
                  <span>CinetPay Mobile Money (OM / MoMo)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Double système FR / EN Bilingue</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Accès prioritaire VIP & Formations</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowRegModal(true)}
              className="w-full py-3.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm hover:opacity-90 transition shadow-md"
            >
              Démarrer l'essai Business 14j
            </button>
          </div>

        </div>
      </section>

      {/* School Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
            >
              ✕
            </button>

            <div>
              <h2 className="text-2xl font-extrabold flex items-center space-x-2.5 text-slate-900 dark:text-white">
                <LogIn className="w-6 h-6 text-[#00a8ff]" />
                <span>Connexion à votre Établissement</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Saisissez le sous-domaine de votre école et vos identifiants.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Identifiant / Sous-domaine École</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="college-excellence"
                    className="w-full px-4 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-mono focus:ring-2 focus:ring-[#00a8ff] outline-none"
                    value={loginSlug}
                    onChange={e => setLoginSlug(e.target.value)}
                  />
                  <span className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 border border-l-0 border-slate-300 dark:border-slate-800 rounded-r-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    .scolyva.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  placeholder="director@excellence.cm"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full btn-eduvate-primary text-white font-extrabold text-sm shadow-lg transition"
              >
                {isSubmitting ? 'Connexion en cours...' : 'Se Connecter à l\'Espace École'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
            >
              ✕
            </button>

            {!regSuccess ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold flex items-center space-x-3 text-slate-900 dark:text-white">
                    <Building2 className="w-7 h-7 text-[#00a8ff]" />
                    <span>{t.reg_modal_title}</span>
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t.reg_modal_subtitle}
                  </p>
                </div>

                {regError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center space-x-2">
                    <span>{regError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_school_name}</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Collège Excellence Douala"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.school_name}
                      onChange={e => setFormData({ ...formData, school_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_city}</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Douala / Yaoundé / Bamenda"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_school_phone}</label>
                    <input
                      type="text"
                      required
                      placeholder="+237 677 11 22 33"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_edu_system}</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.edu_system}
                      onChange={e => setFormData({ ...formData, edu_system: e.target.value })}
                    >
                      <option value="FRANCOPHONE">{t.sys_francophone}</option>
                      <option value="ANGLOPHONE">{t.sys_anglophone}</option>
                      <option value="BOTH">{t.sys_both}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_director_name}</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Jean-Pierre Mbida"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.director_name}
                      onChange={e => setFormData({ ...formData, director_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_school_email}</label>
                    <input
                      type="email"
                      required
                      placeholder="contact@ecole.cm"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value, admin_email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_admin_fname}</label>
                    <input
                      type="text"
                      required
                      placeholder="Jean-Pierre"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.admin_first_name}
                      onChange={e => setFormData({ ...formData, admin_first_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_admin_lname}</label>
                    <input
                      type="text"
                      required
                      placeholder="Mbida"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                      value={formData.admin_last_name}
                      onChange={e => setFormData({ ...formData, admin_last_name: e.target.value })}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_password}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                        value={formData.admin_password}
                        onChange={e => setFormData({ ...formData, admin_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_confirm_password}</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                        value={formData.admin_confirm_password}
                        onChange={e => setFormData({ ...formData, admin_confirm_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full btn-eduvate-primary text-white font-extrabold text-base shadow-lg transition"
                >
                  {isSubmitting ? 'Création de votre établissement en cours...' : t.btn_start_trial}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Établissement Enregistré !</h2>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  {regSuccess.message}
                </p>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-left text-sm space-y-2 font-mono">
                  <div><strong>École:</strong> {regSuccess.school.name}</div>
                  <div><strong>Sous-domaine:</strong> {regSuccess.school.slug}.scolyva.com</div>
                  <div><strong>Statut:</strong> Essai gratuit jusqu'au {new Date(regSuccess.school.trial_ends_at).toLocaleDateString()}</div>
                </div>

                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full py-4 rounded-full btn-eduvate-primary text-white font-extrabold text-lg shadow-xl hover:opacity-95 transition"
                >
                  Accéder à l'Espace Administration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Live Activity Feed Toast */}
      <LiveActivityToast lang={lang} />

    </div>
  );
}
