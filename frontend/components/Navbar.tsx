'use client';

import { useState } from 'react';
import ScolyvaLogo from './ScolyvaLogo';
import { Sun, Moon, Globe, LogIn, Building2, ShieldCheck, GraduationCap, CreditCard, BookOpen, Users, User, ChevronDown } from 'lucide-react';
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

  // Internal roles only shown inside private dashboard (never on public landing page)
  const dashboardRoles = [
    { id: 'SCHOOL_ADMIN', label: t.role_school_admin, icon: ShieldCheck },
    { id: 'ACCOUNTANT', label: t.role_accountant, icon: CreditCard },
    { id: 'TEACHER', label: t.role_teacher, icon: BookOpen },
    { id: 'PARENT', label: t.role_parent, icon: Users },
    { id: 'STUDENT', label: t.role_student, icon: User },
    // SuperAdmin is only accessible in private dashboard debug mode
    { id: 'SUPER_ADMIN', label: t.role_superadmin, icon: GraduationCap },
  ];

  return (
    <nav className="w-full glass-card sticky top-0 z-40 px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Official 3D Scolyva Logo Component */}
        <div onClick={() => window.location.href = '/'}>
          <ScolyvaLogo size="md" showSubtitle={isPublic} />
        </div>

        {/* PUBLIC NAVBAR LINKS (scolyva.com) — Standard SaaS Public Navigation */}
        {isPublic ? (
          <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-slate-700 dark:text-slate-200">
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
          /* PRIVATE DASHBOARD ROLE SWITCHER (Only inside /dashboard workspace) */
          <div className="hidden md:flex flex-wrap items-center justify-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-inner">
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

        {/* Global Controls: Language, Theme & Public Action Buttons */}
        <div className="flex items-center space-x-3">
          
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-bold shadow-sm"
          >
            <Globe className="w-4 h-4 text-sky-500" />
            <span className="uppercase tracking-wider">{lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200 shadow-sm"
            title={darkMode ? "Passer au Thème Clair" : "Passer au Thème Sombre"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Public Action Buttons (Connexion + Inscrire mon établissement) */}
          {isPublic && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 shadow-sm"
              >
                <LogIn className="w-4 h-4 text-sky-500" />
                <span>{t.nav_login}</span>
              </button>

              <button
                onClick={onOpenRegisterModal}
                className="hidden sm:flex px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs sm:text-sm hover:from-sky-600 hover:to-indigo-700 transition shadow-md items-center space-x-1.5"
              >
                <Building2 className="w-4 h-4" />
                <span>{t.nav_register}</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </nav>
  );
}
