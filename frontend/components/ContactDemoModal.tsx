'use client';

import { useState } from 'react';
import { Mail, Phone, Building2, User, Send, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface ContactDemoModalProps {
  lang: Language;
  onClose: () => void;
}

export default function ContactDemoModal({ lang, onClose }: ContactDemoModalProps) {
  const t = translations[lang];
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    school: '',
    email: '',
    phone: '+237',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 relative rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-[#00a8ff] text-xs font-extrabold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Démonstration Personnalisée Gratuitement</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Demander une démonstration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Nos conseillers pédagogiques vous recontactent sous 2 heures pour présenter Scolyva à votre équipe.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Votre Nom & Prénom</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Jean-Pierre Mbida"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nom de votre Établissement</label>
                <input
                  type="text"
                  required
                  placeholder="Collège Excellence Douala"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                  value={form.school}
                  onChange={e => setForm({ ...form, school: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    required
                    placeholder="directeur@ecole.cm"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="+237 677 11 22 33"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Précisions (Nombre d'élèves, besoins)</label>
                <textarea
                  rows={3}
                  placeholder="Nous sommes un établissement de 500 élèves intéressé par la gestion des frais et l'emploi du temps IA..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#00a8ff] outline-none"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full btn-eduvate-primary text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer ma Demande de Démonstration</span>
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Demande Envoyée !</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Merci {form.name} ! Notre équipe pédagogique a bien reçu votre demande pour {form.school}. Nous vous contacterons sur le {form.phone} dans les plus brefs délais.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm shadow-md"
            >
              Fermer la fenêtre
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
