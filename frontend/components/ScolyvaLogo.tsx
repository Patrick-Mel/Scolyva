'use client';

interface ScolyvaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  showSubtitle?: boolean;
}

export default function ScolyvaLogo({ size = 'md', subtitle = 'Gestion Scolaire', showSubtitle = true }: ScolyvaLogoProps) {
  const dimensions = {
    sm: { img: 'w-8 h-8', text: 'text-xl', badge: 'text-[9px]' },
    md: { img: 'w-10 h-10', text: 'text-2xl', badge: 'text-[10px]' },
    lg: { img: 'w-14 h-14', text: 'text-4xl', badge: 'text-xs' },
  }[size];

  return (
    <div className="flex items-center space-x-3 cursor-pointer group">
      {/* 3D Glassmorphic Logo Image Asset */}
      <div className={`${dimensions.img} rounded-2xl overflow-hidden shadow-lg border border-sky-400/30 group-hover:scale-105 transition duration-300 relative bg-white dark:bg-slate-900 flex items-center justify-center p-0.5`}>
        <img
          src="/scolyva_logo.jpg"
          alt="Logo Officiel Scolyva"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      <div>
        <div className="flex items-center space-x-2">
          <span className={`${dimensions.text} font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-500 dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-400`}>
            Scolyva
          </span>
          {showSubtitle && (
            <span className={`${dimensions.badge} uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/10 to-emerald-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
