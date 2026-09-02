'use client';

import { useState } from 'react';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';

interface ReadonlyBannerProps {
  isPublic?: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'READ_ONLY' | 'SUSPENDED';
  trialDaysRemaining?: number;
  lang: Language;
  onSubscribeClick: () => void;
}

export default function ReadonlyBanner({
  isPublic = false,
  status,
  trialDaysRemaining = 14,
  lang,
  onSubscribeClick
}: ReadonlyBannerProps) {
  const t = translations[lang];

  // RULE: Never show trial banner on public vitrine page (scolyva.com)
  if (isPublic) {
    return null;
  }

  // Never show banner if paid subscription is fully active
  if (status === 'ACTIVE') {
    return null;
  }

  const isReadOnly = status === 'READ_ONLY' || trialDaysRemaining <= 0 || status === 'SUSPENDED';

  return (
    <div className={`w-full py-3 px-6 text-sm font-semibold transition-all duration-300 shadow-md ${
      isReadOnly 
        ? 'bg-gradient-to-r from-amber-600 via-red-600 to-rose-700 text-white' 
        : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {isReadOnly ? (
            <AlertTriangle className="w-5 h-5 text-yellow-200 animate-bounce" />
          ) : (
            <Sparkles className="w-5 h-5 text-sky-200 animate-pulse" />
          )}
          <span>
            {isReadOnly 
              ? t.trial_expired_banner 
              : t.trial_active_banner.replace('{days}', Math.max(0, trialDaysRemaining).toString())
            }
          </span>
        </div>
        
        <button
          onClick={onSubscribeClick}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition transform hover:scale-105 shadow-md text-xs sm:text-sm whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t.upgrade_now}</span>
        </button>
      </div>
    </div>
  );
}
