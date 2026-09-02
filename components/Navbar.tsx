'use client';

import { useState } from 'react';
import { Sun, Moon, Globe, GraduationCap, ShieldCheck, CreditCard, BookOpen, Users, User, Sparkles } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export default function Navbar({ lang, onLanguageChange, darkMode, onThemeToggle, currentRole, onRoleChange }: NavbarProps) {
  const t = translations[lang];

  const roles = [
    { id: 'SCHOOL_ADMIN', label: t.role_school_admin, icon: ShieldCheck },
    { id: 'SUPER_ADMIN', label: t.role_superadmin, icon: GraduationCap },
    { id: 'ACCOUNTANT', label: t.role_accountant, icon: CreditCard },
    { id: 'TEACHER', label: t.role_teacher, icon: BookOpen },
    { id: 'PARENT', label: t.role_parent, icon: Users },
    { id: 'STUDENT', label: t.role_student, icon: User },
  ];

  return (
    <nav className="w-full glass-card sticky top-0 z-40 px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg text-white font-extrabold text-xl transform group-hover:scale-105 transition duration-300">
            S
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-500 dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-400">
                Scolyva
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                SaaS Multi-Tenant
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
              {t.slogan}
            </p>
          </div>
        </div>

        {/* Dynamic Role Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-inner">
          {roles.map((r) => {
            const Icon = r.icon;
            const active = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
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

        {/* Global Controls: Language & Persistent Theme Toggle */}
        <div className="flex items-center space-x-3">
          
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-bold shadow-sm"
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
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}
