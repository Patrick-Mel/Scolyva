'use client';

interface ScolyvaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  showSubtitle?: boolean;
}

export default function ScolyvaLogo({ size = 'md', subtitle = '', showSubtitle = false }: ScolyvaLogoProps) {
  const dimensions = {
    sm: { img: 'w-7 h-7 sm:w-8 sm:h-8', text: 'text-lg sm:text-xl', badge: 'text-[9px]' },
    md: { img: 'w-8 h-8 sm:w-10 sm:h-10', text: 'text-xl sm:text-2xl', badge: 'text-[10px]' },
    lg: { img: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-3xl sm:text-4xl', badge: 'text-xs' },
  }[size];

  return (
    <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
      {/* Official 3D Glassmorphic Logo Image Emblem */}
      <div className={`${dimensions.img} rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-sky-400/30 group-hover:scale-105 transition duration-300 relative bg-white dark:bg-slate-900 flex items-center justify-center p-0.5 flex-shrink-0`}>
        <img
          src="/scolyva_logo.jpg"
          alt="Logo Officiel Scolyva"
          className="w-full h-full object-cover rounded-lg sm:rounded-xl"
        />
      </div>

      <div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className={`${dimensions.text} font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-500 dark:from-sky-400 dark:via-indigo-400 dark:to-emerald-400`}>
            Scolyva
          </span>
          {showSubtitle && subtitle && (
            <span className={`${dimensions.badge} uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/10 to-emerald-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 hidden sm:inline-block`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
