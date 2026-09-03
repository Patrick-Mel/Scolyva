'use client';

import { useState } from 'react';
import ScolyvaLogo from './ScolyvaLogo';
import { Sun, Moon, Globe, LogIn, Building2, ShieldCheck, GraduationCap, CreditCard, BookOpen, Users, User, Menu, X, ArrowRight } from 'lucide-react';
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

  // Internal roles only shown inside private dashboard
  const dashboardRoles = [
    { id: 'SCHOOL_ADMIN', label: t.role_school_admin, icon: ShieldCheck },
    { id: 'ACCOUNTANT', label: t.role_accountant, icon: CreditCard },
    { id: 'TEACHER', label: t.role_teacher, icon: BookOpen },
    { id: 'PARENT', label: t.role_parent, icon: Users },
    { id: 'STUDENT', label: t.role_student, icon: User },
    { id: 'SUPER_ADMIN', label: t.role_superadmin, icon: GraduationCap },
  ];

  return (
    <nav className="w-full glass-card sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Official 3D Scolyva Logo Component */}
        <div onClick={() => window.location.href = '/'}>
          <ScolyvaLogo size="md" showSubtitle={isPublic} />
        </div>

        {/* PUBLIC DESKTOP NAVBAR LINKS (scolyva.com) */}
        {isPublic ? (
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-bold text-slate-700 dark:text-slate-200">
            <a href="#features" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              {t.nav_features}
            </a>
            <a href="#pricing" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              {t.nav_pricing}
            </a>
            <a href="/dashboard?demo=true" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              {t.nav_demo}
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
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md font-bold scale-105'
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
        <div className="hidden sm:flex items-center space-x-2.5">
          
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-bold shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            <span className="uppercase tracking-wider">{lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200 shadow-sm"
            title={darkMode ? "Passer au Thème Clair" : "Passer au Thème Sombre"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Public Action Buttons */}
          {isPublic && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-500" />
                <span>{t.nav_login}</span>
              </button>

              <button
                onClick={onOpenRegisterModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs hover:from-sky-600 hover:to-indigo-700 transition shadow-md flex items-center space-x-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.nav_register}</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE CONTROLS & HAMBURGER TOGGLE */}
        <div className="flex sm:hidden items-center space-x-1.5">
          {/* Quick Lang Switcher on Mobile */}
          <button
            onClick={() => onLanguageChange(lang === 'fr' ? 'en' : 'fr')}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-300"
          >
            {lang === 'fr' ? '🇫🇷' : '🇬🇧'}
          </button>

          {/* Quick Theme Toggle on Mobile */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER PANEL */}
      {mobileMenuOpen && (
        <div className="sm:hidden pt-4 pb-3 border-t border-slate-200 dark:border-slate-800 mt-3 space-y-4 animate-fadeIn">
          
          {isPublic ? (
            <div className="space-y-2">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.nav_features}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.nav_pricing}
              </a>
              <a
                href="/dashboard?demo=true"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.nav_demo}
              </a>

              <div className="pt-2 grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLoginModal && onOpenLoginModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4 text-sky-500" />
                  <span>{t.nav_login}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRegisterModal && onOpenRegisterModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t.nav_register}</span>
                </button>
              </div>
            </div>
          ) : (
            /* PRIVATE MOBILE ROLE SWITCHER */
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
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
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
