'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { Sparkles, CheckCircle, Bell, CreditCard, Award, ShieldCheck, X } from 'lucide-react';

interface LiveActivityToastProps {
  lang?: Language;
}

export default function LiveActivityToast({ lang = 'fr' }: LiveActivityToastProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const activities = {
    fr: [
      {
        icon: CheckCircle,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
        title: 'Nouvelle École Inscrite',
        desc: 'Collège Excellence Douala vient de démarrer son Essai 14j (200 élèves)',
        time: 'À l\'instant'
      },
      {
        icon: CreditCard,
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/30',
        title: 'Paiement CinetPay Encaissé',
        desc: 'Orange Money : 25 000 FCFA reçus pour l\'élève K. Abena (Terminale C)',
        time: 'Il y a 2 min'
      },
      {
        icon: Award,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
        title: 'Séquence 3 Validée',
        desc: '342 Bulletins générés avec moyennes et rangs calculés automatiquement',
        time: 'Il y a 5 min'
      },
      {
        icon: Bell,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        title: 'SMS de Relance Envoyé',
        desc: 'Alerte instantanée envoyée aux parents (99.2% de taux d\'ouverture)',
        time: 'Il y a 8 min'
      },
      {
        icon: ShieldCheck,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
        title: 'Passerelle Bilingue Active',
        desc: 'Lycée Bilingue de Yaoundé a configuré le système Anglophone & Francophone',
        time: 'Il y a 12 min'
      }
    ],
    en: [
      {
        icon: CheckCircle,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
        title: 'New School Registered',
        desc: 'St. Patrick College started their 14-day free trial (200 students)',
        time: 'Just now'
      },
      {
        icon: CreditCard,
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/30',
        title: 'CinetPay Payment Received',
        desc: 'MTN MoMo: 25,000 FCFA received for student K. Abena (Form 5)',
        time: '2 mins ago'
      },
      {
        icon: Award,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
        title: 'Term 1 Exam Sequence Validated',
        desc: '342 Report Cards generated with automated grades & class ranks',
        time: '5 mins ago'
      },
      {
        icon: Bell,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        title: 'SMS Reminder Sent',
        desc: 'Instant fee reminder sent to parents (99.2% delivery rate)',
        time: '8 mins ago'
      },
      {
        icon: ShieldCheck,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
        title: 'Bilingual Engine Active',
        desc: 'Yaoundé International School configured Anglophone & Francophone systems',
        time: '12 mins ago'
      }
    ]
  };

  const list = activities[lang] || activities.fr;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [list.length]);

  if (!visible) return null;

  const current = list[index] || list[0];
  const IconComponent = current.icon;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm w-full animate-float pointer-events-auto">
      <div className="glass-card p-4 rounded-2xl border border-sky-500/30 shadow-2xl relative overflow-hidden flex items-start space-x-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        
        {/* Live Pulsing Dot */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`p-2.5 rounded-xl border ${current.color} flex-shrink-0 mt-0.5`}>
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="space-y-0.5 pr-6">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{current.title}</span>
            <span className="text-[10px] font-bold text-slate-400">• {current.time}</span>
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-snug">
            {current.desc}
          </p>
        </div>

      </div>
    </div>
  );
}
