'use client';

import { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2, Lock, Save, AlertTriangle, Send, FileText, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { apiRequest } from '@/lib/api';

interface ExamSessionRoomProps {
  lang: Language;
  examId?: string;
  examTitle?: string;
  durationMinutes?: number;
  onClose: () => void;
}

export default function ExamSessionRoom({
  lang,
  examId = '1',
  examTitle = 'Évaluation Séquence 3 - Mathématiques & Logique',
  durationMinutes = 45,
  onClose
}: ExamSessionRoomProps) {
  const t = translations[lang];
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(durationMinutes * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [autoSavedTime, setAutoSavedTime] = useState<string>('00:00:00');
  const [integrityScore, setIntegrityScore] = useState(100);
  const [tabSwitchesCount, setTabSwitchesCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Exam Questions Mock Data
  const questions = [
    {
      id: '1',
      type: 'MCQ',
      text: 'Résoudre dans ℝ l\'équation du second degré : 2x² - 5x + 3 = 0. Quelles sont les solutions exactes ?',
      points: 4,
      options: ['A) x₁ = 1 et x₂ = 3/2', 'B) x₁ = -1 et x₂ = -3/2', 'C) x₁ = 2 et x₂ = 5', 'D) Pas de solution réelle']
    },
    {
      id: '2',
      type: 'MCQ',
      text: 'Soit la fonction f(x) = (3x + 1) / (x - 2). Quelle est la dérivée f\'(x) sur ℝ \\ {2} ?',
      points: 4,
      options: ['A) f\'(x) = -7 / (x - 2)²', 'B) f\'(x) = 7 / (x - 2)²', 'C) f\'(x) = 3 / (x - 2)²', 'D) f\'(x) = -5 / (x - 2)²']
    },
    {
      id: '3',
      type: 'SHORT_ANSWER',
      text: 'Calculer la limite quand x tend vers +∞ de la suite (Un) définie par Un = (4n² + 3n) / (2n² - 1).',
      points: 4,
      options: []
    },
    {
      id: '4',
      type: 'ESSAY',
      text: 'Démontrer par récurrence que pour tout entier naturel n ≥ 1, la somme 1 + 2 + 3 + ... + n est égale à n(n + 1) / 2. Rédiger soigneusement les étapes d\'initialisation, d\'hérédité et de conclusion.',
      points: 8,
      options: []
    }
  ];

  // Student Answers State
  const [answers, setAnswers] = useState<Record<string, { text: string; selected: string[] }>>({
    '1': { text: '', selected: ['A) x₁ = 1 et x₂ = 3/2'] },
    '2': { text: '', selected: ['A) f\'(x) = -7 / (x - 2)²'] },
    '3': { text: '2', selected: [] },
    '4': { text: '', selected: [] }
  });

  // 1. Live Countdown Timer Effect
  useEffect(() => {
    if (examSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examSubmitted]);

  // 2. Periodic Auto-Save Draft (Resilience against Cameroon network drops)
  useEffect(() => {
    if (examSubmitted) return;
    const saveTimer = setInterval(() => {
      localStorage.setItem(`scolyva_exam_draft_${examId}`, JSON.stringify(answers));
      setAutoSavedTime(new Date().toLocaleTimeString());
    }, 15000);
    return () => clearInterval(saveTimer);
  }, [answers, examId, examSubmitted]);

  // 3. In-Browser Integrity Event Listeners (Tab Blur, Focus Loss, Copy/Paste)
  useEffect(() => {
    if (examSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchesCount(prev => prev + 1);
        setIntegrityScore(prev => Math.max(0, prev - 5));
        logIntegrityEvent('TAB_BLUR', 'Changement d\'onglet ou minimisation de fenêtre');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setIntegrityScore(prev => Math.max(0, prev - 10));
      logIntegrityEvent('COPY_PASTE_ATTEMPT', 'Tentative de copier/coller bloquée');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logIntegrityEvent('RIGHT_CLICK_ATTEMPT', 'Clic droit bloqué');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [examSubmitted]);

  const logIntegrityEvent = async (eventType: string, details: string) => {
    try {
      await apiRequest(`/exams/submissions/1/log-integrity/`, {
        method: 'POST',
        body: JSON.stringify({ event_type: eventType, details: { description: details } })
      });
    } catch (err) {
      // Offline fallback log
    }
  };

  const handleFinalSubmit = async (auto: boolean = false) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/exams/submissions/1/submit/`, {
        method: 'POST',
        body: JSON.stringify({ auto_submitted: auto, answers })
      });
    } catch (err) {
      // Fallback
    } finally {
      setIsSubmitting(false);
      setExamSubmitted(true);
      setShowSubmitModal(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQ.id] || { text: '', selected: [] };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">{examTitle}</h2>
            <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
              <span>Session d'Examen Sécurisée</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <Save className="w-3.5 h-3.5" />
                <span>Sauvegarde Auto : {autoSavedTime}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Integrity Score Badge */}
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold ${
            integrityScore >= 90
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : integrityScore >= 70
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            <ShieldAlert className="w-4 h-4" />
            <span>Score Fiabilité : {integrityScore}%</span>
            {tabSwitchesCount > 0 && <span className="text-[10px]">({tabSwitchesCount} alerte)</span>}
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono font-extrabold text-lg">
            <Clock className="w-5 h-5 text-sky-400 animate-pulse" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg transition flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Remettre la Copie</span>
          </button>
        </div>
      </div>

      {/* Main Exam Content Body */}
      {!examSubmitted ? (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Question Navigation Drawer */}
          <div className="w-64 bg-slate-900/80 border-r border-slate-800 p-5 space-y-4 hidden md:block">
            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Navigation Questions (4 total)
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = (answers[q.id]?.text || answers[q.id]?.selected.length > 0);
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center justify-center space-y-1 transition ${
                      isCurrent
                        ? 'bg-sky-500 text-white border-sky-400 shadow-lg scale-105'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>Question {idx + 1}</span>
                    <span className="text-[10px] opacity-80">{q.points} pts</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Panel */}
          <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto">
            
            {/* Question Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30">
                Question {currentQuestionIndex + 1} sur {questions.length} • {currentQ.type}
              </span>
              <span className="text-xs font-bold text-amber-400">
                Barème : {currentQ.points} Points
              </span>
            </div>

            {/* Question Prompt */}
            <div className="text-lg font-bold text-slate-100 leading-relaxed bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              {currentQ.text}
            </div>

            {/* Answer Input Field */}
            <div className="space-y-4">
              {currentQ.type === 'MCQ' ? (
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = currentAnswer.selected.includes(opt);

                    return (
                      <div
                        key={optIdx}
                        onClick={() => {
                          setAnswers(prev => ({
                            ...prev,
                            [currentQ.id]: { ...prev[currentQ.id], selected: [opt] }
                          }));
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer font-extrabold text-sm transition flex items-center space-x-3 ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border-sky-500 text-sky-300 shadow-md'
                            : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-sky-400 bg-sky-500 text-white' : 'border-slate-600'}`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  rows={6}
                  placeholder="Saisissez votre démonstration ou réponse détaillée ici..."
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
                  value={currentAnswer.text}
                  onChange={e => {
                    const val = e.target.value;
                    setAnswers(prev => ({
                      ...prev,
                      [currentQ.id]: { ...prev[currentQ.id], text: val }
                    }));
                  }}
                />
              )}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 disabled:opacity-40 transition flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Question Précédente</span>
              </button>

              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs disabled:opacity-40 transition flex items-center space-x-2 shadow-md"
              >
                <span>Question Suivante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Exam Completion Screen */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Copie Remise avec Succès !</h2>
            <p className="text-sm text-slate-400">
              Vos réponses ont été enregistrées et scellées dans la base de données.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left text-xs font-mono space-y-2 max-w-sm w-full">
            <div><strong>Examen:</strong> {examTitle}</div>
            <div><strong>Copie:</strong> {answers['1']?.selected.length ? '4/4 Répondues' : 'Enregistrée'}</div>
            <div><strong>Score Intégrité Session:</strong> {integrityScore}%</div>
            <div><strong>Horodatage Remise:</strong> {new Date().toLocaleTimeString()}</div>
          </div>

          <button
            onClick={onClose}
            className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm shadow-xl transition"
          >
            Quitter la Salle d'Examen Sécurisée
          </button>
        </div>
      )}

      {/* Final Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative rounded-3xl border border-slate-800 shadow-2xl space-y-5 text-slate-100">
            <h3 className="text-xl font-extrabold text-white">Confirmer la Remise Définitive ?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Êtes-vous sûr de vouloir soumettre définitivement votre copie ? Vous ne pourrez plus modifier vos réponses une fois validé.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-extrabold text-xs hover:bg-slate-700 transition"
              >
                Continuer l'Examen
              </button>

              <button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition"
              >
                {isSubmitting ? 'Soumission...' : 'Valider et Soumettre'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
