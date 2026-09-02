'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ReadonlyBanner from '@/components/ReadonlyBanner';
import { translations, Language } from '@/lib/i18n';
import { apiRequest } from '@/lib/api';
import {
  ShieldCheck, BookOpen, CreditCard, Users, CheckCircle2, ArrowRight,
  Sparkles, Building2, Phone, Mail, User, Star, TrendingUp, Award,
  ChevronRight, Lock, Laptop, Check
} from 'lucide-react';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('fr');
  const [darkMode, setDarkMode] = useState(false); // Default to LIGHT mode!
  const [currentRole, setCurrentRole] = useState('SCHOOL_ADMIN');

  // Load persistent theme preference on mount
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

  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState<any>(null);
  const [regError, setRegError] = useState('');

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
    admin_password: ''
  });

  const t = translations[lang];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegError('');
    try {
      const res = await apiRequest('/auth/register-school/', {
        method: 'POST',
        body: JSON.stringify(formData),
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

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      
      {/* Decorative Background Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <Navbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      <ReadonlyBanner
        status="TRIAL"
        trialDaysRemaining={14}
        lang={lang}
        onSubscribeClick={() => window.location.href = '/dashboard'}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 text-center overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-extrabold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-500 animate-spin-slow" />
            <span>{t.badge_saas}</span>
          </div>

          {/* Fully Translated Hero Headlines */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t.hero_headline_1}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500">
              {t.hero_headline_highlight}
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl font-semibold text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
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
              onClick={() => window.location.href = '/dashboard'}
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
              <div className="absolute top-6 left-6 glass-card p-3 rounded-2xl flex items-center space-x-3 shadow-lg animate-float hidden sm:flex">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-white">Mobile Money Active</div>
                  <div className="text-slate-500 dark:text-slate-400">Orange Money & MTN MoMo</div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 glass-card p-3 rounded-2xl flex items-center space-x-3 shadow-lg animate-float hidden sm:flex" style={{ animationDelay: '2s' }}>
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

      {/* Feature Cards Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.feat_title}
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 space-y-4 hover:border-sky-500/60 transition group hover:shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">{t.feat_1_title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t.feat_1_desc}
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 hover:border-indigo-500/60 transition group hover:shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">{t.feat_2_title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t.feat_2_desc}
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 hover:border-emerald-500/60 transition group hover:shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">{t.feat_3_title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t.feat_3_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-8 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
            >
              ✕
            </button>

            {!regSuccess ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold flex items-center space-x-3">
                    <Building2 className="w-7 h-7 text-sky-500" />
                    <span>Inscrire mon Établissement Scolaire</span>
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Bénéficiez immédiatement de 14 jours d'essai gratuit sans engagement.
                  </p>
                </div>

                {regError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 text-sm font-semibold">
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nom de l'établissement</label>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ville</label>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Téléphone de l'école</label>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Système Éducatif</label>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nom du Directeur</label>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email de l'école</label>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Prénom Admin</label>
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
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nom Admin</label>
                    <input
                      type="text"
                      required
                      placeholder="Mbida"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                      value={formData.admin_last_name}
                      onChange={e => setFormData({ ...formData, admin_last_name: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mot de passe de votre compte</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                      value={formData.admin_password}
                      onChange={e => setFormData({ ...formData, admin_password: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg transition"
                >
                  {isSubmitting ? 'Création de votre établissement en cours...' : 'Activer l\'essai gratuit 14 jours'}
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
