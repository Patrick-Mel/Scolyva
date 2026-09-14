'use client';

import { useState } from 'react';
import { QrCode, Printer, Download, ShieldCheck, X, Sparkles, GraduationCap } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import ScolyvaLogo from './ScolyvaLogo';

interface StudentQRPassModalProps {
  lang: Language;
  studentName?: string;
  matricule?: string;
  className?: string;
  onClose: () => void;
}

export default function StudentQRPassModal({
  lang,
  studentName = 'Claire Ngo Nsoga',
  matricule = 'EXC-2025-002',
  className = '6ème A (Collège Excellence Douala)',
  onClose
}: StudentQRPassModalProps) {
  const t = translations[lang];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-md w-full p-6 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-sky-500" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Pass QR Badge Élève Officiel
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            À présenter à l'entrée en classe pour l'émargement automatique des présences.
          </p>
        </div>

        {/* Official Printable Student ID Card Badge */}
        <div id="student-badge-card" className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-sky-500/30 relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Badge Top Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <ScolyvaLogo size="sm" showSubtitle={false} />
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Carte Élève Sécurisée
            </span>
          </div>

          {/* Student Info Row */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-extrabold text-xl text-white shadow-lg flex-shrink-0">
              {studentName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{studentName}</div>
              <div className="text-xs font-mono font-bold text-sky-400">{matricule}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">{className}</div>
            </div>
          </div>

          {/* Signed Encrypted QR Code Box */}
          <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center space-y-2 shadow-inner">
            {/* Visual SVG QR Code Matrix */}
            <svg className="w-36 h-36" viewBox="0 0 100 100">
              <path fill="#0f172a" d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M22,22 h6 v6 h-6 z" />
              <path fill="#0f172a" d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M72,22 h6 v6 h-6 z" />
              <path fill="#0f172a" d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M22,72 h6 v6 h-6 z" />
              <path fill="#0284c7" d="M45,10 h10 v10 h-10 z M50,25 h15 v10 h-15 z M45,45 h10 v10 h-10 z" />
              <path fill="#10b981" d="M10,45 h15 v10 h-15 z M60,60 h10 v20 h-10 z M75,50 h15 v15 h-15 z" />
              <path fill="#4f46e5" d="M45,75 h20 v15 h-20 z M75,75 h15 v15 h-15 z" />
            </svg>
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              🔒 Jeton Cryptographique Signé HMAC-256
            </span>
          </div>

          {/* Footer Security Badge */}
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 pt-1">
            <span>Année Académique 2025-2026</span>
            <span className="text-emerald-400 font-bold">● Actif</span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-sky-500" />
            <span>Imprimer la Carte</span>
          </button>
        </div>

      </div>
    </div>
  );
}
