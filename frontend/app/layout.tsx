import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scolyva — SaaS Multi-Tenant de Gestion Scolaire (Cameroun & Afrique)',
  description: 'Plateforme complète de gestion scolaire pour écoles publiques et privées : dossier élève, frais de scolarité, Mobile Money (CinetPay), notes, bulletins et présences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
