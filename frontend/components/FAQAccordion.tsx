'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface FAQAccordionProps {
  lang: Language;
}

export default function FAQAccordion({ lang }: FAQAccordionProps) {
  const t = translations[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = {
    fr: [
      {
        q: "Qu'est-ce que Scolyva ?",
        a: "Scolyva est une plateforme SaaS complète de gestion scolaire propulsée par l'IA qui automatise l'ensemble des tâches administratives et pédagogiques des établissements d'enseignement : emplois du temps, bulletins, présences QR, examens en ligne et frais de scolarité."
      },
      {
        q: "Comment fonctionne la génération automatique d'emplois du temps par IA ?",
        a: "Notre algorithme de résolution de contraintes (CSP) analyse vos enseignants, salles, matières et leurs disponibilités pour produire un emploi du temps optimisé en quelques secondes, garantissant 0 conflit de chevauchement."
      },
      {
        q: "Comment fonctionne le paiement des frais par Mobile Money ?",
        a: "Grâce à notre passerelle CinetPay intégrée, les parents règlent les frais de scolarité directement depuis leur téléphone via Orange Money ou MTN MoMo. Le solde de l'élève est mis à jour instantanément et un reçu officiel PDF est généré."
      },
      {
        q: "Scolyva gère-t-il le double système Francophone et Anglophone ?",
        a: "Oui. Scolyva prend en charge nativement le système Francophone (6ème à Terminale) et le système Anglophone (Form 1 à Upper Sixth), avec calcul automatique des moyennes pondérées par coefficients."
      },
      {
        q: "Comment fonctionne la présence par QR code ?",
        a: "Chaque élève dispose d'un Pass QR Code unique et signé. À l'entrée en classe, l'enseignant scanne le code depuis son téléphone ou sa tablette. En cas de retard (> 10 min) ou d'absence, le parent reçoit une notification SMS / In-App immédiate."
      },
      {
        q: "Les examens en ligne sont-ils sécurisés contre la triche ?",
        a: "Oui. L'interface d'examen intègre un chronomètre, une détection en temps réel des changements d'onglet/fenêtre, un blocage du copier-coller et génère un rapport de fiabilité pour l'enseignant. Vos copies sont sauvegardées automatiquement toutes les 15 secondes."
      },
      {
        q: "Quels sont les tarifs et comment démarrer l'essai gratuit ?",
        a: "Nous proposons 3 formules simples (Starter à 10 000 FCFA/mois, Pro à 25 000 FCFA/mois, Business à 40 000 FCFA/mois). Chaque établissement bénéficie de 14 jours d'essai gratuit sans engagement."
      },
      {
        q: "Comment les données de mon établissement sont-elles sécurisées ?",
        a: "Chaque école bénéficie d'une isolation multi-tenant stricte par `school_id` avec stockage sécurisé sur Cloudflare R2 et chiffrement de bout en bout conforme aux normes de protection des données."
      }
    ],
    en: [
      {
        q: "What is Scolyva?",
        a: "Scolyva is a complete AI-powered school management SaaS platform automating all administrative and academic tasks: timetables, report cards, QR attendance, online exams, and tuition fees."
      },
      {
        q: "How does AI automated timetable generation work?",
        a: "Our Constraint Satisfaction Problem (CSP) solver analyzes teachers, classrooms, subjects, and availability slots to generate an optimized timetable in seconds with zero scheduling conflicts."
      },
      {
        q: "How do tuition fee payments via Mobile Money work?",
        a: "Through our integrated CinetPay gateway, parents pay tuition directly from their phones via Orange Money or MTN MoMo. Student balances update instantly and official PDF receipts are issued."
      },
      {
        q: "Does Scolyva support both Francophone and Anglophone systems?",
        a: "Yes. Scolyva natively supports both the Francophone system (6th to Terminale) and Anglophone system (Form 1 to Upper Sixth) with automated coefficient-weighted average calculations."
      },
      {
        q: "How does QR Code attendance work?",
        a: "Each student has a unique cryptographically signed QR Pass. Teachers scan codes upon class entry. If a student is late (> 10 mins) or absent, parents receive an immediate SMS/In-App alert."
      },
      {
        q: "Are online exams protected against cheating?",
        a: "Yes. The exam room features live countdown timers, browser focus loss monitoring, copy-paste prevention, and generates an integrity trust score. Student progress auto-saves every 15 seconds."
      },
      {
        q: "What are the prices and how to start the free trial?",
        a: "We offer 3 plans (Starter 10,000 FCFA/mo, Pro 25,000 FCFA/mo, Business 40,000 FCFA/mo). Every school starts with a 14-day free trial with no commitment."
      },
      {
        q: "How is my school data protected?",
        a: "Every school benefits from strict server-level multi-tenant isolation by `school_id` with Cloudflare R2 object storage and end-to-end encryption compliant with data protection standards."
      }
    ]
  };

  const list = faqs[lang] || faqs.fr;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {list.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between space-x-4 focus:outline-none"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-[#00a8ff] flex-shrink-0" />
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {faq.q}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#00a8ff]' : ''}`} />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3 animate-fadeIn">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
