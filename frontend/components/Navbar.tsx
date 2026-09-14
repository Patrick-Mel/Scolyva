'use client';

import { useState } from 'react';
import ScolyvaLogo from './ScolyvaLogo';
import { Sun, Moon, Globe, LogIn, ExternalLink, Menu, X, ShieldCheck, GraduationCap, CreditCard, BookOpen, Users, User } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface NavbarProps {
  isPublic?: boolean;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
  currentRole?: string;
  onRoleChange?: (role: string) => void;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;
}

export default function Navbar({
  isPublic = false,
  lang,
  onLanguageChange,
  darkMode,
  onThemeToggle,
  currentRole = 'SCHOOL_ADMIN',
  onRoleChange,
  onOpenLoginModal,
  onOpenRegisterModal
}: NavbarProps) {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Internal roles for private dashboard
  const dashboardRoles = [
    { id: 'SCHOOL_ADMIN', label: t.role_school_admin, icon: ShieldCheck },
    { id: 'ACCOUNTANT', label: t.role_accountant, icon: CreditCard },
    { id: 'TEACHER', label: t.role_teacher, icon: BookOpen },
    { id: 'PARENT', label: t.role_parent, icon: Users },
    { id: 'STUDENT', label: t.role_student, icon: User },
    { id: 'SUPER_ADMIN', label: t.role_superadmin, icon: GraduationCap },
  ];

  return (
    <nav className="w-full bg-white/90 dark:bg-slate-950/90 sticky top-0 z-40 px-4 sm:px-8 py-3.5 border-b border-slate-100 dark:border-slate-800 backdrop-blur-md transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Official 3D Scolyva Brand Logo */}
        <div onClick={() => window.location.href = '/'}>
          <ScolyvaLogo size="md" showSubtitle={false} />
        </div>

        {/* PUBLIC DESKTOP NAVBAR LINKS (matching screenshot: Accueil, Fonctionnalités, Tarifs, À propos, Contact) */}
        {isPublic ? (
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="/" className="text-slate-900 dark:text-white font-bold hover:text-[#00a8ff] transition">
              {t.nav_home}
            </a>
            <a href="#features" className="hover:text-[#00a8ff] dark:hover:text-sky-400 transition">
              {t.nav_features}
            </a>
            <a href="#pricing" className="hover:text-[#00a8ff] dark:hover:text-sky-400 transition">
              {t.nav_pricing}
            </a>
            <a href="#about" className="hover:text-[#00a8ff] dark:hover:text-sky-400 transition">
              À propos
            </a>
            <a href="#contact" className="hover:text-[#00a8ff] dark:hover:text-sky-400 transition">
              Contact
            </a>
          </div>
        ) : (
          /* PRIVATE DESKTOP DASHBOARD ROLE SWITCHER */
          <div className="hidden lg:flex flex-wrap items-center justify-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-inner">
            {dashboardRoles.map((r) => {
              const Icon = r.icon;
              const active = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRoleChange && onRoleChange(r.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'btn-eduvate-primary text-white shadow-md font-bold scale-105'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* DESKTOP CONTROLS */}
        <div className="hidden sm:flex items-center space-x-3">
          
          {/* Globe Language Selector */}
          <button
            onClick={() => onLanguageChange(lang === 'fr' ? 'en' : 'fr')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition flex items-center space-x-1 text-xs font-bold"
            title="Langue"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="uppercase">{lang === 'fr' ? 'FR' : 'EN'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title={darkMode ? "Mode Clair" : "Mode Sombre"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Pill CTA Button (Connexion ↗) matching exact screenshot style */}
          {isPublic && (
            <button
              onClick={onOpenLoginModal}
              className="btn-eduvate-primary text-white font-extrabold text-sm px-6 py-2.5 rounded-full flex items-center space-x-1.5 transition transform hover:scale-[1.02] shadow-md"
            >
              <span>{t.nav_login}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* MOBILE CONTROLS & HAMBURGER TOGGLE */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            onClick={() => onLanguageChange(lang === 'fr' ? 'en' : 'fr')}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            {lang === 'fr' ? 'FR' : 'EN'}
          </button>

          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER PANEL */}
      {mobileMenuOpen && (
        <div className="sm:hidden pt-4 pb-3 border-t border-slate-100 dark:border-slate-800 mt-3 space-y-3">
          {isPublic ? (
            <div className="space-y-2">
              <a href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">
                {t.nav_home}
              </a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {t.nav_features}
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {t.nav_pricing}
              </a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                À propos
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                Contact
              </a>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLoginModal && onOpenLoginModal();
                  }}
                  className="w-full btn-eduvate-primary text-white font-extrabold text-sm py-3 rounded-full flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <span>{t.nav_login}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 px-3">Bascule de Rôle Espace École</div>
              <div className="grid grid-cols-1 gap-1.5">
                {dashboardRoles.map((r) => {
                  const Icon = r.icon;
                  const active = currentRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onRoleChange && onRoleChange(r.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        active
                          ? 'btn-eduvate-primary text-white shadow-md'
                          : 'text-slate-700 dark:text-slate-300 bg-slate-100/60 dark:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
