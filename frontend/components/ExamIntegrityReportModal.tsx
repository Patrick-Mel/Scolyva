'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock, FileText, UserCheck, X, Award, Check } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface ExamIntegrityReportModalProps {
  lang: Language;
  studentName?: string;
  integrityScore?: number;
  onClose: () => void;
}

export default function ExamIntegrityReportModal({
  lang,
  studentName = 'Claire Ngo Nsoga',
  integrityScore = 95,
  onClose
}: ExamIntegrityReportModalProps) {
  const t = translations[lang];
  const [essayScore, setEssayScore] = useState('7.5');
  const [teacherComment, setTeacherComment] = useState('Excellente démonstration par récurrence, raisonnement rigoureux.');
  const [isGraded, setIsGraded] = useState(false);

  const integrityLogs = [
    { id: '1', type: 'TAB_BLUR', time: '08:14:22', label: 'Changement d\'onglet détecté (Quitte l\'écran pendant 4s)' },
    { id: '2', type: 'COPY_PASTE_ATTEMPT', time: '08:25:10', label: 'Tentative de copier-coller bloquée dans la Zone Dissertation' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Rapport de Fiabilité & Correction d'Examen
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Copie de {studentName} • Évaluation Séquence 3 Mathématiques
            </p>
          </div>
        </div>

        {/* Trust Score Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
          integrityScore >= 90
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
        }`}>
          <div className="flex items-center space-x-3">
            {integrityScore >= 90 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0" />
            )}
            <div>
              <div className="font-extrabold text-sm">
                Score d'Intégrité Session : {integrityScore}% ({integrityScore >= 90 ? 'Session Fiable' : 'Activité Suspecte'})
              </div>
              <div className="text-[11px] font-medium opacity-80 mt-0.5">
                Calculé d'après les événements d'intégrité en navigateur pendant l'épreuve.
              </div>
            </div>
          </div>
        </div>

        {/* Timeline of Integrity Events */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chronologie des Événements Détectés
          </div>

          <div className="space-y-2">
            {integrityLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{log.label}</span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grading Section */}
        <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Correction & Attribution des Points
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-500">QCM Autocorrigés (3 Questions)</div>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                10.0 / 12.0 Points
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-500">Question Ouverte (Barème : 8 pts)</div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  max="8"
                  value={essayScore}
                  onChange={e => setEssayScore(e.target.value)}
                  className="w-20 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-extrabold text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <span className="font-extrabold text-slate-700 dark:text-slate-300">/ 8.0 Points</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Appréciation de l'Enseignant</label>
            <textarea
              rows={2}
              value={teacherComment}
              onChange={e => setTeacherComment(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={() => {
              setIsGraded(true);
              setTimeout(() => onClose(), 1000);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs hover:from-sky-600 hover:to-indigo-700 transition shadow-lg flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{isGraded ? 'Copie Publiée !' : 'Valider la Note Finale & Publier'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
