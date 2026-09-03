'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ReadonlyBanner from '@/components/ReadonlyBanner';
import { translations, Language } from '../lib/i18n';
import { apiRequest } from '../lib/api';
import {
  ShieldCheck, BookOpen, CreditCard, Users, CheckCircle2, ArrowRight,
  Sparkles, Building2, Phone, Mail, User, Eye, EyeOff, Lock, Laptop, Check,
  Award, TrendingUp, DollarSign, LogIn, Globe
} from 'lucide-react';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('fr');
  const [darkMode, setDarkMode] = useState(false); // Default to Light mode
  const [activeFeatureTab, setActiveFeatureTab] = useState<'payments' | 'academics' | 'security'>('payments');

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
      // Demo fallback redirect
      localStorage.setItem('scolyva_demo_slug', loginSlug);
      window.location.href = '/dashboard';
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      
      {/* Decorative Background Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* PUBLIC NAVBAR: Clean SaaS Navigation (No roles in header, No Super Admin link) */}
      <Navbar
        isPublic={true}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenRegisterModal={() => setShowRegModal(true)}
      />

      {/* PUBLIC BANNER: Never renders on public vitrine page for unauthenticated visitors */}
      <ReadonlyBanner
        isPublic={true}
        status="TRIAL"
        trialDaysRemaining={14}
        lang={lang}
        onSubscribeClick={() => {}}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 text-center overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-extrabold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>{t.badge_saas}</span>
          </div>

          {/* Fully Translated Hero Headlines */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t.hero_headline_1}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500">
              {t.hero_headline_highlight}
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-xl font-semibold text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            « {t.hero_subtext} »
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setShowRegModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-base sm:text-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
            >
              <span>{t.hero_btn_register}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => window.location.href = '/dashboard?demo=true'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-base sm:text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center space-x-2 shadow-md"
            >
              <Laptop className="w-5 h-5 text-sky-500" />
              <span>{t.hero_btn_dashboards}</span>
            </button>
          </div>

          {/* High-End 3D Graphic Showcase */}
          <div className="pt-10 relative max-w-5xl mx-auto">
            <div className="glass-card-hero p-3 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800/90">
              <img
                src="/hero_illustration.jpg"
                alt="Scolyva 3D Dashboard Showcase"
                className="w-full h-auto rounded-2xl shadow-lg object-cover transform hover:scale-[1.01] transition duration-500"
              />
              
              {/* Floating Live Callout Badges */}
              <div className="absolute top-6 left-6 glass-card p-3 rounded-2xl flex items-center space-x-3 shadow-lg animate-float hidden md:flex">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-white">Mobile Money Active</div>
                  <div className="text-slate-500 dark:text-slate-400">Orange Money & MTN MoMo</div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 glass-card p-3 rounded-2xl flex items-center space-x-3 shadow-lg animate-float hidden md:flex" style={{ animationDelay: '2s' }}>
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-white">FR / EN Dual System</div>
                  <div className="text-slate-500 dark:text-slate-400">Weighted Average Engine</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Feature Tabs Showcase */}
      <section id="features" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.feat_title}
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t.feat_subtitle}
          </p>
          <div className="w-20 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full mx-auto" />
        </div>

        {/* Feature Tabs Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveFeatureTab('payments')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-extrabold transition shadow-sm ${
              activeFeatureTab === 'payments'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Frais & Mobile Money</span>
          </button>

          <button
            onClick={() => setActiveFeatureTab('academics')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-extrabold transition shadow-sm ${
              activeFeatureTab === 'academics'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Notes, Bulletins & Coefs</span>
          </button>

          <button
            onClick={() => setActiveFeatureTab('security')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-extrabold transition shadow-sm ${
              activeFeatureTab === 'security'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Isolation Multi-Tenant</span>
          </button>
        </div>

        {/* Feature Tab Content Display */}
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {activeFeatureTab === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-500 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
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
                  className="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover"
                />
              </div>
            </div>
          )}

          {activeFeatureTab === 'academics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
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
                    <span>Feuilles d'appel et suivi de présence en temps réel</span>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src="/analytics_illustration.jpg"
                  alt="Analytiques et Bulletins de Notes"
                  className="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover"
                />
              </div>
            </div>
          )}

          {activeFeatureTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Sécurité & Multitenancy
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Isolation Stricte Serveur par `school_id`
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                  {t.feat_3_desc}
                </p>
                <div className="space-y-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Garantie de non-fuite de données entre établissements</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Stockage Cloudflare R2 avec URLs signées S3 temporaires</span>
                  </div>
                </div>
              </div>
              <div>
                <img
                  src="/hero_illustration.jpg"
                  alt="Isolation Multi-Tenant"
                  className="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Tarifs simples et transparents pour chaque établissement
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Commencez par 14 jours d'essai gratuit. Choisissez le plan adapté au nombre de vos élèves.
          </p>
          <div className="w-20 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-500 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full">Starter</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">150,000 FCFA <span className="text-xs text-slate-500 font-semibold">/ an</span></div>
              <p className="text-xs text-slate-500 mt-1">Jusqu'à 200 élèves</p>
            </div>
            <ul className="space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">✓ <span>Gestion des élèves & classes</span></li>
              <li className="flex items-center space-x-2">✓ <span>Notes & Bulletins de séquence</span></li>
              <li className="flex items-center space-x-2">✓ <span>Feuilles d'appel & Présences</span></li>
            </ul>
            <button
              onClick={() => setShowRegModal(true)}
              className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm hover:opacity-90 transition"
            >
              Tester Gratuitement 14j
            </button>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-6 border-2 border-sky-500 shadow-2xl relative">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
              Populaire
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">Pro</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">350,000 FCFA <span className="text-xs text-slate-500 font-semibold">/ an</span></div>
              <p className="text-xs text-slate-500 mt-1">Jusqu'à 600 élèves</p>
            </div>
            <ul className="space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">✓ <span>Tout le plan Starter</span></li>
              <li className="flex items-center space-x-2">✓ <span>Finances & Recouvrement impayés</span></li>
              <li className="flex items-center space-x-2">✓ <span>Espace Parents & Notifications</span></li>
              <li className="flex items-center space-x-2">✓ <span>Reçus officiels instantanés</span></li>
            </ul>
            <button
              onClick={() => setShowRegModal(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm hover:from-sky-600 hover:to-indigo-700 transition shadow-lg"
            >
              Démarrer l'essai Pro 14j
            </button>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">Business</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">750,000 FCFA <span className="text-xs text-slate-500 font-semibold">/ an</span></div>
              <p className="text-xs text-slate-500 mt-1">Jusqu'à 1500 élèves</p>
            </div>
            <ul className="space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">✓ <span>Tout le plan Pro</span></li>
              <li className="flex items-center space-x-2">✓ <span>CinetPay Mobile Money (OM / MoMo)</span></li>
              <li className="flex items-center space-x-2">✓ <span>Relances SMS automatiques</span></li>
              <li className="flex items-center space-x-2">✓ <span>Double système FR / EN Bilingue</span></li>
            </ul>
            <button
              onClick={() => setShowRegModal(true)}
              className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm hover:opacity-90 transition"
            >
              Tester Gratuitement 14j
            </button>
          </div>
        </div>
      </section>

      {/* School Login Modal (Demande du sous-domaine de l'école + Identifiants) */}
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
                <LogIn className="w-6 h-6 text-sky-500" />
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
                    className="w-full px-4 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-mono focus:ring-2 focus:ring-sky-500 outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg transition"
              >
                {isSubmitting ? 'Connexion en cours...' : 'Se Connecter à l\'Espace École'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registration Modal with Password Visibility & Confirmation Validation */}
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
                    <Building2 className="w-7 h-7 text-sky-500" />
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_edu_system}</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                      value={formData.admin_last_name}
                      onChange={e => setFormData({ ...formData, admin_last_name: e.target.value })}
                    />
                  </div>

                  {/* Password Field with Eye Toggle */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_password}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                        value={formData.admin_password}
                        onChange={e => setFormData({ ...formData, admin_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={showPassword ? "Masquer" : "Afficher"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field with Eye Toggle */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.label_confirm_password}</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                        value={formData.admin_confirm_password}
                        onChange={e => setFormData({ ...formData, admin_confirm_password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={showConfirmPassword ? "Masquer" : "Afficher"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg transition"
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
                  className="w-full py-4 rounded-2xl bg-sky-600 text-white font-extrabold text-lg shadow-xl hover:bg-sky-700 transition"
                >
                  Accéder à l'Espace Administration
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
